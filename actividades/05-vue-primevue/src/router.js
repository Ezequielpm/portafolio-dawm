import { createRouter, createWebHashHistory } from 'vue-router'
import DashboardView from './views/DashboardView.vue'

// Historial con hash (#/ruta): funciona en cualquier hosting estático
// sin configurar redirecciones en el servidor.
export const router = createRouter({
    history: createWebHashHistory(),
    routes: [
        { path: '/', component: DashboardView, meta: { titulo: 'Dashboard' } },
        { path: '/formEmpleados', component: () => import('./views/FormEmpleadosView.vue'), meta: { titulo: 'Tarjeta de empleado' } },
        { path: '/empleados', component: () => import('./views/EmpleadosView.vue'), meta: { titulo: 'Empleados' } },
        { path: '/barcode-qr', component: () => import('./views/BarcodeQrView.vue'), meta: { titulo: 'BarCode-QR' } },
        { path: '/:pathMatch(.*)*', redirect: '/' }
    ],
    scrollBehavior: () => ({ top: 0 })
})

router.afterEach(to => {
    document.title = `${to.meta.titulo} · Tarjeta digital UNACH`
})
