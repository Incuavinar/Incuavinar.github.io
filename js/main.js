// js/main.js

// Espera a que el DOM esté completamente cargado
document.addEventListener('DOMContentLoaded', () => {

    // --- Elementos del DOM ---
    const cedulaInput = document.getElementById('cedulaInput');
    const searchButton = document.getElementById('searchButton');
    const resultsDiv = document.getElementById('results');

    // --- Verificar si Supabase se inicializó ---
    if (typeof supabase === 'undefined' || !supabase) {
        const errorMessage = typeof initError !== 'undefined' ? initError : 'Error: Cliente Supabase no disponible.';
        resultsDiv.innerHTML = `<p class="error">${errorMessage}</p>`;
        if(cedulaInput) cedulaInput.disabled = true;
        if(searchButton) searchButton.disabled = true;
        return;
    }

    // --- Validación de entrada (solo números) ---
    if (cedulaInput) {
        cedulaInput.addEventListener('input', () => {
            cedulaInput.value = cedulaInput.value.replace(/[^0-9]/g, '');
        });
    }

    // --- Función para formatear claves (opcional pero útil) ---
    function formatKey(key) {
        // Reemplaza guiones bajos con espacios y capitaliza la primera letra de cada palabra
        return key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    }

    // --- Función para crear una fila de tabla ---
    function createTableRow(key, value) {
        const formattedKey = formatKey(key);
        // Si el valor es null o undefined, mostrar 'No disponible' o similar
        const displayValue = (value === null || value === undefined) ? 'No disponible' : value;
        return `<tr><td><strong>${formattedKey}:</strong></td><td>${displayValue}</td></tr>`;
    }

    // --- Función de Búsqueda ---
    async function buscarPorCedula() {
        const cedula = cedulaInput.value.trim();
        resultsDiv.innerHTML = '<p class="loading">Buscando...</p>';

        if (!cedula) {
            resultsDiv.innerHTML = '<p class="error">Por favor, ingrese un número de cédula.</p>';
            return;
        }

        try {
            // Asegúrate de seleccionar TODOS los campos que necesitas para las 3 tablas
            // Si necesitas ARL, agrégalo aquí: 'cedula,Nombres_y_Apellidos,...,EPS,AFP,ARL,Correo_electronico,Celular'
            const { data, error } = await supabase
                .from('Base de datos')      // Nombre de tu tabla
                .select('cedula,Nombres_y_Apellidos,Fecha_de_nacimiento,Cotizante,Sede,Salario,Cargo_Empresa,EPS,AFP,Correo_electronico,Celular') // Columnas a seleccionar
                .eq('cedula', cedula)  // Condición de búsqueda
                .maybeSingle();        // Espera 0 o 1 resultado

            if (error) {
                console.error('Error de Supabase:', error);
                resultsDiv.innerHTML = `<p class="error">Error al consultar la base de datos: ${error.message}</p>`;
                return;
            }

            if (data) {
                // --- Construcción del HTML con 3 tablas ---
                let outputHtml = '';

                // Tabla 1: Datos Personales
                outputHtml += '<h2>Datos Personales</h2>';
                outputHtml += '<table class="results-table">';
                outputHtml += '<tbody>';
                outputHtml += createTableRow('Nombres_y_Apellidos', data.Nombres_y_Apellidos);
                outputHtml += createTableRow('cedula', data.cedula);
                outputHtml += createTableRow('Celular', data.Celular);
                outputHtml += createTableRow('Correo_electronico', data.Correo_electronico);
                 // Si quieres incluir Fecha_de_Nacimiento aquí (aunque no estaba en tu lista original):
                 // outputHtml += createTableRow('Fecha_de_Nacimiento', data.Fecha_de_Nacimiento);
                outputHtml += '</tbody>';
                outputHtml += '</table>';

                // Tabla 2: Datos Laborales
                outputHtml += '<h2>Datos Laborales</h2>';
                outputHtml += '<table class="results-table">';
                outputHtml += '<tbody>';
                outputHtml += createTableRow('Salario', data.Salario);
                outputHtml += createTableRow('Cotizante', data.Cotizante);
                outputHtml += createTableRow('Sede', data.Sede);
                outputHtml += createTableRow('Cargo_Empresa', data.Cargo_Empresa);
                outputHtml += '</tbody>';
                outputHtml += '</table>';

                // Tabla 3: Datos de Afiliación
                outputHtml += '<h2>Datos de Afiliación</h2>';
                outputHtml += '<table class="results-table">';
                outputHtml += '<tbody>';
                outputHtml += createTableRow('EPS', data.EPS);
                outputHtml += createTableRow('AFP', data.AFP);
                // Si seleccionaste y tienes datos de ARL, descomenta la siguiente línea:
                // outputHtml += createTableRow('ARL', data.ARL);
                outputHtml += '</tbody>';
                outputHtml += '</table>';

                resultsDiv.innerHTML = outputHtml;

            } else {
                resultsDiv.innerHTML = `<p class="not-found">No se encontraron datos para la cédula ${cedula}.</p>`;
            }

        } catch (err) {
            console.error('Error inesperado:', err);
            resultsDiv.innerHTML = `<p class="error">Ocurrió un error inesperado durante la búsqueda.</p>`;
        }
    }

    // --- Event Listeners ---
    if (searchButton) {
        searchButton.addEventListener('click', buscarPorCedula);
    }

    if (cedulaInput) {
        cedulaInput.addEventListener('keypress', function(event) {
            if (event.key === 'Enter') {
                event.preventDefault(); // Evita el envío de formulario si lo hubiera
                buscarPorCedula();
            }
        });
    }
}); // Fin del DOMContentLoaded