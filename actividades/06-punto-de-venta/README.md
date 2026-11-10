# App de Punto de Venta con DataTable

Práctica 3.2 · Desarrollo de Aplicaciones Web y Móviles
Escuela de Tecnologías Digitales Aplicadas, Campus IV Tapachula — UNACH
Ezequiel Peña Mazariegos · Entrega: 10 de noviembre de 2026

Punto de venta hecho con **Vue 3 + PrimeVue** que registra, edita y elimina
los productos de una compra en un **DataTable** y calcula el Subtotal, el IVA
(16 %) y el Total a pagar.

- **Aplicación publicada:** <https://punto-de-venta-unach.vercel.app>
- **Código fuente:** <https://github.com/Ezequielpm/portafolio-dawm/tree/main/actividades/06-punto-de-venta>
- **Reporte:** [`reporte/06-punto-de-venta`](../../reporte/06-punto-de-venta/)

## Qué hace

- **Registrar:** nombre, cantidad y precio unitario; Enter o el botón
  Registrar. La tabla salta a la página donde quedó el producto.
- **Editar:** el lápiz carga el producto en el formulario (fila resaltada,
  botón Actualizar / Cancelar).
- **Eliminar:** el bote de basura pide confirmación con un ConfirmPopup.
  «Nueva venta» vacía la lista.
- **DataTable:** orden por cualquier columna (también por el precio parcial
  calculado), paginación de 5/10/20 filas y el texto «Visualizando…».
- **Totales:** `computed` en centavos enteros para evitar errores de
  redondeo; IVA redondeado al centavo.
- La venta se guarda en `localStorage`; la primera vez aparecen los dos
  productos del ejemplo de la práctica ($15,500.00 / $2,480.00 / $17,980.00).

## Archivos

| Archivo | Contenido |
|---|---|
| `src/main.js` | PrimeVue con tema Aura verde, Toast y ConfirmPopup |
| `src/App.vue` | Formulario de captura, DataTable y totales |
| `src/composables/useVenta.js` | Lista de productos, registrar/actualizar/eliminar, Subtotal, IVA y Total |

Se usa **PrimeVue 4.5** (licencia MIT); PrimeVue 5 pide una clave de la
"PrimeUI License".

## Ejecutar

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # genera dist/
```
