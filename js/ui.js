import { validarFormulario } from "./validators.js";
import {
    obtenerPedidos,
    guardarPedido,
    actualizarPedido,
    eliminarPedido,
    obtenerNotas,
    guardarNotas
} from "./storage.js";

let idEditando = null;

const formulario = document.getElementById("formPedido");
const inputPedido = document.getElementById("pedido"), inputPorciones = document.getElementById("porciones");
const inputFechaEntrega = document.getElementById("fechaEntrega"), inputSena = document.getElementById("sena");
const listaPedidos = document.getElementById("listaPedidos");

const modalEditar = document.getElementById("modalEditar"), formEditar = document.getElementById("formEditar");
const editInputPedido = document.getElementById("editPedido"), editInputPorciones = document.getElementById("editPorciones");
const editInputFechaEntrega = document.getElementById("editFechaEntrega"), editInputSena = document.getElementById("editSena");
const botonCancelarEdicion = document.getElementById("botonCancelarEdicion");
// Referencias al modal de confirmar eliminar
const modalConfirmarEliminar = document.getElementById("modalConfirmarEliminar");
const textoConfirmarEliminar = document.getElementById("textoConfirmarEliminar");
const botonConfirmarEliminar = document.getElementById("botonConfirmarEliminar");
const botonCancelarEliminar = document.getElementById("botonCancelarEliminar");

let pedidoAEliminar = null;

const cantidadPedidosSpan = document.getElementById("cantidadPedidos");
const contadorConSena = document.getElementById("contadorConSena"), contadorSinSena = document.getElementById("contadorSinSena");
// Referencias al calendario y al bloc de notas
const calendarioTitulo = document.getElementById("calendarioTitulo"), calendarioGrid = document.getElementById("calendarioGrid");
const notasTextarea = document.getElementById("notasTextarea");
const NOMBRES_MESES = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];
/**
 * 
 * 
 */
export function inicializarEventos() {
    formulario.addEventListener("submit", guardarFormulario);
    formEditar.addEventListener("submit", guardarEdicion);
    botonCancelarEdicion.addEventListener("click", cerrarModalEditar);
    notasTextarea.addEventListener("input", guardarNotasEscritas);
    botonConfirmarEliminar.addEventListener("click", confirmarEliminacion);
    botonCancelarEliminar.addEventListener("click", cerrarModalConfirmarEliminar);
}

function guardarNotasEscritas() {
    guardarNotas(notasTextarea.value);
}
/**
 * 
 */
export function cargarNotas() {
    notasTextarea.value = obtenerNotas();
}

function leerDatosDelFormulario() {
    return {
        pedido: inputPedido.value.trim(),
        porciones: Number(inputPorciones.value),
        fechaEntrega: inputFechaEntrega.value,
        senaAbonada: inputSena.value === "true"
    };
}
/**
 * 
 */
function guardarFormulario(evento) {
    evento.preventDefault();
    const pedidoNuevo = leerDatosDelFormulario();
    const resultado = validarFormulario(pedidoNuevo);
    if (resultado.valido === false) {
        alert(resultado.errores.join("\n"));
        return;
    }
    guardarPedido(pedidoNuevo);
    formulario.reset();
    renderizarPedidos();
}
//
function leerDatosDelFormularioDeEdicion() {
    return {
        id: idEditando,
        pedido: editInputPedido.value.trim(),
        porciones: Number(editInputPorciones.value),
        fechaEntrega: editInputFechaEntrega.value,
        senaAbonada: editInputSena.value === "true"
    };
}

function guardarEdicion(evento) {
    evento.preventDefault();
    const pedidoEditado = leerDatosDelFormularioDeEdicion();
    const resultado = validarFormulario(pedidoEditado);
    if (resultado.valido === false) {
        alert(resultado.errores.join("\n"));
        return;
    }
    actualizarPedido(pedidoEditado);
    cerrarModalEditar();
    renderizarPedidos();
}

function editarPedido(pedido) {
    idEditando = pedido.id;
    editInputPedido.value = pedido.pedido;
    editInputPorciones.value = pedido.porciones;
    editInputFechaEntrega.value = pedido.fechaEntrega || "";
    editInputSena.value = pedido.senaAbonada.toString();
    modalEditar.classList.remove("oculto");
}

function cerrarModalEditar() {
    formEditar.reset();
    idEditando = null;
    modalEditar.classList.add("oculto");
}
//
/**
 * 
 */
function calcularDiasParaEntrega(fechaEntrega) {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const fechaDeEntrega = new Date(fechaEntrega + "T00:00:00");
    return Math.round((fechaDeEntrega.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));
}
/**
 * 
 */
function compararPorFechaDeEntrega(pedidoA, pedidoB) {
    const diasA = calcularDiasParaEntrega(pedidoA.fechaEntrega);
    const diasB = calcularDiasParaEntrega(pedidoB.fechaEntrega);
    return diasA - diasB;
}

/**
 * 
 */
export function renderizarPedidos() {
    listaPedidos.innerHTML = "";
    const pedidos = obtenerPedidos();
    pedidos.sort(compararPorFechaDeEntrega);
    for (let i = 0; i < pedidos.length; i++) {
        crearTarjeta(pedidos[i]);
    }
    actualizarContadores(pedidos);
    renderizarCalendario(pedidos);
}

