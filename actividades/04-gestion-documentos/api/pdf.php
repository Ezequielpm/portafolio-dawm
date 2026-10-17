<?php
/* ============================================================
   GET api/pdf.php?id=5              → muestra el PDF en el navegador
   GET api/pdf.php?id=5&descargar=1  → lo descarga

   Los PDF están guardados en la tabla archivos_pdf; solo salen
   por aquí, y solo si pertenecen a un registro existente.
   ============================================================ */

require_once __DIR__ . '/../includes/conexion.php';

/* Esta respuesta se abre dentro de un <iframe> o en otra pestaña,
   así que los errores se devuelven como texto, no como JSON. */
function errorPdf(int $codigo, string $mensaje): void
{
    http_response_code($codigo);
    header('Content-Type: text/plain; charset=utf-8');
    echo $mensaje;
    exit;
}

$id = filter_var($_GET['id'] ?? null, FILTER_VALIDATE_INT, ['options' => ['min_range' => 1]]);
if ($id === false) {
    errorPdf(400, 'Falta el identificador del documento.');
}

try {
    $consulta = conectaDB()->prepare(
        'SELECT d.no_oficio, a.contenido
         FROM documentos d JOIN archivos_pdf a ON a.id_documento = d.id_documento
         WHERE d.id_documento = :id'
    );
    $consulta->execute([':id' => $id]);
    $documento = $consulta->fetch();
} catch (PDOException $e) {
    error_log('[gestion-documentos] ' . $e);
    errorPdf(500, 'No se pudo conectar con la base de datos.');
}

if (!$documento) {
    errorPdf(404, 'El documento no tiene PDF asociado.');
}

/* Nombre con el que se descarga: «Oficio_001-2026.pdf». */
$nombre = 'Oficio_' . preg_replace('/[^A-Za-z0-9._-]+/', '-', $documento['no_oficio']) . '.pdf';
$disposicion = isset($_GET['descargar']) ? 'attachment' : 'inline';

header('Content-Type: application/pdf');
header("Content-Disposition: $disposicion; filename=\"$nombre\"");
header('Content-Length: ' . strlen($documento['contenido']));
header('X-Content-Type-Options: nosniff');
header('Cache-Control: private, no-cache');
echo $documento['contenido'];
