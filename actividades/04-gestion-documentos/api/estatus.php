<?php
/* ============================================================
   POST api/estatus.php
   Cambia solo el estatus de un documento y lo anota en la
   bitácora.   Campos: id, estatus
   ============================================================ */

require_once __DIR__ . '/../includes/utilidades.php';

exigirMetodo('POST');

$id      = enteroPositivo($_POST['id'] ?? null);
$estatus = texto($_POST, 'estatus');

if ($id === null) {
    responderError('Falta el identificador del documento.');
}
if (!in_array($estatus, ESTATUS_VALIDOS, true)) {
    responderError('Estatus no válido.');
}

$pdo = conectaDB();
$pdo->beginTransaction();

/* FOR UPDATE bloquea el renglón hasta el commit, para que dos cambios
   simultáneos no anoten un «estatus anterior» equivocado. */
$consulta = $pdo->prepare('SELECT estatus FROM documentos WHERE id_documento = :id FOR UPDATE');
$consulta->execute([':id' => $id]);
$anterior = $consulta->fetchColumn();

if ($anterior === false) {
    $pdo->rollBack();
    responderError('El documento no existe o ya fue eliminado.', 404);
}

if ($anterior !== $estatus) {
    $pdo->prepare('UPDATE documentos SET estatus = :estatus WHERE id_documento = :id')
        ->execute([':estatus' => $estatus, ':id' => $id]);
    registrarCambioEstatus($pdo, $id, $anterior, $estatus);
}

$pdo->commit();

responderJson(['ok' => true, 'estatus' => $estatus, 'mensaje' => "Estatus cambiado a «{$estatus}»."]);
