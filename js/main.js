// js/main.js

// Espera a que el DOM esté completamente cargado
document.addEventListener('DOMContentLoaded', () => {

    // --- Elementos del DOM ---
    const cedulaInput = document.getElementById('cedulaInput');
    const searchButton = document.getElementById('searchButton');
    const resultsDiv = document.getElementById('results');

    // --- Verificar si Supabase se inicializó ---
    // Accedemos a la variable global `supabase` creada en supabaseClient.js
    // Y a la variable `initError` que también creamos allí.
    if (typeof supabase === 'undefined' || !supabase) {
         // Si initError se definió en supabaseClient.js, úsalo.
         const errorMessage = typeof initError !== 'undefined' ? initError : 'Error: Cliente Supabase no disponible.';
         resultsDiv.innerHTML = `<p class="error">${errorMessage}</p>`;
         // Deshabilitar controles si Supabase no funciona
         if(cedulaInput) cedulaInput.disabled = true;
         if(searchButton) searchButton.disabled = true;
         return; // Detener ejecución si Supabase no está listo
    }

    // --- Validación de entrada (solo números) ---
    if (cedulaInput) {
        cedulaInput.addEventListener('input', () => {
            cedulaInput.value = cedulaInput.value.replace(/[^0-9]/g, '');
        });
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
            // Usa la instancia global `supabase`
            const { data, error } = await supabase
                .from('Base de datos')      // Nombre de tu tabla
                .select('cedula,Nombres_y_Apellidos,Cotizante,Sede,Salario,Cargo_Empresa,Fecha_de_Nacimiento,EPS,AFP,Correo_electronico,Celular')           // Columnas a seleccionar
                .eq('cedula', cedula)  // Condición de búsqueda
                .maybeSingle();        // Espera 0 o 1 resultado

            if (error) {
                console.error('Error de Supabase:', error);
                resultsDiv.innerHTML = `<p class="error">Error al consultar la base de datos: ${error.message}</p>`;
                return;
            }

            if (data) {
                let output = '<ul>';
                for (const key in data) {
                    const formattedKey = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                    output += `<li><strong>${formattedKey}:</strong> ${data[key]}</li>`;
                }
                output += '</ul>';
                resultsDiv.innerHTML = output;
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
                event.preventDefault();
                buscarPorCedula();
            }
        });
    }
}); // Fin del DOMContentLoaded