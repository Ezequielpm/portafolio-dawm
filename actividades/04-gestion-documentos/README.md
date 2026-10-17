# Sistema de Gestión de Documentos de una Oficina

Laboratorio práctico · Desarrollo de Aplicaciones Web y Móviles
Escuela de Tecnologías Digitales Aplicadas, Campus IV Tapachula — UNACH
Ezequiel Peña Mazariegos · Entrega: 16 de octubre de 2026

Plataforma web responsiva para registrar, digitalizar, buscar y dar
seguimiento a los oficios, circulares y solicitudes que recibe una oficina.
Hecha con HTML5, CSS3, Bootstrap 5, jQuery, PHP y MySQL.

- **Aplicación publicada:** <https://gestion-documentos-unach-six.vercel.app>
- **Código fuente:** <https://github.com/Ezequielpm/portafolio-dawm/tree/main/actividades/04-gestion-documentos>

Flujo que cubre: **recibir → digitalizar → registrar → buscar → actualizar
estatus → consultar PDF**.

## Publicación en Vercel

La versión en línea corre en Vercel con una base MySQL 8 en Aiven (plan
gratuito):

- **PHP en Vercel:** Vercel no ejecuta PHP de forma nativa; `vercel.json`
  indica que los archivos de `api/` usen el runtime comunitario
  `vercel-php` (PHP 8.3). `api/php.ini` ajusta los límites de subida.
- **Archivos internos:** las rutas de `vercel.json` responden 404 a
  `includes/`, `php.ini` y `vercel.json`. `.vercelignore` evita subir el SQL,
  el script de XAMPP y las credenciales locales.
- **Credenciales:** se capturan como variables de entorno del proyecto en
  Vercel: `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD` y
  `DB_SSL_CA_BASE64` (el certificado de Aiven en Base64, para que la conexión
  vaya cifrada con TLS y se verifique el servidor).
- **PDF:** se guardan en la tabla `archivos_pdf` de MySQL, porque el disco
  de una función de Vercel se borra entre peticiones. Vercel rechaza
  peticiones de más de 4.5 MB, por eso el límite es de 4 MB por documento.

Para volver a publicar después de un cambio, desde esta carpeta:

```bash
npx vercel deploy --prod
```

## Requisitos (para correrlo en XAMPP)

- XAMPP con **Apache** y **MySQL** (probado con PHP 8.2 y MariaDB 10.4).
- Extensiones de PHP `pdo_mysql`, `gd` y `fileinfo` (vienen activas en XAMPP).
- Navegador actualizado. Para tomar fotos, un celular en la misma red Wi-Fi
  que la computadora.

## Instalación

1. Abrir el panel de XAMPP y encender **Apache** y **MySQL**.
2. Copiar el proyecto a `htdocs` y crear la base de datos:

   ```bash
   ./sincronizar-xampp.sh --bd
   ```

   El script copia la carpeta a
   `/Applications/XAMPP/xamppfiles/htdocs/gestion-documentos` e importa
   `sql/gestion_documentos.sql`.
   Después de editar el código basta con `./sincronizar-xampp.sh` (sin `--bd`,
   que **borra y vuelve a crear** la base).

   **Sin el script (Windows o a mano):**
   - Copiar la carpeta a `htdocs/gestion-documentos`.
   - En phpMyAdmin → *Importar*, elegir `sql/gestion_documentos.sql`.
3. Abrir <http://localhost/gestion-documentos/>.

### Desde el celular

Con la computadora y el celular en la misma red, abrir
`http://IP-DE-LA-COMPUTADORA/gestion-documentos/`. La IP se consulta en macOS
con `ipconfig getifaddr en0` (en Windows, con `ipconfig`). Si no carga, revisar
que el firewall permita conexiones a Apache.

### Credenciales de la base de datos

`includes/config.php` las lee de variables de entorno. Si no hay ninguna
definida, como en XAMPP, usa `localhost` con el usuario `root` sin contraseña.
La carpeta `includes/` tiene un `.htaccess` que impide abrirla desde el
navegador. En un servidor real conviene crear un usuario de MySQL con permisos
solo sobre `gestion_documentos`:

