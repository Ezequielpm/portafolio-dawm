<script setup>
import { computed, ref, watch, onMounted, nextTick } from 'vue'
import JsBarcode from 'jsbarcode'
import QRCode from 'qrcode'

/* Tarjeta de identificación del empleado.
   - Código de barras CODE128 con el RFC (JsBarcode, dibujado en un <svg>)
   - Código QR con una vCard: al escanearlo el teléfono ofrece guardar el contacto */

const props = defineProps({
    empleado: { type: Object, default: null }
})

const logo = `${import.meta.env.BASE_URL}logo-unach.png`
const barras = ref(null)
const qr = ref('')

const nombreCompleto = computed(() => {
    const e = props.empleado
    return e ? `${e.nombre} ${e.paterno} ${e.materno}`.replace(/\s+/g, ' ').trim() : ''
})

const puesto = computed(() => props.empleado?.sexo === 'H' ? 'Empleado' : 'Empleada')

function vCard(e) {
    return [
        'BEGIN:VCARD',
        'VERSION:3.0',
        `N:${e.paterno} ${e.materno};${e.nombre};;;`,
        `FN:${nombreCompleto.value}`,
        'ORG:UNACH - Campus IV Tapachula',
        `TITLE:${puesto.value}`,
        `NOTE:RFC ${e.rfc}`,
        'END:VCARD'
    ].join('\n')
}

async function dibujarCodigos() {
    const e = props.empleado
    if (!e) return
    await nextTick()

    if (barras.value) {
        JsBarcode(barras.value, e.rfc, {
            format: 'CODE128',
            width: 1.3,
            height: 46,
            margin: 0,
            fontSize: 12,
            font: 'monospace',
            textMargin: 3,
            background: 'transparent',
            lineColor: '#0d2a52'
        })
    }

    qr.value = await QRCode.toDataURL(vCard(e), {
        errorCorrectionLevel: 'M',
        margin: 0,
        width: 220,
        color: { dark: '#0d2a52', light: '#ffffff' }
    })
}

watch(() => props.empleado, dibujarCodigos, { deep: true })
onMounted(dibujarCodigos)
</script>

<template>
    <div class="tarjeta" :class="{ vacia: !empleado }">
        <!-- Ondas superiores -->
        <svg class="onda-superior" viewBox="0 0 320 210" preserveAspectRatio="none" aria-hidden="true">
            <path d="M0 70H320V205C292 150 240 138 160 138S28 150 0 205Z" fill="#2f6fd0" />
            <path d="M0 70H320V188C298 152 250 145 160 145S22 152 0 188Z" fill="#4c8ee8" opacity=".55" />
            <path d="M0 0H320V92Q160 205 0 92Z" fill="#0d2a52" />
        </svg>

        <header class="empresa">
            <img :src="logo" alt="" class="empresa-logo">
            <div>
                <strong>UNACH</strong>
                <span>Campus IV Tapachula</span>
            </div>
        </header>

        <div class="foto">
            <img v-if="empleado?.foto" :src="empleado.foto" alt="Fotografía del empleado">
            <!-- Silueta cuando no hay foto -->
            <svg v-else-if="empleado?.sexo === 'H'" viewBox="0 0 120 120" aria-hidden="true">
                <circle cx="60" cy="44" r="22" fill="#0d2a52" />
                <path d="M38 40c0-16 10-25 22-25s22 9 22 25c-6-8-14-11-22-11s-16 3-22 11Z" fill="#0d2a52" />
                <path d="M18 120c2-26 18-40 42-40s40 14 42 40Z" fill="#0d2a52" />
                <path d="M52 80l8 14 8-14Z" fill="#fff" />
                <path d="M58 86h4l2 20-4 6-4-6Z" fill="#2f6fd0" />
            </svg>
            <svg v-else viewBox="0 0 120 120" aria-hidden="true">
                <path d="M32 74c-4-30 6-56 28-56s32 26 28 56c-6 6-14 8-28 8s-22-2-28-8Z" fill="#0d2a52" />
                <ellipse cx="60" cy="48" rx="19" ry="22" fill="#163e73" />
                <path d="M16 120c2-24 18-38 44-38s42 14 44 38Z" fill="#0d2a52" />
                <path d="M52 82l8 12 8-12Z" fill="#fff" />
            </svg>
        </div>

        <section class="datos">
            <template v-if="empleado">
                <h3 class="nombre">
                    <span>{{ empleado.nombre }}</span>
                    <span>{{ empleado.paterno }} {{ empleado.materno }}</span>
                </h3>
                <p class="puesto">{{ puesto }}</p>
                <p class="id">ID : {{ empleado.rfc }}</p>

                <div class="codigos">
                    <img :src="qr" alt="Código QR con los datos del empleado" class="qr" v-if="qr">
                    <svg ref="barras" class="barras" role="img" :aria-label="`Código de barras ${empleado.rfc}`"></svg>
                </div>
            </template>
            <p v-else class="aviso">
                Llena el formulario y presiona <b>Generar</b> para crear la tarjeta.
            </p>
        </section>

        <!-- Ondas inferiores -->
        <svg class="onda-inferior" viewBox="0 0 320 60" preserveAspectRatio="none" aria-hidden="true">
            <path d="M0 6Q160 52 320 6V60H0Z" fill="#2f6fd0" />
            <path d="M0 26Q160 64 320 26V60H0Z" fill="#0d2a52" />
        </svg>
    </div>
