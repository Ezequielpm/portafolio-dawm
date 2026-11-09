<script setup>
import { ref } from 'vue'
import { useToast } from 'primevue/usetoast'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'
import IconField from 'primevue/iconfield'
import InputIcon from 'primevue/inputicon'
import Tag from 'primevue/tag'
import TarjetaDigital from '../components/TarjetaDigital.vue'
import { useEmpleados } from '../composables/useEmpleados'

const toast = useToast()
const { empleados, eliminar } = useEmpleados()

const filtros = ref({ global: { value: null, matchMode: 'contains' } })
const seleccionado = ref(null)
const verTarjeta = ref(false)

function abrir(empleado) {
    seleccionado.value = empleado
    verTarjeta.value = true
}

function borrar(empleado) {
    eliminar(empleado.rfc)
    toast.add({ severity: 'info', summary: 'Registro eliminado', detail: empleado.rfc, life: 2500 })
}

function fecha(iso) {
    return new Date(iso).toLocaleDateString('es-MX', { day: '2-digit', month: '2-digit', year: 'numeric' })
}
</script>

<template>
    <section class="panel">
        <div class="encabezado">
            <h1 class="titulo">Empleados con tarjeta</h1>
            <IconField>
                <InputIcon class="pi pi-search" />
                <InputText v-model="filtros.global.value" placeholder="Buscar por nombre o RFC" />
            </IconField>
        </div>

        <DataTable
            :value="empleados"
            v-model:filters="filtros"
            :globalFilterFields="['nombre', 'paterno', 'materno', 'rfc']"
            dataKey="rfc"
            paginator
            :rows="8"
            stripedRows
        >
            <template #empty>
                No hay tarjetas registradas. Genera una en
                <RouterLink to="/formEmpleados">Tarjeta de empleado</RouterLink>.
            </template>

            <Column header="Nombre" sortable sortField="paterno">
                <template #body="{ data }">{{ data.nombre }} {{ data.paterno }} {{ data.materno }}</template>
            </Column>
            <Column field="rfc" header="RFC" sortable>
                <template #body="{ data }"><code>{{ data.rfc }}</code></template>
            </Column>
            <Column header="Nacimiento" sortable sortField="fechaNacimiento">
                <template #body="{ data }">{{ fecha(data.fechaNacimiento) }}</template>
            </Column>
            <Column header="Puesto">
                <template #body="{ data }">
                    <Tag :value="data.sexo === 'H' ? 'Empleado' : 'Empleada'" :severity="data.sexo === 'H' ? 'success' : 'info'" />
                </template>
            </Column>
            <Column header="" style="width: 7rem; text-align: right">
                <template #body="{ data }">
                    <Button icon="pi pi-id-card" text rounded aria-label="Ver tarjeta" @click="abrir(data)" />
                    <Button icon="pi pi-trash" text rounded severity="danger" aria-label="Eliminar" @click="borrar(data)" />
                </template>
            </Column>
        </DataTable>
    </section>

    <Dialog v-model:visible="verTarjeta" modal header="Tarjeta digital" :style="{ width: '400px' }" :breakpoints="{ '480px': '95vw' }">
        <TarjetaDigital :empleado="seleccionado" />
    </Dialog>
</template>

<style scoped>
.encabezado {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    align-items: center;
    gap: 12px;
    margin-bottom: 16px;
}

.encabezado .titulo {
    margin: 0;
}

code {
    font-size: .88rem;
}

a {
    color: var(--primario);
}
</style>
