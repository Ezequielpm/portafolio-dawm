<script setup>
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import Toast from 'primevue/toast'

/* Estructura del panel: barra superior, menú lateral y área de contenido.
   En escritorio el botón ☰ oculta/muestra el menú; en pantallas chicas
   el menú se abre encima del contenido. */

const route = useRoute()
const menuOculto = ref(false)   // escritorio
const menuMovil = ref(false)    // móvil
const logo = `${import.meta.env.BASE_URL}logo-unach.png`

const menu = [
    {
        titulo: 'Universidad Autónoma de Chiapas',
        items: [{ texto: 'Dashboard', icono: 'pi pi-home', ruta: '/' }]
    },
    {
        titulo: 'Módulos',
        items: [
            { texto: 'Tarjeta de empleado', icono: 'pi pi-id-card', ruta: '/formEmpleados' },
            { texto: 'Empleados', icono: 'pi pi-users', ruta: '/empleados' },
            { texto: 'BarCode-QR', icono: 'pi pi-qrcode', ruta: '/barcode-qr' }
        ]
    }
]

function alternarMenu() {
    if (window.matchMedia('(max-width: 991px)').matches) {
        menuMovil.value = !menuMovil.value
    } else {
        menuOculto.value = !menuOculto.value
    }
}

// Al navegar en móvil se cierra el menú
watch(() => route.fullPath, () => { menuMovil.value = false })
</script>

<template>
    <Toast />
    <div class="layout" :class="{ 'menu-oculto': menuOculto, 'menu-movil': menuMovil }">
        <header class="topbar">
            <RouterLink to="/" class="marca">
                <img :src="logo" alt="Logotipo de la UNACH">
                <span>
                    Tecnologías Digitales<br>
                    UNACH
                </span>
            </RouterLink>
            <button class="boton-menu" type="button" aria-label="Mostrar u ocultar menú" @click="alternarMenu">
                <i class="pi pi-bars"></i>
            </button>
            <span class="topbar-usuario">
                <i class="pi pi-user"></i>
                Ezequiel Peña Mazariegos
            </span>
        </header>

        <aside class="sidebar">
            <nav>
                <section v-for="grupo in menu" :key="grupo.titulo">
                    <h2 class="grupo">{{ grupo.titulo }}</h2>
                    <RouterLink
                        v-for="item in grupo.items"
                        :key="item.ruta"
                        :to="item.ruta"
                        class="enlace"
                        exact-active-class="activo"
                    >
                        <i :class="item.icono"></i>
                        {{ item.texto }}
                    </RouterLink>
                </section>
            </nav>
        </aside>

        <div class="velo" @click="menuMovil = false"></div>

        <main class="contenido">
            <RouterView />
            <footer class="pie">
                Desarrollo de Aplicaciones Web y Móviles · Vue 3 + PrimeVue · UNACH Campus IV
            </footer>
        </main>
    </div>
</template>

<style scoped>
.layout {
    --ancho-menu: 290px;
    --alto-barra: 76px;
    min-height: 100vh;
}

/* ---------- Barra superior ---------- */
.topbar {
    position: fixed;
    inset: 0 0 auto 0;
    z-index: 30;
    height: var(--alto-barra);
    display: flex;
    align-items: center;
    gap: 24px;
    padding: 0 32px;
    background: #fff;
    box-shadow: 0 2px 8px rgba(15, 23, 42, .06);
}

.marca {
    display: flex;
    align-items: center;
    gap: 12px;
    width: calc(var(--ancho-menu) - 56px);
    color: var(--texto);
    text-decoration: none;
    font-size: 1.12rem;
    line-height: 1.2;
    white-space: nowrap;
}

.marca img {
    width: 46px;
    height: 46px;
    object-fit: contain;
}

.boton-menu {
    width: 42px;
    height: 42px;
    border: 0;
    border-radius: 50%;
    background: transparent;
    color: var(--suave);
    cursor: pointer;
    font-size: 1.25rem;
    transition: background .2s;
}

.boton-menu:hover {
    background: #f1f5f9;
}

.topbar-usuario {
    margin-left: auto;
    display: flex;
    align-items: center;
    gap: 8px;
    color: var(--suave);
    font-size: .92rem;
}

/* ---------- Menú lateral ---------- */
.sidebar {
    position: fixed;
    z-index: 20;
    top: calc(var(--alto-barra) + 24px);
    left: 24px;
    bottom: 24px;
    width: var(--ancho-menu);
    padding: 20px 18px;
    background: #fff;
    border-radius: 12px;
    box-shadow: 0 3px 5px rgba(0, 0, 0, .02), 0 1px 4px rgba(0, 0, 0, .06);
    overflow-y: auto;
    transition: transform .25s, left .25s;
}

.grupo {
    margin: 0 0 8px;
    font-size: .78rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: .04em;
    color: var(--texto);
}

section + section .grupo {
    margin-top: 20px;
}

.enlace {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 10px 16px;
    border-radius: 8px;
    color: var(--texto);
    text-decoration: none;
    transition: background .15s, color .15s;
}

.enlace:hover {
    background: #f1f5f9;
}

.enlace i {
    color: var(--suave);
}

.enlace.activo {
    color: var(--primario);
    font-weight: 700;
}

.enlace.activo i {
    color: var(--primario);
}

/* ---------- Contenido ---------- */
.contenido {
    min-height: 100vh;
    padding: calc(var(--alto-barra) + 24px) 32px 16px calc(var(--ancho-menu) + 56px);
    display: flex;
    flex-direction: column;
    transition: padding-left .25s;
}

.pie {
    margin-top: auto;
    padding-top: 24px;
    text-align: center;
    font-size: .82rem;
    color: var(--suave);
}

.velo {
    display: none;
}

/* Menú oculto en escritorio */
.menu-oculto .sidebar {
    transform: translateX(calc(-100% - 40px));
}

.menu-oculto .contenido {
    padding-left: 32px;
}

/* ---------- Pantallas chicas ---------- */
@media (max-width: 991px) {
    .topbar {
        padding: 0 16px;
        gap: 12px;
    }

    .marca {
        width: auto;
        font-size: 1rem;
    }

    .topbar-usuario {
        display: none;
    }

    .boton-menu {
        margin-left: auto;
    }

    .sidebar {
        top: var(--alto-barra);
        left: 0;
        bottom: 0;
        border-radius: 0 12px 12px 0;
        transform: translateX(-100%);
    }

    .menu-movil .sidebar {
        transform: none;
    }

    .menu-movil .velo {
        display: block;
        position: fixed;
        inset: 0;
        z-index: 15;
        background: rgba(15, 23, 42, .35);
    }

    .contenido,
    .menu-oculto .contenido {
        padding: calc(var(--alto-barra) + 16px) 16px 16px;
    }
}
</style>
