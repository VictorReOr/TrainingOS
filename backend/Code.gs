/**
 * TrainingOS — Backend Google Apps Script
 * doGet + doPost con enrutador por action.
 * Ejecutar initSheets() una vez manualmente para crear las hojas.
 */

// ─── CORS Helper ─────────────────────────────────────────────────────────────
function _corsOutput(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

function _ok(extra) {
  return _corsOutput(Object.assign({ status: 'success' }, extra || {}));
}

function _err(msg) {
  return _corsOutput({ status: 'error', message: msg });
}

// ─── Sheet Helper ─────────────────────────────────────────────────────────────
function _sheet(name) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName(name);
  if (!sh) throw new Error('Hoja no encontrada: ' + name + '. Ejecuta initSheets() primero.');
  return sh;
}

function _sheetData(name) {
  var sh = _sheet(name);
  var data = sh.getDataRange().getValues();
  if (data.length < 2) return [];
  var headers = data[0];
  return data.slice(1).map(function(row) {
    var obj = {};
    headers.forEach(function(h, i) { obj[h] = row[i]; });
    return obj;
  });
}

function _appendRow(sheetName, rowObj) {
  var sh = _sheet(sheetName);
  var headers = sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0];
  var row = headers.map(function(h) { return rowObj[h] !== undefined ? rowObj[h] : ''; });
  sh.appendRow(row);
}


// ─── Firebase ID Token verification ──────────────────────────────────────────
/**
 * Verifica un ID Token de Firebase contra Identity Toolkit.
 * Usa CacheService para evitar re-verificaciones dentro de una ventana de 5 min.
 * Fail-closed: si la verificación falla por cualquier motivo, se rechaza la petición.
 *
 * @param {string} idToken — ID Token JWT de Firebase Auth
 * @returns {string} uid verificado
 * @throws {Error} si el token es ausente, inválido, o expirado
 */
function _verifyIdToken(idToken) {
  if (!idToken) throw new Error('No autorizado: token ausente');

  // ── Cache: evitar re-verificación del mismo token en ráfagas ──
  var cache = CacheService.getScriptCache();
  var cacheKey = 'tok_' + idToken.substring(idToken.length - 40);
  var cached = cache.get(cacheKey);
  if (cached) {
    Logger.log('[Auth] Cache HIT — uid: ' + cached);
    return cached;
  }

  // ── Verificación real contra Firebase Identity Toolkit ──
  var apiKey = PropertiesService.getScriptProperties().getProperty('FIREBASE_WEB_API_KEY');
  if (!apiKey) throw new Error('Config error: FIREBASE_WEB_API_KEY no configurada en ScriptProperties');

  var res = UrlFetchApp.fetch(
    'https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=' + apiKey,
    {
      method: 'post',
      contentType: 'application/json',
      payload: JSON.stringify({ idToken: idToken }),
      muteHttpExceptions: true
    }
  );

  var code = res.getResponseCode();
  if (code !== 200) {
    Logger.log('[Auth] Token inválido — HTTP ' + code + ': ' + res.getContentText());
    throw new Error('No autorizado: token inválido o expirado (HTTP ' + code + ')');
  }

  var body = JSON.parse(res.getContentText());
  if (!body.users || !body.users[0] || !body.users[0].localId) {
    throw new Error('No autorizado: usuario no encontrado en la respuesta de Firebase');
  }

  var uid = body.users[0].localId;
  cache.put(cacheKey, uid, 300); // TTL 5 minutos
  Logger.log('[Auth] Token verificado — uid: ' + uid + ' (cacheado 5min)');
  return uid;
}
// ─── INITIALIZER ─────────────────────────────────────────────────────────────
function initSheets() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();

  var SCHEMAS = {
    'users':             ['uid','email','name','role','created_at'],
    'logs':              ['id','exercise_id','atleta_id','fecha','carga_real','rpe_real','completado'],
    'seasons':           ['id','atleta_id','nombre','deporte','fecha_inicio','fecha_fin','status','created_at'],
    'mesocycles':        ['id','season_id','atleta_id','nombre','tipo','fecha_inicio','semanas','objetivo','color','created_at'],
    'session_templates': ['id','atleta_id','nombre','tipo','deporte','duracion','ejercicios_count','bloques_json','created_at','updated_at'],
    'week_assignments':  ['id','atleta_id','fecha_iso','session_id','session_json','created_at'],
    'prs':               ['id','exercise_id','exercise_name','atleta_id','fecha','valor','carga_real','reps_reales','unidad','created_at'],
    'timer_templates':   ['id','atleta_id','nombre','blocks_json','created_at'],
    'workouts':          ['rutina_id','coach_id','sessionName','dia','bloque','grupo_muscular','tipo','ejercicio','series','repeticiones','tiempo_ejecucion','tiempo_descanso','superSerie'],
    'routine_assignments': ['id','rutina_id','coach_id','atleta_id','active','assigned_at'],
    'wellness_logs':     ['id','atleta_id','fecha','sleep','stress','doms','fatigue'],
    'performance_tests': ['id','atleta_id','fecha','tipo','valor','valor_original','unidad'],
    'body_metrics':      ['id','atleta_id','fecha','peso','grasa','medidaCintura','medidaBrazo','medidaMuslo']
  };

  Object.keys(SCHEMAS).forEach(function(name) {
    var sh = ss.getSheetByName(name);
    if (!sh) {
      sh = ss.insertSheet(name);
      Logger.log('Creada hoja: ' + name);
    }
    // Solo escribe cabeceras si la hoja está vacía
    if (sh.getLastRow() === 0) {
      var headers = SCHEMAS[name];
      sh.getRange(1, 1, 1, headers.length).setValues([headers]);
      sh.getRange(1, 1, 1, headers.length)
        .setBackground('#1a1f2e')
        .setFontColor('#ffffff')
        .setFontWeight('bold');
      sh.setFrozenRows(1);
      Logger.log('Cabeceras escritas en: ' + name);
    }
  });

  Logger.log('initSheets completado correctamente.');
}

