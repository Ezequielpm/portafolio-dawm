<?php
/* ============================================================
   Digitalización: recibe el archivo del formulario y lo deja
   listo como PDF para guardarlo en la base de datos.

   El formulario manda una de dos cosas:
     - pdf        → un PDF ya hecho (se valida y se guarda tal cual).
     - paginas[]  → una o varias fotografías JPEG/PNG, que aquí se
                    convierten en un PDF de una página por foto.

   La conversión se hace con PHP puro (sin librerías): una imagen
   JPEG se puede meter dentro de un PDF sin recodificarla, porque
   el formato PDF entiende JPEG de forma nativa (filtro DCTDecode).

   Los PDF se guardan en MySQL (tabla archivos_pdf) y no en una
   carpeta: en Vercel el disco del servidor se borra entre una
   petición y otra, así que un archivo escrito ahí se perdería.
   ============================================================ */

require_once __DIR__ . '/config.php';

/* Error causado por el archivo que mandó el usuario (se le muestra). */
class ErrorDeArchivo extends RuntimeException {}

/* Lado más largo, en píxeles, con el que se guarda cada fotografía.
   Una foto de celular de 4000 px pesa varios MB y no aporta nada
   al leer un oficio; 2000 px bastan y el PDF queda ligero. */
const LADO_MAXIMO_FOTO = 2000;
const CALIDAD_JPEG     = 82;

/**
 * Procesa el archivo que venga en la petición.
 * Devuelve ['nombre' => ..., 'contenido' => bytes del PDF],
 * o null si no se mandó archivo.
 */
function leerArchivoSubido(): ?array
{
    if (isset($_FILES['pdf']) && $_FILES['pdf']['error'] !== UPLOAD_ERR_NO_FILE) {
        $contenido = leerPdfSubido($_FILES['pdf']);
    } elseif (isset($_FILES['paginas']) && is_array($_FILES['paginas']['name'])) {
        $contenido = fotosComoPdf(reordenarArchivos($_FILES['paginas']));
    } else {
        return null;
    }

    return ['nombre' => nombreNuevo(), 'contenido' => $contenido];
}

/* Guarda (o reemplaza) el PDF de un documento. */
function guardarPdfEnBase(PDO $pdo, int $id, string $contenido): void
{
    $consulta = $pdo->prepare(
        'REPLACE INTO archivos_pdf (id_documento, contenido, tamano) VALUES (:id, :contenido, :tamano)'
    );
    $consulta->bindValue(':id', $id, PDO::PARAM_INT);
    $consulta->bindValue(':contenido', $contenido, PDO::PARAM_LOB);
    $consulta->bindValue(':tamano', strlen($contenido), PDO::PARAM_INT);
    $consulta->execute();
}

/* ---- PDF subido directamente ------------------------------ */

function leerPdfSubido(array $archivo): string
{
    revisarErrorDeSubida($archivo, TAMANO_MAXIMO_PDF);

    /* No se confía en la extensión ni en el tipo que dice el navegador:
       se revisa el contenido real del archivo. */
    $tipo = (new finfo(FILEINFO_MIME_TYPE))->file($archivo['tmp_name']);
    $inicio = file_get_contents($archivo['tmp_name'], false, null, 0, 5);

    if ($tipo !== 'application/pdf' || $inicio !== '%PDF-') {
        throw new ErrorDeArchivo('El archivo seleccionado no es un PDF válido.');
    }

    return file_get_contents($archivo['tmp_name']);
}

/* ---- Fotografías → PDF ------------------------------------ */

function fotosComoPdf(array $fotos): string
{
    $fotos = array_values(array_filter($fotos, fn($f) => $f['error'] !== UPLOAD_ERR_NO_FILE));

    if (count($fotos) === 0) {
        throw new ErrorDeArchivo('No se recibió ninguna fotografía.');
    }
    if (count($fotos) > PAGINAS_MAXIMAS) {
        throw new ErrorDeArchivo('Se admiten como máximo ' . PAGINAS_MAXIMAS . ' fotografías por documento.');
    }

    $paginas = [];
    foreach ($fotos as $i => $foto) {
        revisarErrorDeSubida($foto, TAMANO_MAXIMO_IMAGEN);
        $paginas[] = prepararFoto($foto['tmp_name'], $i + 1);
    }

    return construirPdf($paginas);
}

