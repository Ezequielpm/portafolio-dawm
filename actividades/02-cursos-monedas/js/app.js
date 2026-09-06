/* ============================================================
   Actividad 2 — Cursos con precios en varias monedas
   Los precios base están en USD y se convierten con las tasas
   que entrega una API pública y gratuita de tipo de cambio.
   ============================================================ */

/* ----- Configuración de monedas ----- */
const MONEDAS = {
    USD: { nombre: "Dólar estadounidense", bandera: "🇺🇸", locale: "en-US" },
    MXN: { nombre: "Peso mexicano",        bandera: "🇲🇽", locale: "es-MX" },
    EUR: { nombre: "Euro",                 bandera: "🇪🇺", locale: "es-ES" },
    JPY: { nombre: "Yen japonés",          bandera: "🇯🇵", locale: "ja-JP" }
};

const MONEDA_BASE = "USD";

/* Valores de emergencia: solo se usan si ninguna API responde
   (por ejemplo, si se abre el archivo sin conexión a internet). */
const TASAS_RESPALDO = { USD: 1, MXN: 16.90, EUR: 0.86, JPY: 156.25 };

/* ----- Estado de la aplicación ----- */
let tasas = Object.assign({}, TASAS_RESPALDO);
let monedaActual = MONEDA_BASE;
let carrito = [];


/* ============================================================
   1. Consulta del tipo de cambio
   ============================================================ */

function obtenerTasas() {
    $("#estado-tasas").removeClass("estado-error").text("Consultando la API…");
    $("#btn-actualizar").prop("disabled", true);

    const simbolos = Object.keys(MONEDAS).filter(m => m !== MONEDA_BASE).join(",");

    /* API principal: Frankfurter (datos del Banco Central Europeo, sin llave) */
    $.getJSON(`https://api.frankfurter.dev/v1/latest?base=${MONEDA_BASE}&symbols=${simbolos}`)
        .done(function (data) {
            aplicarTasas(data.rates, "Frankfurter", data.date);
        })
        .fail(function () {
            /* Respaldo: ExchangeRate-API endpoint abierto (sin llave) */
            $.getJSON(`https://open.er-api.com/v6/latest/${MONEDA_BASE}`)
                .done(function (data) {
                    aplicarTasas(data.rates, "ExchangeRate-API", data.time_last_update_utc);
                })
                .fail(function () {
                    tasas = Object.assign({}, TASAS_RESPALDO);
                    $("#estado-tasas")
                        .addClass("estado-error")
                        .text("Sin conexión con la API · mostrando tasas de referencia");
                    $("#btn-actualizar").prop("disabled", false);
                    pintarTasas();
                    pintarCursos();
                    pintarCarrito();
                });
        });
}

function aplicarTasas(rates, fuente, fecha) {
    tasas = { [MONEDA_BASE]: 1 };

    Object.keys(MONEDAS).forEach(function (codigo) {
        if (codigo === MONEDA_BASE) return;
        tasas[codigo] = (typeof rates[codigo] === "number")
            ? rates[codigo]
            : TASAS_RESPALDO[codigo];
    });

    $("#estado-tasas")
        .removeClass("estado-error")
        .text(`Fuente: ${fuente} · ${formatearFecha(fecha)}`);
    $("#btn-actualizar").prop("disabled", false);

    pintarTasas();
    pintarCursos();
    pintarCarrito();
}

function formatearFecha(valor) {
    /* Frankfurter devuelve "2026-09-04"; sin la hora, JavaScript lo
       interpreta como UTC y en México se vería el día anterior. */
    const texto = /^\d{4}-\d{2}-\d{2}$/.test(valor) ? valor + "T00:00:00" : valor;
    const fecha = new Date(texto);
    if (isNaN(fecha)) return String(valor);
    return fecha.toLocaleDateString("es-MX", {
        day: "2-digit", month: "long", year: "numeric"
    });
}


/* ============================================================
   2. Conversión y formato de precios
   ============================================================ */

function convertir(montoUSD, moneda) {
    return montoUSD * (tasas[moneda] || 1);
}

function formatearPrecio(montoUSD, moneda) {
    const valor = convertir(montoUSD, moneda);
    return new Intl.NumberFormat(MONEDAS[moneda].locale, {
        style: "currency",
        currency: moneda
    }).format(valor);
}


/* ============================================================
   3. Dibujado de la interfaz
   ============================================================ */

