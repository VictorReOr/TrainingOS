import * as XLSX from 'xlsx';

/**
 * Lee un archivo .xlsx o .csv y lo convierte en array de objetos fila,
 * con las claves exactas que espera parseWorkouts().
 * @param {File} file
 * @returns {Promise<Array<object>>}
 */
export async function fileToRows(file) {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: 'array' });
  const firstSheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[firstSheetName];
  const rows = XLSX.utils.sheet_to_json(sheet, { defval: '' });
  return rows;
}

/**
 * Genera y descarga un archivo .xlsx con las columnas de plantilla requeridas
 * y una fila de ejemplo para orientar al entrenador.
 */
export function downloadWorkoutTemplate() {
  const headers = [
    'rutina_id',
    'sessionName',
    'dia',
    'bloque',
    'grupo_muscular',
    'tipo',
    'ejercicio',
    'series',
    'repeticiones',
    'tiempo_ejecucion',
    'tiempo_descanso',
    'superSerie'
  ];
  const example = [
    'Pretemporada',
    'Fuerza A',
    'Lunes',
    'A',
    'Pierna',
    'Fuerza',
    'Sentadilla Trasera',
    4,
    '4-6',
    '2-0-X-1',
    180,
    ''
  ];
  const ws = XLSX.utils.aoa_to_sheet([headers, example]);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Rutina');
  XLSX.writeFile(wb, 'plantilla-trainingos.xlsx');
}
