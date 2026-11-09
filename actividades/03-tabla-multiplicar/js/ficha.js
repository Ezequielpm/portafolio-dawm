/* ============================================================
   Demostración equivalente a index.php, resuelta en el navegador.

   Sirve para que la actividad se pueda revisar desde el portafolio
   publicado, donde no hay PHP. La lógica es la misma: se lee el
   parámetro de la URL, se valida y se arma la tabla.

   PHP                      JavaScript
   $_GET['num']     <-->    new URLSearchParams(location.search).get("num")
   ============================================================ */

const NUM_MINIMO = -1000;
const NUM_MAXIMO = 1000;
const HASTA_MINIMO = 1;
const HASTA_MAXIMO = 20;
const HASTA_DEFECTO = 10;

document.addEventListener("DOMContentLoaded", function () {

    const parametros = new URLSearchParams(window.location.search);
    const numeroCrudo = (parametros.get("num") || "").trim();
    const hastaCrudo = (parametros.get("hasta") || "").trim();

    const campoNumero = document.getElementById("num");
    const campoHasta = document.getElementById("hasta");
    const salida = document.getElementById("salida");

    /* Equivalente a FILTER_VALIDATE_INT: devuelve null si no es entero. */
    function aEntero(texto) {
        if (!/^[+-]?\d+$/.test(texto)) {
            return null;
        }
        return parseInt(texto, 10);
    }

    /* Equivalente a htmlspecialchars(). */
    function esc(valor) {
        return String(valor)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;");
    }

    /* La cantidad de filas es opcional: si viene mal, se usa la de omisión. */
    let hasta = aEntero(hastaCrudo);
    if (hasta === null || hasta < HASTA_MINIMO || hasta > HASTA_MAXIMO) {
        hasta = HASTA_DEFECTO;
    }
    campoHasta.value = hasta;

    if (numeroCrudo === "") {
        salida.innerHTML = `
            <p class="aviso aviso-neutro">
                Escribe un número y pulsa <strong>Generar tabla</strong>, o agrega
                el parámetro en la barra de direcciones:
                <code>ficha.html?num=7</code>.
            </p>`;
        return;
    }

    campoNumero.value = numeroCrudo;
    const numero = aEntero(numeroCrudo);

    if (numero === null) {
        salida.innerHTML = `<p class="aviso aviso-error">El valor «${esc(numeroCrudo)}» no es un número entero.</p>`;
        return;
    }

    if (numero < NUM_MINIMO || numero > NUM_MAXIMO) {
        salida.innerHTML = `<p class="aviso aviso-error">El número debe estar entre ${NUM_MINIMO} y ${NUM_MAXIMO}.</p>`;
        return;
    }

    /* Mismo ciclo que el del script en PHP. */
    let filas = "";
    for (let i = 1; i <= hasta; i++) {
        filas += `
            <tr>
                <td>${esc(numero)} &times; ${i}</td>
                <td class="celda-resultado">${esc(numero * i)}</td>
            </tr>`;
    }

    salida.innerHTML = `
        <section class="resultado">
            <div class="resultado-encabezado">
                <h2>Tabla del ${esc(numero)}</h2>
                <span class="resultado-url">index.php?num=${esc(numero)}&amp;hasta=${hasta}</span>
            </div>

            <table class="tabla">
                <caption>${hasta} multiplicaciones · en XAMPP las genera PHP en el servidor</caption>
                <thead>
                    <tr>
                        <th scope="col">Operación</th>
                        <th scope="col">Resultado</th>
                    </tr>
                </thead>
                <tbody>${filas}</tbody>
            </table>
        </section>`;
});
