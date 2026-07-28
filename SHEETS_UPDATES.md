# TrainingOS — Sheets API Updates (Feedback System)

## New Endpoints

### POST `saveFeedback`

Saves a new feedback comment for a session.

**Payload:**
```json
{
  "action": "saveFeedback",
  "atletaId": "v-atleta-1",
  "id": "fb-1715172000000",
  "sessionId": "session-abc123",
  "atleta_id": "v-atleta-1",
  "autor_id": "coach-1",
  "autor_role": "coach",
  "autor_name": "Víctor",
  "texto": "Buen trabajo en sentadilla, sube 5kg la próxima",
  "valoracion": null,
  "fecha": "2026-05-08T14:00:00.000Z",
  "leido": false
}
```

**Sheet:** `feedback`
**Columns:** `id | session_id | atleta_id | autor_id | autor_role | autor_name | texto | valoracion | fecha | leido`

**Response:**
```json
{ "status": "success", "id": "fb-1715172000000" }
```

---

### POST `markFeedbackRead`

Marks a specific feedback comment as read.

**Payload:**
```json
{
  "action": "markFeedbackRead",
  "atletaId": "v-atleta-1",
  "id": "fb-1715172000000"
}
```

**Action:** Set `leido = true` where `id` matches.

**Response:**
```json
{ "status": "success" }
```

---

### GET `getFeedback`

Retrieves all feedback comments for a specific session and athlete.

**Params:**
```
?action=getFeedback&session_id=session-abc123&atleta_id=v-atleta-1
```

**Response:**
```json
{
  "status": "success",
  "rows": [
    {
      "id": "fb-1715172000000",
      "sessionId": "session-abc123",
      "atletaId": "v-atleta-1",
      "autorId": "coach-1",
      "autorRole": "coach",
      "autorName": "Víctor",
      "texto": "Buen trabajo en sentadilla",
      "valoracion": null,
      "fecha": "2026-05-08T14:00:00.000Z",
      "leido": true
    }
  ]
}
```

---

## Google Apps Script Router

Add to `Code.gs` router:

```javascript
// POST handlers
case 'saveFeedback':
  return saveFeedback(data);
case 'markFeedbackRead':
  return markFeedbackRead(data);

// GET handlers
case 'getFeedback':
  return getFeedback(params.session_id, params.atleta_id);
```

---

## Velocidad Percibida — Nueva Columna en `logs`

**Fecha:** 2026-07-18

### Cambio en modelo de datos

La hoja `logs` necesita una nueva columna:

| Columna | Tipo | Valores |
|---------|------|---------|
| `velocidad_percibida` | `string \| null` | `lenta` / `media` / `rapida` / `null` |

### Ubicación

Dentro de cada serie del array `seriesLog` de cada ejercicio:

```json
{
  "carga": 100,
  "reps": 5,
  "rpe": 8,
  "velocidad": "rapida",
  "done": true
}
```

### Notas

- Campo **completamente opcional** — `null` si el atleta no lo selecciona.
- No bloquea el check de completar serie.
- Se usa por el algoritmo de sugerencia de cargas para ajustar la progresión:
  - `rapida` (🚀) → indica que la carga fue liviana, favorece progresión acelerada.
  - `media` (⚡) → velocidad normal, comportamiento estándar.
  - `lenta` (🐢) → indica esfuerzo máximo cercano al fallo, favorece cautela o reducción.
- Se muestra como emoji en el historial de sesiones (Evolution.jsx).
- La función `saveLog` en `sheets.js` ya envía el objeto completo de serie, no requiere cambios adicionales en el frontend.
