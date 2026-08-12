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

// Referencias al DOM - formulario de nuevo pedido
const formulario = document.getElementById("formPedido");
const inputPedido = document.getElementById("pedido");
const inputPorciones = document.getElementById("porciones");
const inputFechaEntrega = document.getElementById("fechaEntrega");
const inputSena = document.getElementById("sena");
const listaPedidos = document.getElementById("listaPedidos");

// Referencias al DOM - modal de edición (formulario separado)
const modalEditar = document.getElementById("modalEditar");
const formEditar = document.getElementById("formEditar");
const editInputPedido = document.getElementById("editPedido");
const editInputPorciones = document.getElementById("editPorciones");
const editInputFechaEntrega = document.getElementById("editFechaEntrega");
const editInputSena = document.getElementById("editSena");
const botonCancelarEdicion = document.getElementById("botonCancelarEdicion");

const cantidadPedidosSpan = document.getElementById("cantidadPedidos");
const contadorConSena = document.getElementById("contadorConSena");
const contadorSinSena = document.getElementById("contadorSinSena");

// Referencias al DOM - calendario
const calendarioTitulo = document.getElementById("calendarioTitulo");
const calendarioGrid = document.getElementById("calendarioGrid");

// Referencias al DOM - bloc de recordatorios
const notasTextarea = document.getElementById("notasTextarea");

/**
 * Inicializa todos los eventos.
 */
export function inicializarEventos() {

    formulario.addEventListener("submit", guardarFormulario);

    formEditar.addEventListener("submit", guardarEdicion);

    botonCancelarEdicion.addEventListener("click", cerrarModalEditar);

    notasTextarea.addEventListener("input", () => {
        guardarNotas(notasTextarea.value);
    });

}

/**
 * Carga en el bloc de notas lo que haya guardado.
 * Se llama una sola vez, al iniciar la aplicación.
 */
export function cargarNotas() {

    notasTextarea.value = obtenerNotas();

}

/**
 * Guarda un pedido nuevo. Este formulario ya no se usa para editar.
 */
function guardarFormulario(event) {

    event.preventDefault();

    const pedido = {
        pedido: inputPedido.value.trim(),
        porciones: Number(inputPorciones.value),
        fechaEntrega: inputFechaEntrega.value,
        senaAbonada: inputSena.value === "true"
    };

    const resultado = validarFormulario(pedido);

    if (!resultado.valido) {
        alert(resultado.errores.join("\n"));
        return;
    }

    guardarPedido(pedido);

    formulario.reset();

    renderizarPedidos();

}

/**
 * Guarda los cambios del pedido que se está editando en el modal.
 */
function guardarEdicion(event) {

    event.preventDefault();

    const pedido = {
        id: idEditando,
        pedido: editInputPedido.value.trim(),
        porciones: Number(editInputPorciones.value),
        fechaEntrega: editInputFechaEntrega.value,
        senaAbonada: editInputSena.value === "true"
    };

    const resultado = validarFormulario(pedido);

    if (!resultado.valido) {
        alert(resultado.errores.join("\n"));
        return;
    }

    actualizarPedido(pedido);

    cerrarModalEditar();

    renderizarPedidos();

}

/**
 * Calcula cuántos días faltan para la fecha de entrega.
 * Devuelve 0 si es hoy, un número positivo si falta, o
 * un número negativo si ya se pasó la fecha.
 */
function calcularDiasParaEntrega(fechaEntrega) {

    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    const entrega = new Date(fechaEntrega + "T00:00:00");

    const unDiaEnMs = 1000 * 60 * 60 * 24;

    const diferencia = entrega.getTime() - hoy.getTime();

    return Math.round(diferencia / unDiaEnMs);
}

/**
 * Crea el bloque con el círculo de "Entrega" para una tarjeta.
 */
function crearBloqueEntrega(pedido) {

    const bloque = document.createElement("div");
    bloque.classList.add("bloqueEntrega");

    if (!pedido.fechaEntrega) {

        bloque.innerHTML = `
            <p class="entregaTexto">Entrega</p>
            <div class="entregaCirculo">-</div>
        `;

        return bloque;
    }

    const dias = calcularDiasParaEntrega(pedido.fechaEntrega);

    let textoCirculo = "";
    let textoDias = "";

    if (dias <= 0) {
        textoCirculo = "hoy";
    } else {
        textoCirculo = dias;
        textoDias = "días";
    }

    bloque.innerHTML = `
        <p class="entregaTexto">Entrega</p>
        <div class="entregaCirculo">${textoCirculo}</div>
        <p class="entregaDias">${textoDias}</p>
    `;

    return bloque;
}

/**
 * Muestra todos los pedidos.
 */
export function renderizarPedidos() {

    listaPedidos.innerHTML = "";

    const pedidos = obtenerPedidos();

    // Los pedidos que entregan antes van primero (urgencia real)
    pedidos.sort((a, b) => {

        const diasA = calcularDiasParaEntrega(a.fechaEntrega);
        const diasB = calcularDiasParaEntrega(b.fechaEntrega);

        return diasA - diasB;

    });

    pedidos.forEach(crearTarjeta);

    actualizarContadores(pedidos);

    renderizarCalendario(pedidos);

}

/**
 * Nombres de los meses, para el título del calendario.
 */
const NOMBRES_MESES = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];