```sql
CREATE USER 'gestion'@'localhost' IDENTIFIED BY 'una-contraseña-segura';
GRANT SELECT, INSERT, UPDATE, DELETE ON gestion_documentos.* TO 'gestion'@'localhost';
```

## Uso

| Pantalla | Qué se hace ahí |
|---|---|
| **Inicio** | Conteo de documentos por estatus y los cinco más recientes. Cada tarjeta abre el listado ya filtrado. |
| **Documentos** | Listado paginado. Buscador general o por campo (oficio, asunto, remitente, destinatario), filtro por estatus y rango de fechas. El estatus se cambia ahí mismo desde la insignia de cada fila; cada fila tiene ver, descargar, editar y eliminar. |
| **Nuevo** | Formulario de registro. **Tomar foto** abre la cámara del celular; **Seleccionar archivo** acepta un PDF o varias imágenes. Cada foto se vuelve una página del PDF. |
| **Ver** (👁) | Datos del documento, botones para cambiar el estatus, historial de cambios y visor del PDF con botones para abrirlo en otra pestaña o descargarlo. |

La campana de la barra superior muestra cuántos documentos siguen como
«Recibido» y los últimos cinco.

En el celular la navegación está en la barra inferior, con el botón central
**+** para registrar, y el menú lateral se abre con el botón ☰ (offcanvas de
Bootstrap). Desde 992 px el menú lateral queda fijo y el listado se muestra
como tabla.

## Estructura

```
04-gestion-documentos/
├── index.html              Única página; las vistas se cambian con #inicio, #documentos, #nuevo...
├── css/
│   ├── estilos.css         Identidad UNACH encima de Bootstrap (Mobile First, breakpoints 768 y 992 px)
│   └── vendor/bootstrap-5.3.3.min.css
├── js/
│   ├── app.js              Navegación, listado, formulario, cámara y visor (jQuery + componentes de Bootstrap)
│   └── vendor/             jQuery 3.7.1 y Bootstrap 5.3.3 en copia local: funciona sin internet
├── api/                    Endpoints PHP que responden JSON (php.ini: límites para Vercel)
│   ├── listar.php          GET  búsqueda, filtros y paginación
│   ├── obtener.php         GET  un documento con su historial
│   ├── guardar.php         POST alta y edición (multipart, con el archivo)
│   ├── estatus.php         POST cambio de estatus
│   ├── eliminar.php        POST borra registro y PDF
│   ├── pdf.php             GET  entrega el PDF (en línea o descarga)
│   └── sugerencias.php     GET  remitentes y destinatarios ya capturados
├── includes/               Solo para include; bloqueada al navegador
│   ├── config.php          Lee las credenciales de variables de entorno; límites
│   ├── conexion.php        Conexión PDO (con TLS si hay certificado)
│   ├── utilidades.php      Respuestas JSON y validación
│   └── archivos.php        Validación de PDF y conversión de fotos a PDF
├── sql/gestion_documentos.sql   Creación de la base y datos de prueba (con sus PDF)
├── img/logo-unach.png
├── vercel.json             Runtime de PHP y rutas bloqueadas en Vercel
├── .vercelignore           Lo que no se sube a Vercel
└── sincronizar-xampp.sh    Copia a htdocs (utilería, no es parte de la app)
```

## Base de datos

`gestion_documentos` tiene tres tablas:

- **documentos**: los campos del modelo mínimo (`id_documento`, `no_oficio`,
  `fecha`, `asunto`, `remitente`, `destinatario`, `estatus`, `archivo_pdf`)
  más `creado_en` y `actualizado_en`.
  - `estatus` es un `ENUM('Recibido','En proceso','Atendido')`.
  - `no_oficio` es `UNIQUE`.
  - Hay índices sobre `fecha`, `(estatus, fecha)`, `remitente` y
    `destinatario`, que son las columnas por las que filtra el listado.
- **bitacora_estatus**: un renglón por cada cambio de estatus, con el estatus
  anterior, el nuevo y la hora.
  - Su llave foránea hacia `documentos` tiene `ON DELETE CASCADE`.
