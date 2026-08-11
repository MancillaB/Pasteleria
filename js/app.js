
import {
    obtenerPedidos,
    guardarPedido
} from "./storage.js";

import {
    validarPedido
} from "./validators.js";

import {
    iniciarUI,
    obtenerDatosFormulario,
    mostrarPedidos,
    mostrarError
} from "./ui.js";


// Inicializar la aplicación
iniciarUI({
    onGuardar: guardarNuevoPedido,
    onCargar: cargarPedidos
});


// Cargar los pedidos guardados
function cargarPedidos() {
    const pedidos = obtenerPedidos();
    mostrarPedidos(pedidos);
}


// Guardar un nuevo pedido
function guardarNuevoPedido() {
    const datos = obtenerDatosFormulario();

    const resultado = validarPedido(datos);

    if (!resultado.valido) {
        mostrarError(resultado.mensaje);
        return;
    }

    guardarPedido(datos);
    cargarPedidos();
}