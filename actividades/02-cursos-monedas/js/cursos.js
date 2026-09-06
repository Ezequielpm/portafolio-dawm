/* Catálogo de cursos (demo).
   El precio se guarda FIJO en pesos mexicanos (precioMXN). Los precios en
   dólar y yen se recalculan en app.js con el tipo de cambio que devuelve
   la API REST al pulsar el botón "Actualizar precios". */

const CURSOS = [
    {
        id: 1,
        institucion: "Facultad de Ingeniería",
        siglas: "FING",
        titulo: "Desarrollo Web con HTML, CSS y JavaScript",
        descripcion: "Construye tu primer sitio web desde cero: estructura " +
                     "semántica con HTML5, presentación con CSS3 e " +
                     "interactividad con JavaScript.",
        horas: 32,
        nivel: "Principiante",
        precioMXN: 1290.00,
        icono: "🌐"
    },
    {
        id: 2,
        institucion: "Facultad de Ingeniería",
        siglas: "FING",
        titulo: "Diseño responsivo con Flexbox y Grid",
        descripcion: "Aprende a que una misma página se adapte al teléfono, " +
                     "la tableta y el escritorio usando los sistemas de " +
                     "maquetación modernos de CSS.",
        horas: 22,
        nivel: "Intermedio",
        precioMXN: 990.00,
        icono: "📐"
    },
    {
        id: 3,
        institucion: "Facultad de Ingeniería",
        siglas: "FING",
        titulo: "jQuery y consumo de APIs REST",
        descripcion: "Conecta tus páginas con servicios externos: peticiones " +
                     "asíncronas, manejo de respuestas en JSON y control de " +
                     "errores de red.",
        horas: 18,
        nivel: "Principiante",
        precioMXN: 1190.00,
        icono: "🔌"
    },
    {
        id: 4,
        institucion: "Facultad de Contaduría y Administración",
        siglas: "FCA",
        titulo: "Bases de datos relacionales con MySQL",
        descripcion: "Modela información, escribe consultas SQL y comprende " +
                     "la normalización que sostiene a cualquier aplicación " +
                     "de gestión.",
        horas: 28,
        nivel: "Intermedio",
        precioMXN: 1090.00,
        icono: "🗄️"
    },
    {
        id: 5,
        institucion: "Facultad de Ingeniería",
        siglas: "FING",
        titulo: "Node.js y Express desde cero",
        descripcion: "Lleva JavaScript al servidor: crea tu propia API REST, " +
                     "define rutas y conecta el backend con una base de datos.",
        horas: 40,
        nivel: "Intermedio",
        precioMXN: 1490.00,
        icono: "🟩"
    },
    {
        id: 6,
        institucion: "Facultad de Ingeniería",
        siglas: "FING",
        titulo: "Flutter para aplicaciones móviles",
        descripcion: "Desarrolla una sola aplicación que funcione en Android " +
                     "y iOS, con widgets, navegación entre pantallas y " +
                     "consumo de servicios.",
        horas: 50,
        nivel: "Avanzado",
        precioMXN: 1890.00,
        icono: "📱"
    }
];
