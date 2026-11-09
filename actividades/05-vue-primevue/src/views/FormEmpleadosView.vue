<script setup>
import { reactive, ref } from 'vue'
import { useToast } from 'primevue/usetoast'
import InputText from 'primevue/inputtext'
import DatePicker from 'primevue/datepicker'
import SelectButton from 'primevue/selectbutton'
import Button from 'primevue/button'
import Message from 'primevue/message'
import TarjetaDigital from '../components/TarjetaDigital.vue'
import { calcularRFC } from '../utils/rfc'
import { useEmpleados } from '../composables/useEmpleados'

const toast = useToast()
const { guardar } = useEmpleados()

const hoy = new Date()
const opcionesSexo = [
    { etiqueta: 'Mujer', valor: 'M' },
    { etiqueta: 'Hombre', valor: 'H' }
]

const form = reactive({
    nombre: 'Susana',
    paterno: 'Rojas',
    materno: 'Merida',
    fechaNacimiento: new Date(1992, 7, 22),
    sexo: 'M',
    foto: ''
})

const errores = reactive({})
const rfc = ref('')
const empleado = ref(null)

function validar() {
    const soloLetras = /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ' .-]+$/
    for (const k of Object.keys(errores)) delete errores[k]

    if (!form.nombre.trim()) errores.nombre = 'Escribe el nombre.'
    else if (!soloLetras.test(form.nombre)) errores.nombre = 'Usa solo letras.'

    if (!form.paterno.trim()) errores.paterno = 'Escribe el apellido paterno.'
    else if (!soloLetras.test(form.paterno)) errores.paterno = 'Usa solo letras.'

    if (form.materno && !soloLetras.test(form.materno)) errores.materno = 'Usa solo letras.'

    if (!form.fechaNacimiento) errores.fechaNacimiento = 'Selecciona la fecha de nacimiento.'
    else if (form.fechaNacimiento > hoy) errores.fechaNacimiento = 'La fecha no puede ser futura.'

    return Object.keys(errores).length === 0
}

function generar() {
    if (!validar()) {
        toast.add({ severity: 'warn', summary: 'Revisa el formulario', detail: 'Hay campos incompletos.', life: 3000 })
        return
    }

    rfc.value = calcularRFC(form)
    empleado.value = {
        nombre: form.nombre.trim(),
        paterno: form.paterno.trim(),
        materno: form.materno.trim(),
        fechaNacimiento: form.fechaNacimiento.toISOString(),
        sexo: form.sexo,
        foto: form.foto,
        rfc: rfc.value,
        creado: new Date().toISOString()
    }
    guardar(empleado.value)
    toast.add({ severity: 'success', summary: 'Tarjeta generada', detail: `RFC ${rfc.value}`, life: 3000 })
}

// La foto se reduce a 300 px y se guarda como data URL (cabe en localStorage)
function cargarFoto(evento) {
    const archivo = evento.target.files?.[0]
    if (!archivo) return
    if (!archivo.type.startsWith('image/')) {
        toast.add({ severity: 'error', summary: 'Archivo no válido', detail: 'Elige una imagen.', life: 3000 })
        return
    }

    const img = new Image()
    img.onload = () => {
        const lado = 300
        const canvas = document.createElement('canvas')
        canvas.width = canvas.height = lado
        const corte = Math.min(img.width, img.height)
        canvas.getContext('2d').drawImage(
            img,
            (img.width - corte) / 2, (img.height - corte) / 2, corte, corte,
            0, 0, lado, lado
        )
        form.foto = canvas.toDataURL('image/jpeg', 0.85)
        URL.revokeObjectURL(img.src)
    }
    img.src = URL.createObjectURL(archivo)
}

function quitarFoto() {
    form.foto = ''
}
</script>

