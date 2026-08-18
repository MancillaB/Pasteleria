import { validarFormulario } from "./validators.js";
import {
    obtenerPedidos,
    guardarPedido,
    actualizarPedido,
    eliminarPedido,
    obtenerNotas,
    guardarNotas
} from "./storage.js";
// -----------------------------------------------------------------
// UI.JS
// Responsabilidad única: dibujar y leer el HTML (el DOM).
// No sabe CÓMO se guardan los datos (eso lo hace storage.js)
// ni CÓMO se validan (eso lo hace validators.js). Acá solo
// llamamos a sus funciones.
// -----------------------------------------------------------------
// ID del pedido que se está editando en el modal (null = ninguno)
let idEditando = null;
// Referencias al formulario "Nuevo Pedido"
const formulario = document.getElementById("formPedido");
const inputPedido = document.getElementById("pedido"), inputPorciones = document.getElementById("porciones");
const inputFechaEntrega = document.getElementById("fechaEntrega"), inputSena = document.getElementById("sena");
const listaPedidos = document.getElementById("listaPedidos");
// Referencias al modal de edición
const modalEditar = document.getElementById("modalEditar"), formEditar = document.getElementById("formEditar");
const editInputPedido = document.getElementById("editPedido"), editInputPorciones = document.getElementById("editPorciones");
const editInputFechaEntrega = document.getElementById("editFechaEntrega"), editInputSena = document.getElementById("editSena");
const botonCancelarEdicion = document.getElementById("botonCancelarEdicion");
// Referencias al modal de confirmar eliminar
const modalConfirmarEliminar = document.getElementById("modalConfirmarEliminar");
const textoConfirmarEliminar = document.getElementById("textoConfirmarEliminar");
const botonConfirmarEliminar = document.getElementById("botonConfirmarEliminar");
const botonCancelarEliminar = document.getElementById("botonCancelarEliminar");
// Guarda el pedido que se quiere eliminar mientras se muestra el modal
let pedidoAEliminar = null;
// Referencias a los contadores del encabezado
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
 * Conecta todos los eventos (clics y escritura) con sus funciones.
 * Se llama una sola vez, cuando arranca la aplicación.
 */
export function inicializarEventos() {
    formulario.addEventListener("submit", guardarFormulario);
    formEditar.addEventListener("submit", guardarEdicion);
    botonCancelarEdicion.addEventListener("click", cerrarModalEditar);
    notasTextarea.addEventListener("input", guardarNotasEscritas);
    botonConfirmarEliminar.addEventListener("click", confirmarEliminacion);
    botonCancelarEliminar.addEventListener("click", cerrarModalConfirmarEliminar);
}
// ===================== BLOC DE RECORDATORIOS =====================
// Se ejecuta cada vez que el usuario escribe en el bloc de notas
function guardarNotasEscritas() {
    guardarNotas(notasTextarea.value);
}
/**
 * Muestra en el bloc de notas lo que estaba guardado.
 * Se llama una sola vez, al abrir la página.
 */
export function cargarNotas() {
    notasTextarea.value = obtenerNotas();
}
// ===================== FORMULARIO "NUEVO PEDIDO" =====================
// Lee los valores que el usuario cargó en el formulario de arriba
function leerDatosDelFormulario() {
    return {
        pedido: inputPedido.value.trim(),
        porciones: Number(inputPorciones.value),
        fechaEntrega: inputFechaEntrega.value,
        senaAbonada: inputSena.value === "true"
    };
}
/**
 * Se ejecuta al apretar "Guardar Pedido".
 * Este formulario SOLO crea pedidos nuevos (para editar se usa el modal).
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
// ===================== MODAL "EDITAR PEDIDO" =====================
// Lee los valores que el usuario cargó en el formulario del modal
function leerDatosDelFormularioDeEdicion() {
    return {
        id: idEditando,
        pedido: editInputPedido.value.trim(),
        porciones: Number(editInputPorciones.value),
        fechaEntrega: editInputFechaEntrega.value,
        senaAbonada: editInputSena.value === "true"
    };
}
// Se ejecuta al apretar "Guardar cambios" en el modal
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
// Abre el modal de edición y lo llena con los datos del pedido elegido
function editarPedido(pedido) {
    idEditando = pedido.id;
    editInputPedido.value = pedido.pedido;
    editInputPorciones.value = pedido.porciones;
    editInputFechaEntrega.value = pedido.fechaEntrega || "";
    editInputSena.value = pedido.senaAbonada.toString();
    modalEditar.classList.remove("oculto");
}
// Cierra el modal de edición sin guardar ningún cambio
function cerrarModalEditar() {
    formEditar.reset();
    idEditando = null;
    modalEditar.classList.add("oculto");
}
// ===================== CÁLCULO DE FECHAS =====================
/**
 * Días que faltan para la entrega. 0 o menos = hoy (o ya se pasó).
 * Un número positivo = cuántos días faltan.
 */
