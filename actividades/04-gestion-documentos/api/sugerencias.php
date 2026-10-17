<?php
/* ============================================================
   GET api/sugerencias.php
   Remitentes y destinatarios ya capturados, para sugerirlos en
   el formulario y que no se escriba la misma dependencia de
   varias formas distintas.
   ============================================================ */

require_once __DIR__ . '/../includes/utilidades.php';

exigirMetodo('GET');

$pdo = conectaDB();

responderJson([
    'ok'            => true,
    'remitentes'    => $pdo->query('SELECT DISTINCT remitente FROM documentos ORDER BY remitente')->fetchAll(PDO::FETCH_COLUMN),
    'destinatarios' => $pdo->query('SELECT DISTINCT destinatario FROM documentos ORDER BY destinatario')->fetchAll(PDO::FETCH_COLUMN),
]);
