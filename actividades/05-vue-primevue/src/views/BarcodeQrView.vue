<script setup>
import { ref, watch, onMounted, nextTick } from 'vue'
import JsBarcode from 'jsbarcode'
import QRCode from 'qrcode'
import InputText from 'primevue/inputtext'
import Select from 'primevue/select'
import Button from 'primevue/button'
import Message from 'primevue/message'

/* Generador libre: escribe cualquier texto y obtén su QR y su código de barras */

const texto = ref('https://www.unach.mx')
const formato = ref('CODE128')
const formatos = ['CODE128', 'CODE39', 'EAN13', 'UPC', 'ITF14']
const barras = ref(null)
const qr = ref('')
const errorBarras = ref('')

async function dibujar() {
    await nextTick()
    const valor = texto.value.trim()
    errorBarras.value = ''

    if (!valor) {
        qr.value = ''
        barras.value?.replaceChildren()
        return
    }

    qr.value = await QRCode.toDataURL(valor, { width: 280, margin: 1 })

    try {
        JsBarcode(barras.value, valor, { format: formato.value, height: 70, fontSize: 14, margin: 8 })
    } catch {
        barras.value.replaceChildren()
        errorBarras.value = `"${valor}" no es válido para ${formato.value}.` +
            (formato.value === 'EAN13' ? ' Necesita 12 o 13 dígitos.' : '') +
            (formato.value === 'UPC' ? ' Necesita 11 o 12 dígitos.' : '') +
            (formato.value === 'ITF14' ? ' Necesita 13 o 14 dígitos.' : '')
    }
}

function descargarQR() {
    const a = document.createElement('a')
    a.href = qr.value
    a.download = 'codigo-qr.png'
    a.click()
}

function descargarBarras() {
    const svg = new XMLSerializer().serializeToString(barras.value)
    const a = document.createElement('a')
    a.href = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml' }))
    a.download = 'codigo-barras.svg'
    a.click()
    URL.revokeObjectURL(a.href)
}

watch([texto, formato], dibujar)
onMounted(dibujar)
</script>

<template>
    <section class="panel">
        <h1 class="titulo">Generador de BarCode y QR</h1>

        <div class="controles">
            <div class="campo texto">
                <label for="texto">Texto o URL</label>
                <InputText id="texto" v-model="texto" fluid />
            </div>
            <div class="campo">
                <label for="formato">Formato del código de barras</label>
                <Select inputId="formato" v-model="formato" :options="formatos" fluid />
            </div>
        </div>

        <div class="resultados">
            <article class="resultado">
                <h2>Código QR</h2>
                <img v-if="qr" :src="qr" alt="Código QR generado" class="qr">
                <Button label="Descargar PNG" icon="pi pi-download" outlined :disabled="!qr" @click="descargarQR" />
            </article>

            <article class="resultado">
                <h2>Código de barras ({{ formato }})</h2>
                <svg ref="barras" class="barras"></svg>
                <Message v-if="errorBarras" severity="warn" size="small">{{ errorBarras }}</Message>
                <Button label="Descargar SVG" icon="pi pi-download" outlined :disabled="!texto.trim() || !!errorBarras" @click="descargarBarras" />
            </article>
        </div>
    </section>
</template>

<style scoped>
.controles {
    display: grid;
    grid-template-columns: 2fr 1fr;
    gap: 16px;
    margin-bottom: 24px;
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

.resultados {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 24px;
}

.resultado {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
    padding: 24px;
    border: 1px dashed #cbd5e1;
    border-radius: 12px;
    text-align: center;
}

.resultado h2 {
    margin: 0;
    font-size: 1rem;
    font-weight: 600;
}

.qr {
    width: 200px;
    height: 200px;
}

.barras {
    max-width: 100%;
    height: auto;
}

@media (max-width: 767px) {
    .controles,
    .resultados {
        grid-template-columns: 1fr;
    }
}
</style>
