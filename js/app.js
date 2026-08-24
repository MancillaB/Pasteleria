import {
    inicializarEventos, alCargarLaPagina,
    mostrarErrores, limpiarFormularioNuevo,
    mostrarModalEditar, ocultarModalEditar,
    mostrarModalConfirmarEliminar, ocultarModalConfirmarEliminar,
    mostrarNotas,
    renderizarListaPedidos, actualizarContadores, renderizarCalendario
} from "./ui.js";

import { validarFormulario } from "./validators.js";

import {
    obtenerPedidos, guardarPedido, actualizarPedido, eliminarPedido,
    obtenerNotas, guardarNotas
} from "./storage.js";

let idEditando = null;
let pedidoAEliminar = null;

function actualizarPantalla() {
    const pedidos = obtenerPedidos();
    renderizarListaPedidos(pedidos, { onEditarClick: abrirEdicion, onEliminarClick: abrirEliminacion });
    actualizarContadores(pedidos);
    renderizarCalendario(pedidos);
}

function onGuardarNuevo(datos) {
    const resultado = validarFormulario(datos);
    if (resultado.valido === false) {
        mostrarErrores(resultado.errores);
        return;
    }
    guardarPedido(datos);
    limpiarFormularioNuevo();
    actualizarPantalla();
}

function abrirEdicion(pedido) {
    idEditando = pedido.id;
    mostrarModalEditar(pedido);
}

function onGuardarEdicion(datos) {
    datos.id = idEditando;
    const resultado = validarFormulario(datos);
    if (resultado.valido === false) {
        mostrarErrores(resultado.errores);
        return;
    }
    actualizarPedido(datos);
    idEditando = null;
    ocultarModalEditar();
    actualizarPantalla();
}

function onCancelarEdicion() {
    idEditando = null;
    ocultarModalEditar();
}

function abrirEliminacion(pedido) {
    pedidoAEliminar = pedido;
    mostrarModalConfirmarEliminar(pedido);
}

function onConfirmarEliminar() {
    eliminarPedido(pedidoAEliminar.id);
    pedidoAEliminar = null;
    ocultarModalConfirmarEliminar();
    actualizarPantalla();
}

function onCancelarEliminar() {
    pedidoAEliminar = null;
    ocultarModalConfirmarEliminar();
}

function onEscribirNotas(texto) {
    guardarNotas(texto);
}

function iniciarAplicacion() {
    inicializarEventos({
        onGuardarNuevo,
        onGuardarEdicion,
        onCancelarEdicion,
        onConfirmarEliminar,
        onCancelarEliminar,
        onEscribirNotas
    });
    actualizarPantalla();
    mostrarNotas(obtenerNotas());
}

alCargarLaPagina(iniciarAplicacion);