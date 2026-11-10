<script setup>
import { computed, nextTick, reactive, ref } from 'vue'
import { useToast } from 'primevue/usetoast'
import { useConfirm } from 'primevue/useconfirm'
import InputText from 'primevue/inputtext'
import InputNumber from 'primevue/inputnumber'
import Button from 'primevue/button'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Toast from 'primevue/toast'
import ConfirmPopup from 'primevue/confirmpopup'
import { useVenta, importe, moneda, TASA_IVA } from './composables/useVenta'

const toast = useToast()
const confirm = useConfirm()
const { productos, subtotal, iva, total, registrar, actualizar, eliminar, vaciar } = useVenta()

// ---------- Formulario de captura ----------
const form = reactive({ nombre: '', cantidad: null, precio: null })
const errores = reactive({ nombre: false, cantidad: false, precio: false })
const editando = ref(null)          // cns del producto que se está editando
const campoNombre = ref(null)

function validar() {
    errores.nombre = form.nombre.trim().length === 0
    errores.cantidad = !Number.isInteger(form.cantidad) || form.cantidad < 1
    errores.precio = form.precio == null || form.precio <= 0
    return !errores.nombre && !errores.cantidad && !errores.precio
}

function limpiar() {
    form.nombre = ''
    form.cantidad = null
    form.precio = null
    errores.nombre = errores.cantidad = errores.precio = false
    editando.value = null
    nextTick(() => campoNombre.value?.$el.focus())
}

function guardar() {
    if (!validar()) {
        toast.add({ severity: 'warn', summary: 'Revisa la captura', detail: 'Escribe el nombre, una cantidad entera y un precio mayor a cero.', life: 3500 })
        return
    }
    const datos = { nombre: form.nombre.trim(), cantidad: form.cantidad, precio: form.precio }

    if (editando.value !== null) {
        actualizar(editando.value, datos)
        toast.add({ severity: 'success', summary: 'Producto actualizado', detail: datos.nombre, life: 2500 })
    } else {
        registrar(datos)
        // Ir a la página donde quedó el producto nuevo
        primera.value = Math.floor((productos.value.length - 1) / filas.value) * filas.value
        toast.add({ severity: 'success', summary: 'Producto registrado', detail: datos.nombre, life: 2500 })
    }
    limpiar()
}

function editar(producto) {
    editando.value = producto.cns
    form.nombre = producto.nombre
    form.cantidad = producto.cantidad
    form.precio = producto.precio
    errores.nombre = errores.cantidad = errores.precio = false
    nextTick(() => campoNombre.value?.$el.focus())
}

function borrar(evento, producto) {
    confirm.require({
        target: evento.currentTarget,
        message: `¿Eliminar «${producto.nombre}»?`,
        icon: 'pi pi-exclamation-triangle',
        rejectProps: { label: 'Cancelar', severity: 'secondary', outlined: true, size: 'small' },
        acceptProps: { label: 'Eliminar', severity: 'danger', size: 'small' },
        accept: () => {
            if (editando.value === producto.cns) limpiar()
            eliminar(producto.cns)
            // Si la página actual quedó vacía, regresar una
            if (primera.value >= productos.value.length && primera.value > 0) primera.value -= filas.value
            toast.add({ severity: 'info', summary: 'Producto eliminado', detail: producto.nombre, life: 2500 })
        }
    })
}

function nuevaVenta(evento) {
    confirm.require({
        target: evento.currentTarget,
        message: 'Se quitarán todos los productos de la venta.',
        icon: 'pi pi-exclamation-triangle',
        rejectProps: { label: 'Cancelar', severity: 'secondary', outlined: true, size: 'small' },
        acceptProps: { label: 'Nueva venta', severity: 'danger', size: 'small' },
        accept: () => {
            vaciar()
            limpiar()
            primera.value = 0
        }
    })
}

// ---------- Tabla ----------
const primera = ref(0)
const filas = ref(5)
const articulos = computed(() => productos.value.reduce((n, p) => n + p.cantidad, 0))
const claseFila = (p) => (p.cns === editando.value ? 'fila-editando' : '')
</script>

