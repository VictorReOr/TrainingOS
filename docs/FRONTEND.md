# FRONTEND ARCHITECTURE — TrainingOS

## 1. Estructura de Páginas (`src/pages/`)
| Ruta | Componente Página | Propósito Principal | Contextos / Hooks Principales |
|---|---|---|---|
| `/` | `Home.jsx` | Pantalla de inicio, racha semanal, resumen rápido y trigger de wellness. | `AthleteContext`, `PlannerContext`, `PRContext`, `ReadinessContext`, `usePerformanceEngine` |
| `/plan` | `Plan.jsx` | Planificador semanal interactivo con selector de mesociclos e importador. | `PlannerContext`, `AthleteContext`, `SessionContext` |
| `/plan/seasons` | `SeasonList.jsx` | Gestión de temporadas del atleta. | `PlannerContext` |
| `/plan/seasons/:id` | `MesocycleList.jsx` | Lista de mesociclos asociados a una temporada. | `PlannerContext` |
| `/plan/session/new` | `SessionEditor.jsx` | Constructor/editor de plantillas de sesión. | `PlannerContext` |
| `/session` | `Session.jsx` | Ejecución en vivo de la sesión de entrenamiento activa. | `SessionContext`, `PRContext`, `PlannerContext`, `useTimer` |
| `/performance` | `PerformanceDashboard.jsx` | Panel analítico del Performance Engine (Semáforo, 6 Índices, Recs). | `usePerformanceEngine`, `ReadinessContext`, `AthleteContext` |
| `/evolution` | `Evolution.jsx` | Gráficos evolutivos de PRs y comparativas entre mesociclos. | `useEvolutionData`, `PRContext`, `PlannerContext` |
| `/timer` | `TimerPage.jsx` | Cronómetro interactivo y reproductor de circuitos por bloques. | `TimerContext`, `CircuitContext` |
| `/profile` | `Profile.jsx` | Configuración del perfil de atleta, rol y opciones avanzadas. | `AthleteContext`, `AuthContext` |
| `/coach` | `CoachDashboard.jsx` | Panel del entrenador para supervisar atletas asignados. | `CoachContext`, `useRole` |
| `/coach/:id` | `AthleteDetail.jsx` | Detalle específico de un atleta atendido por el coach. | `CoachContext` |
| `/onboarding` | `Onboarding.jsx` | Flujo inicial de bienvenida y configuración de perfil. | `AthleteContext` |
| `/login` / `/register`| `Login.jsx` / `Register.jsx` | Autenticación y registro con Firebase. | `AuthContext` |

---

## 2. Componentes Clave (`src/components/`)

### 2.1. Componentes del Performance Engine (`src/components/performance/`)
- **`TrafficLightBadge.jsx`**: Renderiza el semáforo global o por ejercicio en tamaños `sm`, `md` o `lg` con animaciones CSS (`pulse-green`, `pulse-red`).
- **`IndexCard.jsx`**: Tarjeta visual para métricas individuales de rendimiento (Fatiga, Recuperación, Estímulo, Progresión, Equilibrio, Transfer TKD) con barra de progreso y badges de confianza.
- **`RecommendationCard.jsx`**: Tarjeta explicativa con código de colores según prioridad (`critical`, `high`, `medium`, `low`) y botones de aprobación para entrenadores.
- **`ColdStartBanner.jsx`**: Muestra la barra de progreso durante las primeras 5 sesiones de aprendizaje.
- **`WellnessCheckIn.jsx`**: Bottom sheet interactivo para registrar el estado diario de Sueño, Estrés, Energía y DOMS.

### 2.2. Componentes Principales
- **`SetLoggerSheet.jsx`**: Hoja flotante para registrar series de un ejercicio (carga, reps, RPE, velocidad) e integrada con el semáforo del Performance Engine.
- **`SportSelector.jsx`**: Selector rápido de disciplina deportiva (`Todos`, `Gimnasio`, `Taekwondo`, `Cardio`).
- **`ProgressBar.jsx`**: Barra de progreso de completitud de la sesión activa.
- **`FeedbackSection.jsx`**: Sección de comentarios entre entrenador y atleta.

---

## 3. Matriz Componente/Página → Contextos Utilizados

| Componente / Página | `Athlete` | `Planner` | `PR` | `Readiness` | `Session` | `Auth` | `Coach` | `Timer` | `Circuit` |
|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| `Home.jsx` | ✅ | ✅ | ✅ | ✅ | ✅ | | | | |
| `Plan.jsx` | ✅ | ✅ | | | ✅ | | | | |
| `Session.jsx` | ✅ | ✅ | | | ✅ | | | ✅ | |
| `PerformanceDashboard.jsx` | ✅ | | | ✅ | | | | | |
| `SetLoggerSheet.jsx` | | ✅ | ✅ | | | | | ✅ | ✅ |
| `Profile.jsx` | ✅ | | | | | ✅ | | | |
| `CoachDashboard.jsx` | | | | | | | ✅ | | |
| `usePerformanceEngine` | ✅ | ✅ | ✅ | ✅ | | | | | |

---

## 4. Gestión de Estado y Rerenders
1. **Memoización con `useMemo` y `useCallback`**: Usada en `usePerformanceEngine`, `buildPerformanceInput` e `IndexCard` para prevenir rerenders innecesarios al recalcular los índices del motor.
2. **Subscripción a Eventos de Almacenamiento**: Los hooks clave se suscriben a los eventos `storage` y `session_logs_updated` para reaccionar inmediatamente cuando se persiste información en `localStorage`.