function calcularDiasParaEntrega(fechaEntrega) {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const fechaDeEntrega = new Date(fechaEntrega + "T00:00:00");
    return Math.round((fechaDeEntrega.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));
}
/**
 * Función de comparación para sort(): los pedidos que entregan
 * antes quedan primero en la lista.
 */
function compararPorFechaDeEntrega(pedidoA, pedidoB) {
    const diasA = calcularDiasParaEntrega(pedidoA.fechaEntrega);
    const diasB = calcularDiasParaEntrega(pedidoB.fechaEntrega);
    return diasA - diasB;
}
// ===================== LISTA DE PEDIDOS (TARJETAS) =====================
/**
 * Vuelve a dibujar toda la lista de pedidos.
 * Se llama cada vez que se crea, edita o elimina un pedido.
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
// Círculo de "Entrega" del lado izquierdo de la tarjeta
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
// Título, porciones y badge de seña
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
// Abre el modal de confirmación con el nombre del pedido a eliminar
function pedirConfirmacionYEliminar(pedido) {
    pedidoAEliminar = pedido;
    textoConfirmarEliminar.textContent = '¿Seguro que querés eliminar el pedido de "' + pedido.pedido + '"?';
    modalConfirmarEliminar.classList.remove("oculto");
}
// Se ejecuta al apretar "Eliminar" dentro del modal de confirmación
function confirmarEliminacion() {
    eliminarPedido(pedidoAEliminar.id);
    cerrarModalConfirmarEliminar();
    renderizarPedidos();
}
// Cierra el modal de confirmación sin eliminar nada
function cerrarModalConfirmarEliminar() {
    pedidoAEliminar = null;
    modalConfirmarEliminar.classList.add("oculto");
}
// Botones "Editar" y "Eliminar", con sus eventos ya conectados
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
// Arma la tarjeta completa (círculo + texto + botones) y la agrega a la lista
function crearTarjeta(pedido) {
    const tarjeta = document.createElement("div");
    tarjeta.classList.add("tarjeta");
    // Seña pendiente = riesgo: se marca con borde punteado en toda la tarjeta
    if (pedido.senaAbonada === false) {
        tarjeta.classList.add("tarjeta-pendiente");
    }
    tarjeta.appendChild(crearBloqueEntrega(pedido));
    tarjeta.appendChild(crearContenidoDePedido(pedido));
    tarjeta.appendChild(crearBotonesDePedido(pedido));
    listaPedidos.appendChild(tarjeta);
}
// Cuenta pedidos con seña pagada/pendiente y actualiza los textos del encabezado
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
// ===================== CALENDARIO =====================
// Pedidos cuya fecha de entrega cae en el día indicado
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
// true si alguno de los pedidos pasados tiene la seña pendiente
function hayAlgunoConSenaPendiente(pedidos) {
    for (let i = 0; i < pedidos.length; i++) {
        if (pedidos[i].senaAbonada === false) {
            return true;
        }
    }
    return false;
}
/**
 * Dibuja el calendario del mes actual, con un punto naranja en los
 * días con algún pedido pendiente, y verde si están todos pagados.
 */
function renderizarCalendario(pedidos) {
    calendarioGrid.innerHTML = "";
    const hoy = new Date();
    const anioActual = hoy.getFullYear();
    const mesActual = hoy.getMonth();
    calendarioTitulo.textContent = NOMBRES_MESES[mesActual] + " " + anioActual;
    const primerDiaDelMes = new Date(anioActual, mesActual, 1);
    const cantidadDeDias = new Date(anioActual, mesActual + 1, 0).getDate();
    // JS numera los días desde Domingo (0). Con "+6 % 7" lo acomodamos
    // para que la semana arranque en Lunes: Lunes = 0 ... Domingo = 6.
    const diaDeInicio = (primerDiaDelMes.getDay() + 6) % 7;
    // Casilleros vacíos antes del día 1, para alinear la semana
    for (let i = 0; i < diaDeInicio; i++) {
        const vacio = document.createElement("div");
        vacio.classList.add("diaCalendario", "diaVacio");
        calendarioGrid.appendChild(vacio);
    }
    // Un casillero por cada día del mes
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
// Limpia el formulario de "Nuevo Pedido"
export function limpiarFormulario() {
    formulario.reset();
}