<template>
    <div class="pagina">
        <main class="pos">
            <header class="pos-encabezado">
                <div>
                    <h1>Punto de venta (POS)</h1>
                    <p>{{ productos.length }} productos · {{ articulos }} artículos</p>
                </div>
                <Button label="Nueva venta" icon="pi pi-refresh" severity="secondary" text size="small"
                        :disabled="productos.length === 0" @click="nuevaVenta" />
            </header>

            <!-- Captura -->
            <form class="seccion captura" :class="{ 'en-edicion': editando !== null }" @submit.prevent="guardar" novalidate>
                <InputText ref="campoNombre" v-model="form.nombre" placeholder="Nombre del producto..."
                           maxlength="80" :invalid="errores.nombre" aria-label="Nombre del producto"
                           class="c-nombre" />
                <InputNumber v-model="form.cantidad" placeholder="Cant" :min="1" :max="9999" :useGrouping="false"
                             :invalid="errores.cantidad" inputId="cantidad" :inputProps="{ 'aria-label': 'Cantidad' }"
                             class="c-cant" fluid />
                <InputNumber v-model="form.precio" placeholder="$ Precio U." mode="currency" currency="MXN"
                             locale="es-MX" currencyDisplay="narrowSymbol" :min="0" :max="9999999"
                             :invalid="errores.precio" inputId="precio" :inputProps="{ 'aria-label': 'Precio unitario' }"
                             class="c-precio" fluid />
                <div class="c-botones">
                    <Button v-if="editando !== null" type="button" label="Cancelar" severity="secondary"
                            outlined @click="limpiar" />
                    <Button type="submit" :label="editando !== null ? 'Actualizar' : 'Registrar'"
                            :icon="editando !== null ? 'pi pi-check' : 'pi pi-plus'" />
                </div>
                <p v-if="editando !== null" class="aviso-edicion">
                    <i class="pi pi-pencil" /> Editando el producto {{ editando }}. Cambia los datos y presiona <strong>Actualizar</strong>.
                </p>
            </form>

            <!-- Tabla de productos -->
            <DataTable :value="productos" dataKey="cns" class="tabla"
                       sortField="cns" :sortOrder="1" :rowClass="claseFila"
                       paginator v-model:first="primera" v-model:rows="filas" :rowsPerPageOptions="[5, 10, 20]"
                       paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                       currentPageReportTemplate="Visualizando {first}–{last} de {totalRecords} productos"
                       scrollable tableStyle="min-width: 46rem">
                <template #empty>
                    <div class="vacio">
                        <i class="pi pi-shopping-cart" />
                        <span>No hay productos en la venta. Captura uno arriba y presiona <strong>Registrar</strong>.</span>
                    </div>
                </template>

                <Column field="cns" header="Cns" sortable style="width: 6rem" />
                <Column field="nombre" header="Nombre del Producto" sortable />
                <Column field="precio" header="Precio U." sortable style="width: 9rem">
                    <template #body="{ data }">{{ moneda.format(data.precio) }}</template>
                </Column>
                <Column field="cantidad" header="Cant." sortable style="width: 6rem"
                        headerClass="centrado" bodyClass="centrado" />
                <Column header="Precio P." sortable :sortField="importe" style="width: 10rem">
                    <template #body="{ data }"><strong>{{ moneda.format(importe(data)) }}</strong></template>
                </Column>
                <Column header="Acciones" style="width: 8rem">
                    <template #body="{ data }">
                        <div class="acciones">
                            <Button icon="pi pi-pencil" severity="success" size="small"
                                    :aria-label="`Editar ${data.nombre}`"
                                    @click="editar(data)" />
                            <Button icon="pi pi-trash" severity="danger" size="small"
                                    :aria-label="`Eliminar ${data.nombre}`" @click="borrar($event, data)" />
                        </div>
                    </template>
                </Column>
            </DataTable>
            <p class="pista-scroll" v-if="productos.length"><i class="pi pi-arrows-h" /> Desliza la tabla para ver todas las columnas</p>

            <!-- Totales -->
            <footer class="seccion totales">
                <label class="total-campo">
                    <span>Subtotal:</span>
                    <InputText :value="moneda.format(subtotal)" readonly tabindex="-1" />
                </label>
                <label class="total-campo">
                    <span>IVA ({{ TASA_IVA * 100 }}%):</span>
                    <InputText :value="moneda.format(iva)" readonly tabindex="-1" />
                </label>
                <label class="total-campo total-final">
                    <span>Total:</span>
                    <InputText :value="moneda.format(total)" readonly tabindex="-1" />
                </label>
            </footer>
        </main>

        <p class="pie">Práctica 3.2 · Desarrollo de Aplicaciones Web y Móviles · UNACH Campus IV</p>

        <Toast position="bottom-left" :breakpoints="{ '760px': { width: 'calc(100vw - 24px)', left: '12px' } }" />
        <ConfirmPopup />
    </div>
