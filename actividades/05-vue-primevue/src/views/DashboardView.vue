<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import Button from 'primevue/button'
import Tag from 'primevue/tag'
import { useEmpleados } from '../composables/useEmpleados'

const router = useRouter()
const { empleados } = useEmpleados()

const mujeres = computed(() => empleados.value.filter(e => e.sexo === 'M').length)
const hombres = computed(() => empleados.value.filter(e => e.sexo === 'H').length)
const recientes = computed(() => empleados.value.slice(0, 5))

const indicadores = computed(() => [
    { texto: 'Tarjetas generadas', valor: empleados.value.length, icono: 'pi pi-id-card', color: 'azul' },
    { texto: 'Empleadas', valor: mujeres.value, icono: 'pi pi-user', color: 'morado' },
    { texto: 'Empleados', valor: hombres.value, icono: 'pi pi-user', color: 'verde' },
    { texto: 'Códigos por tarjeta', valor: 2, icono: 'pi pi-qrcode', color: 'naranja', nota: 'Barras + QR' }
])

function fecha(iso) {
    return new Date(iso).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })
}
</script>

<template>
    <div class="dashboard">
        <div class="indicadores">
            <article v-for="i in indicadores" :key="i.texto" class="panel indicador">
                <div>
                    <p class="indicador-texto">{{ i.texto }}</p>
                    <p class="indicador-valor">{{ i.valor }}</p>
                    <p v-if="i.nota" class="indicador-nota">{{ i.nota }}</p>
                </div>
                <span class="indicador-icono" :class="i.color"><i :class="i.icono"></i></span>
            </article>
        </div>

        <div class="fila">
            <section class="panel bienvenida">
                <h1 class="titulo">Tarjeta digital de empleado</h1>
                <p>
                    Captura el nombre y la fecha de nacimiento de una persona, calcula su
                    <b>RFC con homoclave</b> siguiendo el algoritmo del SAT y genera una
                    credencial con <b>código de barras</b> y <b>código QR</b>. El QR guarda
                    una vCard, así que al escanearlo el teléfono ofrece agregar el contacto.
                </p>
                <ul class="pasos">
                    <li><i class="pi pi-pencil"></i> Llena el formulario</li>
                    <li><i class="pi pi-cog"></i> Se calcula el RFC</li>
                    <li><i class="pi pi-id-card"></i> Se arma la tarjeta</li>
                    <li><i class="pi pi-qrcode"></i> Escanea el QR</li>
                </ul>
                <Button label="Generar una tarjeta" icon="pi pi-arrow-right" iconPos="right" @click="router.push('/formEmpleados')" />
            </section>

            <section class="panel">
                <div class="encabezado">
                    <h2 class="titulo">Últimas tarjetas</h2>
                    <RouterLink to="/empleados" class="ver-todo">Ver todas</RouterLink>
                </div>

                <ul v-if="recientes.length" class="lista">
                    <li v-for="e in recientes" :key="e.rfc">
                        <span class="avatar" :class="e.sexo === 'H' ? 'verde' : 'morado'">
                            {{ (e.nombre[0] + e.paterno[0]).toUpperCase() }}
                        </span>
                        <div class="lista-datos">
                            <strong>{{ e.nombre }} {{ e.paterno }} {{ e.materno }}</strong>
                            <code>{{ e.rfc }}</code>
                        </div>
                        <Tag :value="fecha(e.creado)" severity="secondary" />
                    </li>
                </ul>
                <p v-else class="vacio">
                    <i class="pi pi-inbox"></i>
                    Todavía no hay tarjetas. Genera la primera desde
                    <RouterLink to="/formEmpleados">Tarjeta de empleado</RouterLink>.
                </p>
            </section>
        </div>
    </div>
</template>

<style scoped>
.dashboard {
    display: flex;
    flex-direction: column;
    gap: 28px;
}

.indicadores {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
    gap: 28px;
}

.indicador {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    padding: 22px 24px;
}

.indicador-texto {
    margin: 0 0 8px;
    color: var(--suave);
    font-size: .92rem;
}

.indicador-valor {
    margin: 0;
    font-size: 1.8rem;
    font-weight: 700;
}

.indicador-nota {
    margin: 4px 0 0;
    font-size: .8rem;
    color: var(--suave);
}

.indicador-icono,
.avatar {
    display: grid;
    place-items: center;
    width: 46px;
    height: 46px;
    border-radius: 10px;
    font-size: 1.2rem;
    flex-shrink: 0;
}

.azul { background: #e0ecff; color: #2563eb; }
.morado { background: #ede4ff; color: #7c3aed; }
.verde { background: #dcfce7; color: #16a34a; }
.naranja { background: #ffedd5; color: #ea580c; }

.fila {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
    gap: 28px;
    align-items: start;
}

.bienvenida p {
    margin: 0 0 18px;
    line-height: 1.6;
    color: var(--suave);
}

.pasos {
    list-style: none;
    padding: 0;
    margin: 0 0 22px;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
}

.pasos li {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 12px;
    border-radius: 8px;
    background: #f8fafc;
    font-size: .92rem;
}

.pasos i {
    color: var(--primario);
}

.encabezado {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
}

.ver-todo {
    color: var(--primario);
    font-size: .9rem;
    text-decoration: none;
}

.lista {
    list-style: none;
    margin: 0;
    padding: 0;
}

.lista li {
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 12px 0;
    border-bottom: 1px solid #eef2f6;
}

.lista li:last-child {
    border-bottom: 0;
}

.avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    font-size: .85rem;
    font-weight: 700;
}

.lista-datos {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 2px;
}

.lista-datos strong {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.lista-datos code {
    font-size: .82rem;
    color: var(--suave);
}

.vacio {
    margin: 12px 0 0;
    color: var(--suave);
    line-height: 1.6;
}

.vacio i {
    margin-right: 6px;
}

.vacio a {
    color: var(--primario);
}

@media (max-width: 1199px) {
    .fila {
        grid-template-columns: minmax(0, 1fr);
    }
}

@media (max-width: 520px) {
    .indicadores,
    .dashboard,
    .fila {
        gap: 16px;
    }

    .pasos {
        grid-template-columns: 1fr;
    }
}
</style>