// ─── doPost ───────────────────────────────────────────────────────────────────
function doPost(e) {
  try {
    var payload = JSON.parse(e.postData.contents);
    var action  = payload.action;
    var now     = new Date().toISOString();

    // ── Verificación de identidad (todas las acciones) ──
    var uid = _verifyIdToken(payload.idToken);

    if (action === 'register') {
      var email = (payload.email || '').toLowerCase().trim();
      // uid viene del token verificado, NO del payload
      if (!email || !uid) return _err('Faltan datos obligatorios (email, uid)');
      
      var existing = _sheetData('users').filter(function(u) { return u.uid === uid || u.email === email; });
      if (existing.length > 0) return _err('El usuario ya está registrado en la base de datos');

      _appendRow('users', {
        uid:           uid,
        email:         email,
        name:          payload.name || 'Atleta',
        role:          payload.role || 'athlete',
        created_at:    now
      });
      return _ok({ user: { id: uid, email: email, name: payload.name || 'Atleta', role: payload.role || 'athlete' } });
    }

    if (action === 'savelog') {
      // Cat. A: atletaId = uid verificado (ignora payload.atletaId)
      var fecha    = payload.fecha || now;
      var rows     = [];
      (payload.ejercicios || []).forEach(function(ex) {
        (ex.seriesLog || []).forEach(function(set) {
          rows.push({
            id:           Utilities.getUuid(),
            exercise_id:  ex.id,
            atleta_id:    uid,
            fecha:        fecha,
            carga_real:   set.carga || 0,
            rpe_real:     set.rpe   || '',
            completado:   set.done  ? 1 : 0,
          });
        });
      });
      rows.forEach(function(r) { _appendRow('logs', r); });
      return _ok({ saved: rows.length });
    }

    if (action === 'saveSeason') {
      var id = Utilities.getUuid();
      _appendRow('seasons', {
        id:          id,
        atleta_id:   uid,
        nombre:      payload.nombre   || payload.name || '',
        deporte:     payload.deporte  || payload.sport || '',
        fecha_inicio: payload.fechaInicio || payload.startDate || '',
        fecha_fin:   payload.fechaFin    || payload.endDate   || '',
        status:      payload.status      || 'upcoming',
        created_at:  now,
      });
      return _ok({ id: id });
    }

    if (action === 'saveMesocycle') {
      var id = Utilities.getUuid();
      _appendRow('mesocycles', {
        id:          id,
        season_id:   payload.seasonId || '',
        atleta_id:   uid,
        nombre:      payload.nombre   || payload.name  || '',
        tipo:        payload.tipo     || payload.type  || '',
        fecha_inicio: payload.fechaInicio || payload.startDate || '',
        semanas:     payload.semanas  || payload.weeks || 0,
        objetivo:    payload.objetivo || payload.objective || '',
        color:       payload.color    || '',
        created_at:  now,
      });
      return _ok({ id: id });
    }

    if (action === 'saveSession') {
      var id = payload.id || Utilities.getUuid();
      _appendRow('session_templates', {
        id:              id,
        atleta_id:       uid,
        nombre:          payload.nombre     || payload.name  || '',
        tipo:            payload.tipo       || payload.type  || '',
        deporte:         payload.deporte    || payload.sport || '',
        duracion:        payload.duration   || 0,
        ejercicios_count: payload.exercises || 0,
        bloques_json:    JSON.stringify(payload.blocks || []),
        created_at:      payload.createdAt  || now,
        updated_at:      now,
      });
      return _ok({ id: id });
    }

    if (action === 'assignSession') {
      var id = Utilities.getUuid();
      _appendRow('week_assignments', {
        id:           id,
        atleta_id:    uid,
        fecha_iso:    payload.dateISO    || '',
        session_id:   payload.sessionId  || '',
        session_json: JSON.stringify(payload.sessionData || {}),
        created_at:   now,
      });
      return _ok({ id: id });
    }

    if (action === 'savePR') {
      var id = Utilities.getUuid();
      _appendRow('prs', {
        id:            id,
        exercise_id:   payload.exerciseId   || '',
        exercise_name: payload.exerciseName || '',
        atleta_id:     uid,
        fecha:         payload.fecha        || now,
        valor:         payload.valor        || 0,
        carga_real:    payload.cargaReal    || 0,
        reps_reales:   payload.repsReales   || 0,
        unidad:        payload.unidad       || 'kg',
        created_at:    now,
      });
      return _ok({ id: id });
    }

    if (action === 'saveTimerTemplate') {
      var id = payload.id || Utilities.getUuid();
      _appendRow('timer_templates', {
        id:          id,
        atleta_id:   uid,
        nombre:      payload.nombre   || payload.name   || '',
        blocks_json: JSON.stringify(payload.blocks      || []),
        created_at:  now,
      });
      return _ok({ id: id });
    }

    if (action === 'saveDailyWellness') {
      var id = payload.id || Utilities.getUuid();
      _appendRow('wellness_logs', {
        id:          id,
        atleta_id:   uid,
        fecha:       payload.fecha || now,
        sleep:       payload.sleep || 5,
        stress:      payload.stress || 5,
        doms:        payload.doms || 5,
        fatigue:     payload.fatigue || 5
      });
      return _ok({ id: id });
    }

    if (action === 'saveTestRecord') {
      var id = payload.id || Utilities.getUuid();
      _appendRow('performance_tests', {
        id:             id,
        atleta_id:      uid,
        fecha:          payload.fecha || now,
        tipo:           payload.tipo || '',
        valor:          payload.valor || 0,
        valor_original: payload.valorOriginal || '',
        unidad:         payload.unidad || ''
      });
      return _ok({ id: id });
    }

    if (action === 'saveBodyMetrics') {
      var id = payload.id || Utilities.getUuid();
      _appendRow('body_metrics', {
        id:             id,
        atleta_id:      uid,
        fecha:          payload.fecha || now,
        peso:           payload.peso || 0,
        grasa:          payload.grasa || '',
        medidaCintura:  payload.medidaCintura || '',
        medidaBrazo:    payload.medidaBrazo || '',
        medidaMuslo:    payload.medidaMuslo || ''
      });
      return _ok({ id: id });
    }

    if (action === 'saveWorkouts') {
      // Cat. A (reclasificado): coach_id = uid verificado
      var rutinaId = payload.rutinaId || '';
      if (!rutinaId) return _err('Falta rutinaId');

      var sh = _sheet('workouts');
      var data = sh.getDataRange().getValues();
      var headers = data[0];
      var rutinaIdCol = headers.indexOf('rutina_id');
      var coachIdCol  = headers.indexOf('coach_id');
      for (var i = data.length - 1; i >= 1; i--) {
        if (data[i][rutinaIdCol] === rutinaId && data[i][coachIdCol] === uid) {
          sh.deleteRow(i + 1);
        }
      }

      var rows = payload.rows || [];
      rows.forEach(function(r) {
        _appendRow('workouts', Object.assign({}, r, { rutina_id: rutinaId, coach_id: uid }));
      });

      return _ok({ saved: rows.length });
    }

    if (action === 'assignRoutine') {
      // Cat. B: coach_id = uid verificado, atletaIds validados contra tabla users
      // TODO: Pendiente sistema de invitación mutua coach-atleta (ver ROADMAP.md Fase 5)
      // Mitigación temporal: se permite asignar a cualquier usuario registrado en la tabla 'users'.
      // La solución final requiere que el atleta acepte una invitación del coach.
      var rutinaId  = payload.rutinaId || '';
      var atletaIds = payload.atletaIds || [];

      // Validar que todos los atletaIds existen como usuarios reales registrados
      var allUsers = _sheetData('users');
      var validUids = {};
      allUsers.forEach(function(u) { validUids[u.uid] = true; });
      var invalidIds = atletaIds.filter(function(aid) { return !validUids[aid]; });
      if (invalidIds.length > 0) {
        return _err('atletaIds no registrados: ' + invalidIds.join(', ') + ' — solo se puede asignar a usuarios con cuenta real');
      }

      var results = [];
      atletaIds.forEach(function(aid) {
        var id = Utilities.getUuid();
        _appendRow('routine_assignments', {
          id: id, rutina_id: rutinaId, coach_id: uid,
          atleta_id: aid, active: false, assigned_at: now,
        });
        results.push(id);
      });
      return _ok({ ids: results });
    }

    if (action === 'activateRoutine') {
      // Cat. B: solo operar sobre filas donde coach_id = uid verificado
      // TODO: Pendiente sistema de invitación mutua coach-atleta (ver ROADMAP.md Fase 5)
      // Mitigación temporal: un coach solo puede activar/desactivar asignaciones que él mismo creó.
      var assignmentId = payload.assignmentId || '';
      var atletaId = payload.atletaId || '';
      var sh = _sheet('routine_assignments');
      var data = sh.getDataRange().getValues();
      var headers = data[0];
      var idCol = headers.indexOf('id');
      var atletaCol = headers.indexOf('atleta_id');
      var activeCol = headers.indexOf('active');
      var coachCol  = headers.indexOf('coach_id');
      var modified = 0;
      for (var i = 1; i < data.length; i++) {
        // Solo modifica filas que pertenecen a ESTE coach verificado
        if (data[i][atletaCol] === atletaId && data[i][coachCol] === uid) {
          var shouldBeActive = (data[i][idCol] === assignmentId);
          sh.getRange(i + 1, activeCol + 1).setValue(shouldBeActive);
          modified++;
        }
      }
      if (modified === 0) {
        return _err('No se encontraron asignaciones de este coach para el atleta indicado');
      }
      return _ok({ activated: assignmentId });
    }

    return _err('Acción POST desconocida: ' + action);

  } catch(err) {
    return _err(err.toString());
  }
}

