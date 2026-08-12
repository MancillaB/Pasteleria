// Clave donde se guardarán los pedidos
const CLAVE_STORAGE = "pedidos";

// Clave donde se guardan las notas del bloc de recordatorios
const CLAVE_NOTAS = "recordatorios";

/**
 * Obtiene todos los pedidos guardados.
 * @returns {Array}
 */
export function obtenerPedidos() {
    const pedidos = localStorage.getItem(CLAVE_STORAGE);

    return pedidos ? JSON.parse(pedidos) : [];
}

/**
 * Guarda todos los pedidos en localStorage.
 * @param {Array} pedidos
 */
function guardarTodos(pedidos) {
    localStorage.setItem(CLAVE_STORAGE, JSON.stringify(pedidos));
}

/**
 * Genera un ID único para cada pedido.
 * @returns {number}
 */
export function generarId() {
    return Date.now();
}

/**
 * Guarda un nuevo pedido.
 * @param {Object} pedido
 */

export function guardarPedido(pedido) {

    const pedidos = obtenerPedidos();

    pedido.id = generarId();

    pedidos.push(pedido);

    guardarTodos(pedidos);
}

/**
 * Actualiza un pedido existente.
 * @param {Object} pedidoActualizado
 */
export function actualizarPedido(pedidoActualizado) {

    const pedidos = obtenerPedidos();

    const pedidosActualizados = pedidos.map(pedido =>

        pedido.id === pedidoActualizado.id
            ? pedidoActualizado
            : pedido
    );

    guardarTodos(pedidosActualizados);
}

/**
 * Elimina un pedido por ID.
 * @param {number} id
 */
export function eliminarPedido(id) {

    const pedidos = obtenerPedidos();

    const nuevosPedidos = pedidos.filter(pedido => pedido.id !== id);

    guardarTodos(nuevosPedidos);
}

/**
 * Obtiene el texto guardado en el bloc de recordatorios.
 * @returns {string}
 */
export function obtenerNotas() {

    const notas = localStorage.getItem(CLAVE_NOTAS);

    return notas ? notas : "";
}

/**
 * Guarda el texto del bloc de recordatorios.
 * @param {string} texto
 */
export function guardarNotas(texto) {

    localStorage.setItem(CLAVE_NOTAS, texto);
}