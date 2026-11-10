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
        titulo: "Oferta académica con precios multimoneda",
        resumen: "SPA responsiva con la oferta académica de una institución. " +
                 "Seis tarjetas en un grid que se reacomoda solo; el precio en " +
                 "pesos es fijo y los de dólar y yen se recalculan contra una " +
                 "API REST de tipo de cambio.",
        ruta: "actividades/02-cursos-monedas/index.html",
        fecha: "Septiembre 2026",
        estado: "Entregada",
        icono: "💱",
        temas: ["SPA", "CSS Grid responsivo", "API REST", "Hover CSS", "Intl.NumberFormat"]
    },
    {
        numero: 3,
        titulo: "Tabla de multiplicar con PHP",
        resumen: "Script en PHP que corre sobre Apache (XAMPP) y arma en el " +
                 "servidor la tabla de multiplicar del número que recibe por " +
                 "la URL con $_GET, validando el parámetro antes de usarlo.",
        ruta: "actividades/03-tabla-multiplicar/ficha.html",
        fecha: "Septiembre 2026",
        estado: "Entregada",
        icono: "✖️",
        temas: ["PHP 8", "XAMPP", "$_GET", "Parámetros de URL", "Validación"]
    },
    {
        numero: 4,
        titulo: "Sistema de gestión de documentos",
        resumen: "Plataforma responsiva para registrar, digitalizar y buscar " +
                 "los oficios y circulares de una oficina, con seguimiento " +
                 "de estatus y consulta del PDF de cada documento.",
        ruta: "https://gestion-documentos-unach-six.vercel.app",
        fecha: "Octubre 2026",
        estado: "Entregada",
        icono: "🗂️",
        temas: ["PHP", "MySQL", "Bootstrap 5", "jQuery", "Subida de PDF"]
    },
    {
        numero: 5,
        titulo: "Tarjeta digital de empleado con QR",
        resumen: "Panel en Vue 3 + PrimeVue que calcula el RFC con homoclave " +
                 "siguiendo el algoritmo del SAT y genera la credencial del " +
                 "empleado con código de barras y un QR con su vCard.",
        ruta: "https://tarjeta-empleado-unach.vercel.app",
        fecha: "Noviembre 2026",
        estado: "Entregada",
        icono: "🪪",
        temas: ["Vue 3", "PrimeVue", "Vue Router", "Código QR", "Código de barras"]
    },
    {
        numero: 6,
        titulo: "Punto de venta con DataTable",
        resumen: "Punto de venta en Vue 3 + PrimeVue que registra, edita y " +
                 "elimina productos en un DataTable con orden y paginación, " +
                 "y calcula al instante el subtotal, el IVA y el total.",
        ruta: "https://punto-de-venta-unach.vercel.app",
        fecha: "Noviembre 2026",
        estado: "Entregada",
        icono: "🧾",
        temas: ["Vue 3", "PrimeVue", "DataTable", "computed", "localStorage"]
    }
];
