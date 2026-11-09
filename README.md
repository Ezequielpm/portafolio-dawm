# Portafolio de Actividades

**Desarrollo de Aplicaciones Web y Móviles**
Ezequiel Peña Mazariegos · Matrícula 100017097 · 7.º semestre, grupo A
Escuela de Tecnologías Digitales Aplicadas, Campus IV — UNACH
Agosto–diciembre de 2026

Repositorio donde voy reuniendo las prácticas de la materia. La portada
(`index.html`) lista cada actividad y enlaza a su carpeta.

Sitio publicado: https://ezequielpm.github.io/portafolio-dawm/

## Organización

Cada práctica vive en su propia carpeta dentro de `actividades/`, con su
HTML, su CSS y su JavaScript. Lo que se repite entre prácticas —el logo de
la universidad, las fotos, los estilos de la portada— está en `assets/`,
para no duplicar archivos.

```
portafolio-dawm/
├── index.html
├── assets/
│   ├── css/portafolio.css
│   ├── js/actividades.js
│   ├── js/portafolio.js
│   └── img/
├── actividades/
│   ├── 01-calculadora-unach/
│   │   ├── index.html
│   │   ├── css/estilos.css
│   │   └── js/app.js
│   ├── 02-cursos-monedas/
│   │   ├── index.html
│   │   ├── css/estilos.css
│   │   ├── js/cursos.js
│   │   └── js/app.js
│   └── 03-tabla-multiplicar/
│       ├── index.php
│       ├── ficha.html
│       ├── css/estilos.css
│       ├── js/ficha.js
│       └── img/
├── reporte/
└── README.md
```

La portada no tiene las tarjetas escritas a mano: las arma
`assets/js/portafolio.js` recorriendo el arreglo de `assets/js/actividades.js`.
Así, al terminar una práctica nueva basta con agregar sus datos a ese arreglo
en lugar de editar el HTML.

## Práctica 01 — Calculadora y consulta de API

Página con la identidad de la UNACH. Contiene dos ejercicios: una calculadora
que resuelve las cuatro operaciones capturando eventos con jQuery, y una
consulta que trae un usuario por su `id` desde `jsonplaceholder.typicode.com`
con `$.get()` y muestra su nombre y correo.

## Práctica 02 — Oferta académica con precios multimoneda

SPA responsiva con el catálogo de cursos de una institución, tomando como
referencia visual la plataforma SaberesMX.

**Rejilla responsiva.** Las seis tarjetas se acomodan con CSS Grid:

```css
grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
```

`auto-fill` calcula cuántas columnas caben en el ancho disponible y `minmax()`
impide que una tarjeta se angoste más de 280 px. La rejilla pasa sola de
cuatro columnas a tres, dos y una, sin declarar la cantidad de columnas para
cada resolución. Las media queries de 1024, 860 y 520 px solo ajustan
márgenes y tipografía.

**Ampliación de la imagen.** Al pasar el cursor sobre la portada del curso,
esta crece 10 %:

```css
.tarjeta-portada { overflow: hidden; }
.tarjeta-portada:hover .portada-imagen { transform: scale(1.1); }
```

El `overflow: hidden` es lo que hace que la imagen se recorte al crecer en
lugar de empujar el resto de la tarjeta.

**Precios en tres monedas.** El precio en pesos es fijo y vive en
`precioMXN`, dentro de `js/cursos.js`. El botón *Actualizar precios* consulta
el tipo de cambio y recalcula únicamente dólar y yen:

| | Servicio | Petición |
|---|---|---|
| Principal | Frankfurter (Banco Central Europeo) | `api.frankfurter.dev/v1/latest?base=MXN&symbols=USD,JPY` |
| Respaldo | ExchangeRate-API | `open.er-api.com/v6/latest/MXN` |

Ninguno de los dos pide llave de acceso. Si el principal falla se intenta el
de respaldo, y si tampoco responde se conservan las tasas de referencia de
`TASAS_RESPALDO` y la página avisa que no hubo conexión, para que el precio
mostrado nunca aparezca como si viniera del servicio.

El símbolo, el separador de miles y los decimales de cada moneda los resuelve
`Intl.NumberFormat`; por eso el yen se muestra sin decimales sin tener que
programarlo aparte.

El reporte de esta práctica está en `reporte/`, junto con el HTML que lo
genera.

## Práctica 03 — Tabla de multiplicar con PHP

Primera práctica del lado del servidor. Un script en PHP recibe un número por
la URL y devuelve su tabla de multiplicar ya armada:

```
http://localhost/tabla/index.php?num=2
```

`$_GET` es el arreglo superglobal donde PHP deja los parámetros de la cadena de
consulta, con el nombre del parámetro como llave:

```php
$numeroCrudo = isset($_GET['num']) ? trim($_GET['num']) : '';
$numero = filter_var($numeroCrudo, FILTER_VALIDATE_INT);
```

`isset()` evita el aviso *Undefined array key* cuando la página se abre sin
parámetros, y `filter_var()` comprueba que el texto que llegó por la URL sea un
entero antes de usarlo en la multiplicación. Todo lo que se imprime pasa por
`htmlspecialchars()`, porque el contenido de la URL lo escribe quien sea desde
la barra de direcciones. El parámetro opcional `hasta` cambia cuántas filas se
generan (1 a 20, por omisión 10).

Esta práctica corre sobre Apache, así que **no funciona en GitHub Pages**, que
solo sirve archivos estáticos. Por eso la carpeta incluye además `ficha.html`,
que reproduce la misma tabla con JavaScript —leyendo la URL con
`URLSearchParams`, el equivalente de `$_GET` en el navegador— y muestra el
código PHP original. La tarjeta del portafolio apunta a esa ficha; el
entregable real es `index.php`.

### Cómo correrla en XAMPP

1. Iniciar **Apache** desde el panel de XAMPP.
2. Copiar `actividades/03-tabla-multiplicar/` a `htdocs` con el nombre `tabla`;
   el script `sincronizar-xampp.sh` de esa carpeta lo hace.
3. Abrir <http://localhost/tabla/index.php?num=2>.

Tiene que ser una copia y no un enlace simbólico: Apache corre como el usuario
`daemon`, que no puede entrar a `~/Documents`, y el enlace acaba en un
**Error 403**.

Detalles y tabla de parámetros en el `README.md` de la propia carpeta.

## Ejecución local

```bash
python3 -m http.server 8000
```

Y abrir <http://localhost:8000>. Hace falta un servidor porque las peticiones
a la API no funcionan bien abriendo el archivo directamente con `file://`.

Esto alcanza para las prácticas 01 y 02 y para la ficha de la 03. El
`index.php` de la práctica 03 necesita Apache con PHP; para eso se usa XAMPP,
como se explica arriba.

## Publicación

Todas las rutas son relativas, así que el sitio funciona subiendo la carpeta
tal cual a cualquier hosting estático. Está publicado en GitHub Pages desde
la rama `main`.

El único archivo que un hosting estático no puede ejecutar es
`actividades/03-tabla-multiplicar/index.php`; se sube igual, porque es el
entregable de esa práctica, y quien la revise en línea ve la ficha
equivalente. Si más adelante el portafolio se mueve a un hosting con PHP,
basta con cambiar la `ruta` de la actividad 3 en `assets/js/actividades.js`
de `ficha.html` a `index.php`.
