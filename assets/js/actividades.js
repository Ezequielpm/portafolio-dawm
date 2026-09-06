/* ============================================================
   Listado de actividades del portafolio.

   Para agregar una actividad nueva:
     1. Crea la carpeta  actividades/03-nombre-de-la-actividad/
     2. Copia un objeto de esta lista y ajusta sus datos.
   El resto de la portada se genera solo.
   ============================================================ */

const ACTIVIDADES = [
    {
        numero: 1,
        titulo: "Calculadora y consulta de API",
        resumen: "Página institucional de la UNACH con una calculadora hecha con " +
                 "eventos de jQuery y una consulta por id a una API pública de usuarios.",
        ruta: "actividades/01-calculadora-unach/index.html",
        fecha: "Agosto 2026",
        estado: "Entregada",
        icono: "🧮",
        temas: ["HTML5", "CSS3", "jQuery", "Eventos", "$.get()"]
    },
    {
        numero: 2,
        titulo: "Cursos con precios multimoneda",
        resumen: "Catálogo demostrativo de cursos en línea. Los precios se guardan " +
                 "en dólares y se convierten a pesos mexicanos, euros y yenes " +
                 "consultando una API gratuita de tipo de cambio.",
        ruta: "actividades/02-cursos-monedas/index.html",
        fecha: "Septiembre 2026",
        estado: "Entregada",
        icono: "💱",
        temas: ["API REST", "Frankfurter", "Intl.NumberFormat", "CSS Grid", "jQuery"]
    }
];