<template>
    <div class="rejilla">
        <section class="panel">
            <h1 class="titulo">Generar el RFC de una persona</h1>

            <form class="formulario" novalidate @submit.prevent="generar">
                <div class="campo">
                    <label for="nombre">Nombre(s):</label>
                    <InputText id="nombre" v-model="form.nombre" :invalid="!!errores.nombre" fluid autocomplete="given-name" />
                    <Message v-if="errores.nombre" severity="error" size="small" variant="simple">{{ errores.nombre }}</Message>
                </div>

                <div class="campo">
                    <label for="paterno">Apellido Paterno:</label>
                    <InputText id="paterno" v-model="form.paterno" :invalid="!!errores.paterno" fluid />
                    <Message v-if="errores.paterno" severity="error" size="small" variant="simple">{{ errores.paterno }}</Message>
                </div>

                <div class="campo">
                    <label for="materno">Apellido Materno:</label>
                    <InputText id="materno" v-model="form.materno" :invalid="!!errores.materno" fluid />
                    <Message v-if="errores.materno" severity="error" size="small" variant="simple">{{ errores.materno }}</Message>
                </div>

                <div class="campo">
                    <label for="fecha">Fecha Nacimiento:</label>
                    <DatePicker
                        v-model="form.fechaNacimiento"
                        inputId="fecha"
                        dateFormat="dd/mm/yy"
                        :maxDate="hoy"
                        :invalid="!!errores.fechaNacimiento"
                        showIcon
                        iconDisplay="input"
                        fluid
                    />
                    <Message v-if="errores.fechaNacimiento" severity="error" size="small" variant="simple">{{ errores.fechaNacimiento }}</Message>
                </div>

                <div class="fila">
                    <div class="campo">
                        <label id="sexo-etiqueta">Sexo:</label>
                        <SelectButton
                            v-model="form.sexo"
                            :options="opcionesSexo"
                            optionLabel="etiqueta"
                            optionValue="valor"
                            :allowEmpty="false"
                            aria-labelledby="sexo-etiqueta"
                        />
                    </div>

                    <div class="campo">
                        <label for="foto">Fotografía (opcional):</label>
                        <div class="foto-acciones">
                            <label class="p-button p-button-outlined p-button-secondary boton-foto" for="foto">
                                <i class="pi pi-camera"></i> {{ form.foto ? 'Cambiar' : 'Elegir' }}
                            </label>
                            <Button v-if="form.foto" icon="pi pi-times" severity="secondary" text rounded aria-label="Quitar foto" @click="quitarFoto" />
                        </div>
                        <input id="foto" type="file" accept="image/*" class="oculto" @change="cargarFoto">
                    </div>
                </div>

                <div class="campo">
                    <label for="rfc">RFC:</label>
                    <InputText id="rfc" :modelValue="rfc" readonly placeholder="Se calcula al generar" fluid class="rfc" />
                </div>

                <Button type="submit" label="GENERAR" icon="pi pi-id-card" severity="success" class="boton-generar" />
            </form>
        </section>

        <section class="panel">
            <h2 class="titulo">Tarjeta digital</h2>
            <TarjetaDigital :empleado="empleado" />
        </section>
    </div>
</template>

<style scoped>
.rejilla {
    display: grid;
    grid-template-columns: minmax(0, 1.25fr) minmax(0, 1fr);
    gap: 28px;
    align-items: start;
}

.formulario {
    display: flex;
    flex-direction: column;
    gap: 18px;
}

.campo {
    display: flex;
    flex-direction: column;
    gap: 6px;
}

.campo label {
    font-size: .92rem;
    color: var(--suave);
}

.fila {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
}

.foto-acciones {
    display: flex;
    align-items: center;
    gap: 4px;
}

.boton-foto {
    cursor: pointer;
    gap: 8px;
}

.oculto {
    position: absolute;
    width: 1px;
    height: 1px;
    opacity: 0;
    pointer-events: none;
}

.rfc :deep(input),
.rfc {
    font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
    letter-spacing: .06em;
}

.boton-generar {
    align-self: flex-start;
    min-width: 220px;
    margin-top: 6px;
    font-weight: 700;
    letter-spacing: .04em;
}

@media (max-width: 1199px) {
    .rejilla {
        grid-template-columns: 1fr;
    }
}

@media (max-width: 520px) {
    .fila {
        grid-template-columns: 1fr;
    }

    .boton-generar {
        align-self: stretch;
    }
}
</style>
