import { inicializarEventos, renderizarPedidos, cargarNotas } from "./ui.js";

function iniciarAplicacion() {

    inicializarEventos();

    renderizarPedidos();

    cargarNotas();

}

document.addEventListener("DOMContentLoaded", iniciarAplicacion);