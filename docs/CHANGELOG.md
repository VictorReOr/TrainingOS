# CHANGELOG — TrainingOS

Todos los cambios notables en este proyecto están documentados en este archivo.

---

## [2.0.0] - 2026-07-28
### Añadido
- **Fase 4 - UI del Performance Engine**:
  - Creado componente `TrafficLightBadge.jsx` con tres tamaños (`sm`, `md`, `lg`) y animación pulse.
  - Creado componente `IndexCard.jsx` para la visualización individual de los 6 índices de rendimiento.
  - Creado componente `RecommendationCard.jsx` con sistema de prioridades (1 a 5) y acciones de entrenador.
  - Creado componente `ColdStartBanner.jsx` para el seguimiento de la fase de aprendizaje (sesión 1 a 5).
  - Creado modal `WellnessCheckIn.jsx` para el check-in diario de bienestar con botones emoji interactivos.
  - Creada la nueva pantalla `/performance` (`PerformanceDashboard.jsx`) con el semáforo global, métricas, recomendaciones y estado de datos.
  - Integrado el semáforo de sobrecarga progresiva por ejercicio en `SetLoggerSheet.jsx`.
- **Fase 3 - React Integration & Event Driven Sync**:
  - Creado el hook bridge `usePerformanceEngine.js` con suscripción a eventos `session_logs_updated`, `new_session_saved` y `storage`.
  - Creado `inputBuilder.js` para la conversión automática entre estados de React Context y el DTO `PerformanceInput`.
  - Añadido el atributo `performanceEngine` y la función `togglePerformanceEngine` en `AthleteContext.jsx`.
  - Actualizado `SessionContext.jsx` para persistir los entrenamientos completados en `localStorage.getItem('trainingos_session_logs')` y emitir el evento `session_logs_updated`.

---

## [1.2.0] - 2026-07-27
### Añadido
- **Fase 2 - Oleada 2 del Performance Engine**:
  - Implementado `progressionIndex.js` (IP) para el cálculo de tendencias por ejercicio y detección de estancamiento.
  - Implementado `patternBalanceIndex.js` (IPB) para la evaluación de desequilibrios Push:Pull, Knee:Hip y Bilateral:Unilateral.
  - Implementado `sportTransferIndex.js` (ITD) para medir la transferencia específica a Taekwondo en 4 pilares.
  - Implementado `decisionEngine.js` para la consolidación del semáforo global y generación de recomendaciones.
  - Actualizado `engineCore.js` para orquestar la ejecución secuencial en 2 oleadas y aplicar la atenuación de Cold Start.
  - suite de tests `smoke.test.js` ampliada con 52 casos de prueba aprobados.

---

## [1.1.0] - 2026-07-26
### Añadido
- **Fase 1 - Core puro del Performance Engine**:
  - Estructuración del directorio `src/engine/performance/`.
  - Implementado `fatigueIndex.js` (IFS) con modelo de decaimiento exponencial (`decay.js`).
  - Implementado `recoveryIndex.js` (IR) evaluando marcadores de bienestar.
  - Implementado `stimulusIndex.js` (IEM) midiendo volumen efectivo contra umbrales MEV.
  - Creado `performanceConfig.js` centralizando constantes del motor.
  - Creado `smoke.test.js` ejecutable directamente en Node.js.
- **Enriquecimiento de la Librería de Ejercicios**:
  - Actualizado `exerciseLibrary.js` (35 ejercicios) añadiendo los campos `pattern`, `systemicCost`, `sportTransfer` y `priority`.
  - Creado `exerciseMetadata.js` para gestionar overrides de entrenador.

---

## [1.0.0] - 2026-07-25
### Añadido
- Versión inicial de **TrainingOS**:
  - Interfaz de usuario con Tailwind CSS y tipografías `Barlow Condensed` + `Outfit`.
  - Sistema de navegación por rutas (`Home`, `Plan`, `Session`, `Evolution`, `TimerPage`, `Profile`, `CoachDashboard`).
  - Integración de autenticación con Firebase.
  - Capa de red con Google Sheets API (`src/services/sheets.js`).
  - Cronómetro de circuito y temporizadores de descanso (`TimerContext` & `CircuitContext`).
