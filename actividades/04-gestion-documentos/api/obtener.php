<?php
/* ============================================================
   GET api/obtener.php?id=5
   Un documento con su historial de estatus.
   ============================================================ */

require_once __DIR__ . '/../includes/utilidades.php';

exigirMetodo('GET');

$id = enteroPositivo($_GET['id'] ?? null);
if ($id === null) {
    responderError('Falta el identificador del documento.');
}

$pdo = conectaDB();

$consulta = $pdo->prepare(
    'SELECT id_documento, no_oficio, fecha, asunto, remitente, destinatario, estatus,
            archivo_pdf IS NOT NULL AS tiene_pdf, creado_en, actualizado_en
     FROM documentos WHERE id_documento = :id'
);
$consulta->execute([':id' => $id]);
$documento = $consulta->fetch();

if (!$documento) {
    responderError('El documento no existe o ya fue eliminado.', 404);
}
$documento['id_documento'] = (int) $documento['id_documento'];
$documento['tiene_pdf'] = (bool) $documento['tiene_pdf'];

$consulta = $pdo->prepare(
    'SELECT estatus_anterior, estatus_nuevo, fecha_cambio
     FROM bitacora_estatus WHERE id_documento = :id
     ORDER BY fecha_cambio, id_bitacora'
);
$consulta->execute([':id' => $id]);

responderJson(['ok' => true, 'documento' => $documento, 'bitacora' => $consulta->fetchAll()]);
