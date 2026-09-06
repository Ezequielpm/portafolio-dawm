# Portafolio de Actividades — Desarrollo de Aplicaciones Web y Móviles

Universidad Autónoma de Chiapas · Ezequiel Peña · Agosto–Diciembre 2026

Sitio estático que reúne las actividades de la materia. La portada
(`index.html`) lista cada actividad y enlaza a su carpeta.

## Estructura

```
portafolio-dawm/
├── index.html                     ← portada del portafolio
├── assets/                        ← recursos compartidos
│   ├── css/portafolio.css
│   ├── js/actividades.js          ← lista de actividades (se edita aquí)
│   ├── js/portafolio.js           ← genera las tarjetas de la portada
│   └── img/                       ← logo-unach.png, escuela.jpg, edificio.jpg
├── actividades/
│   ├── 01-calculadora-unach/
│   │   ├── index.html
│   │   ├── css/estilos.css
│   │   └── js/app.js
│   └── 02-cursos-monedas/
│       ├── index.html
│       ├── css/estilos.css
│       ├── js/cursos.js           ← catálogo de cursos (datos)
│       └── js/app.js              ← conversión de monedas e interfaz
├── _respaldos/                    ← versiones viejas, se puede borrar
└── README.md
```

## Actividades

### 01 — Calculadora y consulta de API
Página institucional de la UNACH. Calculadora con eventos de jQuery y
consulta de un usuario por `id` a `jsonplaceholder.typicode.com` con `$.get()`.

### 02 — Oferta académica con precios multimoneda
SPA (una sola página) con diseño responsivo, inspirada en el catálogo de
SaberesMX. Cumple los tres requerimientos de la práctica:

**RF1 — Grid responsivo con 6 tarjetas.** `.rejilla` usa
`grid-template-columns: repeat(auto-fill, minmax(280px, 1fr))`, así que las
columnas se reacomodan solas al cambiar la resolución (4 → 3 → 2 → 1).
Cada ficha lleva logo, título, descripción y botón de inscripción; el botón
es únicamente visual, no tiene ninguna acción programada.

**RF2 — Efecto al pasar el cursor.** `.tarjeta-portada:hover .portada-imagen`
aplica `transform: scale(1.1)`, es decir 10% más grande. El contenedor tiene
`overflow: hidden` para que la imagen se recorte al crecer.

**RF3 — Actualizar precios contra una API REST.** El precio en pesos
mexicanos es **fijo** (`precioMXN` en `js/cursos.js`). Al pulsar el botón
*Actualizar precios* se consulta el tipo de cambio y se recalculan
únicamente dólar y yen:

| | API | Endpoint |
|---|---|---|
| Principal | Frankfurter (Banco Central Europeo) | `https://api.frankfurter.dev/v1/latest?base=MXN&symbols=USD,JPY` |
| Respaldo | ExchangeRate-API (endpoint abierto) | `https://open.er-api.com/v6/latest/MXN` |

Ninguna de las dos necesita llave de acceso. Si las dos fallan, la página
conserva las tasas de referencia (`TASAS_RESPALDO`) y avisa en rojo que no
hubo conexión. El formato de cada moneda lo resuelve `Intl.NumberFormat`,
por eso el yen se muestra sin decimales.

## Agregar una actividad nueva

1. Crea la carpeta `actividades/03-nombre-de-la-actividad/` con su
   `index.html`, `css/` y `js/`.
2. Agrega en el `index.html` de la actividad el enlace de regreso:
   `<a class="volver" href="../../index.html">← Volver al portafolio</a>`
3. Copia un objeto de `assets/js/actividades.js` y ajusta sus datos.
   La portada se regenera sola.

Las imágenes compartidas se referencian desde una actividad con
`../../assets/img/archivo.jpg`.

## Ver en local

```bash
python3 -m http.server 8000
```

Luego abre <http://localhost:8000>.

## Publicar

Todas las rutas son relativas, así que el sitio funciona en cualquier
hosting estático subiendo la carpeta tal cual: GitHub Pages, Netlify,
Vercel, Cloudflare Pages o un servidor con `public_html`.
