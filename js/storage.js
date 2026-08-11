const STORAGE_KEY = "pedidos_reposteria";

// Obtener todos los pedidos
export function obtenerPedidos() {
    const datos = localStorage.getItem(STORAGE_KEY);

    if (!datos) {
        return [];
    }

    return JSON.parse(datos);
}

// Guardar un nuevo pedido
export function guardarPedido(pedido) {
    const pedidos = obtenerPedidos();

    const nuevoPedido = {
        id: crypto.randomUUID(),
        ...pedido
    };

    pedidos.push(nuevoPedido);

    localStorage.setItem(STORAGE_KEY, JSON.stringify(pedidos));

    return nuevoPedido;
}

// Actualizar un pedido
export function actualizarPedido(id, datosActualizados) {
    const pedidos = obtenerPedidos();

    const pedidosActualizados = pedidos.map(pedido => {
        if (pedido.id === id) {
            return {
                ...pedido,
                ...datosActualizados
            };
        }

        return pedido;
    });

    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(pedidosActualizados)
    );

    return pedidosActualizados;
}

// Eliminar un pedido
export function eliminarPedido(id) {
    const pedidos = obtenerPedidos();

    const pedidosFiltrados = pedidos.filter(
        pedido => pedido.id !== id
    );

    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(pedidosFiltrados)
    );

    return pedidosFiltrados;
}

// Buscar un pedido por ID
export function obtenerPedidoPorId(id) {
    const pedidos = obtenerPedidos();

    return pedidos.find(pedido => pedido.id === id);
}