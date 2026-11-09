import { ref, watch } from 'vue'

/* Lista de tarjetas generadas, compartida entre las vistas.
   Se guarda en localStorage para que no se pierda al recargar. */

const CLAVE = 'tarjetas-empleado'

function leer() {
    try {
        return JSON.parse(localStorage.getItem(CLAVE)) ?? []
    } catch {
        return []
    }
}

const empleados = ref(leer())

watch(empleados, lista => {
    try {
        localStorage.setItem(CLAVE, JSON.stringify(lista))
    } catch {
        /* sin almacenamiento disponible: la lista vive solo en memoria */
    }
}, { deep: true })

export function useEmpleados() {
    // Si el RFC ya existe se actualiza ese registro en lugar de duplicarlo
    function guardar(empleado) {
        const i = empleados.value.findIndex(e => e.rfc === empleado.rfc)
        if (i >= 0) empleados.value.splice(i, 1)
        empleados.value.unshift(empleado)
    }

    function eliminar(rfc) {
        empleados.value = empleados.value.filter(e => e.rfc !== rfc)
    }

    return { empleados, guardar, eliminar }
}