/**
 * Abre la foto con GD, la endereza según su EXIF, la reduce si es muy
 * grande y la vuelve a codificar como JPEG RGB. Re-codificarla también
 * descarta cualquier contenido extra que viniera escondido en el archivo.
 *
 * El PHP de Vercel no trae GD. Ahí se usa el JPEG tal como lo manda el
 * navegador, que ya lo redujo y enderezó en un <canvas>; solo se
 * comprueba que de verdad sea un JPEG a color.
 */
function prepararFoto(string $ruta, int $numero): array
{
    $tipo = (new finfo(FILEINFO_MIME_TYPE))->file($ruta);

    if (!extension_loaded('gd')) {
        return fotoSinGd($ruta, $tipo, $numero);
    }

    switch ($tipo) {
        case 'image/jpeg':
            $imagen = @imagecreatefromjpeg($ruta);
            break;
        case 'image/png':
            $imagen = @imagecreatefrompng($ruta);
            break;
        default:
            throw new ErrorDeArchivo("La foto $numero no es JPEG ni PNG.");
    }
    if (!$imagen) {
        throw new ErrorDeArchivo("La foto $numero está dañada o no se pudo leer.");
    }

    if ($tipo === 'image/jpeg') {
        $imagen = aplicarOrientacionExif($imagen, $ruta);
    }

    /* Escala para que el lado mayor no pase de LADO_MAXIMO_FOTO. */
    $ancho = imagesx($imagen);
    $alto  = imagesy($imagen);
    $escala = min(1, LADO_MAXIMO_FOTO / max($ancho, $alto));
    $nuevoAncho = max(1, (int) round($ancho * $escala));
    $nuevoAlto  = max(1, (int) round($alto * $escala));

    /* Fondo blanco: un PNG con transparencia se vería negro en JPEG. */
    $lienzo = imagecreatetruecolor($nuevoAncho, $nuevoAlto);
    imagefill($lienzo, 0, 0, imagecolorallocate($lienzo, 255, 255, 255));
    imagecopyresampled($lienzo, $imagen, 0, 0, 0, 0, $nuevoAncho, $nuevoAlto, $ancho, $alto);
    imagedestroy($imagen);

    ob_start();
    imagejpeg($lienzo, null, CALIDAD_JPEG);
    $jpeg = ob_get_clean();
    imagedestroy($lienzo);

    return ['jpeg' => $jpeg, 'ancho' => $nuevoAncho, 'alto' => $nuevoAlto];
}

function fotoSinGd(string $ruta, string $tipo, int $numero): array
{
    $info = @getimagesize($ruta);

    if ($tipo !== 'image/jpeg' || !$info || $info[2] !== IMAGETYPE_JPEG) {
        throw new ErrorDeArchivo("La foto $numero no es JPEG.");
    }
    /* DeviceRGB en el PDF: un JPEG en escala de grises o CMYK se vería mal. */
    if (($info['channels'] ?? 3) !== 3) {
        throw new ErrorDeArchivo("La foto $numero no está en color RGB.");
    }
    if (max($info[0], $info[1]) > LADO_MAXIMO_FOTO) {
        throw new ErrorDeArchivo("La foto $numero es demasiado grande; vuelve a seleccionarla.");
    }

    return ['jpeg' => file_get_contents($ruta), 'ancho' => $info[0], 'alto' => $info[1]];
}

/* Las cámaras guardan la foto «acostada» y anotan en el EXIF cómo
   girarla. El PDF ignora el EXIF, así que el giro se aplica aquí. */
function aplicarOrientacionExif($imagen, string $ruta)
{
    if (!function_exists('exif_read_data')) {
        return $imagen;
    }
    $exif = @exif_read_data($ruta);
    $orientacion = $exif['Orientation'] ?? 1;

    $giros = [3 => 180, 6 => -90, 8 => 90];
    if (isset($giros[$orientacion])) {
        $girada = imagerotate($imagen, $giros[$orientacion], 0);
        imagedestroy($imagen);
        return $girada;
    }
    return $imagen;
}

/**
 * Arma un PDF con una imagen JPEG por página.
 *
 * Estructura del PDF que se genera:
 *   1 Catalog → 2 Pages → por cada foto: Page, Contents (dibuja la
 *   imagen) e Image (los bytes del JPEG). Al final va la tabla xref
 *   con la posición en bytes de cada objeto.
 *
 * Cada página es tamaño carta (612 × 792 puntos), vertical u
 * horizontal según la foto, con la imagen centrada.
 */
