<?php
/* ============================================================
   POST api/guardar.php   (multipart/form-data)
   Registra un documento nuevo, o lo edita si llega «id».

   Campos: no_oficio, fecha, asunto, remitente, destinatario,
           estatus y el archivo: «pdf» o «paginas[]» (fotos).
   Al registrar, el archivo es obligatorio; al editar es
   opcional y, si llega, reemplaza al anterior.
   ============================================================ */

require_once __DIR__ . '/../includes/utilidades.php';
require_once __DIR__ . '/../includes/archivos.php';

exigirMetodo('POST');

/* Si la petición supera post_max_size, PHP descarta todo el cuerpo
   y $_POST llega vacío sin avisar. */
if (empty($_POST) && (int) ($_SERVER['CONTENT_LENGTH'] ?? 0) > 0) {
    responderError('El archivo es demasiado grande para el servidor.', 413, [
        'archivo' => 'El archivo es demasiado grande para el servidor.',
    ]);
}

$id = isset($_POST['id']) && $_POST['id'] !== '' ? enteroPositivo($_POST['id']) : null;
if (isset($_POST['id']) && $_POST['id'] !== '' && $id === null) {
    responderError('Identificador no válido.');
}
$esEdicion = $id !== null;

[$datos, $errores] = validarDocumento($_POST);

$pdo = conectaDB();

/* Documento actual (solo al editar). */
$actual = null;
if ($esEdicion) {
    $consulta = $pdo->prepare('SELECT estatus FROM documentos WHERE id_documento = :id');
    $consulta->execute([':id' => $id]);
    $actual = $consulta->fetch();
    if (!$actual) {
        responderError('El documento no existe o ya fue eliminado.', 404);
    }
}

/* Número de oficio repetido. */
if (!isset($errores['no_oficio'])) {
    $consulta = $pdo->prepare('SELECT 1 FROM documentos WHERE no_oficio = :no AND id_documento <> :id');
    $consulta->execute([':no' => $datos['no_oficio'], ':id' => $id ?? 0]);
    if ($consulta->fetchColumn()) {
        $errores['no_oficio'] = 'Ya existe un documento con ese número de oficio.';
    }
}

$llegoArchivo = (isset($_FILES['pdf']) && $_FILES['pdf']['error'] !== UPLOAD_ERR_NO_FILE)
             || !empty($_FILES['paginas']['name'][0]);
if (!$esEdicion && !$llegoArchivo) {
    $errores['archivo'] = 'Toma una foto o selecciona el PDF del documento.';
}

/* Si algún campo está mal ni siquiera se procesa el archivo. */
if ($errores) {
    responderError('Revisa los campos marcados.', 422, $errores);
}

try {
    $archivo = leerArchivoSubido();
} catch (ErrorDeArchivo $e) {
    responderError($e->getMessage(), 422, ['archivo' => $e->getMessage()]);
}

/* ---- Escritura en la base, dentro de una transacción ------
   El registro y su PDF se guardan juntos: si algo falla no queda
   ni el registro sin PDF ni el PDF sin registro. */
try {
    $pdo->beginTransaction();

    $valores = [
        ':no_oficio'    => $datos['no_oficio'],
        ':fecha'        => $datos['fecha'],
        ':asunto'       => $datos['asunto'],
        ':remitente'    => $datos['remitente'],
        ':destinatario' => $datos['destinatario'],
        ':estatus'      => $datos['estatus'],
    ];

    if ($esEdicion) {
        $sql = 'UPDATE documentos
                SET no_oficio = :no_oficio, fecha = :fecha, asunto = :asunto,
                    remitente = :remitente, destinatario = :destinatario, estatus = :estatus'
             . ($archivo !== null ? ', archivo_pdf = :archivo' : '')
             . ' WHERE id_documento = :id';
        $valores[':id'] = $id;
        if ($archivo !== null) {
            $valores[':archivo'] = $archivo['nombre'];
        }
        $pdo->prepare($sql)->execute($valores);

        if ($actual['estatus'] !== $datos['estatus']) {
            registrarCambioEstatus($pdo, $id, $actual['estatus'], $datos['estatus']);
        }
    } else {
        $sql = 'INSERT INTO documentos (no_oficio, fecha, asunto, remitente, destinatario, estatus, archivo_pdf)
                VALUES (:no_oficio, :fecha, :asunto, :remitente, :destinatario, :estatus, :archivo)';
        $valores[':archivo'] = $archivo['nombre'];
        $pdo->prepare($sql)->execute($valores);

        $id = (int) $pdo->lastInsertId();
        registrarCambioEstatus($pdo, $id, null, $datos['estatus']);
    }

    /* Al editar con archivo nuevo, REPLACE sustituye al PDF anterior. */
    if ($archivo !== null) {
        guardarPdfEnBase($pdo, $id, $archivo['contenido']);
    }

    $pdo->commit();
} catch (Throwable $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }

    /* 1062: llave duplicada. Pasa si dos personas guardan el mismo
       número de oficio al mismo tiempo. */
    if ($e instanceof PDOException && ($e->errorInfo[1] ?? null) === 1062) {
        responderError('Revisa los campos marcados.', 422, [
            'no_oficio' => 'Ya existe un documento con ese número de oficio.',
        ]);
    }
    throw $e;
}

responderJson([
    'ok'      => true,
    'id'      => $id,
    'mensaje' => $esEdicion ? 'Documento actualizado.' : 'Documento registrado.',
], $esEdicion ? 200 : 201);
