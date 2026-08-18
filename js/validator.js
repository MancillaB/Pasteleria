
export function validarPedido(pedido) {
    return /^.{5,120}$/.test(pedido.trim());
}


export function validarPorciones(porciones) {
    return Number.isInteger(porciones) && porciones >= 1;
}


export function validarSena(senaAbonada) {
    return typeof senaAbonada === "boolean";
}


export function validarFechaEntrega(fechaEntrega) {
    return typeof fechaEntrega === "string" && fechaEntrega.trim() !== "";
}


export function validarFormulario(datos) {

    const errores = [];

    if (!validarPedido(datos.pedido)) {
        errores.push(
            "La descripción debe tener entre 5 y 120 caracteres."
        );
    }

    if (!validarPorciones(datos.porciones)) {
        errores.push(
            "La cantidad de porciones debe ser un número entero mayor o igual a 1."
        );
    }

    if (!validarFechaEntrega(datos.fechaEntrega)) {
        errores.push(
            "Elegí una fecha de entrega."
        );
    }

    if (!validarSena(datos.senaAbonada)) {
        errores.push(
            "El estado de la seña es inválido."
        );
    }

    return {
        valido: errores.length === 0,
        errores: errores
    };
}