function construirPdf(array $paginas): string
{
    $objetos = [];   // número de objeto => contenido
    $hijos = [];

    foreach ($paginas as $i => $p) {
        $nPagina    = 3 + $i * 3;
        $nContenido = $nPagina + 1;
        $nImagen    = $nPagina + 2;
        $hijos[] = "$nPagina 0 R";

        $horizontal = $p['ancho'] > $p['alto'];
        [$anchoHoja, $altoHoja] = $horizontal ? [792, 612] : [612, 792];
        $margen = 24;

        $escala = min(($anchoHoja - 2 * $margen) / $p['ancho'], ($altoHoja - 2 * $margen) / $p['alto']);
        $w = $p['ancho'] * $escala;
        $h = $p['alto'] * $escala;
        $x = ($anchoHoja - $w) / 2;
        $y = ($altoHoja - $h) / 2;

        $dibujo = sprintf("q %.2F 0 0 %.2F %.2F %.2F cm /Im0 Do Q", $w, $h, $x, $y);

        $objetos[$nPagina] = "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 $anchoHoja $altoHoja] "
                           . "/Resources << /XObject << /Im0 $nImagen 0 R >> >> /Contents $nContenido 0 R >>";
        $objetos[$nContenido] = "<< /Length " . strlen($dibujo) . " >>\nstream\n$dibujo\nendstream";
        $objetos[$nImagen] = "<< /Type /XObject /Subtype /Image /Width {$p['ancho']} /Height {$p['alto']} "
                           . "/ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode "
                           . "/Length " . strlen($p['jpeg']) . " >>\nstream\n{$p['jpeg']}\nendstream";
    }

    $objetos[1] = '<< /Type /Catalog /Pages 2 0 R >>';
    $objetos[2] = '<< /Type /Pages /Kids [' . implode(' ', $hijos) . '] /Count ' . count($hijos) . ' >>';
    ksort($objetos);

    /* La segunda línea con bytes > 127 le indica a los lectores que
       el archivo es binario. */
    $pdf = "%PDF-1.4\n%\xE2\xE3\xCF\xD3\n";
    $posiciones = [];
    foreach ($objetos as $numero => $contenido) {
        $posiciones[$numero] = strlen($pdf);
        $pdf .= "$numero 0 obj\n$contenido\nendobj\n";
    }

    $inicioXref = strlen($pdf);
    $total = count($objetos) + 1;
    $pdf .= "xref\n0 $total\n0000000000 65535 f \n";
    foreach ($posiciones as $posicion) {
        $pdf .= sprintf("%010d 00000 n \n", $posicion);
    }
    $pdf .= "trailer\n<< /Size $total /Root 1 0 R >>\nstartxref\n$inicioXref\n%%EOF\n";

    return $pdf;
}

/* ---- Auxiliares ------------------------------------------- */

function revisarErrorDeSubida(array $archivo, int $tamanoMaximo): void
{
    $mb = round($tamanoMaximo / 1048576);

    switch ($archivo['error']) {
        case UPLOAD_ERR_OK:
            break;
        case UPLOAD_ERR_INI_SIZE:
        case UPLOAD_ERR_FORM_SIZE:
            throw new ErrorDeArchivo("El archivo pesa más de $mb MB.");
        case UPLOAD_ERR_PARTIAL:
            throw new ErrorDeArchivo('El archivo llegó incompleto. Intenta de nuevo.');
        default:
            throw new RuntimeException('Error de subida de PHP, código ' . $archivo['error']);
    }

    if ($archivo['size'] > $tamanoMaximo) {
        throw new ErrorDeArchivo("El archivo pesa más de $mb MB.");
    }
    if (!is_uploaded_file($archivo['tmp_name'])) {
        throw new ErrorDeArchivo('El archivo no se recibió correctamente.');
    }
}

/* PHP agrupa los archivos múltiples por propiedad (name[], tmp_name[]...);
   aquí se voltean para tener un arreglo por archivo. */
function reordenarArchivos(array $grupo): array
{
    $archivos = [];
    foreach ($grupo['name'] as $i => $_) {
        $archivos[] = [
            'name'     => $grupo['name'][$i],
            'tmp_name' => $grupo['tmp_name'][$i],
            'error'    => $grupo['error'][$i],
            'size'     => $grupo['size'][$i],
        ];
    }
    return $archivos;
}

/* Nombre con el que se identifica el archivo (columna archivo_pdf).
   Es aleatorio: no depende de lo que escriba el usuario. */
function nombreNuevo(): string
{
    return 'doc_' . date('Ymd') . '_' . bin2hex(random_bytes(8)) . '.pdf';
}
