const formNuevo = {
    form: document.getElementById("formPedido"),
    pedido: document.getElementById("pedido"),
    porciones: document.getElementById("porciones"),
    fechaEntrega: document.getElementById("fechaEntrega"),
    sena: document.getElementById("sena")
};

const formEdicion = {
    modal: document.getElementById("modalEditar"),
    form: document.getElementById("formEditar"),
    pedido: document.getElementById("editPedido"),
    porciones: document.getElementById("editPorciones"),
    fechaEntrega: document.getElementById("editFechaEntrega"),
    sena: document.getElementById("editSena"),
    botonCancelar: document.getElementById("botonCancelarEdicion")
};

const modalEliminar = {
    modal: document.getElementById("modalConfirmarEliminar"),
    texto: document.getElementById("textoConfirmarEliminar"),
    botonConfirmar: document.getElementById("botonConfirmarEliminar"),
    botonCancelar: document.getElementById("botonCancelarEliminar")
};

const contadores = {
    cantidad: document.getElementById("cantidadPedidos"),
    conSena: document.getElementById("contadorConSena"),
    sinSena: document.getElementById("contadorSinSena")
};

const calendario = {
    titulo: document.getElementById("calendarioTitulo"),
    grid: document.getElementById("calendarioGrid")
};

const listaPedidos = document.getElementById("listaPedidos");
const notasTextarea = document.getElementById("notasTextarea");

const NOMBRES_MESES = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];


export function inicializarEventos(callbacks) {
    formNuevo.form.addEventListener("submit", function (evento) {
        evento.preventDefault();
        callbacks.onGuardarNuevo(leerFormularioNuevo());
    });
    formEdicion.form.addEventListener("submit", function (evento) {
        evento.preventDefault();
        callbacks.onGuardarEdicion(leerFormularioEdicion());
    });
    formEdicion.botonCancelar.addEventListener("click", callbacks.onCancelarEdicion);
    modalEliminar.botonConfirmar.addEventListener("click", callbacks.onConfirmarEliminar);
    modalEliminar.botonCancelar.addEventListener("click", callbacks.onCancelarEliminar);
    notasTextarea.addEventListener("input", function () {
        callbacks.onEscribirNotas(notasTextarea.value);
    });
}

export function alCargarLaPagina(funcion) {
    document.addEventListener("DOMContentLoaded", funcion);
}


function leerFormularioNuevo() {
    return {
        pedido: formNuevo.pedido.value.trim(),
        porciones: Number(formNuevo.porciones.value),
        fechaEntrega: formNuevo.fechaEntrega.value,
        senaAbonada: formNuevo.sena.value === "true"
    };
}

function leerFormularioEdicion() {
    return {
        pedido: formEdicion.pedido.value.trim(),
        porciones: Number(formEdicion.porciones.value),
        fechaEntrega: formEdicion.fechaEntrega.value,
        senaAbonada: formEdicion.sena.value === "true"
    };
}

export function mostrarErrores(errores) {
    alert(errores.join("\n"));
}

export function limpiarFormularioNuevo() {
    formNuevo.form.reset();
}


export function mostrarModalEditar(pedido) {
    formEdicion.pedido.value = pedido.pedido;
    formEdicion.porciones.value = pedido.porciones;
    formEdicion.fechaEntrega.value = pedido.fechaEntrega || "";
    formEdicion.sena.value = pedido.senaAbonada.toString();
    formEdicion.modal.classList.remove("oculto");
}

export function ocultarModalEditar() {
    formEdicion.form.reset();
    formEdicion.modal.classList.add("oculto");
}


export function mostrarModalConfirmarEliminar(pedido) {
    modalEliminar.texto.textContent = '¿Seguro que querés eliminar el pedido de "' + pedido.pedido + '"?';
    modalEliminar.modal.classList.remove("oculto");
}

export function ocultarModalConfirmarEliminar() {
    modalEliminar.modal.classList.add("oculto");
}

export function mostrarNotas(texto) {
    notasTextarea.value = texto;
}

function calcularDiasParaEntrega(fechaEntrega) {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const fechaDeEntrega = new Date(fechaEntrega + "T00:00:00");
    return Math.round((fechaDeEntrega.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));
}

function compararPorFechaDeEntrega(pedidoA, pedidoB) {
    return calcularDiasParaEntrega(pedidoA.fechaEntrega) - calcularDiasParaEntrega(pedidoB.fechaEntrega);
}


export function renderizarListaPedidos(pedidos, callbacks) {
    listaPedidos.innerHTML = "";
    pedidos.sort(compararPorFechaDeEntrega);
    for (let i = 0; i < pedidos.length; i++) {
        crearTarjeta(pedidos[i], callbacks);
    }
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

function crearBotonesDePedido(pedido, callbacks) {
    const botones = document.createElement("div");
    botones.classList.add("botones");
    botones.innerHTML = `<button class="editar">Editar</button><button class="eliminar">Eliminar</button>`;
    botones.querySelector(".editar").addEventListener("click", function () {
        callbacks.onEditarClick(pedido);
    });
    botones.querySelector(".eliminar").addEventListener("click", function () {
        callbacks.onEliminarClick(pedido);
    });
    return botones;
}

function crearTarjeta(pedido, callbacks) {
    const tarjeta = document.createElement("div");
    tarjeta.classList.add("tarjeta");
    if (pedido.senaAbonada === false) {
        tarjeta.classList.add("tarjeta-pendiente");
    }
    tarjeta.appendChild(crearBloqueEntrega(pedido));
    tarjeta.appendChild(crearContenidoDePedido(pedido));
    tarjeta.appendChild(crearBotonesDePedido(pedido, callbacks));
    listaPedidos.appendChild(tarjeta);
}

export function actualizarContadores(pedidos) {
    contadores.cantidad.textContent = pedidos.length;
    let conSena = 0;
    let sinSena = 0;
    for (let i = 0; i < pedidos.length; i++) {
        if (pedidos[i].senaAbonada === true) conSena++; else sinSena++;
    }
    contadores.conSena.textContent = "Pedidos con seña: " + conSena;
    contadores.sinSena.textContent = "Pedidos sin seña: " + sinSena;
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

export function renderizarCalendario(pedidos) {
    calendario.grid.innerHTML = "";
    const hoy = new Date();
    const anioActual = hoy.getFullYear();
    const mesActual = hoy.getMonth();
    calendario.titulo.textContent = NOMBRES_MESES[mesActual] + " " + anioActual;

    const primerDiaDelMes = new Date(anioActual, mesActual, 1);
    const cantidadDeDias = new Date(anioActual, mesActual + 1, 0).getDate();

    const diaDeInicio = (primerDiaDelMes.getDay() + 6) % 7;


    for (let i = 0; i < diaDeInicio; i++) {
        const vacio = document.createElement("div");
        vacio.classList.add("diaCalendario", "diaVacio");
        calendario.grid.appendChild(vacio);
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
        calendario.grid.appendChild(celda);
    }
}