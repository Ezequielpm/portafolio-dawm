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

### 02 — Cursos con precios multimoneda
Catálogo demo de cursos en línea. Cada curso guarda su precio **en dólares**
y la interfaz lo convierte a **MXN, EUR y JPY** con las tasas que devuelve una
API gratuita, sin llave de acceso:

| | API | Endpoint |
|---|---|---|
| Principal | Frankfurter (Banco Central Europeo) | `https://api.frankfurter.dev/v1/latest?base=USD&symbols=MXN,EUR,JPY` |
| Respaldo | ExchangeRate-API (endpoint abierto) | `https://open.er-api.com/v6/latest/USD` |

Si ninguna responde se usan tasas fijas de referencia (`TASAS_RESPALDO` en
`js/app.js`) y la interfaz avisa que no hubo conexión.

El formato de cada moneda lo resuelve `Intl.NumberFormat`, así que el yen se
muestra sin decimales y cada moneda usa su separador correcto.

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
