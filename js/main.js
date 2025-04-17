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
        if (cedulaInput) cedulaInput.disabled = true;
        if (searchButton) searchButton.disabled = true;
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
        return key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    }

    // --- Función para crear una fila de tabla ---
    function createTableRow(key, value) {
        const formattedKey = formatKey(key);
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
            const { data, error } = await supabase
                .from('Base de datos')
                .select('fotos,cedula,nombres_y_apellidos,fecha_nacimiento,cotizante,sede,salario,cargo_empresa,situacion_laboral,eps,afp,correo_electronico,celular,arl,ccf,cedulapdf')
                .eq('cedula', cedula)
                .maybeSingle();

            if (error) {
                console.error('Error de Supabase:', error);
                resultsDiv.innerHTML = `<p class="error">Error al consultar la base de datos: ${error.message}</p>`;
                return;
            }

            if (data) {
                // --- Construcción del HTML con 3 tablas ---
                let outputHtml = '';

                // Mostrar la foto si existe
                if (data.fotos) {
                    outputHtml += `<div class="image-container"><img src="${data.fotos}" alt="Foto"></div>`;
                }

                // Tabla 1: Datos Personales
                outputHtml += '<h2>Datos Personales</h2>';
                outputHtml += '<table class="results-table">';
                outputHtml += '<tbody>';
                outputHtml += createTableRow('Nombres_y_Apellidos', data.nombres_y_apellidos);
                outputHtml += createTableRow('Cedula', data.cedula);
                outputHtml += createTableRow('Celular', data.celular);
                outputHtml += createTableRow('Correo_electronico', data.correo_electronico);
                outputHtml += createTableRow('Fecha_de_Nacimiento', data.fecha_nacimiento);
                outputHtml += '</tbody>';
                outputHtml += '</table>';

                // Tabla 2: Datos Laborales
                outputHtml += '<h2>Datos Laborales</h2>';
                outputHtml += '<table class="results-table">';
                outputHtml += '<tbody>';
                outputHtml += createTableRow('Salario', data.salario);
                outputHtml += createTableRow('Cotizante', data.cotizante);
                outputHtml += createTableRow('Sede', data.sede);
                outputHtml += createTableRow('Cargo_Empresa', data.cargo_empresa);
                outputHtml += createTableRow('Situacion_Laboral', data.situacion_laboral);
                outputHtml += '</tbody>';
                outputHtml += '</table>';

                // Tabla 3: Datos de Afiliación
                outputHtml += '<h2>Datos de Afiliación</h2>';
                outputHtml += '<table class="results-table">';
                outputHtml += '<tbody>';
                outputHtml += createTableRow('EPS', data.eps);
                outputHtml += createTableRow('AFP', data.afp);
                outputHtml += createTableRow('ARL', data.arl);
                outputHtml += createTableRow('CCF', data.ccf);
                outputHtml += '</tbody>';
                outputHtml += '</table>';

                // Tabla 4: Vinculacion Laboral
                outputHtml += '<h2>Vinculacion Laboral</h2>';
                outputHtml += '<table class="results-table">';
                outputHtml += '<tbody>';
                outputHtml += createTableRow('Cedula', `<a href="${data.cedulapdf}">Link</a>`);
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
