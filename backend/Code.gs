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
    'workouts':          ['rutina_id','dia','bloque','grupo_muscular','tipo','ejercicio','series','repeticiones','tiempo_ejecucion','tiempo_descanso'],
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

    if (action === 'register') {
      var email = (payload.email || '').toLowerCase().trim();
      var uid = payload.uid;
      
      if (!email || !uid) return _err('Faltan datos obligatorios (email, uid)');
      
      // Comprobar si ya existe
      var existing = _sheetData('users').filter(function(u) { return u.uid === uid || u.email === email; });
      if (existing.length > 0) return _err('El usuario ya está registrado en la base de datos');

      _appendRow('users', {
        uid:           uid,
        email:         email,
        name:          payload.name || 'Atleta',
        role:          payload.role || 'athlete', // athlete, coach, both
        created_at:    now
      });
      return _ok({ user: { id: uid, email: email, name: payload.name || 'Atleta', role: payload.role || 'athlete' } });
    }

    if (action === 'savelog') {
      var atletaId = payload.atletaId || 'unknown';
      var fecha    = payload.fecha || now;
      var rows     = [];
      (payload.ejercicios || []).forEach(function(ex) {
        (ex.seriesLog || []).forEach(function(set) {
          rows.push({
            id:           Utilities.getUuid(),
            exercise_id:  ex.id,
            atleta_id:    atletaId,
            fecha:        fecha,
            carga_real:   set.carga || 0,
            rpe_real:     set.rpe   || '',
            completado:   set.done  ? 1 : 0,
          });
        });
      });
      var sh = _sheet('logs');
      rows.forEach(function(r) { _appendRow('logs', r); });
      return _ok({ saved: rows.length });
    }

    if (action === 'saveSeason') {
      var id = Utilities.getUuid();
      _appendRow('seasons', {
        id:          id,
        atleta_id:   payload.atletaId || 'unknown',
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
        atleta_id:   payload.atletaId || 'unknown',
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
        atleta_id:       payload.atletaId   || 'unknown',
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
        atleta_id:    payload.atletaId   || 'unknown',
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
        atleta_id:     payload.atletaId     || 'unknown',
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
        atleta_id:   payload.atletaId || 'unknown',
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
        atleta_id:   payload.atletaId || 'unknown',
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
        atleta_id:      payload.atletaId || 'unknown',
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
        atleta_id:      payload.atletaId || 'unknown',
        fecha:          payload.fecha || now,
        peso:           payload.peso || 0,
        grasa:          payload.grasa || '',
        medidaCintura:  payload.medidaCintura || '',
        medidaBrazo:    payload.medidaBrazo || '',
        medidaMuslo:    payload.medidaMuslo || ''
      });
      return _ok({ id: id });
    }

    return _err('Acción POST desconocida: ' + action);

  } catch(err) {
    return _err(err.toString());
  }
}

// ─── doGet ────────────────────────────────────────────────────────────────────
function doGet(e) {
  try {
    var p      = e.parameter || {};
    var action = p.action;
    var atleta = p.atleta_id || 'unknown';

    if (action === 'getLogs') {
      var rows = _sheetData('logs').filter(function(r) {
        if (r.atleta_id !== atleta) return false;
        if (p.fechaDesde && r.fecha < p.fechaDesde) return false;
        if (p.fechaHasta && r.fecha > p.fechaHasta) return false;
        return true;
      });
      return _ok({ rows: rows });
    }

    if (action === 'getSeasons') {
      var seasons = _sheetData('seasons').filter(function(r) {
        return r.atleta_id === atleta;
      });
      var mesoAll = _sheetData('mesocycles').filter(function(r) {
        return r.atleta_id === atleta;
      });
      // Anidar mesociclos dentro de cada temporada
      seasons.forEach(function(s) {
        s.mesocycles = mesoAll.filter(function(m) { return m.season_id === s.id; });
      });
      return _ok({ rows: seasons });
    }

    if (action === 'getSessions') {
      var rows = _sheetData('session_templates').filter(function(r) {
        return r.atleta_id === atleta;
      }).map(function(r) {
        try { r.blocks = JSON.parse(r.bloques_json || '[]'); } catch(e) { r.blocks = []; }
        return r;
      });
      return _ok({ rows: rows });
    }

    if (action === 'getWeekAssignments') {
      var rows = _sheetData('week_assignments').filter(function(r) {
        if (r.atleta_id !== atleta) return false;
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
        if (r.atleta_id !== atleta) return false;
        if (p.exercise_id && r.exercise_id !== p.exercise_id) return false;
        return true;
      });
      return _ok({ rows: rows });
    }

    if (action === 'getWorkouts') {
      var rows = _sheetData('workouts').filter(function(r) {
        // Por ahora devolveremos todos, o filtrar por rutina_id si se pasa
        if (p.rutina_id && r.rutina_id !== p.rutina_id) return false;
        return true;
      });
      return _ok({ rows: rows });
    }

    return _err('Acción GET desconocida: ' + action);

  } catch(err) {
    return _err(err.toString());
  }
}


