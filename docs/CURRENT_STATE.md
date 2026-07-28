# CURRENT STATE — AUDIT & DIAGNOSIS

## 1. Funcionalidades Implementadas (100% Operativas)
- **Performance Engine Core (Fases 1 y 2)**:
  - Oleada 1: Fatiga Sistémica (`IFS`), Recuperación (`IR`), Estímulo Muscular (`IEM`).
  - Oleada 2: Progresión por ejercicio (`IP`), Equilibrio de Patrones (`IPB`), Transferencia TKD (`ITD`).
  - Decision Engine: Semáforo global (`green`/`yellow`/`red`), recomendaciones priorizadas (1 a 5), deltas de carga por ejercicio.
  - Test de humo automático (`smoke.test.js`) con 100% de éxito.
- **Integración React (Fase 3)**:
  - Hook `usePerformanceEngine` reactivo con listener de eventos `session_logs_updated` y `storage`.
  - DTO Adapter `inputBuilder.js` completamente adaptado al modelo de `ReadinessContext`.
  - Configuración de activación/desactivación del motor por atleta en `AthleteContext.jsx`.
- **UI & Dashboard (Fase 4)**:
  - Componentes `TrafficLightBadge`, `IndexCard`, `RecommendationCard`, `ColdStartBanner`, `WellnessCheckIn`.
  - Nueva ruta y pantalla `/performance` (`PerformanceDashboard.jsx`).
  - Integración del semáforo por ejercicio en `SetLoggerSheet.jsx` (+2.5kg sugerido).
- **Planificador & Diario**:
  - Gestión de temporadas, mesociclos y plantillas.
  - Registro de series con carga, reps, RPE, velocidad percibida y calidad técnica.
  - Cronómetro de descanso y reproductor de circuitos por bloques (`TimerContext` & `CircuitContext`).

---

## 2. Funcionalidades Parcialmente Implementadas
- **Sincronización con Google Sheets (`src/services/sheets.js`)**:
  - Funciona correctamente la persistencia local de `savelog`, `saveDailyWellness` y `savePR`.
  - **Pendiente en el Apps Script remoto**: La acción `getWorkouts` no está implementada en el servidor de Apps Script de Google Sheets. *Solucionado mediante fallback automático a `PRESET_ROUTINES` en `Plan.jsx`*.
- **Modo Entrenador (`CoachDashboard.jsx` & `AthleteDetail.jsx`)**:
  - La interfaz de navegación de entrenadores está creada y protegida por `CoachRoute`.
  - Falta la edición remota bidireccional en tiempo real de perfiles de atletas desde la vista del coach.

---

## 3. Funcionalidades Pendientes
1. **Notificaciones Push PWA**: Alertas en el dispositivo móvil cuando el nivel de recuperación es crítico.
2. **Exportación de Informes**: Generación de PDFs/Excel con los informes semanales del Performance Engine.
3. **Integración con Salud Nativa**: Conexión con Apple Health / Google Fit para importar datos reales de sueño y HRV.

---

## 4. Archivos Más Importantes de la Aplicación

| Archivo | Propósito | Nivel de Importancia |
|---|---|---|
| `src/engine/performance/core/engineCore.js` | Orquestador principal del motor de rendimiento. | 🔥 CRÍTICO |
| `src/engine/performance/core/decisionEngine.js` | Motor de síntesis de decisiones y semáforo global. | 🔥 CRÍTICO |
| `src/hooks/usePerformanceEngine.js` | Hook adaptador entre React y el motor analítico. | 🔥 CRÍTICO |
| `src/engine/performance/utils/inputBuilder.js` | Transformador de datos de contextos al DTO de entrada. | ⚡ ALTO |
| `src/context/SessionContext.jsx` | Gestor de la sesión activa y almacenamiento de logs. | ⚡ ALTO |
| `src/pages/PerformanceDashboard.jsx` | Pantalla principal del cuadro de mando del motor. | ⚡ ALTO |
| `src/components/SetLoggerSheet.jsx` | Diario de entrenamiento y sugerencia de cargas. | ⚡ ALTO |
| `src/data/exerciseLibrary.js` | Librería estática de 35 ejercicios con metadatos. | 📘 MEDIO |

---

## 5. Últimos Cambios Detectados
- **Integración de Sincronización Reactiva**: Se actualizó `SessionContext.jsx` para guardar los logs completados en `localStorage.getItem('trainingos_session_logs')` y emitir el evento `session_logs_updated`.
- **Actualización de `usePerformanceEngine.js`**: Se convirtió la carga estática de `sessionLogs` en un estado reactivo con listeners para `storage`, `session_logs_updated` y `new_session_saved`.
- **Rutinas de Fallback en Planificador**: Se añadieron `PRESET_ROUTINES` en `Plan.jsx` para asegurar la importación de semanas completas aunque la API remota de Google Sheets no tenga la acción `getWorkouts`.