function pintarTasas() {
    const $lista = $("#tasas-lista").empty();

    Object.keys(MONEDAS).forEach(function (codigo) {
        const esActual = codigo === monedaActual;
        const tasa = tasas[codigo];

        const texto = (codigo === MONEDA_BASE)
            ? "Moneda base"
            : `1 USD = ${new Intl.NumberFormat("es-MX", {
                    minimumFractionDigits: 2, maximumFractionDigits: 4
                }).format(tasa)} ${codigo}`;

        $lista.append(`
            <div class="tasa ${esActual ? "tasa-activa" : ""}">
                <span class="tasa-bandera">${MONEDAS[codigo].bandera}</span>
                <div>
                    <span class="tasa-codigo">${codigo} <small>${MONEDAS[codigo].nombre}</small></span>
                    <span class="tasa-valor">${texto}</span>
                </div>
            </div>
        `);
    });
}

function pintarCursos() {
    const categoria = $("#filtro-categoria").val() || "todas";
    const $rejilla = $("#rejilla-cursos").empty();

    const visibles = CURSOS.filter(function (curso) {
        return categoria === "todas" || curso.categoria === categoria;
    });

    if (visibles.length === 0) {
        $rejilla.append('<p class="sin-resultados">No hay cursos en esa categoría.</p>');
        return;
    }

    visibles.forEach(function (curso) {
        const enCarrito = carrito.indexOf(curso.id) !== -1;

        $rejilla.append(`
            <article class="tarjeta">
                <div class="tarjeta-portada">
                    <span class="tarjeta-icono">${curso.icono}</span>
                    <span class="tarjeta-categoria">${curso.categoria}</span>
                </div>

                <div class="tarjeta-cuerpo">
                    <h3>${curso.titulo}</h3>
                    <p class="tarjeta-instructor">${curso.instructor}</p>

                    <ul class="tarjeta-datos">
                        <li>⭐ ${curso.calificacion.toFixed(1)}</li>
                        <li>⏱ ${curso.horas} h</li>
                        <li>📈 ${curso.nivel}</li>
                        <li>👥 ${curso.alumnos.toLocaleString("es-MX")}</li>
                    </ul>
                </div>

                <div class="tarjeta-pie">
                    <div class="precio">
                        <span class="precio-monto">${formatearPrecio(curso.precioUSD, monedaActual)}</span>
                        ${monedaActual !== MONEDA_BASE
                            ? `<span class="precio-base">${formatearPrecio(curso.precioUSD, MONEDA_BASE)} USD</span>`
                            : `<span class="precio-base">Precio base del catálogo</span>`}
                    </div>
                    <button type="button"
                            class="btn-agregar ${enCarrito ? "agregado" : ""}"
                            data-id="${curso.id}">
                        ${enCarrito ? "Quitar" : "Agregar"}
                    </button>
                </div>
            </article>
        `);
    });
}

function pintarCarrito() {
    const $lista = $("#carrito-lista").empty();

    if (carrito.length === 0) {
        $lista.append('<li class="carrito-vacio">Aún no has agregado cursos.</li>');
        $("#carrito-total").text(formatearPrecio(0, monedaActual));
        return;
    }

    let totalUSD = 0;

    carrito.forEach(function (id) {
        const curso = CURSOS.find(c => c.id === id);
        totalUSD += curso.precioUSD;

        $lista.append(`
            <li>
                <span class="carrito-titulo">${curso.icono} ${curso.titulo}</span>
                <span class="carrito-precio">${formatearPrecio(curso.precioUSD, monedaActual)}</span>
            </li>
        `);
    });

    $("#carrito-total").text(formatearPrecio(totalUSD, monedaActual));
}

function llenarFiltroCategorias() {
    const categorias = [...new Set(CURSOS.map(c => c.categoria))].sort();
    const $select = $("#filtro-categoria");

    categorias.forEach(function (cat) {
        $select.append(`<option value="${cat}">${cat}</option>`);
    });
}


/* ============================================================
   4. Eventos
   ============================================================ */

$(document).ready(function () {

    llenarFiltroCategorias();
    pintarTasas();
    pintarCursos();
    pintarCarrito();
    obtenerTasas();

    /* Cambio de moneda */
    $("#selector-moneda").on("click", ".chip", function () {
        monedaActual = $(this).data("moneda");

        $(".chip").removeClass("activa");
        $(this).addClass("activa");

        pintarTasas();
        pintarCursos();
        pintarCarrito();
    });

    /* Volver a consultar la API */
    $("#btn-actualizar").click(obtenerTasas);

    /* Filtro por categoría */
    $("#filtro-categoria").change(pintarCursos);

    /* Agregar o quitar del resumen de compra */
    $("#rejilla-cursos").on("click", ".btn-agregar", function () {
        const id = parseInt($(this).data("id"), 10);
        const posicion = carrito.indexOf(id);

        if (posicion === -1) {
            carrito.push(id);
        } else {
            carrito.splice(posicion, 1);
        }

        pintarCursos();
        pintarCarrito();
    });

});
