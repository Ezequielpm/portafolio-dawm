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
│   └── 02-cursos-monedas/
│       ├── index.html
│       ├── css/estilos.css
│       ├── js/cursos.js
│       └── js/app.js
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

## Ejecución local

```bash
python3 -m http.server 8000
```

Y abrir <http://localhost:8000>. Hace falta un servidor porque las peticiones
a la API no funcionan bien abriendo el archivo directamente con `file://`.

## Publicación

Todas las rutas son relativas, así que el sitio funciona subiendo la carpeta
tal cual a cualquier hosting estático. Está publicado en GitHub Pages desde
la rama `main`.
