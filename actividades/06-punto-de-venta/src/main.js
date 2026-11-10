import { createApp } from 'vue'
import PrimeVue from 'primevue/config'
import ToastService from 'primevue/toastservice'
import ConfirmationService from 'primevue/confirmationservice'
import Aura from '@primeuix/themes/aura'
import { definePreset } from '@primeuix/themes'
import 'primeicons/primeicons.css'
import './style.css'
import App from './App.vue'

// Aura con verde como color primario, igual que los botones del mockup
const Tema = definePreset(Aura, {
    semantic: {
        primary: {
            50: '{green.50}', 100: '{green.100}', 200: '{green.200}', 300: '{green.300}',
            400: '{green.400}', 500: '{green.500}', 600: '{green.600}', 700: '{green.700}',
            800: '{green.800}', 900: '{green.900}', 950: '{green.950}'
        }
    }
})

const app = createApp(App)

app.use(PrimeVue, {
    theme: {
        preset: Tema,
        options: { darkModeSelector: false }
    },
    locale: {
        accept: 'Sí',
        reject: 'No',
        emptyMessage: 'Sin resultados',
        aria: {
            firstPageLabel: 'Primera página',
            previousPageLabel: 'Página anterior',
            nextPageLabel: 'Página siguiente',
            lastPageLabel: 'Última página',
            rowsPerPageLabel: 'Filas por página'
        }
    }
})
app.use(ToastService)
app.use(ConfirmationService)

app.mount('#app')
