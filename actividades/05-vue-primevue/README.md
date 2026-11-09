# Tarjeta digital de un Empleado con código QR

Práctica 3.1 · Desarrollo de Aplicaciones Web y Móviles
Escuela de Tecnologías Digitales Aplicadas, Campus IV Tapachula — UNACH
Ezequiel Peña Mazariegos · Entrega: 8 de noviembre de 2026

Interfaz hecha con **Vue 3 + PrimeVue** que captura los datos de una persona,
calcula su RFC y genera su tarjeta digital de empleado con código de barras y
código QR.

- **Aplicación publicada:** <https://tarjeta-empleado-unach.vercel.app>
- **Código fuente:** <https://github.com/Ezequielpm/portafolio-dawm/tree/main/actividades/05-vue-primevue>

## Vistas

| Ruta | Vista |
|---|---|
| `#/` | Dashboard: indicadores y últimas tarjetas generadas |
| `#/formEmpleados` | Formulario + tarjeta digital (la del mockup) |
| `#/empleados` | Tabla de empleados con búsqueda, paginación y vista de la tarjeta en un diálogo |
| `#/barcode-qr` | Generador libre de QR y código de barras (CODE128, CODE39, EAN13, UPC, ITF14) |

El layout (barra superior, menú lateral que se oculta con ☰ y se vuelve
menú deslizable en celular) está en `src/layout/AppLayout.vue`.

## Cálculo del RFC

`src/utils/rfc.js` implementa el algoritmo del SAT para personas físicas:

1. **Cuatro letras:** primera letra y primera vocal interna del apellido
   paterno, primera letra del materno y primera del nombre. Se quitan
   artículos y preposiciones (DE, LA, DEL…), se omite JOSÉ/MARÍA cuando hay
   más de un nombre, y si sale una palabra altisonante la última letra se
   cambia por X. También cubre un solo apellido y apellidos de 1–2 letras.
2. **Fecha** en formato AAMMDD.
3. **Homoclave:** cada carácter del nombre completo se convierte a dos
   dígitos según la tabla del SAT, se suman los productos y los tres últimos
   dígitos se pasan a base 34.
4. **Dígito verificador** por módulo 11.

Se comprobó con el ejemplo del instructivo del SAT: Emma Gómez Díaz,
31/12/1956 → `GODE561231GR8`.

## Códigos

- **Barras:** [JsBarcode](https://github.com/lindell/JsBarcode) dibuja el RFC
  en CODE128 dentro de un `<svg>`.
- **QR:** [qrcode](https://github.com/soldair/node-qrcode) genera una
  **vCard**; al escanearla, el teléfono ofrece guardar el contacto con
  nombre, puesto, institución y RFC.

Las tarjetas generadas se guardan en `localStorage`
(`src/composables/useEmpleados.js`), por eso el Dashboard y la tabla las
conservan al recargar.

## Versión de PrimeVue

Se usa **PrimeVue 4.5** (licencia MIT). PrimeVue 5 pasó a la "PrimeUI
License", que pide una clave registrada y, sin ella, muestra un aviso
de *Invalid PrimeUI License* sobre la página.

## Ejecutar

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # genera dist/
```
