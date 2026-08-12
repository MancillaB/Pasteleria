import { inicializarEventos, renderizarPedidos, cargarNotas } from "./ui.js";

/**
 * Inicia la aplicación.
 * Es el punto de entrada del sistema.
 */
function iniciarAplicacion() {

    // Configura los eventos del formulario
    inicializarEventos();

    // Muestra los pedidos guardados al cargar la página
    renderizarPedidos();

    // Muestra las notas guardadas en el bloc de recordatorios
    cargarNotas();

}

// Espera a que el HTML esté completamente cargado
document.addEventListener("DOMContentLoaded", iniciarAplicacion);