</template>

<style scoped>
.pagina {
    min-height: 100vh;
    padding: 40px 16px 24px;
}

.pos {
    max-width: 1100px;
    margin: 0 auto;
    background: #fff;
    border-radius: 14px;
    box-shadow: 0 1px 3px rgba(15, 23, 42, .06), 0 8px 24px rgba(15, 23, 42, .06);
    overflow: hidden;
}

.pos-encabezado {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 18px 24px;
    background: #f1f3f5;
    border-bottom: 1px solid #e2e8f0;
}

.pos-encabezado h1 {
    margin: 0;
    font-size: 1rem;
    font-weight: 900;
    text-transform: uppercase;
    letter-spacing: .02em;
    color: #1e293b;
}

.pos-encabezado p {
    margin: 2px 0 0;
    font-size: .82rem;
    color: var(--suave);
}

.seccion {
    margin: 20px 24px;
    padding: 16px;
    background: #f8f9fa;
    border: 1px solid #e5e7eb;
    border-radius: 10px;
}

/* ---- Captura ---- */
.captura {
    display: grid;
    grid-template-columns: 2.4fr 1fr 1.3fr auto;
    gap: 8px;
    align-items: start;
    transition: border-color .2s, background .2s;
}

.captura.en-edicion {
    border-color: #86efac;
    background: #f0fdf4;
}

.c-botones {
    display: flex;
    gap: 8px;
    justify-content: flex-end;
}

.aviso-edicion {
    grid-column: 1 / -1;
    margin: 2px 0 0;
    font-size: .85rem;
    color: #15803d;
}

/* ---- Tabla ---- */
.tabla {
    margin: 0 24px;
    border: 1px solid #e5e7eb;
    border-radius: 10px;
    overflow: hidden;
}

.pista-scroll {
    display: none;
    margin: 6px 12px 0;
    font-size: .8rem;
    color: var(--suave);
    text-align: center;
}

.acciones {
    display: flex;
    gap: 4px;
}

:deep(.centrado) {
    text-align: center;
}

:deep(th.centrado .p-datatable-column-header-content) {
    justify-content: center;
}

:deep(.fila-editando) {
    background: #f0fdf4 !important;
    box-shadow: inset 3px 0 0 #22c55e;
}

.vacio {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    padding: 28px 0;
    color: var(--suave);
    text-align: center;
}

.vacio .pi {
    font-size: 1.8rem;
    color: #cbd5e1;
}

/* ---- Totales ---- */
.totales {
    display: flex;
    justify-content: flex-end;
    flex-wrap: wrap;
    gap: 14px;
}

.total-campo {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: .95rem;
    color: #475569;
}

.total-campo :deep(input) {
    width: 11rem;
    font-variant-numeric: tabular-nums;
    background: #fff;
}

.total-final span {
    font-weight: 900;
    color: #1e293b;
}

.total-final :deep(input) {
    font-weight: 900;
    color: #15803d;
    border-color: #86efac;
}

.pie {
    margin: 18px 0 0;
    text-align: center;
    font-size: .8rem;
    color: var(--suave);
}

@media (max-width: 760px) {
    .pagina {
        padding: 16px 12px;
    }

    .pos-encabezado,
    .seccion {
        padding-left: 14px;
        padding-right: 14px;
    }

    .seccion {
        margin: 14px 12px;
    }

    .tabla {
        margin: 0 12px;
    }

    .pista-scroll {
        display: block;
    }

    .captura {
        grid-template-columns: 1fr 1fr;
    }

    .c-nombre,
    .c-botones {
        grid-column: 1 / -1;
    }

    .c-botones :deep(.p-button) {
        flex: 1;
    }

    .totales {
        flex-direction: column;
        gap: 8px;
    }

    .total-campo {
        justify-content: space-between;
    }

    .total-campo :deep(input) {
        width: 60%;
        text-align: right;
    }
}
</style>
