# SHEETS_SETUP.md — Configuración del Backend: Google Sheets

Guía completa para conectar TrainingOS a Google Sheets via Google Apps Script.

---

## Requisitos previos
- Cuenta de Google (la misma que uses para desarrollar)
- Proyecto TrainingOS corriendo en local (`npm run dev`)

---

## Paso 1 — Crear el documento base

1. Ve a [Google Sheets](https://sheets.google.com).
2. Crea una **hoja de cálculo en blanco**.
3. Ponle un nombre reconocible: **`TrainingOS Backend`**.

---

## Paso 2 — Pegar el código del servidor

1. Con la hoja abierta, ve al menú: **Extensiones > Apps Script**.
2. Se abre una nueva pestaña con el editor de código (archivo `Código.gs`).
3. **Borra** todo el contenido que haya.
4. Abre el archivo `backend/Code.gs` de este proyecto.
5. Copia **todo** su contenido y pégalo en el editor de Apps Script.
6. Guarda con `Ctrl+S` (o el icono del disquete 💾).

---

## Paso 3 — Inicializar las hojas (solo una vez)

1. En el editor de Apps Script, localiza el **selector de función** en la barra de herramientas (desplegable junto al botón Ejecutar).
2. Selecciona la función **`initSheets`**.
3. Pulsa el botón **Ejecutar ▶️**.
4. Aparecerá un aviso de **Autorización necesaria**:
   - Pulsa **Revisar permisos**.
   - Selecciona tu cuenta de Google.
   - Si Google advierte que la app "no está verificada":
     → Pulsa **Opciones avanzadas** → **Ir al proyecto (inseguro)**.
   - Pulsa **Permitir**.
5. Espera la confirmación en el log inferior del editor.

### Resultado esperado
Vuelve a tu hoja de cálculo. Verás **7 pestañas** creadas automáticamente:

| Pestaña | Contenido |
|---|---|
| `logs` | Registros de series por sesión |
| `seasons` | Temporadas del atleta |
| `mesocycles` | Mesociclos dentro de temporadas |
| `session_templates` | Plantillas de sesión creadas en el constructor |
| `week_assignments` | Sesiones asignadas a días del calendario |
| `prs` | Récords personales |
| `timer_templates` | Plantillas del timer/circuito |

Cada pestaña tendrá una fila de cabecera en color oscuro y las columnas fijas. **No borres ni renombres estas pestañas.**

---

## Paso 4 — Desplegar como API Web

1. En el editor de Apps Script, pulsa el botón azul **Implementar** (arriba a la derecha).
2. Selecciona **Nueva implementación**.
3. Pulsa el icono **⚙️** → elige **Aplicación web**.
4. Configura **EXACTAMENTE** así:

   | Campo | Valor requerido |
   |---|---|
   | Descripción | `TrainingOS API v1` |
   | Ejecutar como | **Yo mismo** |
   | Quién tiene acceso | ⚠️ **Cualquier persona** |

   > **CRÍTICO**: Si seleccionas cualquier otra opción de acceso, React recibirá un error CORS y no podrá comunicarse con el backend.

5. Pulsa **Implementar**.
6. **Copia la URL** de la aplicación web que aparece (formato: `https://script.google.com/macros/s/AKfycb.../exec`).

---

## Paso 5 — Conectar el frontend

1. Abre el archivo `.env.local` en la raíz del proyecto TrainingOS.
2. Actualiza estas variables:

```env
# URL copiada en el paso 4
VITE_SHEETS_API_URL=https://script.google.com/macros/s/TU_ID_AQUI/exec

# Cambia a false para activar la escritura real
VITE_USE_MOCK=false

# Tu identificador de atleta (puede ser cualquier string)
VITE_ATLETA_ID=v-atleta-1
```

3. **Reinicia el servidor de desarrollo**:
   ```bash
   # Ctrl+C para parar, luego:
   npm run dev
   ```

4. Abre la app y crea una temporada o asigna una sesión a un día.
5. Abre la consola del navegador (`F12`). Verás mensajes como:
   ```
   [Sheets] saveSeason → ok  season-1711891234567
   [Sheets] assignSession → ok  5e8b2a3f-...
   ```
6. Comprueba en tu Google Sheet que aparecen las filas.

---

## Paso 6 — Futuras actualizaciones del código `Code.gs`

> ⚠️ Si modificas `Code.gs`, la URL **no se actualiza automáticamente**.

1. En el editor de Apps Script: **Implementar > Gestionar implementaciones**.
2. Pulsa el **lápiz ✏️** de tu implementación activa.
3. En el desplegable **Versión** selecciona **"Nueva versión"**.
4. Escribe una nota (ej: `"Añadida acción deleteSeason"`).
5. Pulsa **Implementar**. La misma URL ejecutará el código nuevo.

---

## Referencia de endpoints

### POST — escritura de datos
Todos los POST van a la misma URL con `Content-Type: text/plain` (evita CORS preflight).

| `action` | Datos requeridos | Hoja destino |
|---|---|---|
| `savelog` | `atletaId, fecha, ejercicios[]` | `logs` |
| `saveSeason` | `nombre, deporte, fechaInicio, fechaFin, status` | `seasons` |
| `saveMesocycle` | `seasonId, nombre, tipo, fechaInicio, semanas` | `mesocycles` |
| `saveSession` | `nombre, tipo, bloques_json, ejercicios_count` | `session_templates` |
| `assignSession` | `dateISO, sessionId, sessionData` | `week_assignments` |
| `savePR` | `exerciseId, exerciseName, valor, unidad` | `prs` |
| `saveTimerTemplate` | `nombre, blocks_json` | `timer_templates` |

### GET — lectura de datos
Todos los GET van con query params `?action=...&atleta_id=...`

| `action` | Params opcionales | Devuelve |
|---|---|---|
| `getLogs` | `fechaDesde`, `fechaHasta` | Array de registros de series |
| `getSeasons` | — | Temporadas con mesociclos anidados |
| `getSessions` | — | Todas las plantillas del atleta |
| `getWeekAssignments` | `weekStart`, `weekEnd` | Asignaciones de la semana |
| `getPRs` | `exercise_id` | Récords personales |

---

## Solución de problemas frecuentes

| Síntoma | Causa | Solución |
|---|---|---|
| `CORS error` en consola | Acceso configurado como "Solo yo" | Vuelve a desplegar con "Cualquier persona" |
| `[Sheets] Timeout (8s)` | URL incorrecta o Apps Script con error | Verifica la URL en `.env.local` y los logs del editor de Apps Script |
| Datos no aparecen en Sheets | `VITE_USE_MOCK=true` activo | Cambia a `false` y reinicia `npm run dev` |
| Hoja no encontrada | `initSheets()` no ejecutado | Ejecuta `initSheets()` manualmente en el editor |
| Versión cacheada de código | No se hizo "Nueva versión" al reimplementar | Reimplementa con "Nueva versión" (ver Paso 6) |
