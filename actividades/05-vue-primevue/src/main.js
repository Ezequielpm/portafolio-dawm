import { createApp } from 'vue'
import PrimeVue from 'primevue/config'
import ToastService from 'primevue/toastservice'
import Aura from '@primeuix/themes/aura'
import { definePreset } from '@primeuix/themes'
import 'primeicons/primeicons.css'
import './style.css'
import App from './App.vue'
import { router } from './router'

// Aura con el azul índigo del mockup como color primario
const Tema = definePreset(Aura, {
    semantic: {
        primary: {
            50: '{indigo.50}', 100: '{indigo.100}', 200: '{indigo.200}', 300: '{indigo.300}',
            400: '{indigo.400}', 500: '{indigo.500}', 600: '{indigo.600}', 700: '{indigo.700}',
            800: '{indigo.800}', 900: '{indigo.900}', 950: '{indigo.950}'
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
        firstDayOfWeek: 1,
        dayNames: ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'],
        dayNamesShort: ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'],
        dayNamesMin: ['D', 'L', 'M', 'X', 'J', 'V', 'S'],
        monthNames: ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'],
        monthNamesShort: ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'],
        today: 'Hoy',
        clear: 'Limpiar',
        emptyMessage: 'Sin resultados',
        emptyFilterMessage: 'Sin resultados'
    }
})
app.use(ToastService)
app.use(router)

app.mount('#app')
