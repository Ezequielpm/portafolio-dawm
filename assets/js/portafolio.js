/* Genera las tarjetas de la portada a partir de ACTIVIDADES */

document.addEventListener("DOMContentLoaded", function () {

    const rejilla = document.getElementById("rejilla-actividades");
    const conteo = document.getElementById("conteo-actividades");

    conteo.textContent = ACTIVIDADES.length +
        (ACTIVIDADES.length === 1 ? " actividad" : " actividades");

    ACTIVIDADES.forEach(function (act) {
        const temas = act.temas
            .map(t => `<li>${t}</li>`)
            .join("");

        const tarjeta = document.createElement("a");
        tarjeta.className = "tarjeta";
        tarjeta.href = act.ruta;
        tarjeta.innerHTML = `
            <div class="tarjeta-encabezado">
                <span class="tarjeta-icono">${act.icono}</span>
                <span class="tarjeta-numero">Actividad ${String(act.numero).padStart(2, "0")}</span>
                <span class="tarjeta-estado">${act.estado}</span>
            </div>

            <h3>${act.titulo}</h3>
            <p class="tarjeta-resumen">${act.resumen}</p>

            <ul class="tarjeta-temas">${temas}</ul>

            <div class="tarjeta-pie">
                <span class="tarjeta-fecha">${act.fecha}</span>
                <span class="tarjeta-enlace">Abrir &rarr;</span>
            </div>
        `;

        rejilla.appendChild(tarjeta);
    });

});