- **archivos_pdf**: el contenido de cada PDF (`MEDIUMBLOB`) y su tamaño, uno
  por documento. Va aparte para que el listado no cargue los archivos.
  - Su llave foránea también tiene `ON DELETE CASCADE`.

El script incluye seis documentos de ejemplo con su historial y sus PDF
(escritos en hexadecimal dentro del mismo script).

## Digitalización

- **PDF**: se valida el contenido real del archivo, no la extensión. Debe
  empezar con `%PDF-` y `finfo` debe reconocerlo como `application/pdf`.
  Además, no puede pasar de 4 MB.
- **Fotos**: el navegador reduce cada foto a 2000 px de lado mayor con un
  `<canvas>` antes de subirla, así una foto de 5 MB llega en unos cientos de
  KB. En el servidor, `includes/archivos.php` hace lo siguiente:
  - abre cada foto con GD;
  - la endereza según su EXIF;
  - la vuelve a codificar como JPEG;
  - arma un PDF tamaño carta con una página por foto.

  Esto último se hace en PHP puro, sin librerías: PDF admite JPEG de forma
  nativa (filtro `DCTDecode`), así que basta escribir los objetos del PDF y su
  tabla `xref`.

  El PHP de Vercel no trae GD. Ahí se usa el JPEG que ya preparó el navegador,
  después de comprobar con `getimagesize` que es un JPEG a color de 2000 px o
  menos.
- Cada PDF se guarda en `archivos_pdf` con un nombre aleatorio
  (`doc_AAAAMMDD_xxxx.pdf`) en la columna `archivo_pdf`. Solo sale por
  `api/pdf.php`, que lo busca por el id del registro.

## Seguridad aplicada

- Sentencias preparadas (PDO) en todas las consultas. Los nombres de columna
  del buscador salen de una lista fija.
- Validación en el servidor de todos los campos: obligatorios, longitudes,
  formato del oficio, fecha real y no futura, estatus dentro de la lista. La
  validación del navegador solo sirve para avisar más rápido.
- Todo texto que viene de la base se escapa antes de insertarlo en el HTML.
- Las peticiones que modifican datos exigen el encabezado `X-Requested-With`,
  que un formulario de otro sitio no puede enviar (protección básica contra
  CSRF).
- Los errores internos se registran en el log del servidor. Al usuario solo
  le llega un mensaje general.
- Las altas y ediciones van en una transacción junto con su PDF: si algo
  falla no queda ni registro sin PDF ni PDF sin registro.
- Las credenciales no están en el código: se leen de variables de entorno.
  La conexión a la base en la nube va cifrada con TLS y verifica el
  certificado del servidor.

El sistema no tiene inicio de sesión porque la actividad no lo pide. Antes de
publicarlo en una red real habría que agregarlo.

## Pruebas realizadas

| Prueba | Resultado |
|---|---|
| Registro con 2 fotos (local y en Vercel, sin GD) | PDF de 2 páginas generado y visible en el visor |
| Registro con PDF | Se guarda tal cual; descarga como `Oficio_011-2026.pdf` |
| Archivo de texto renombrado a `.pdf` | Rechazado: «no es un PDF válido» |
| No. de oficio repetido, fecha futura, sin archivo | Los tres errores marcados en su campo |
| Búsqueda por destinatario «dirección» | 2 resultados (Dirección ETDA) |
| Rango de fechas + estatus | Filtra correctamente |
| Buscar `%` | 0 resultados (el comodín se busca como texto) |
| Cambio de estatus (tabla y detalle) | Se actualiza y se agrega al historial |
| Edición con PDF nuevo | Reemplaza el PDF anterior |
| Eliminación | Borra registro, historial y PDF (cascada); el PDF responde 404 |
| `includes/config.php`, `api/php.ini`, `sql/` en Vercel | 403 / 404, no se pueden descargar |
| POST sin `X-Requested-With` | 403 «Petición no permitida» |
| Remitente con `<b>` | Se muestra como texto, no como HTML |
| Vista a 390 px, 820 px y 1440 px | Sin desbordamiento horizontal; tarjetas en móvil, tabla en escritorio |
