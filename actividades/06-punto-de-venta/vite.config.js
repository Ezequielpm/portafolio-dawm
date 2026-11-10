import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'

export default defineConfig({
    plugins: [vue()],
    // Rutas relativas: el build funciona en Vercel y dentro de una subcarpeta
    base: './'
})
