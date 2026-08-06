/**
 * Valida la descripción del pedido.
 * Debe tener entre 5 y 120 caracteres.
 */
export function validarPedido(pedido) {
    return /^.{5,120}$/.test(pedido.trim());
}

/**
 * Valida que la cantidad de porciones
 * sea un número entero mayor o igual a 1.
 */
export function validarPorciones(porciones) {
    return Number.isInteger(porciones) && porciones >= 1;
}

/**
 * Valida que el estado de la seña
 * sea un valor booleano.
 */
export function validarSena(senaAbonada) {
    return typeof senaAbonada === "boolean";
}

/**
 * Valida todos los campos del formulario.
 * Devuelve un objeto indicando si los datos
 * son válidos y una lista de errores.
 */
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