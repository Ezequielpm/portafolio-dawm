<?php
/* ============================================================
   POST api/eliminar.php
   Elimina el registro. Su PDF y su bitácora se borran solos por
   las llaves foráneas con ON DELETE CASCADE.   Campo: id
   ============================================================ */

require_once __DIR__ . '/../includes/utilidades.php';

exigirMetodo('POST');

$id = enteroPositivo($_POST['id'] ?? null);
if ($id === null) {
    responderError('Falta el identificador del documento.');
}

$pdo = conectaDB();

$consulta = $pdo->prepare('DELETE FROM documentos WHERE id_documento = :id');
$consulta->execute([':id' => $id]);

if ($consulta->rowCount() === 0) {
    responderError('El documento no existe o ya fue eliminado.', 404);
}

responderJson(['ok' => true, 'mensaje' => 'Documento eliminado.']);
