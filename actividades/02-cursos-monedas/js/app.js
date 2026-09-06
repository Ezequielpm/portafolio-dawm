/* ============================================================
   Actividad 2 — Oferta académica con precios multimoneda (SPA)

   RF3: el precio en pesos mexicanos es FIJO. Al pulsar el botón
   "Actualizar precios" se consulta una API REST de tipo de cambio
   y se recalculan únicamente las monedas extranjeras (USD y JPY).
   ============================================================ */

/* ----- Configuración ----- */
const MONEDA_BASE = "MXN";

const MONEDAS = {
    MXN: { nombre: "Peso mexicano",        etiqueta: "PrecioMXN", bandera: "🇲🇽", locale: "es-MX" },
    USD: { nombre: "Dólar estadounidense", etiqueta: "PrecioUS",  bandera: "🇺🇸", locale: "en-US" },
    JPY: { nombre: "Yen japonés",          etiqueta: "PrecioYen", bandera: "🇯🇵", locale: "ja-JP" }
};

/* Tasas de referencia con las que arranca la página.
   Se reemplazan por las de la API en cuanto se pulsa "Actualizar precios". */
const TASAS_RESPALDO = { MXN: 1, USD: 0.0592, JPY: 9.2459 };

/* ----- Estado ----- */
let tasas = Object.assign({}, TASAS_RESPALDO);


/* ============================================================
   1. Conexión a la API REST de tipo de cambio
   ============================================================ */

function actualizarPrecios() {
    $("#estado-tasas")
        .removeClass("estado-error estado-listo")
        .text("Conectando con la API…");
    $("#btn-actualizar").prop("disabled", true);

    const simbolos = Object.keys(MONEDAS).filter(m => m !== MONEDA_BASE).join(",");

    /* API principal: Frankfurter (Banco Central Europeo), gratuita y sin llave */
    $.getJSON(`https://api.frankfurter.dev/v1/latest?base=${MONEDA_BASE}&symbols=${simbolos}`)
        .done(function (data) {
            aplicarTasas(data.rates, "Frankfurter", data.date);
        })
        .fail(function () {
            /* Respaldo: ExchangeRate-API, endpoint abierto sin llave */
            $.getJSON(`https://open.er-api.com/v6/latest/${MONEDA_BASE}`)
                .done(function (data) {
                    aplicarTasas(data.rates, "ExchangeRate-API", data.time_last_update_utc);
                })
                .fail(function () {
                    $("#estado-tasas")
                        .addClass("estado-error")
                        .text("No hubo conexión con la API · se conservan las tasas de referencia");
                    $("#btn-actualizar").prop("disabled", false);
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
        .addClass("estado-listo")
        .text(`Actualizado · ${fuente} · ${formatearFecha(fecha)}`);
    $("#btn-actualizar").prop("disabled", false);

    pintarTasas();
    pintarCursos();
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
   2. Conversión y formato
   ============================================================ */

function convertir(montoMXN, moneda) {
    return montoMXN * (tasas[moneda] || 1);
}

function formatearPrecio(montoMXN, moneda) {
    return new Intl.NumberFormat(MONEDAS[moneda].locale, {
        style: "currency",
        currency: moneda
    }).format(convertir(montoMXN, moneda));
}


/* ============================================================
   3. Dibujado de la interfaz
   ============================================================ */

function pintarTasas() {
    const $lista = $("#tasas-lista").empty();

    Object.keys(MONEDAS).forEach(function (codigo) {
        const texto = (codigo === MONEDA_BASE)
            ? "Precio fijo del catálogo"
            : `1 MXN = ${new Intl.NumberFormat("es-MX", {
                    minimumFractionDigits: 4, maximumFractionDigits: 6
                }).format(tasas[codigo])} ${codigo}`;

        $lista.append(`
            <div class="tasa ${codigo === MONEDA_BASE ? "tasa-base" : ""}">
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
    const $rejilla = $("#rejilla-cursos").empty();

    CURSOS.forEach(function (curso) {

        /* Fila con las tres monedas: MXN fijo, USD y JPY calculados */
        const precios = Object.keys(MONEDAS).map(function (codigo) {
            return `
                <div class="precio">
                    <span class="precio-bandera">${MONEDAS[codigo].bandera}</span>
                    <span class="precio-etiqueta">${MONEDAS[codigo].etiqueta}</span>
                    <span class="precio-monto">${formatearPrecio(curso.precioMXN, codigo)}</span>
                </div>`;
        }).join("");

        $rejilla.append(`
            <article class="tarjeta">
                <div class="tarjeta-portada">
                    <div class="portada-imagen">
                        <span class="portada-logo">${curso.siglas}</span>
                        <span class="portada-icono">${curso.icono}</span>
                    </div>
                </div>

                <div class="tarjeta-cuerpo">
                    <p class="tarjeta-institucion">${curso.institucion}</p>
                    <h3>${curso.titulo}</h3>

                    <ul class="tarjeta-datos">
                        <li>⏱ Duración: ${curso.horas} horas</li>
                        <li>📈 ${curso.nivel}</li>
                    </ul>

                    <p class="tarjeta-descripcion">${curso.descripcion}</p>
                </div>

                <div class="tarjeta-precios">${precios}</div>

                <!-- RF1: el botón es únicamente visual, no lleva ninguna acción -->
                <button type="button" class="btn-inscripcion">Inscribirse</button>
            </article>
        `);
    });
}


/* ============================================================
   4. Eventos
   ============================================================ */

$(document).ready(function () {

    pintarTasas();
    pintarCursos();

    /* RF3: la conexión a la API ocurre al pulsar el botón */
    $("#btn-actualizar").click(actualizarPrecios);

});
