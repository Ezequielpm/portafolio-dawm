<?php
/* ============================================================
   Conexión a MySQL con PDO.

   Se usa PDO con sentencias preparadas en toda la API: los
   valores viajan separados del SQL, así que lo que escribe el
   usuario nunca se interpreta como código SQL.
   ============================================================ */

require_once __DIR__ . '/config.php';

function conectaDB(): PDO
{
    static $pdo = null;   // una sola conexión por petición

    if ($pdo === null) {
        $dsn = 'mysql:host=' . DB_HOST . ';port=' . DB_PUERTO . ';dbname=' . DB_NOMBRE . ';charset=utf8mb4';

        $opciones = [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,  // los errores lanzan excepción
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES   => false,                   // preparadas reales en el servidor
        ];

        /* En la nube la conexión va cifrada. PDO pide el certificado
           como archivo, así que se escribe en /tmp (la única carpeta
           con permiso de escritura en Vercel). */
        if (DB_SSL_CA_BASE64 !== '') {
            $ca = sys_get_temp_dir() . '/mysql-ca.pem';
            if (!is_file($ca)) {
                file_put_contents($ca, base64_decode(DB_SSL_CA_BASE64));
            }
            $opciones[PDO::MYSQL_ATTR_SSL_CA] = $ca;
            $opciones[PDO::MYSQL_ATTR_SSL_VERIFY_SERVER_CERT] = true;
        }

        $pdo = new PDO($dsn, DB_USUARIO, DB_CLAVE, $opciones);

        /* Las fechas de creación y modificación se guardan con la hora
           del servidor MySQL; así salen en hora de México aunque el
           servidor esté en otro país. */
        $pdo->exec("SET time_zone = '" . date('P') . "'");
    }

    return $pdo;
}