/**
 * Dibuja el calendario del mes actual, con un punto de color
 * en los días que tienen algún pedido con esa fecha de entrega.
 */
function renderizarCalendario(pedidos) {

    calendarioGrid.innerHTML = "";

    const hoy = new Date();
    const anioActual = hoy.getFullYear();
    const mesActual = hoy.getMonth();

    calendarioTitulo.textContent = NOMBRES_MESES[mesActual] + " " + anioActual;

    // Primer día del mes y cuántos días tiene el mes
    const primerDia = new Date(anioActual, mesActual, 1);
    const cantidadDias = new Date(anioActual, mesActual + 1, 0).getDate();

    // getDay() da 0 para Domingo, acá lo acomodamos para que
    // la semana empiece en Lunes (0 = Lunes ... 6 = Domingo)
    let diaSemanaInicio = primerDia.getDay() - 1;
    if (diaSemanaInicio < 0) {
        diaSemanaInicio = 6;
    }

    // Casilleros vacíos antes del día 1
    for (let i = 0; i < diaSemanaInicio; i++) {

        const vacio = document.createElement("div");
        vacio.classList.add("diaCalendario", "diaVacio");

        calendarioGrid.appendChild(vacio);

    }

    // Un casillero por cada día del mes
    for (let numeroDia = 1; numeroDia <= cantidadDias; numeroDia++) {

        const celda = document.createElement("div");
        celda.classList.add("diaCalendario");

        if (numeroDia === hoy.getDate()) {
            celda.classList.add("diaHoy");
        }

        const pedidosDelDia = pedidos.filter(pedido => {

            if (!pedido.fechaEntrega) {
                return false;
            }

            const fecha = new Date(pedido.fechaEntrega + "T00:00:00");

            return fecha.getDate() === numeroDia &&
                fecha.getMonth() === mesActual &&
                fecha.getFullYear() === anioActual;

        });

        let puntoHtml = "";

        if (pedidosDelDia.length > 0) {

            const hayPendiente = pedidosDelDia.some(p => p.senaAbonada === false);

            const colorPunto = hayPendiente ? "puntoNaranja" : "puntoVerde";

            puntoHtml = `<span class="puntoDia ${colorPunto}"></span>`;

        }

        celda.innerHTML = numeroDia + puntoHtml;

        calendarioGrid.appendChild(celda);

    }

}

/**
 * Actualiza el título "Pedidos: N" y los contadores del header.
 */
function actualizarContadores(pedidos) {

    cantidadPedidosSpan.textContent = pedidos.length;

    const conSena = pedidos.filter(pedido => pedido.senaAbonada === true).length;
    const sinSena = pedidos.filter(pedido => pedido.senaAbonada === false).length;

    contadorConSena.textContent = "Pedidos con seña: " + conSena;
    contadorSinSena.textContent = "Pedidos sin seña: " + sinSena;

}

/**
 * Crea la tarjeta de un pedido.
 */
function crearTarjeta(pedido) {

    const tarjeta = document.createElement("div");

    tarjeta.classList.add("tarjeta");

    // Un pedido sin seña abonada es un riesgo: se marca con
    // borde punteado en toda la tarjeta, no solo en el badge.
    if (pedido.senaAbonada === false) {
        tarjeta.classList.add("tarjeta-pendiente");
    }

    const bloqueEntrega = crearBloqueEntrega(pedido);

    const contenido = document.createElement("div");
    contenido.classList.add("contenidoPedido");

    contenido.innerHTML = `

        <h3>${pedido.pedido}</h3>

        <p>
            📦 ${pedido.porciones} porciones
        </p>

        <span class="badge ${pedido.senaAbonada ? "pagada" : "pendiente"}">

            ${
                pedido.senaAbonada
                ? "✔ Seña pagada"
                : "🟠 Seña pendiente"
            }

        </span>

    `;

    const botones = document.createElement("div");
    botones.classList.add("botones");

    botones.innerHTML = `
        <button class="editar">Editar</button>
        <button class="eliminar">Eliminar</button>
    `;

    // Boton editar
    botones
        .querySelector(".editar")
        .addEventListener("click", () => editarPedido(pedido));

    // Boton eliminar
    botones
        .querySelector(".eliminar")
        .addEventListener("click", () => {

            const confirmar = confirm(
                "¿Seguro que querés eliminar el pedido de \"" + pedido.pedido + "\"?"
            );

            if (!confirmar) {
                return;
            }

            eliminarPedido(pedido.id);

            renderizarPedidos();

        });

    tarjeta.appendChild(bloqueEntrega);
    tarjeta.appendChild(contenido);
    tarjeta.appendChild(botones);

    listaPedidos.appendChild(tarjeta);

}

/**
 * Abre el modal de edición con los datos del pedido cargados.
 */
function editarPedido(pedido) {

    idEditando = pedido.id;

    editInputPedido.value = pedido.pedido;

    editInputPorciones.value = pedido.porciones;

    editInputFechaEntrega.value = pedido.fechaEntrega || "";

    editInputSena.value = pedido.senaAbonada.toString();

    modalEditar.classList.remove("oculto");

}

/**
 * Cierra el modal de edición sin guardar cambios.
 */
function cerrarModalEditar() {

    formEditar.reset();

    idEditando = null;

    modalEditar.classList.add("oculto");

}

/**
 * Limpia el formulario de nuevo pedido.
 */
export function limpiarFormulario() {

    formulario.reset();

}
