const CLAVE_STORAGE = "pedidos";


const CLAVE_NOTAS = "recordatorios";



export function obtenerPedidos() {

    const textoGuardado = localStorage.getItem(CLAVE_STORAGE);


    if (textoGuardado === null) {
        return [];
    }


    const pedidos = JSON.parse(textoGuardado);

    return pedidos;
}



function guardarTodos(pedidos) {


    const texto = JSON.stringify(pedidos);

    localStorage.setItem(CLAVE_STORAGE, texto);
}


export function generarId() {
    return Date.now();
}


export function guardarPedido(pedidoNuevo) {

    const pedidos = obtenerPedidos();

    pedidoNuevo.id = generarId();

    pedidos.push(pedidoNuevo);

    guardarTodos(pedidos);
}


export function actualizarPedido(pedidoActualizado) {

    const pedidos = obtenerPedidos();
    const pedidosNuevos = [];

    for (let i = 0; i < pedidos.length; i++) {

        if (pedidos[i].id === pedidoActualizado.id) {
            // Es el pedido que estábamos buscando: ponemos la versión nueva
            pedidosNuevos.push(pedidoActualizado);
        } else {
            // No es este: lo dejamos como estaba
            pedidosNuevos.push(pedidos[i]);
        }
    }

    guardarTodos(pedidosNuevos);
}


export function eliminarPedido(id) {

    const pedidos = obtenerPedidos();
    const pedidosNuevos = [];

    for (let i = 0; i < pedidos.length; i++) {

        // Guardamos en la lista nueva a todos MENOS al que hay que borrar
        if (pedidos[i].id !== id) {
            pedidosNuevos.push(pedidos[i]);
        }
    }

    guardarTodos(pedidosNuevos);
}


export function obtenerNotas() {

    const notas = localStorage.getItem(CLAVE_NOTAS);

    if (notas === null) {
        return "";
    }

    return notas;
}


export function guardarNotas(texto) {
    localStorage.setItem(CLAVE_NOTAS, texto);
}