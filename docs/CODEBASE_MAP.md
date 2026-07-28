# CODEBASE MAP — FULL INVENTORY

## 1. Inventario del Proyecto

### 1.1. Core Engine (`src/engine/performance/`)
| Ruta | Propósito | Dependencias | Usado por | Importancia |
|---|---|---|---|---|
| `engine/performance/index.js` | Punto de entrada público del motor. | `engineCore.js` | `usePerformanceEngine.js` | 🔥 CRÍTICO |
| `engine/performance/performanceConfig.js` | Constantes, umbrales y multiplicadores del motor. | Ninguna | Todos los índices del motor | 🔥 CRÍTICO |
| `engine/performance/core/engineCore.js` | Orquestador principal de la evaluacion en 2 oleadas. | `indices/*`, `decisionEngine`, `validators` | `index.js` | 🔥 CRÍTICO |
| `engine/performance/core/decisionEngine.js` | Generador del semáforo global y recomendaciones. | `performanceConfig.js` | `engineCore.js` | 🔥 CRÍTICO |
| `engine/performance/indices/fatigueIndex.js` | Índice de Fatiga Sistémica (IFS). | `decay.js`, `performanceConfig.js` | `engineCore.js` | 🔥 CRÍTICO |
| `engine/performance/indices/recoveryIndex.js` | Índice de Recuperación (IR). | `performanceConfig.js` | `engineCore.js` | 🔥 CRÍTICO |
| `engine/performance/indices/stimulusIndex.js` | Índice de Estímulo Muscular (IEM). | `performanceConfig.js` | `engineCore.js` | 🔥 CRÍTICO |
| `engine/performance/indices/progressionIndex.js` | Índice de Progresión (IP). | `oneRMEstimators.js`, `performanceConfig` | `engineCore.js` | 🔥 CRÍTICO |
| `engine/performance/indices/patternBalanceIndex.js`| Índice de Equilibrio de Patrones (IPB). | `performanceConfig.js` | `engineCore.js` | 🔥 CRÍTICO |
| `engine/performance/indices/sportTransferIndex.js` | Índice de Transferencia TKD (ITD). | `performanceConfig.js` | `engineCore.js` | 🔥 CRÍTICO |
| `engine/performance/utils/inputBuilder.js` | Transformador Contexts React $\rightarrow$ DTO Input. | `exerciseLibrary`, `exerciseMetadata` | `usePerformanceEngine.js` | ⚡ ALTO |
| `engine/performance/utils/validators.js` | Normalizador y validador del DTO. | Ninguna | `engineCore.js` | ⚡ ALTO |
| `engine/performance/utils/decay.js` | Algoritmo de atenuación exponencial por vida media. | Ninguna | `fatigueIndex.js` | ⚡ ALTO |
| `engine/performance/utils/oneRMEstimators.js` | Estimadores de 1RM (Epley, Brzycki). | Ninguna | `progressionIndex.js` | ⚡ ALTO |
| `engine/performance/__tests__/smoke.test.js` | Suite de tests automáticos en Node.js. | `index.js`, `performanceConfig.js` | CLI / NPM test | 📘 MEDIO |

---

### 1.2. Hooks de React (`src/hooks/`)
| Ruta | Propósito | Dependencias | Usado por | Importancia |
|---|---|---|---|---|
| `hooks/usePerformanceEngine.js` | Hook adaptador principal del Performance Engine. | `Contexts`, `evaluate`, `inputBuilder` | `Home`, `SetLoggerSheet`, `Dashboard` | 🔥 CRÍTICO |
| `hooks/useProgressiveOverload.js` | Sobrecarga progresiva por ejercicio individual. | `PRContext`, `PlannerContext`, `suggestLoad`| `ExerciseRow.jsx` | ⚡ ALTO |
| `hooks/useFatigue.js` | Cálculo directo de fatiga RPE de 7 días. | `localStorage` | `Home.jsx` (legacy fallback) | 📘 MEDIO |
| `hooks/useEvolutionData.js` | Procesador de series históricas para gráficos. | `PRContext`, `PlannerContext` | `Evolution.jsx` | ⚡ ALTO |
| `hooks/useRole.js` | Helper de permisos (es coach, es atleta). | `AthleteContext` | `App.jsx`, `CoachRoute` | ⚡ ALTO |
| `hooks/useSheets.js` | Wrapper con estado de peticiones asíncronas a Sheets.| `services/sheets.js` | Componentes de lectura | 📘 MEDIO |

---

### 1.3. Contextos de Estado (`src/context/`)
| Ruta | Propósito | Dependencias | Usado por | Importancia |
|---|---|---|---|---|
| `context/AthleteContext.jsx` | Estado del perfil del atleta y config del engine. | `localStorage`, `firebase` | Toda la app | 🔥 CRÍTICO |
| `context/PlannerContext.jsx` | Gestión de temporadas, mesociclos y calendario. | `services/sheets.js`, `mockPlanner` | `Plan`, `Home`, `Session` | 🔥 CRÍTICO |
| `context/SessionContext.jsx` | Sesión activa, diario de series y evento de logs. | `services/sheets.js` | `Session`, `SetLoggerSheet` | 🔥 CRÍTICO |
| `context/ReadinessContext.jsx` | Check-in diario de bienestar y tests CMJ/Cardio. | `localStorage` | `usePE`, `WellnessCheckIn` | 🔥 CRÍTICO |
| `context/PRContext.jsx` | Registro y cálculo de récords personales. | `services/sheets.js` | `SetLoggerSheet`, `Evolution` | ⚡ ALTO |
| `context/AuthContext.jsx` | Autenticación con Firebase Auth. | `config/firebase.js` | `App`, `Login`, `Register` | ⚡ ALTO |
| `context/CoachContext.jsx` | Lista de atletas supervisados por el entrenador. | `services/sheets.js` | `CoachDashboard`, `AthleteDetail` | 📘 MEDIO |
| `context/FeedbackContext.jsx` | Comentarios entre coach y atleta por sesión. | `services/sheets.js` | `Session`, `FeedbackSection` | 📘 MEDIO |
| `context/TimerContext.jsx` | Estado global del temporizador de descanso. | Audio utils | `TimerSheet`, `SetLoggerSheet` | 📘 MEDIO |
| `context/CircuitContext.jsx` | Reproductor de circuitos HIIT/TKD por bloques. | `TimerContext` | `TimerPage`, `CircuitPlayer` | 📘 MEDIO |

---

### 1.4. Páginas y Componentes
| Ruta | Propósito | Importancia |
|---|---|---|
| `pages/PerformanceDashboard.jsx` | Vista principal del motor de rendimiento. | 🔥 CRÍTICO |
| `pages/Home.jsx` | Inicio y resumen diario del atleta. | 🔥 CRÍTICO |
| `pages/Session.jsx` | Ejecución interactiva de entrenamiento. | 🔥 CRÍTICO |
| `pages/Plan.jsx` | Planificador semanal y asignación de sesiones. | 🔥 CRÍTICO |
| `components/SetLoggerSheet.jsx` | Logger de series e integración con el semáforo. | 🔥 CRÍTICO |
| `components/performance/TrafficLightBadge.jsx` | Componente reutilizable de semáforo. | ⚡ ALTO |
| `components/performance/IndexCard.jsx` | Componente de tarjeta de índice analítico. | ⚡ ALTO |
| `components/performance/RecommendationCard.jsx` | Componente de tarjeta de recomendación. | ⚡ ALTO |
| `components/performance/WellnessCheckIn.jsx` | Modal bottom-sheet de check-in diario. | ⚡ ALTO |
