<?php
/* ============================================================
   Funciones comunes de la API: respuestas JSON y validación.

   Todos los archivos de api/ empiezan con:
       require_once __DIR__ . '/../includes/utilidades.php';
   ============================================================ */

require_once __DIR__ . '/conexion.php';

/* Un aviso de PHP impreso a media respuesta rompería el JSON,
   así que no se muestran: se mandan al log del servidor. */
ini_set('display_errors', '0');

/* Cualquier excepción que no se atrape termina aquí. Al navegador
   solo le llega un mensaje genérico; el detalle va al log. */
set_exception_handler(function (Throwable $e) {
    error_log('[gestion-documentos] ' . $e);

    $mensaje = $e instanceof PDOException
        ? 'No se pudo conectar con la base de datos. Intenta de nuevo en un momento.'
        : 'Ocurrió un error inesperado en el servidor.';

    responderError($mensaje, 500);
});

/* ---- Respuestas ------------------------------------------- */

function responderJson(array $datos, int $codigo = 200): void
{
    http_response_code($codigo);
    header('Content-Type: application/json; charset=utf-8');
    header('Cache-Control: no-store');
    echo json_encode($datos, JSON_UNESCAPED_UNICODE);
    exit;
}

/* $errores lleva los mensajes por campo, para marcarlos en el formulario. */
function responderError(string $mensaje, int $codigo = 400, array $errores = []): void
{
    responderJson(['ok' => false, 'mensaje' => $mensaje, 'errores' => (object) $errores], $codigo);
}

function exigirMetodo(string $metodo): void
{
    if ($_SERVER['REQUEST_METHOD'] !== $metodo) {
        header('Allow: ' . $metodo);
        responderError('Método no permitido.', 405);
    }

    /* jQuery manda este encabezado en sus peticiones AJAX. Un formulario
       de otro sitio no puede agregarlo, así que exigirlo en las peticiones
       que modifican datos evita que se disparen desde afuera (CSRF). */
    if ($metodo === 'POST' && ($_SERVER['HTTP_X_REQUESTED_WITH'] ?? '') !== 'XMLHttpRequest') {
        responderError('Petición no permitida.', 403);
    }
}

/* ---- Lectura de parámetros -------------------------------- */

function texto(array $origen, string $campo): string
{
    return isset($origen[$campo]) && is_string($origen[$campo]) ? trim($origen[$campo]) : '';
}

/* Devuelve el entero positivo o null si no lo es. */
function enteroPositivo($valor): ?int
{
    $numero = filter_var($valor, FILTER_VALIDATE_INT, ['options' => ['min_range' => 1]]);
    return $numero === false ? null : $numero;
}

/* Comprueba que la fecha venga como AAAA-MM-DD y que exista
   (rechaza, por ejemplo, 2026-02-30). */
function fechaValida(string $fecha): bool
{
    $d = DateTime::createFromFormat('!Y-m-d', $fecha);
    return $d !== false && $d->format('Y-m-d') === $fecha;
}

/* Escapa los comodines de LIKE para que «%» y «_» se busquen
   como texto normal. */
function escaparLike(string $texto): string
{
    return addcslashes($texto, '\\%_');
}

/* ---- Validación del formulario de documento --------------- */

/* Regresa [datos limpios, errores por campo]. */
function validarDocumento(array $entrada): array
{
    $datos = [
        'no_oficio'    => texto($entrada, 'no_oficio'),
        'fecha'        => texto($entrada, 'fecha'),
        'asunto'       => texto($entrada, 'asunto'),
        'remitente'    => texto($entrada, 'remitente'),
        'destinatario' => texto($entrada, 'destinatario'),
        'estatus'      => texto($entrada, 'estatus'),
    ];
    $errores = [];

    $longitudes = [
        'no_oficio'    => ['No. de oficio', 30],
        'asunto'       => ['Asunto', 200],
        'remitente'    => ['Remitente', 150],
        'destinatario' => ['Destinatario', 150],
    ];
    foreach ($longitudes as $campo => [$etiqueta, $maximo]) {
        if ($datos[$campo] === '') {
            $errores[$campo] = "$etiqueta es obligatorio.";
        } elseif (mb_strlen($datos[$campo]) > $maximo) {
            $errores[$campo] = "$etiqueta admite como máximo $maximo caracteres.";
        }
    }

    if (!isset($errores['no_oficio']) && !preg_match('/^[\p{L}\p{N}\/\-. ]+$/u', $datos['no_oficio'])) {
        $errores['no_oficio'] = 'Usa solo letras, números, espacios y los signos / - .';
    }

    if (!fechaValida($datos['fecha'])) {
        $errores['fecha'] = 'Escribe una fecha válida.';
    } elseif ($datos['fecha'] > date('Y-m-d')) {
        $errores['fecha'] = 'La fecha de recepción no puede ser futura.';
    }

    if (!in_array($datos['estatus'], ESTATUS_VALIDOS, true)) {
        $errores['estatus'] = 'Elige un estatus de la lista.';
    }

    return [$datos, $errores];
}

/* Inserta un renglón en la bitácora de estatus. */
function registrarCambioEstatus(PDO $pdo, int $id, ?string $anterior, string $nuevo): void
{
    $sql = 'INSERT INTO bitacora_estatus (id_documento, estatus_anterior, estatus_nuevo)
            VALUES (:id, :anterior, :nuevo)';
    $pdo->prepare($sql)->execute([':id' => $id, ':anterior' => $anterior, ':nuevo' => $nuevo]);
}
