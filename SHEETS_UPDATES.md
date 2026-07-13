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
