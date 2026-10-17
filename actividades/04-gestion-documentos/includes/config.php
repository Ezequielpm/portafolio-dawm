<?php
/* ============================================================
   Configuración del sistema.

   Las credenciales no se escriben en el código: se leen de las
   variables de entorno del servidor. En Vercel se capturan en
   Settings → Environment Variables; en XAMPP no hace falta
   definir nada y se usan los valores por omisión (root sin
   contraseña en localhost).

   La carpeta includes/ tiene un .htaccess que impide abrirla
   desde el navegador en Apache.
   ============================================================ */

/* Lee una variable de entorno o regresa el valor por omisión. */
function entorno(string $nombre, string $omision = ''): string
{
    $valor = getenv($nombre);
    return $valor === false || $valor === '' ? $omision : $valor;
}

define('DB_HOST',    entorno('DB_HOST', 'localhost'));
define('DB_PUERTO',  (int) entorno('DB_PORT', '3306'));
define('DB_NOMBRE',  entorno('DB_NAME', 'gestion_documentos'));
define('DB_USUARIO', entorno('DB_USER', 'root'));
define('DB_CLAVE',   entorno('DB_PASSWORD', ''));

/* Certificado de la autoridad (CA) del servidor MySQL en la nube.
   Si se define, la conexión viaja cifrada con TLS y se verifica
   el certificado del servidor. Va en Base64 porque las variables
   de entorno no admiten bien saltos de línea. */
define('DB_SSL_CA_BASE64', entorno('DB_SSL_CA_BASE64'));

/* Límites de los archivos que se reciben. Vercel corta cualquier
   petición mayor a 4.5 MB, así que el total de la subida no puede
   pasar de 4 MB (el navegador reduce las fotos antes de mandarlas). */
const TAMANO_MAXIMO_PDF    = 4 * 1024 * 1024;   // 4 MB por PDF
const TAMANO_MAXIMO_IMAGEN = 4 * 1024 * 1024;   // 4 MB por fotografía
const PAGINAS_MAXIMAS      = 10;                // fotos por documento

/* Valores permitidos del estatus (los mismos del ENUM de la tabla). */
const ESTATUS_VALIDOS = ['Recibido', 'En proceso', 'Atendido'];

/* Registros por página en el listado. */
const REGISTROS_POR_PAGINA = 10;

date_default_timezone_set('America/Mexico_City');
