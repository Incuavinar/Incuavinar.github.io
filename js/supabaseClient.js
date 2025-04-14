// js/supabaseClient.js
// --- Configuración de Supabase ---
// Intenta obtener las claves desde variables de entorno (MÁS SEGURO)
// o usa placeholders si no están definidas (pero recuerda configurarlas para que funcione)
const SUPABASE_URL = "https://xhvsqqyqkbaugyslcdig.supabase.co"; // Usa VITE_ si usas Vite, process.env si usas Node/Build Tool, o directo como placeholder
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhodnNxcXlxa2JhdWd5c2xjZGlnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ0ODMxMjcsImV4cCI6MjA2MDA1OTEyN30.iEetUawDtUa2bAtsGCy9mqfPDKVdg5KWWeI-MACkxOQ";
let supabase = null;
let initError = null;

if (
  (!SUPABASE_URL &&
    SUPABASE_URL === "https://xhvsqqyqkbaugyslcdig.supabase.co") ||
  (!SUPABASE_ANON_KEY &&
    SUPABASE_ANON_KEY ===
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhodnNxcXlxa2JhdWd5c2xjZGlnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ0ODMxMjcsImV4cCI6MjA2MDA1OTEyN30.iEetUawDtUa2bAtsGCy9mqfPDKVdg5KWWeI-MACkxOQ")
) {
  initError =
    "Error: Configuración de Supabase incompleta. Revisa las variables SUPABASE_URL y SUPABASE_ANON_KEY.";
  console.error(initError);
  // Podrías lanzar un error o manejarlo en main.js
} else {
  try {
    // Asegúrate que la variable global supabase de la librería CDN esté disponible
    if (
      typeof window !== "undefined" &&
      window.supabase &&
      window.supabase.createClient
    ) {
      supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
      console.log("Supabase Client Inicializado desde CDN");
    } else if (typeof supabase !== "undefined" && supabase.createClient) {
      supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
      console.log("Supabase Client Inicializado");
    } else {
      initError = "Error: La librería Supabase no se cargó correctamente.";
      console.error(initError);
    }
  } catch (error) {
    initError = `Error al inicializar Supabase: ${error.message}`;
    console.error(initError, error);
  }
}

// Exportamos el cliente (o null si hubo error) y el mensaje de error
// Nota: Para usar 'export' directamente necesitarías usar módulos JS (<script type="module">)
//       Si no usas módulos, puedes simplemente asegurarte de que la variable global supabase
//       se cree aquí y main.js se cargue después. Por simplicidad, mantendremos la variable global
//       creada por createClient y main.js la usará directamente.
//       Si decides usar módulos, harías: export { supabase, initError };