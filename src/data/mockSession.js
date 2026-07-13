export const MOCK_SESSION = {
  id: 'ses-001',
  name: 'Potencia + Velocidad',
  dayBadge: 'LUNES · GYM',
  blocks: [
    {
      id: 'blk-01',
      name: 'MOVILIDAD DINÁMICA',
      type: 'movilidad',
      duration: '10 min',
      icon: '🔄',
      exercises: [
        { id: 'ex-01-1', orderNumber: '01', name: 'Círculos de cadera', series: '1', reps: '10/lado', notes: 'Rango completo' },
        { id: 'ex-01-2', orderNumber: '02', name: 'Leg swings frontales', series: '1', reps: '10/pierna' },
        { id: 'ex-01-3', orderNumber: '03', name: 'Rotaciones torácicas', series: '1', reps: '8/lado', notes: 'Cuadrupedia' },
        { id: 'ex-01-4', orderNumber: '04', name: 'Sentadilla profunda asistida', reps: '8', notes: 'Agarre a rack' },
      ],
    },
    {
      id: 'blk-02',
      name: 'PLIOMETRÍA',
      type: 'potencia/velocidad',
      duration: '15 min',
      icon: '⚡',
      exercises: [
        { id: 'ex-02-1', orderNumber: '05', name: 'Pogos', series: '3', reps: '15', notes: 'Contacto mínimo en suelo', restSeconds: 45 },
        { id: 'ex-02-2', orderNumber: '06', name: 'Skater jumps reactivos', series: '3', reps: '5/lado', tempo: 'Explosivo', restSeconds: 60 },
        { id: 'ex-02-3', orderNumber: '07', name: 'Split jumps', series: '3', reps: '6', notes: 'Extensión completa cadera', restSeconds: 60 },
        { id: 'ex-02-4', orderNumber: '08', name: 'Med ball slams', series: '2', reps: '8', tempo: 'Máxima Potencia', restSeconds: 60 },
      ],
    },
    {
      id: 'blk-03',
      name: 'FUERZA PRINCIPAL',
      type: 'fuerza',
      duration: '25 min',
      icon: '🏋️',
      exercises: [
        { id: 'ex-03-1', orderNumber: '09', name: 'Sentadilla Trasera', series: '4', reps: '5', tempo: '3-0-X-1', notes: 'RIR 2', restSeconds: 120, suggestedWeight: { min: 70, max: 80 } },
        { id: 'ex-03-2', orderNumber: '10', name: 'Press Banca', series: '4', reps: '5', tempo: '2-1-X-0', restSeconds: 90 },
        { id: 'ex-03-3', orderNumber: '11', name: 'Remo con barra', series: '3', reps: '8', notes: 'Espalda neutra', restSeconds: 90 },
        { id: 'ex-03-4', orderNumber: '12', name: 'Dominadas Supinas', series: '3', reps: 'Al fallo-1', restSeconds: 60 },
      ],
    },
    {
      id: 'blk-04',
      name: 'VUELTA A LA CALMA',
      type: 'cooldown',
      duration: '13 min',
      icon: '🧘',
      exercises: [
        { id: 'ex-04-1', orderNumber: '13', name: 'Bicicleta estática', duration: '8 min', notes: 'Recuperación nivel Z1' },
        { id: 'ex-04-2', orderNumber: '14', name: 'Estiramientos globales', duration: '5 min' },
      ],
    },
  ],
};

export const BLOCK_COLORS = {
  'movilidad':          '#3d7dd4',  // azul
  'fuerza':             '#FF6B00',  // naranja accent
  'potencia/velocidad': '#e8412a',  // rojo
  'potencia':           '#e8412a',  // rojo
  'velocidad':          '#e8412a',  // rojo
  'saco':               '#e67e22',  // naranja oscuro
  'core':               '#27ae60',  // verde
  'pnf':                '#16a085',  // verde azulado
  'meta':               '#d35400',  // marrón naranja
  'tkd':                '#3d7dd4',  // azul
  'cooldown':           '#16a085',  // verde azulado
  'calentamiento':      '#e67e22',  // naranja oscuro
  'principal':          '#FF6B00',  // naranja accent
  'accesorio':          '#1C1C1E',  // negro
  'cardio':             '#27ae60',  // verde
  'vuelta_calma':       '#6E6E73',  // gris
  'circuito':           '#E85D04',  // naranja intenso
};
