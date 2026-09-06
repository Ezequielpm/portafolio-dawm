$(document).ready(function () {

    /* ===== Calculadora ===== */
    $("#btn-ejecutar").click(function () {

        let numero1 = parseFloat($("#num1").val());
        let numero2 = parseFloat($("#num2").val());
        let operacion = $("#operacion").val();
        let resultado = 0;

        if (isNaN(numero1) || isNaN(numero2)) {
            alert("Por favor, ingresa ambos números antes de ejecutar.");
            return;
        }

        if (operacion === "suma") {
            resultado = numero1 + numero2;
        }
        else if (operacion === "resta") {
            resultado = numero1 - numero2;
        }
        else if (operacion === "multiplicacion") {
            resultado = numero1 * numero2;
        }
        else if (operacion === "division") {
            if (numero2 === 0) {
                alert("No se puede dividir entre cero.");
                return;
            }
            resultado = numero1 / numero2;
        }

        $("#resultado").val(resultado);
    });


    /* ===== Consulta a la API ===== */
    $("#btn-consultar").click(function () {

        let idp = parseFloat($("#idpersona").val());

        if (isNaN(idp)) {
            alert("Escribe el id de la persona");
            return;
        }

        $.get(`https://jsonplaceholder.typicode.com/users/${idp}`, function (data) {
            console.log(data);
            $("#nom").val(data.name);
            $("#email").val(data.email);
        }).fail(function () {
            alert("No se encontró a la persona con el id " + idp);
            $("#nom").val("");
            $("#email").val("");
        });
    });

});
