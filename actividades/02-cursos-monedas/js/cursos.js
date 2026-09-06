/* Catálogo de cursos (demo).
   El precio SIEMPRE se guarda en dólares (USD); la conversión a las
   demás monedas se calcula en app.js con las tasas de la API. */

const CURSOS = [
    {
        id: 1,
        titulo: "Desarrollo Web con HTML, CSS y JavaScript",
        categoria: "Frontend",
        instructor: "M.C. Laura Domínguez",
        horas: 32,
        nivel: "Principiante",
        calificacion: 4.8,
        alumnos: 1240,
        precioUSD: 49.99,
        icono: "🌐"
    },
    {
        id: 2,
        titulo: "jQuery y consumo de APIs REST",
        categoria: "Frontend",
        instructor: "Ing. Ezequiel Peña",
        horas: 18,
        nivel: "Principiante",
        calificacion: 4.6,
        alumnos: 860,
        precioUSD: 34.50,
        icono: "🔌"
    },
    {
        id: 3,
        titulo: "Diseño responsivo con Flexbox y Grid",
        categoria: "Diseño",
        instructor: "Lic. Andrea Coutiño",
        horas: 22,
        nivel: "Intermedio",
        calificacion: 4.9,
        alumnos: 1530,
        precioUSD: 29.00,
        icono: "📐"
    },
    {
        id: 4,
        titulo: "Node.js y Express desde cero",
        categoria: "Backend",
        instructor: "Dr. Rubén Zavaleta",
        horas: 40,
        nivel: "Intermedio",
        calificacion: 4.7,
        alumnos: 970,
        precioUSD: 59.90,
        icono: "🟩"
    },
    {
        id: 5,
        titulo: "Bases de datos relacionales con MySQL",
        categoria: "Backend",
        instructor: "M.C. Patricia Nangüelú",
        horas: 28,
        nivel: "Intermedio",
        calificacion: 4.5,
        alumnos: 1105,
        precioUSD: 39.00,
        icono: "🗄️"
    },
    {
        id: 6,
        titulo: "React: componentes, estado y hooks",
        categoria: "Frontend",
        instructor: "Ing. Daniel Ovando",
        horas: 45,
        nivel: "Avanzado",
        calificacion: 4.8,
        alumnos: 2010,
        precioUSD: 74.00,
        icono: "⚛️"
    },
    {
        id: 7,
        titulo: "Flutter para aplicaciones móviles",
        categoria: "Móvil",
        instructor: "M.C. Sofía Aguilar",
        horas: 50,
        nivel: "Avanzado",
        calificacion: 4.9,
        alumnos: 1780,
        precioUSD: 89.99,
        icono: "📱"
    },
    {
        id: 8,
        titulo: "Kotlin y Android Studio",
        categoria: "Móvil",
        instructor: "Ing. Marco Trujillo",
        horas: 36,
        nivel: "Intermedio",
        calificacion: 4.4,
        alumnos: 640,
        precioUSD: 64.50,
        icono: "🤖"
    },
    {
        id: 9,
        titulo: "Git y GitHub para trabajo en equipo",
        categoria: "Herramientas",
        instructor: "Ing. Ezequiel Peña",
        horas: 12,
        nivel: "Principiante",
        calificacion: 4.7,
        alumnos: 2450,
        precioUSD: 19.99,
        icono: "🌿"
    }
];
