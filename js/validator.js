export function validarPedido(pedido) {

    const patron = /^.{5,120}$/;
    const texto = pedido.trim();

    return patron.test(texto);
}

export function validarPorciones(porciones) {

    if (!Number.isInteger(porciones)) {
        return false;
    }

    if (porciones < 1) {
        return false;
    }

    return true;
}

export function validarSena(senaAbonada) {
    return typeof senaAbonada === "boolean";
}

export function validarFechaEntrega(fechaEntrega) {

    if (typeof fechaEntrega !== "string") {
        return false;
    }

    if (fechaEntrega.trim() === "") {
        return false;
    }

    return true;
}

export function validarFormulario(datos) {

    const errores = [];

    if (!validarPedido(datos.pedido)) {
        errores.push("La descripción debe tener entre 5 y 120 caracteres.");
    }

    if (!validarPorciones(datos.porciones)) {
        errores.push("La cantidad de porciones debe ser un número entero mayor o igual a 1.");
    }

    if (!validarFechaEntrega(datos.fechaEntrega)) {
        errores.push("Elegí una fecha de entrega.");
    }

    if (!validarSena(datos.senaAbonada)) {
        errores.push("El estado de la seña es inválido.");
    }

    const esValido = errores.length === 0;

    return {
        valido: esValido,
        errores: errores
    };
}