</template>

<style scoped>
.tarjeta {
    position: relative;
    width: 100%;
    max-width: 330px;
    margin: 0 auto;
    background: #fff;
    border-radius: 16px;
    overflow: hidden;
    box-shadow: 0 12px 30px rgba(13, 42, 82, .22);
    color: #0d2a52;
    font-family: 'Lato', system-ui, sans-serif;
    display: flex;
    flex-direction: column;
    min-height: 540px;
}

.onda-superior {
    position: absolute;
    inset: 0 0 auto 0;
    width: 100%;
    height: 210px;
}

.onda-inferior {
    display: block;
    width: 100%;
    height: 60px;
    margin-top: auto;
}

.empresa {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    padding-top: 24px;
    color: #fff;
}

.empresa-logo {
    width: 40px;
    height: 40px;
    object-fit: contain;
    background: #fff;
    border-radius: 50%;
    padding: 4px;
}

.empresa strong {
    display: block;
    font-size: 1.05rem;
    letter-spacing: .08em;
}

.empresa span {
    display: block;
    font-size: .74rem;
    opacity: .8;
}

.foto {
    position: relative;
    width: 132px;
    height: 132px;
    margin: 38px auto 0;
    border-radius: 50%;
    background: #f1f4f8;
    border: 7px solid #fff;
    box-shadow: 0 6px 16px rgba(13, 42, 82, .3);
    overflow: hidden;
}

.foto img,
.foto svg {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
}

.datos {
    position: relative;
    padding: 14px 22px 8px;
    text-align: center;
}

.nombre {
    margin: 0;
    font-size: 1.3rem;
    font-weight: 900;
    line-height: 1.2;
    text-transform: uppercase;
    overflow-wrap: anywhere;
}

.nombre span {
    display: block;
}

.puesto {
    margin: 4px 0 10px;
    font-size: 1.05rem;
    color: #6b7686;
    letter-spacing: .04em;
}

.id {
    margin: 0 0 12px;
    font-size: .98rem;
    font-weight: 700;
    letter-spacing: .03em;
}

.codigos {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
}

.qr {
    width: 78px;
    height: 78px;
    flex-shrink: 0;
}

.barras {
    flex: 1;
    min-width: 0;
    max-width: 190px;
    height: 62px;
}

.aviso {
    margin: 40px 10px;
    color: #6b7686;
    line-height: 1.5;
}
</style>