function crearBloqueEntrega(pedido) {
    const bloque = document.createElement("div");
    bloque.classList.add("bloqueEntrega");
    if (!pedido.fechaEntrega) {
        bloque.innerHTML = `<p class="entregaTexto">Entrega</p><div class="entregaCirculo">-</div>`;
        return bloque;
    }
    const dias = calcularDiasParaEntrega(pedido.fechaEntrega);
    const textoCirculo = dias <= 0 ? "hoy" : dias;
    const textoDias = dias <= 0 ? "" : "días";
    bloque.innerHTML = `
        <p class="entregaTexto">Entrega</p>
        <div class="entregaCirculo">${textoCirculo}</div>
        <p class="entregaDias">${textoDias}</p>
    `;
    return bloque;
}

function crearContenidoDePedido(pedido) {
    const contenido = document.createElement("div");
    contenido.classList.add("contenidoPedido");
    const textoBadge = pedido.senaAbonada ? "✔ Seña pagada" : "🟠 Seña pendiente";
    const claseBadge = pedido.senaAbonada ? "pagada" : "pendiente";
    contenido.innerHTML = `
        <h3>${pedido.pedido}</h3>
        <p>📦 ${pedido.porciones} porciones</p>
        <span class="badge ${claseBadge}">${textoBadge}</span>
    `;
    return contenido;
}

function pedirConfirmacionYEliminar(pedido) {
    pedidoAEliminar = pedido;
    textoConfirmarEliminar.textContent = '¿Seguro que querés eliminar el pedido de "' + pedido.pedido + '"?';
    modalConfirmarEliminar.classList.remove("oculto");
}

function confirmarEliminacion() {
    eliminarPedido(pedidoAEliminar.id);
    cerrarModalConfirmarEliminar();
    renderizarPedidos();
}

function cerrarModalConfirmarEliminar() {
    pedidoAEliminar = null;
    modalConfirmarEliminar.classList.add("oculto");
}

function crearBotonesDePedido(pedido) {
    const botones = document.createElement("div");
    botones.classList.add("botones");
    botones.innerHTML = `<button class="editar">Editar</button><button class="eliminar">Eliminar</button>`;
    botones.querySelector(".editar").addEventListener("click", function () {
        editarPedido(pedido);
    });
    botones.querySelector(".eliminar").addEventListener("click", function () {
        pedirConfirmacionYEliminar(pedido);
    });
    return botones;
}

function crearTarjeta(pedido) {
    const tarjeta = document.createElement("div");
    tarjeta.classList.add("tarjeta");
    
    if (pedido.senaAbonada === false) {
        tarjeta.classList.add("tarjeta-pendiente");
    }
    tarjeta.appendChild(crearBloqueEntrega(pedido));
    tarjeta.appendChild(crearContenidoDePedido(pedido));
    tarjeta.appendChild(crearBotonesDePedido(pedido));
    listaPedidos.appendChild(tarjeta);
}
// 
function actualizarContadores(pedidos) {
    cantidadPedidosSpan.textContent = pedidos.length;
    let conSena = 0;
    let sinSena = 0;
    for (let i = 0; i < pedidos.length; i++) {
        if (pedidos[i].senaAbonada === true) conSena++; else sinSena++;
    }
    contadorConSena.textContent = "Pedidos con seña: " + conSena;
    contadorSinSena.textContent = "Pedidos sin seña: " + sinSena;
}

function buscarPedidosDeEseDia(pedidos, numeroDia, mes, anio) {
    const encontrados = [];
    for (let i = 0; i < pedidos.length; i++) {
        const pedido = pedidos[i];
        if (!pedido.fechaEntrega) {
            continue;
        }
        const fecha = new Date(pedido.fechaEntrega + "T00:00:00");
        const esElMismoDia = fecha.getDate() === numeroDia &&
            fecha.getMonth() === mes && fecha.getFullYear() === anio;
        if (esElMismoDia) {
            encontrados.push(pedido);
        }
    }
    return encontrados;
}

function hayAlgunoConSenaPendiente(pedidos) {
    for (let i = 0; i < pedidos.length; i++) {
        if (pedidos[i].senaAbonada === false) {
            return true;
        }
    }
    return false;
}
/**
 * 
 */
function renderizarCalendario(pedidos) {
    calendarioGrid.innerHTML = "";
    const hoy = new Date();
    const anioActual = hoy.getFullYear();
    const mesActual = hoy.getMonth();
    calendarioTitulo.textContent = NOMBRES_MESES[mesActual] + " " + anioActual;
    const primerDiaDelMes = new Date(anioActual, mesActual, 1);
    const cantidadDeDias = new Date(anioActual, mesActual + 1, 0).getDate();
   
    const diaDeInicio = (primerDiaDelMes.getDay() + 6) % 7;

    for (let i = 0; i < diaDeInicio; i++) {
        const vacio = document.createElement("div");
        vacio.classList.add("diaCalendario", "diaVacio");
        calendarioGrid.appendChild(vacio);
    }

    for (let numeroDia = 1; numeroDia <= cantidadDeDias; numeroDia++) {
        const celda = document.createElement("div");
        celda.classList.add("diaCalendario");
        if (numeroDia === hoy.getDate()) {
            celda.classList.add("diaHoy");
        }
        const pedidosDeEseDia = buscarPedidosDeEseDia(pedidos, numeroDia, mesActual, anioActual);
        let puntoHtml = "";
        if (pedidosDeEseDia.length > 0) {
            const colorPunto = hayAlgunoConSenaPendiente(pedidosDeEseDia) ? "puntoNaranja" : "puntoVerde";
            puntoHtml = `<span class="puntoDia ${colorPunto}"></span>`;
        }
        celda.innerHTML = numeroDia + puntoHtml;
        calendarioGrid.appendChild(celda);
    }
}

export function limpiarFormulario() {
    formulario.reset();
}