// ─── Workouts sheet reader (getDisplayValues para columnas de texto libre) ─────
/**
 * Lee la hoja 'workouts' usando dos pasadas:
 *   - getValues()        → columnas de identidad (pueden ser número/texto normal)
 *   - getDisplayValues() → columnas de texto libre (series, repeticiones,
 *                          tiempo_ejecucion, tiempo_descanso) que Google Sheets
 *                          podría autoconvertir a Date si coinciden con un
 *                          patrón de fecha (ej: "8-10" → 8 oct).
 *
 * getDisplayValues() siempre devuelve el string tal como aparece visualmente
 * en la celda, inmune a la autoconversión de tipo.
 */
function _sheetDataWorkouts() {
  var sh = _sheet('workouts');
  var lastRow = sh.getLastRow();
  var lastCol = sh.getLastColumn();

  if (lastRow < 2 || lastCol < 1) return [];

  // Cabeceras (fila 1)
  var headers = sh.getRange(1, 1, 1, lastCol).getValues()[0];

  // Columnas de texto libre susceptibles de autoconversión de fecha en Sheets.
  // Ajustar si la hoja cambia de estructura.
  var TEXT_FREE_COLS = ['series', 'repeticiones', 'tiempo_ejecucion', 'tiempo_descanso'];

  // Dos lecturas sobre el mismo rango de datos (filas 2..N)
  var valuesRaw   = sh.getRange(2, 1, lastRow - 1, lastCol).getValues();       // tipado
  var displayRaw  = sh.getRange(2, 1, lastRow - 1, lastCol).getDisplayValues(); // siempre string

  return valuesRaw.map(function(row, rowIdx) {
    var obj = {};
    headers.forEach(function(h, colIdx) {
      if (TEXT_FREE_COLS.indexOf(h) !== -1) {
        // Usar el valor visual para estas columnas
        obj[h] = displayRaw[rowIdx][colIdx];
      } else {
        obj[h] = row[colIdx];
      }
    });
    return obj;
  });
}

