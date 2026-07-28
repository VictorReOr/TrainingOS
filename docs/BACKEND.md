# BACKEND & SERVICES ARCHITECTURE — TrainingOS

## 1. Estado Actual de la Capa de Backend
TrainingOS no utiliza un backend tradicional basado en un servidor monolítico (Node.js/Express o Django), sino una **arquitectura Serverless Híbrida y Local-First** compuesta por:

1. **Persistencia Local Primaria**: `localStorage` actúa como base de datos en el cliente.
2. **Firebase Authentication**: Gestión de usuarios y credenciales (`src/config/firebase.js`).
3. **Google Sheets API / Apps Script**: Micro-servicios serverless distribuidos (`src/services/sheets.js`) impulsados por un script ejecutable (`Code.gs`) alojado en Google Drive.

---

## 2. Servicios de Red (`src/services/sheets.js`)

### 2.1. Configuración y Modos de Red
- **`API_URL`**: Obtenido mediante `import.meta.env.VITE_SHEETS_API_URL`.
- **Modo Demo / Offline (`VITE_USE_MOCK`)**: Si `VITE_USE_MOCK=true` o `localStorage.getItem('trainingos_demo_mode') === 'true'`, las llamadas de red se interceptan y devuelven respuestas simuladas con 300 ms de latencia artificial.
- **Timeout y AbortController**: Toda petición POST o GET tiene un timeout estricto de **8 segundos** mediante `AbortController`.

---

## 3. Catálogo de Acciones del Servicio (`src/services/sheets.js`)

| Acción (`action`) | Método | Parámetros Payload | Propósito | Fallback Offline / Mock |
|---|---|---|---|---|
| `register` | POST | `uid`, `email`, `name`, `role` | Registrar usuario en la hoja de control. | Devuelve status success mock. |
| `savelog` | POST | `atletaId`, `fecha`, `ejercicios[]` | Guardar un registro de entrenamiento completo. | Retorna el número de series guardadas. |
| `saveSeason` | POST | `seasonData` | Guardar o actualizar una temporada. | Genera un ID mock (`mock-{timestamp}`). |
| `saveMesocycle` | POST | `mesoData` | Guardar un bloque de mesociclo. | Genera un ID mock. |
| `saveSession` | POST | `sessionData` | Guardar plantilla de sesión. | Genera un ID mock. |
| `assignSession` | POST | `dateISO`, `sessionData` | Asignar sesión a una fecha. | Retorna status success mock. |
| `savePR` | POST | `prData` | Registrar récord personal. | Retorna status success. |
| `shareSession` | POST | `code`, `sessionData` | Exportar rutina con código compartido. | Guarda en `trainingos_shared_sessions`. |
| `getLogs` | GET | `atleta_id`, `fechaDesde`, `fechaHasta` | Recuperar historial de entrenamientos. | Devuelve array vacío. |
| `getSeasons` | GET | `atleta_id` | Obtener temporadas y mesociclos. | Carga `MOCK_SEASONS` de `mockPlanner.js`. |
| `getSessions` | GET | `atleta_id` | Obtener plantillas del atleta. | Lee `trainingos_session_templates`. |
| `getWorkouts` | GET | `rutina_id` | Obtener rutinas de Excel. | Si no existe en Apps Script, usa `PRESET_ROUTINES`. |
| `getWeekAssignments`| GET | `atleta_id`, `weekStart`, `weekEnd` | Cargar asignaciones de la semana. | Lee `trainingos_week_assignments`. |
| `getPRs` | GET | `atleta_id`, `exercise_id` | Cargar marcas personales. | Devuelve array de filas. |
| `getSharedSession` | GET | `code` | Importar sesión compartida por código.| Busca en `trainingos_shared_sessions`. |
| `saveFeedback` | POST | `sessionId`, `atletaId`, `comment` | Guardar comentario coach-atleta. | Retorna status success. |
| `getFeedback` | GET | `session_id`, `atleta_id` | Recuperar comentarios de sesión. | Lee `trainingos_feedback`. |
| `saveDailyWellness`| POST | `sleep`, `stress`, `doms`, `fatigue` | Sincronizar check-in diario. | Retorna status success. |
| `saveBodyMetrics` | POST | `peso`, `grasa`, `medidas` | Registrar antropometría. | Retorna status success. |

---

## 4. Autenticación con Firebase (`src/config/firebase.js`)
- Inicializa la app de Firebase utilizando variables de entorno (`VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, etc.).
- `AuthContext.jsx` escucha los cambios de autenticación mediante `onAuthStateChanged(auth, callback)`.
- Si Firebase no está configurado o falla la conexión, la aplicación mantiene la sesión activa localmente mediante `localStorage.getItem('trainingos_user_meta')`.
