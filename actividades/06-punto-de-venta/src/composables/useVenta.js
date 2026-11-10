import { computed, ref, watch } from 'vue'

export const TASA_IVA = 0.16
const CLAVE = 'pos-unach-productos'

// Productos de ejemplo (los del mockup) para la primera visita
const INICIALES = [
    { cns: 1, nombre: 'Impresora LaserJet Color', precio: 5200, cantidad: 2 },
    { cns: 2, nombre: 'Monitor LED 31 plg.', precio: 1700, cantidad: 3 }
]

// Se trabaja en centavos para que 0.1 + 0.2 no deje residuos
const aCentavos = (n) => Math.round(Number(n) * 100)
export const importe = (p) => (aCentavos(p.precio) * p.cantidad) / 100

function cargar() {
    try {
        const guardado = JSON.parse(localStorage.getItem(CLAVE))
        if (Array.isArray(guardado)) return guardado
    } catch { /* sin almacenamiento disponible */ }
    return INICIALES.map((p) => ({ ...p }))
}

const productos = ref(cargar())

watch(productos, (lista) => {
    try {
        localStorage.setItem(CLAVE, JSON.stringify(lista))
    } catch { /* modo privado: se sigue trabajando en memoria */ }
}, { deep: true })

export function useVenta() {
    const subtotal = computed(() =>
        productos.value.reduce((suma, p) => suma + aCentavos(p.precio) * p.cantidad, 0) / 100
    )
    const iva = computed(() => Math.round(aCentavos(subtotal.value) * TASA_IVA) / 100)
    const total = computed(() => (aCentavos(subtotal.value) + aCentavos(iva.value)) / 100)

    function registrar({ nombre, precio, cantidad }) {
        const cns = productos.value.reduce((max, p) => Math.max(max, p.cns), 0) + 1
        const nuevo = { cns, nombre, precio, cantidad }
        productos.value.push(nuevo)
        return nuevo
    }

    function actualizar(cns, datos) {
        const i = productos.value.findIndex((p) => p.cns === cns)
        if (i !== -1) productos.value[i] = { ...productos.value[i], ...datos }
    }

    function eliminar(cns) {
        productos.value = productos.value.filter((p) => p.cns !== cns)
    }

    function vaciar() {
        productos.value = []
    }

    return { productos, subtotal, iva, total, registrar, actualizar, eliminar, vaciar }
}

export const moneda = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', currencyDisplay: 'narrowSymbol' })
