/* ============================================================
   Sistema de Gestión de Documentos — lógica del navegador
   Desarrollo de Aplicaciones Web y Móviles · UNACH

   Es una sola página (index.html) con cuatro vistas. La vista que
   se muestra depende del fragmento de la URL:

       #inicio          panel con el conteo por estatus
       #documentos      listado con búsqueda y filtros
       #buscar          lo mismo, con el cursor en el buscador
       #nuevo           formulario de registro
       #editar/5        formulario con el documento 5
       #ver/5           detalle, seguimiento y visor del PDF

   Los datos se piden a la API en PHP (carpeta api/) con $.ajax.
   La interfaz usa componentes de Bootstrap 5 (modal, toasts,
   offcanvas, dropdown); se controlan desde aquí con su API de JS.
   ============================================================ */

$(function () {
    "use strict";

    const API = "api/";
    const ESTATUS = ["Recibido", "En proceso", "Atendido"];
    const LADO_MAXIMO_FOTO = 2000;          // px; igual que en el servidor
    const TAMANO_MAXIMO = 4 * 1024 * 1024;  // 4 MB en total; igual que en el servidor
    const PAGINAS_MAXIMAS = 10;

    /* Estado del listado: se conserva al ir y volver de otras vistas. */
    const listado = {
        filtros: { q: "", campo: "todos", estatus: "", desde: "", hasta: "" },
        pagina: 1
    };

    /* Archivo que se va a subir: o varias fotos, o un PDF. */
    const captura = {
        fotos: [],    // [{ blob, url }]
        pdf: null     // File
    };

    /* ========================================================
       Utilidades
       ======================================================== */

    /* Todo texto que viene de la base pasa por aquí antes de
       meterlo en el HTML, para que no se interprete como etiquetas. */
    function esc(texto) {
        return String(texto ?? "").replace(/[&<>"']/g, (c) => ({
            "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
        }[c]));
    }

    /* «2026-10-05» → «05/10/2026» */
    function fechaCorta(iso) {
        const [a, m, d] = String(iso).slice(0, 10).split("-");
        return `${d}/${m}/${a}`;
    }

    /* «2026-10-05 14:30:00» → «05/10/2026 14:30» */
    function fechaHora(texto) {
        return fechaCorta(texto) + " " + String(texto).slice(11, 16);
    }

    /* Fecha local en AAAA-MM-DD (toISOString usaría la hora UTC). */
    function hoyIso() {
        const h = new Date();
        return [h.getFullYear(), String(h.getMonth() + 1).padStart(2, "0"), String(h.getDate()).padStart(2, "0")].join("-");
    }

    function claseEstatus(estatus) {
        return "estatus-" + String(estatus).toLowerCase().replace(/\s+/g, "-");
    }

    function insignia(estatus) {
        return `<span class="insignia ${claseEstatus(estatus)}">${esc(estatus)}</span>`;
    }

    function tamanoLegible(bytes) {
        return bytes < 1048576 ? Math.round(bytes / 1024) + " KB" : (bytes / 1048576).toFixed(1) + " MB";
    }

    function icono(nombre) {
        return `<svg aria-hidden="true"><use href="#i-${nombre}"/></svg>`;
    }

    /* Mensaje flotante (toast de Bootstrap) que desaparece solo. */
    function avisar(mensaje, tipo = "") {
        const colores = { exito: "text-bg-success", error: "text-bg-danger" };
        const $toast = $(`
            <div class="toast align-items-center border-0 ${colores[tipo] || "text-bg-dark"}"
                 role="${tipo === "error" ? "alert" : "status"}" aria-atomic="true">
                <div class="d-flex">
                    <div class="toast-body"></div>
                    <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Cerrar"></button>
                </div>
            </div>`);
        $toast.find(".toast-body").text(mensaje);
        $("#avisos").append($toast);
        $toast.on("hidden.bs.toast", () => $toast.remove());
        bootstrap.Toast.getOrCreateInstance($toast[0], { delay: tipo === "error" ? 5000 : 3000 }).show();
    }

    /* Confirmación con el modal de Bootstrap; devuelve una promesa. */
    const modal = bootstrap.Modal.getOrCreateInstance("#modal");

    function confirmar(titulo, texto, textoBoton = "Eliminar") {
        return new Promise((resolver) => {
            let respuesta = false;
            $("#modal-titulo").text(titulo);
            $("#modal-texto").text(texto);
            $("#modal-aceptar").text(textoBoton).off("click").on("click", () => {
                respuesta = true;
                modal.hide();
            });
            $("#modal").one("hidden.bs.modal", () => resolver(respuesta));
            modal.show();
        });
    }

    /* Saca el mensaje de error de una respuesta fallida de la API. */
    function mensajeDeError(xhr) {
        if (xhr.responseJSON && xhr.responseJSON.mensaje) return xhr.responseJSON.mensaje;
        if (xhr.status === 0) return "No hay conexión con el servidor. Revisa tu conexión a internet.";
        if (xhr.status === 413) return "El archivo es demasiado grande para el servidor (máximo 4 MB).";
        return "Error " + xhr.status + " al comunicarse con el servidor.";
    }

    /* $.getJSON / $.post con manejo de errores común. */
    function obtener(ruta, datos) {
        return $.ajax({ url: API + ruta, data: datos, dataType: "json", cache: false })
            .fail((xhr) => avisar(mensajeDeError(xhr), "error"));
    }

    function enviar(ruta, datos) {
        return $.ajax({ url: API + ruta, method: "POST", data: datos, dataType: "json" })
            .fail((xhr) => avisar(mensajeDeError(xhr), "error"));
    }

    /* ========================================================
       Navegación entre vistas
       ======================================================== */

    function enrutar() {
        const [ruta, parametro] = location.hash.replace(/^#/, "").split("/");
        const id = parseInt(parametro, 10);

        const vistas = {
            inicio:     () => mostrar("inicio", "inicio", cargarInicio),
            documentos: () => mostrar("documentos", "documentos", cargarListado),
            buscar:     () => mostrar("documentos", "buscar", () => { cargarListado(); $("#f-q").trigger("focus"); }),
            nuevo:      () => mostrar("formulario", "nuevo", () => prepararFormulario(null)),
            editar:     () => id > 0 ? mostrar("formulario", "documentos", () => prepararFormulario(id)) : irA("documentos"),
            ver:        () => id > 0 ? mostrar("detalle", "documentos", () => cargarDetalle(id)) : irA("documentos")
        };

        (vistas[ruta] || vistas.inicio)();
    }

    function mostrar(vista, rutaMenu, alMostrar) {
        $(".vista").removeClass("activa");
        $("#vista-" + vista).addClass("activa");
        $("[data-ruta]").removeClass("active").removeAttr("aria-current");
        $(`[data-ruta="${rutaMenu}"]`).addClass("active").attr("aria-current", "page");
        bootstrap.Offcanvas.getInstance("#menu-lateral")?.hide();   // menú del celular
        window.scrollTo(0, 0);
        alMostrar();
    }

    function irA(hash) {
        if (location.hash === "#" + hash) enrutar();
        else location.hash = hash;
    }

    $(window).on("hashchange", enrutar);

    /* ========================================================
       Inicio
       ======================================================== */

    $("#fecha-hoy").text(new Date().toLocaleDateString("es-MX", {
        weekday: "long", day: "numeric", month: "long", year: "numeric"
    }));

    function cargarInicio() {
        obtener("listar.php", { limite: 5 }).done((r) => {
            let total = 0;
            ESTATUS.forEach((e) => {
                $(`[data-conteo="${e}"]`).text(r.conteo[e]);
                total += r.conteo[e];
            });
            $('[data-conteo="total"]').text(total);

            const $lista = $("#lista-recientes").empty();
            if (r.documentos.length === 0) {
                $lista.html('<p class="list-group-item text-body-secondary mb-0">Aún no hay documentos. Registra el primero con «Nuevo documento».</p>');
                return;
            }
            r.documentos.forEach((d) => {
                $lista.append(`
                    <a class="list-group-item list-group-item-action d-flex justify-content-between align-items-center gap-3"
                       href="#ver/${d.id_documento}">
                        <span class="text-truncate">
                            <span class="reciente-asunto d-block text-truncate">${esc(d.asunto)}</span>
                            <small class="text-body-secondary">${esc(d.no_oficio)} · ${fechaCorta(d.fecha)} · ${esc(d.remitente)}</small>
                        </span>
                        ${insignia(d.estatus)}
                    </a>`);
            });
        });
    }

    /* Campana de la barra superior: documentos que siguen sin atender. */
    function cargarPendientes() {
        $.getJSON(API + "listar.php", { estatus: "Recibido", limite: 5 }).done((r) => {
            $("#contador-pendientes").text(r.total).prop("hidden", r.total === 0);
            const $lista = $("#lista-pendientes").empty();
            if (r.total === 0) {
                $lista.html('<p class="dropdown-item-text small text-body-secondary mb-0">No hay documentos pendientes.</p>');
                return;
            }
            r.documentos.forEach((d) => {
                $lista.append(`
                    <a class="dropdown-item py-2" href="#ver/${d.id_documento}">
                        <span class="d-block small fw-semibold">${esc(d.no_oficio)} · ${esc(d.asunto)}</span>
                        <small class="text-body-secondary">${esc(d.remitente)} · ${fechaCorta(d.fecha)}</small>
                    </a>`);
            });
        });
    }

    /* Las tarjetas del panel (y la campana) abren el listado ya filtrado por estatus. */
    $(".tarjeta-resumen, .menu-pendientes [data-estatus]").on("click", function () {
        listado.filtros = { q: "", campo: "todos", estatus: $(this).data("estatus"), desde: "", hasta: "" };
        listado.pagina = 1;
    });

    /* ========================================================
       Listado, búsqueda y filtros
       ======================================================== */

    const $formFiltros = $("#form-filtros");

    function filtrosAlFormulario() {
        $.each(listado.filtros, (nombre, valor) => $formFiltros.find(`[name="${nombre}"]`).val(valor));
    }

    function filtrosDelFormulario() {
        $.each(listado.filtros, (nombre) => {
            listado.filtros[nombre] = $.trim($formFiltros.find(`[name="${nombre}"]`).val());
        });
    }

    function cargarListado() {
        filtrosAlFormulario();
        const parametros = $.extend({}, listado.filtros, { pagina: listado.pagina });

        obtener("listar.php", parametros).done((r) => {
            listado.pagina = r.pagina;
            pintarFilas(r.documentos);
            pintarPaginacion(r);
        });
    }

    /* Cada documento se pinta dos veces: como renglón de la tabla
       (escritorio) y como tarjeta (celular). Bootstrap muestra uno u
       otro según el ancho con d-none / d-lg-block. */
    function pintarFilas(documentos) {
        const $cuerpo = $("#cuerpo-tabla").empty();
        const $tarjetas = $("#lista-tarjetas").empty();

        if (documentos.length === 0) {
            const vacio = "No se encontraron documentos con esos criterios.";
            $cuerpo.html(`<tr><td colspan="7" class="text-center text-body-secondary py-5">${vacio}</td></tr>`);
            $tarjetas.html(`<p class="list-group-item text-center text-body-secondary py-4 mb-0">${vacio}</p>`);
            return;
        }

        documentos.forEach((d) => {
            const opciones = ESTATUS.map((e) =>
                `<option${e === d.estatus ? " selected" : ""}>${e}</option>`).join("");
            const selectEstatus = `
                <select class="form-select select-estatus-tabla ${claseEstatus(d.estatus)}"
                        aria-label="Estatus de ${esc(d.no_oficio)}"
                        data-anterior="${esc(d.estatus)}">${opciones}</select>`;
            const pdf = d.tiene_pdf ? "" : " deshabilitado";
            const acciones = `
                <a class="boton-icono" href="#ver/${d.id_documento}" title="Ver documento" aria-label="Ver">${icono("ver")}</a>
                <a class="boton-icono${pdf}" href="${API}pdf.php?id=${d.id_documento}&descargar=1" title="Descargar PDF" aria-label="Descargar">${icono("descargar")}</a>
                <a class="boton-icono" href="#editar/${d.id_documento}" title="Editar" aria-label="Editar">${icono("editar")}</a>
                <button type="button" class="boton-icono peligro btn-eliminar" title="Eliminar" aria-label="Eliminar">${icono("eliminar")}</button>`;
            const datos = `data-id="${d.id_documento}" data-oficio="${esc(d.no_oficio)}"`;

            $cuerpo.append(`
                <tr ${datos}>
                    <td class="td-oficio fw-semibold">${esc(d.no_oficio)}</td>
                    <td class="td-fecha">${fechaCorta(d.fecha)}</td>
                    <td>${esc(d.asunto)}</td>
                    <td>${esc(d.remitente)}</td>
                    <td>${esc(d.destinatario)}</td>
                    <td>${selectEstatus}</td>
                    <td class="td-acciones">${acciones}</td>
                </tr>`);

            $tarjetas.append(`
                <div class="list-group-item tarjeta-documento py-3" ${datos}>
                    <div class="d-flex justify-content-between align-items-start gap-2 mb-1">
                        <strong class="text-primary-emphasis">${esc(d.no_oficio)}</strong>
                        ${selectEstatus}
                    </div>
                    <p class="fw-semibold mb-1">${esc(d.asunto)}</p>
                    <p class="meta mb-0"><b>De:</b> ${esc(d.remitente)}</p>
                    <p class="meta mb-0"><b>Para:</b> ${esc(d.destinatario)}</p>
                    <p class="meta mb-1">Recibido el ${fechaCorta(d.fecha)}</p>
                    <div class="d-flex gap-1">${acciones}</div>
                </div>`);
        });
    }

    function pintarPaginacion(r) {
        const inicio = r.total === 0 ? 0 : (r.pagina - 1) * r.limite + 1;
        const fin = Math.min(r.pagina * r.limite, r.total);
        $("#info-registros").text(`Mostrando ${inicio} a ${fin} de ${r.total} registro${r.total === 1 ? "" : "s"}`);

        const $pag = $("#paginacion").empty();

        /* Un <li class="page-item"> de la paginación de Bootstrap. */
        const boton = (texto, pagina, etiqueta, actual) => {
            const inactivo = pagina < 1 || pagina > r.paginas;
            return $("<li>", { class: "page-item" + (actual ? " active" : "") + (inactivo ? " disabled" : "") })
                .append($("<button>", { type: "button", class: "page-link", text: texto, "data-pagina": pagina, "aria-label": etiqueta })
                    .attr("aria-current", actual ? "page" : null));
        };

        $pag.append(boton("«", 1, "Primera página"), boton("‹", r.pagina - 1, "Página anterior"));
        for (let p = 1; p <= r.paginas; p++) {
            /* Con muchas páginas solo se muestran la primera, la última y las cercanas. */
            if (p === 1 || p === r.paginas || Math.abs(p - r.pagina) <= 1) {
                $pag.append(boton(String(p), p, "Página " + p, p === r.pagina));
            } else if (Math.abs(p - r.pagina) === 2) {
                $pag.append('<li class="page-item disabled"><span class="page-link">…</span></li>');
            }
        }
        $pag.append(boton("›", r.pagina + 1, "Página siguiente"), boton("»", r.paginas, "Última página"));
    }

    $("#paginacion").on("click", "button[data-pagina]", function () {
        const pagina = Number($(this).data("pagina"));
        if (pagina === listado.pagina) return;
        listado.pagina = pagina;
        cargarListado();
        $("#vista-documentos")[0].scrollIntoView({ behavior: "smooth", block: "start" });
    });

    $formFiltros.on("submit", function (e) {
        e.preventDefault();
        filtrosDelFormulario();
        if (listado.filtros.desde && listado.filtros.hasta && listado.filtros.desde > listado.filtros.hasta) {
            avisar("La fecha «Desde» es posterior a la fecha «Hasta».", "error");
            return;
        }
        listado.pagina = 1;
        cargarListado();
    });

    /* Búsqueda mientras se escribe, con una pausa para no mandar una
       petición por cada tecla. Los selects filtran al cambiar. */
    let pausaBusqueda;
    $("#f-q").on("input", function () {
        clearTimeout(pausaBusqueda);
        pausaBusqueda = setTimeout(() => $formFiltros.trigger("submit"), 350);
    });
    $("#f-campo, #f-estatus").on("change", () => $formFiltros.trigger("submit"));

    $("#btn-limpiar").on("click", function () {
        listado.filtros = { q: "", campo: "todos", estatus: "", desde: "", hasta: "" };
        listado.pagina = 1;
        cargarListado();
    });

    /* Cambio de estatus directo desde la tabla o la tarjeta. */
    const $listado = $("#cuerpo-tabla, #lista-tarjetas");

    $listado.on("change", ".select-estatus-tabla", function () {
        const $select = $(this);
        const id = $select.closest("[data-id]").data("id");
        const anterior = $select.data("anterior");
        const nuevo = $select.val();

        $select.prop("disabled", true);
        enviar("estatus.php", { id, estatus: nuevo })
            .done((r) => {
                $select.removeClass(claseEstatus(anterior)).addClass(claseEstatus(nuevo)).data("anterior", nuevo);
                avisar(r.mensaje, "exito");
                cargarPendientes();
            })
            .fail(() => $select.val(anterior))
            .always(() => $select.prop("disabled", false));
    });

    $listado.on("click", ".btn-eliminar", function () {
        const $fila = $(this).closest("[data-id]");
        eliminarDocumento($fila.data("id"), String($fila.data("oficio")), cargarListado);
    });

    function eliminarDocumento(id, oficio, despues) {
        confirmar("¿Eliminar documento?",
            `Se borrará el oficio ${oficio}, su PDF y su historial. Esta acción no se puede deshacer.`)
            .then((si) => {
                if (!si) return;
                enviar("eliminar.php", { id }).done((r) => {
                    avisar(r.mensaje, "exito");
                    cargarPendientes();
                    despues();
                });
            });
    }

    /* ========================================================
       Formulario de registro / edición
       ======================================================== */

    const $form = $("#form-documento");

    function prepararFormulario(id) {
        $form[0].reset();
        limpiarErrores();
        limpiarCaptura();
        $("#progreso").prop("hidden", true);
        $("#d-id").val(id || "");
        $("#d-fecha").attr("max", hoyIso());
        pintarPuntoEstatus();
        cargarSugerencias();

        if (!id) {
            $("#titulo-formulario").text("Registrar documento");
            $("#d-fecha").val(hoyIso());
            $("#aviso-reemplazo").prop("hidden", true);
            $("#archivo-req").prop("hidden", false);
            $("#d-no_oficio").trigger("focus");
            return;
        }

        $("#titulo-formulario").text("Editar documento");
        $("#archivo-req").prop("hidden", true);
        obtener("obtener.php", { id }).done((r) => {
            const d = r.documento;
            ["no_oficio", "fecha", "asunto", "remitente", "destinatario", "estatus"].forEach((campo) => {
                $("#d-" + campo).val(d[campo]);
            });
            pintarPuntoEstatus();
            $("#aviso-reemplazo").prop("hidden", !d.tiene_pdf);
            $("#enlace-pdf-actual").attr("href", `${API}pdf.php?id=${d.id_documento}`);
        }).fail(() => irA("documentos"));
    }

    function cargarSugerencias() {
        $.getJSON(API + "sugerencias.php").done((r) => {
            const opciones = (lista) => lista.map((v) => `<option value="${esc(v)}">`).join("");
            $("#lista-remitentes").html(opciones(r.remitentes));
            $("#lista-destinatarios").html(opciones(r.destinatarios));
        });
    }

    /* Punto de color junto al estatus, como en la insignia. */
    function pintarPuntoEstatus() {
        const $select = $("#d-estatus");
        $select.closest(".select-con-punto").attr("class", "select-con-punto " + claseEstatus($select.val()));
    }

    $("#d-estatus").on("change", pintarPuntoEstatus);

    /* Los errores usan las clases de validación de Bootstrap:
       is-invalid en el campo e invalid-feedback con el mensaje. */
    function limpiarErrores() {
        $form.find(".is-invalid").removeClass("is-invalid").removeAttr("aria-invalid");
        $form.find("[data-error]").text("");
    }

    function marcarErrores(errores) {
        $.each(errores, (campo, mensaje) => {
            $form.find(`[data-error="${campo}"]`).text(mensaje);
            $form.find(`[name="${campo}"]`).addClass("is-invalid").attr("aria-invalid", "true");
        });
        const $primero = $form.find(".is-invalid").first();
        if ($primero.length) $primero.trigger("focus");
        else $form.find('[data-error="archivo"]')[0].scrollIntoView({ block: "center" });
    }

    /* Validación en el navegador: solo para avisar rápido. El servidor
       vuelve a validar todo, porque esto se puede saltar. */
    function validarEnNavegador() {
        const errores = {};
        const valor = (c) => $.trim($("#d-" + c).val());

        if (!valor("no_oficio")) errores.no_oficio = "Escribe el número de oficio.";
        else if (!/^[\p{L}\p{N}\/\-. ]+$/u.test(valor("no_oficio")))
            errores.no_oficio = "Usa solo letras, números, espacios y los signos / - .";
        if (!valor("fecha")) errores.fecha = "Elige la fecha de recepción.";
        else if (valor("fecha") > hoyIso()) errores.fecha = "La fecha de recepción no puede ser futura.";
        if (!valor("asunto")) errores.asunto = "Escribe el asunto.";
        if (!valor("remitente")) errores.remitente = "Escribe quién envía el documento.";
        if (!valor("destinatario")) errores.destinatario = "Escribe a quién va dirigido.";

        const esNuevo = !$("#d-id").val();
        if (esNuevo && captura.fotos.length === 0 && !captura.pdf) {
            errores.archivo = "Toma una foto o selecciona el PDF del documento.";
        } else if (tamanoCaptura() > TAMANO_MAXIMO) {
            errores.archivo = `El documento pesa ${tamanoLegible(tamanoCaptura())}; el máximo es 4 MB. Quita alguna página.`;
        }
        return errores;
    }

    $form.on("submit", function (e) {
        e.preventDefault();
        limpiarErrores();

        const errores = validarEnNavegador();
        if (!$.isEmptyObject(errores)) {
            marcarErrores(errores);
            return;
        }

        const datos = new FormData(this);
        if (captura.pdf) {
            datos.append("pdf", captura.pdf, captura.pdf.name);
        } else {
            captura.fotos.forEach((f, i) => datos.append("paginas[]", f.blob, `pagina-${i + 1}.jpg`));
        }

        const $boton = $("#btn-guardar").prop("disabled", true);
        $boton.find("span").text("Guardando…");
        const $progreso = $("#progreso").prop("hidden", false);
        const $barra = $progreso.find(".progress-bar").css("width", "0");
        const $texto = $progreso.find(".progreso-texto").text("Subiendo…");

        $.ajax({
            url: API + "guardar.php",
            method: "POST",
            data: datos,
            processData: false,   // FormData se manda tal cual (multipart)
            contentType: false,
            dataType: "json",
            xhr: function () {
                const xhr = $.ajaxSettings.xhr();
                xhr.upload.addEventListener("progress", (ev) => {
                    if (!ev.lengthComputable) return;
                    const pct = Math.round((ev.loaded / ev.total) * 100);
                    $barra.css("width", pct + "%").parent().attr("aria-valuenow", pct);
                    $texto.text(pct < 100 ? `Subiendo… ${pct}%` : "Procesando en el servidor…");
                });
                return xhr;
            }
        })
            .done((r) => {
                avisar(r.mensaje, "exito");
                limpiarCaptura();
                cargarPendientes();
                irA("ver/" + r.id);
            })
            .fail((xhr) => {
                $progreso.prop("hidden", true);
                const r = xhr.responseJSON;
                if (r && r.errores && !$.isEmptyObject(r.errores)) marcarErrores(r.errores);
                avisar(mensajeDeError(xhr), "error");
            })
            .always(() => $boton.prop("disabled", false).find("span").text("Guardar documento"));
    });

    /* ========================================================
       Digitalización: cámara, fotos y PDF
       ======================================================== */

    function tamanoCaptura() {
        return captura.pdf ? captura.pdf.size : captura.fotos.reduce((suma, f) => suma + f.blob.size, 0);
    }

    function limpiarCaptura() {
        captura.fotos.forEach((f) => URL.revokeObjectURL(f.url));
        captura.fotos = [];
        captura.pdf = null;
        pintarCaptura();
    }

    function pintarCaptura() {
        const $previa = $("#vista-previa").empty();

        if (captura.pdf) {
            $previa.append(`
                <div class="archivo-pdf">
                    ${icono("pdf")}
                    <div><strong>${esc(captura.pdf.name)}</strong><small>PDF · ${tamanoLegible(captura.pdf.size)}</small></div>
                    <button type="button" class="quitar" data-quitar="pdf" aria-label="Quitar PDF">${icono("cerrar")}</button>
                </div>`);
            return;
        }

        captura.fotos.forEach((f, i) => {
            $previa.append(`
                <div class="miniatura">
                    <img src="${f.url}" alt="Página ${i + 1}">
                    <span class="miniatura-numero">Pág. ${i + 1}</span>
                    <button type="button" class="quitar" data-quitar="${i}" aria-label="Quitar página ${i + 1}">${icono("cerrar")}</button>
                </div>`);
        });
    }

    $("#vista-previa").on("click", "[data-quitar]", function () {
        const cual = $(this).data("quitar");
        if (cual === "pdf") {
            captura.pdf = null;
        } else {
            URL.revokeObjectURL(captura.fotos[cual].url);
            captura.fotos.splice(cual, 1);
        }
        pintarCaptura();
    });

    $("#in-camara, #in-archivo").on("change", function () {
        const archivos = Array.from(this.files);
        this.value = "";   // permite volver a elegir el mismo archivo
        if (archivos.length) agregarArchivos(archivos);
    });

    async function agregarArchivos(archivos) {
        $form.find('[data-error="archivo"]').text("");

        const pdfs = archivos.filter((a) => a.type === "application/pdf" || /\.pdf$/i.test(a.name));
        const imagenes = archivos.filter((a) => !pdfs.includes(a));

        if (pdfs.length) {
            if (pdfs.length > 1 || imagenes.length) {
                avisar("Selecciona un solo PDF, o bien una o varias imágenes.", "error");
                return;
            }
            if (pdfs[0].size > TAMANO_MAXIMO) {
                avisar("El PDF pesa más de 4 MB.", "error");
                return;
            }
            limpiarCaptura();       // un PDF reemplaza a las fotos
            captura.pdf = pdfs[0];
            pintarCaptura();
            return;
        }

        captura.pdf = null;         // una foto reemplaza al PDF
        for (const imagen of imagenes) {
            if (captura.fotos.length >= PAGINAS_MAXIMAS) {
                avisar(`Máximo ${PAGINAS_MAXIMAS} páginas por documento.`, "error");
                break;
            }
            try {
                const blob = await reducirImagen(imagen);
                captura.fotos.push({ blob, url: URL.createObjectURL(blob) });
                pintarCaptura();
            } catch (err) {
                avisar(`No se pudo leer «${imagen.name}». Usa una imagen JPG o PNG.`, "error");
            }
        }
    }

    /* Redimensiona la foto en un <canvas> y la vuelve JPEG. Una foto de
       celular de 4–8 MB queda en unos cientos de KB, así se sube rápido
       con datos móviles. El navegador ya la endereza según su EXIF al
       dibujarla. */
    function reducirImagen(archivo) {
        return new Promise((resolver, rechazar) => {
            const url = URL.createObjectURL(archivo);
            const img = new Image();

            img.onload = () => {
                URL.revokeObjectURL(url);
                const escala = Math.min(1, LADO_MAXIMO_FOTO / Math.max(img.naturalWidth, img.naturalHeight));
                const canvas = document.createElement("canvas");
                canvas.width = Math.round(img.naturalWidth * escala);
                canvas.height = Math.round(img.naturalHeight * escala);

                const ctx = canvas.getContext("2d");
                ctx.fillStyle = "#fff";   // fondo blanco para PNG con transparencia
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

                canvas.toBlob((blob) => blob ? resolver(blob) : rechazar(new Error("canvas")), "image/jpeg", 0.85);
            };
            img.onerror = () => {
                URL.revokeObjectURL(url);
                rechazar(new Error("imagen"));
            };
            img.src = url;
        });
    }

    /* ========================================================
       Detalle, seguimiento y visor
       ======================================================== */

    let detalleActual = null;

    function cargarDetalle(id) {
        $("#det-visor").attr("src", "about:blank");

        obtener("obtener.php", { id }).done((r) => {
            const d = (detalleActual = r.documento);

            $("#titulo-detalle").text(d.no_oficio);
            $("#det-editar").attr("href", "#editar/" + d.id_documento);

            /* Rejilla de Bootstrap dentro de la <dl>: dos columnas en
               tableta, una en el panel angosto del escritorio. */
            const dato = (etiqueta, valor, completo) => `
                <div class="${completo ? "col-12" : "col-12 col-sm-6 col-lg-12"} mb-2">
                    <dt>${etiqueta}</dt><dd class="mb-0">${valor}</dd>
                </div>`;
            $("#det-datos").html(
                dato("Asunto", esc(d.asunto), true) +
                dato("Fecha de recepción", fechaCorta(d.fecha)) +
                dato("Estatus actual", insignia(d.estatus)) +
                dato("Remitente", esc(d.remitente)) +
                dato("Destinatario", esc(d.destinatario)) +
                dato("Registrado", fechaHora(d.creado_en)) +
                dato("Última modificación", fechaHora(d.actualizado_en)));

            pintarSelectorEstatus(d.estatus);
            pintarHistorial(r.bitacora);

            const urlPdf = `${API}pdf.php?id=${d.id_documento}`;
            $(".visor").toggle(d.tiene_pdf);
            if (d.tiene_pdf) {
                $("#det-visor").attr("src", urlPdf);
                $("#det-abrir").attr("href", urlPdf);
                $("#det-descargar").attr("href", urlPdf + "&descargar=1");
            }
        }).fail(() => irA("documentos"));
    }

    function pintarSelectorEstatus(actual) {
        $("#det-estatus button").each(function () {
            const e = $(this).data("estatus");
            $(this).attr("aria-checked", e === actual ? "true" : "false")
                .removeClass(ESTATUS.map(claseEstatus).join(" "))
                .addClass(claseEstatus(e));
        });
    }

    function pintarHistorial(bitacora) {
        const $h = $("#det-historial").empty();
        bitacora.slice().reverse().forEach((b) => {
            const texto = b.estatus_anterior
                ? `Cambió de <strong>${esc(b.estatus_anterior)}</strong> a <strong>${esc(b.estatus_nuevo)}</strong>`
                : `Registrado como <strong>${esc(b.estatus_nuevo)}</strong>`;
            $h.append(`<li class="${claseEstatus(b.estatus_nuevo)}">${texto}<time>${fechaHora(b.fecha_cambio)}</time></li>`);
        });
    }

    $("#det-estatus").on("click", "button", function () {
        const nuevo = $(this).data("estatus");
        if (!detalleActual || nuevo === detalleActual.estatus) return;

        const $botones = $("#det-estatus button").prop("disabled", true);
        enviar("estatus.php", { id: detalleActual.id_documento, estatus: nuevo })
            .done((r) => {
                avisar(r.mensaje, "exito");
                cargarPendientes();
                cargarDetalle(detalleActual.id_documento);
            })
            .always(() => $botones.prop("disabled", false));
    });

    $("#det-eliminar").on("click", function () {
        if (!detalleActual) return;
        eliminarDocumento(detalleActual.id_documento, detalleActual.no_oficio, () => irA("documentos"));
    });

    /* ========================================================
       Arranque
       ======================================================== */
    enrutar();
    cargarPendientes();
});
