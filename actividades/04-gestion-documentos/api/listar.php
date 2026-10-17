<?php
/* ============================================================
   GET api/listar.php
   Listado paginado con búsqueda y filtros.

   Parámetros (todos opcionales):
     q       texto a buscar
     campo   dónde buscarlo: todos | no_oficio | asunto | remitente | destinatario
     estatus Recibido | En proceso | Atendido
     desde   fecha inicial AAAA-MM-DD
     hasta   fecha final   AAAA-MM-DD
     pagina  número de página, desde 1
     limite  registros por página (máx. 50)
   ============================================================ */

require_once __DIR__ . '/../includes/utilidades.php';

exigirMetodo('GET');

$q       = texto($_GET, 'q');
$campo   = texto($_GET, 'campo') ?: 'todos';
$estatus = texto($_GET, 'estatus');
$desde   = texto($_GET, 'desde');
$hasta   = texto($_GET, 'hasta');
$pagina  = enteroPositivo($_GET['pagina'] ?? 1) ?? 1;
$limite  = min(50, enteroPositivo($_GET['limite'] ?? REGISTROS_POR_PAGINA) ?? REGISTROS_POR_PAGINA);

/* Los nombres de columna no se pueden mandar como parámetro de una
   sentencia preparada, así que solo se aceptan los de esta lista. */
$camposBuscables = ['no_oficio', 'asunto', 'remitente', 'destinatario'];
if ($campo !== 'todos' && !in_array($campo, $camposBuscables, true)) {
    responderError('Campo de búsqueda no válido.');
}
if ($estatus !== '' && !in_array($estatus, ESTATUS_VALIDOS, true)) {
    responderError('Estatus no válido.');
}
if (($desde !== '' && !fechaValida($desde)) || ($hasta !== '' && !fechaValida($hasta))) {
    responderError('Las fechas del filtro no son válidas.');
}
if ($desde !== '' && $hasta !== '' && $desde > $hasta) {
    responderError('La fecha «desde» es posterior a la fecha «hasta».');
}

/* ---- Armado del WHERE con parámetros ---------------------- */
$condiciones = [];
$parametros  = [];

if ($q !== '') {
    $columnas = $campo === 'todos' ? $camposBuscables : [$campo];
    $partes = [];
    foreach ($columnas as $i => $columna) {
        $partes[] = "$columna LIKE :q$i";
        $parametros[":q$i"] = '%' . escaparLike($q) . '%';
    }
    $condiciones[] = '(' . implode(' OR ', $partes) . ')';
}
if ($estatus !== '') {
    $condiciones[] = 'estatus = :estatus';
    $parametros[':estatus'] = $estatus;
}
if ($desde !== '') {
    $condiciones[] = 'fecha >= :desde';
    $parametros[':desde'] = $desde;
}
if ($hasta !== '') {
    $condiciones[] = 'fecha <= :hasta';
    $parametros[':hasta'] = $hasta;
}

$where = $condiciones ? 'WHERE ' . implode(' AND ', $condiciones) : '';

$pdo = conectaDB();

/* Total de coincidencias, para la paginación. */
$consulta = $pdo->prepare("SELECT COUNT(*) FROM documentos $where");
$consulta->execute($parametros);
$total = (int) $consulta->fetchColumn();

$paginas = max(1, (int) ceil($total / $limite));
$pagina  = min($pagina, $paginas);
$offset  = ($pagina - 1) * $limite;

/* $limite y $offset ya son enteros validados. */
$sql = "SELECT id_documento, no_oficio, fecha, asunto, remitente, destinatario, estatus,
               archivo_pdf IS NOT NULL AS tiene_pdf
        FROM documentos
        $where
        ORDER BY fecha DESC, id_documento DESC
        LIMIT $limite OFFSET $offset";
$consulta = $pdo->prepare($sql);
$consulta->execute($parametros);
$documentos = $consulta->fetchAll();

foreach ($documentos as &$d) {
    $d['id_documento'] = (int) $d['id_documento'];
    $d['tiene_pdf'] = (bool) $d['tiene_pdf'];
}
unset($d);

/* Conteo general por estatus (sin filtros), para el panel de inicio. */
$conteo = array_fill_keys(ESTATUS_VALIDOS, 0);
foreach ($pdo->query('SELECT estatus, COUNT(*) AS n FROM documentos GROUP BY estatus') as $fila) {
    $conteo[$fila['estatus']] = (int) $fila['n'];
}

responderJson([
    'ok'         => true,
    'documentos' => $documentos,
    'total'      => $total,
    'pagina'     => $pagina,
    'paginas'    => $paginas,
    'limite'     => $limite,
    'conteo'     => $conteo,
]);
