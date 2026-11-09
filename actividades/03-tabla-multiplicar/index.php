<?php
/* ============================================================
   Actividad 3 — Tabla de multiplicar con PHP
   Desarrollo de Aplicaciones Web y Móviles · UNACH

   El número a multiplicar viaja en la URL como parámetro GET:

       http://localhost/tabla/index.php?num=2

   PHP lo recibe en el arreglo superglobal $_GET, usando como
   llave el nombre que aparece después del «?»:  $_GET['num'].
   ============================================================ */

/* ---- Valores permitidos ------------------------------------ */
const NUM_MINIMO   = -1000;   // límites del número a multiplicar
const NUM_MAXIMO   = 1000;
const HASTA_MINIMO = 1;       // límites de la cantidad de filas
const HASTA_MAXIMO = 20;
const HASTA_DEFECTO = 10;

/* ---- 1. Lectura de los parámetros de la URL ---------------- */
/* isset() evita el aviso «Undefined array key» cuando la página
   se abre sin parámetros. */
$numeroCrudo = isset($_GET['num'])   ? trim($_GET['num'])   : '';
$hastaCrudo  = isset($_GET['hasta']) ? trim($_GET['hasta']) : '';

/* ---- 2. Validación ----------------------------------------- */
/* Todo lo que llega por la URL es texto, así que se comprueba
   que sea un entero antes de usarlo en la multiplicación. */
$numero = null;
$error  = '';

if ($numeroCrudo !== '') {
    $numeroValidado = filter_var($numeroCrudo, FILTER_VALIDATE_INT);

    if ($numeroValidado === false) {
        $error = 'El valor «' . $numeroCrudo . '» no es un número entero.';
    } elseif ($numeroValidado < NUM_MINIMO || $numeroValidado > NUM_MAXIMO) {
        $error = 'El número debe estar entre ' . NUM_MINIMO . ' y ' . NUM_MAXIMO . '.';
    } else {
        $numero = $numeroValidado;
    }
}

/* La cantidad de filas es opcional: si no viene, o viene mal,
   se usa el valor por omisión sin mostrar error. */
$hasta = filter_var($hastaCrudo, FILTER_VALIDATE_INT);
if ($hasta === false || $hasta < HASTA_MINIMO || $hasta > HASTA_MAXIMO) {
    $hasta = HASTA_DEFECTO;
}

/* ---- 3. Generación de la tabla ----------------------------- */
/* Se arma en un arreglo y la plantilla de abajo solo lo recorre,
   para no mezclar el cálculo con el HTML. */
$filas = [];
if ($numero !== null) {
    for ($i = 1; $i <= $hasta; $i++) {
        $filas[] = [
            'multiplicador' => $i,
            'resultado'     => $numero * $i,
        ];
    }
}

/* htmlspecialchars() en cada dato que se imprime: lo que llega
   por la URL no se escribe tal cual dentro del HTML. */
function esc($valor) {
    return htmlspecialchars((string) $valor, ENT_QUOTES, 'UTF-8');
}

/* La carpeta funciona en dos lugares: dentro del portafolio y suelta en
   htdocs. El enlace de regreso solo se dibuja si la portada está arriba. */
$dentroDelPortafolio = is_file(__DIR__ . '/../../index.html');
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Actividad 3 — Tabla de multiplicar | UNACH</title>
    <link rel="stylesheet" href="css/estilos.css">
</head>
<body>

    <div class="envoltorio">

<?php if ($dentroDelPortafolio): ?>
        <a class="volver" href="../../index.html">&larr; Volver al portafolio</a>
<?php endif; ?>

        <header class="cabecera">
            <div class="marca">
                <img src="img/logo-unach.png" alt="Logotipo UNACH">
                <div>
                    <span class="marca-nombre">Tabla<strong>PHP</strong></span>
                    <span class="marca-lema">Universidad Autónoma de Chiapas</span>
                </div>
            </div>
            <span class="insignia">PHP <?= esc(PHP_VERSION) ?></span>
        </header>

        <section class="hero">
            <h1>Tabla de multiplicar</h1>
        </section>

        <!-- El formulario usa method="get": al enviarlo, el navegador
             arma solo la URL con ?num=...&hasta=... -->
        <form class="panel-consulta" method="get" action="index.php">
            <div class="campo">
                <label for="num">Número</label>
                <input type="number" id="num" name="num"
                       min="<?= NUM_MINIMO ?>" max="<?= NUM_MAXIMO ?>" step="1"
                       placeholder="2"
                       value="<?= esc($numeroCrudo) ?>" required>
            </div>

            <div class="campo">
                <label for="hasta">Hasta el</label>
                <input type="number" id="hasta" name="hasta"
                       min="<?= HASTA_MINIMO ?>" max="<?= HASTA_MAXIMO ?>" step="1"
                       value="<?= esc($hasta) ?>">
            </div>

            <button type="submit">Generar tabla</button>
        </form>

<?php if ($error !== ''): ?>
        <p class="aviso aviso-error"><?= esc($error) ?></p>

<?php elseif ($numero === null): ?>
        <p class="aviso aviso-neutro">
            Escribe un número y pulsa <strong>Generar tabla</strong>, o agrega el
            parámetro directamente en la barra de direcciones:
            <code>index.php?num=7</code>.
        </p>

<?php else: ?>
        <section class="resultado">
            <div class="resultado-encabezado">
                <h2>Tabla del <?= esc($numero) ?></h2>
                <span class="resultado-url">
                    <?= esc($_SERVER['PHP_SELF']) ?>?num=<?= esc($numero) ?>&amp;hasta=<?= esc($hasta) ?>
                </span>
            </div>

            <table class="tabla">
                <caption><?= count($filas) ?> multiplicaciones generadas en el servidor</caption>
                <thead>
                    <tr>
                        <th scope="col">Operación</th>
                        <th scope="col">Resultado</th>
                    </tr>
                </thead>
                <tbody>
<?php foreach ($filas as $fila): ?>
                    <tr>
                        <td><?= esc($numero) ?> &times; <?= esc($fila['multiplicador']) ?></td>
                        <td class="celda-resultado"><?= esc($fila['resultado']) ?></td>
                    </tr>
<?php endforeach; ?>
                </tbody>
            </table>
        </section>
<?php endif; ?>

        <footer class="pie">
            <p><strong>Universidad Autónoma de Chiapas</strong> · Desarrollo de Aplicaciones Web y Móviles</p>
            <p>Ezequiel Peña Mazariegos · Página generada el
               <?= esc(date('d/m/Y H:i:s')) ?> por el servidor.</p>
        </footer>

    </div>

</body>
</html>