// ─── doGet ────────────────────────────────────────────────────────────────────
function doGet(e) {
  try {
    var p      = e.parameter || {};
    var action = p.action;

    // ── Verificación de identidad (todas las acciones) ──
    var uid = _verifyIdToken(p.id_token);

    if (action === 'getLogs') {
      // Cat. A: atleta = uid verificado (ignora p.atleta_id)
      var rows = _sheetData('logs').filter(function(r) {
        if (r.atleta_id !== uid) return false;
        if (p.fechaDesde && r.fecha < p.fechaDesde) return false;
        if (p.fechaHasta && r.fecha > p.fechaHasta) return false;
        return true;
      });
      return _ok({ rows: rows });
    }

    if (action === 'getSeasons') {
      var seasons = _sheetData('seasons').filter(function(r) {
        return r.atleta_id === uid;
      });
      var mesoAll = _sheetData('mesocycles').filter(function(r) {
        return r.atleta_id === uid;
      });
      seasons.forEach(function(s) {
        s.mesocycles = mesoAll.filter(function(m) { return m.season_id === s.id; });
      });
      return _ok({ rows: seasons });
    }

    if (action === 'getSessions') {
      var rows = _sheetData('session_templates').filter(function(r) {
        return r.atleta_id === uid;
      }).map(function(r) {
        try { r.blocks = JSON.parse(r.bloques_json || '[]'); } catch(e) { r.blocks = []; }
        return r;
      });
      return _ok({ rows: rows });
    }

    if (action === 'getWeekAssignments') {
      var rows = _sheetData('week_assignments').filter(function(r) {
        if (r.atleta_id !== uid) return false;
        if (p.weekStart && r.fecha_iso < p.weekStart) return false;
        if (p.weekEnd   && r.fecha_iso > p.weekEnd)   return false;
        return true;
      }).map(function(r) {
        try { r.sessionData = JSON.parse(r.session_json || '{}'); } catch(e) { r.sessionData = {}; }
        return r;
      });
      return _ok({ rows: rows });
    }

    if (action === 'getPRs') {
      var rows = _sheetData('prs').filter(function(r) {
        if (r.atleta_id !== uid) return false;
        if (p.exercise_id && r.exercise_id !== p.exercise_id) return false;
        return true;
      });
      return _ok({ rows: rows });
    }

    if (action === 'getWorkouts') {
      // Cat. A (reclasificado): coach_id = uid verificado
      var rutinaIdParam = p.rutina_id ? String(p.rutina_id).trim() : '';

      var allRows = _sheetDataWorkouts();

      var rows = allRows.filter(function(r) {
        var rowRutinaId = String(r.rutina_id || '').trim();
        var rowCoachId  = String(r.coach_id  || '').trim();

        if (rutinaIdParam) {
          if (rowRutinaId !== rutinaIdParam) return false;
          return true;
        }

        // Sin rutina_id, filtrar por coach_id = uid verificado
        return rowCoachId === uid;
      });

      return _ok({ rows: rows });
    }

    if (action === 'getRoutineAssignments') {
      var rows = _sheetData('routine_assignments').filter(function(r) {
        return r.atleta_id === uid;
      });
      return _ok({ rows: rows });
    }

    if (action === 'getSharedSession') {
      // Shared sessions are public by code — no atleta_id filtering needed
      // But still require a valid token to prevent anonymous abuse
      var code = p.code || '';
      // This action doesn't filter by atleta_id, it's a shared resource by code
      // For now, just verify the user is authenticated (token already verified above)
      return _err('getSharedSession no implementada en backend real — solo mock');
    }

    return _err('Acción GET desconocida: ' + action);

  } catch(err) {
    return _err(err.toString());
  }
}


