# AUDITORÍA TÉCNICA VISUAL — TRAININGOS
## FASE 1 — DESCUBRIMIENTO TÉCNICO EXHAUSTIVO

---

### 1. Información del Análisis

* **Modelo utilizado:** Gemini 3.7 Flash
* **Nivel de razonamiento utilizado:** Medium (Pensamiento estándar)
* **Fecha de análisis:** 2026-08-20
* **Repositorio analizado:** TrainingOS (`training-os`)
* **Entorno:** React 19 + Vite 6 + Tailwind CSS v4 + Capacitor (Android)

---

### 2. Resumen Ejecutivo

La interfaz de TrainingOS combina un sistema de iconos vectoriales basados en la librería **`lucide-react`** con un ecosistema de **gráficos SVG inline personalizados**, **renderizado de gráficos con Recharts**, **archivos rasterizados de marca (PNG)** y un amplio conjunto de **iconos semánticos codificados mediante emojis nativos y mapas dinámicos**.

#### Cifras Clave del Descubrimiento:
* **Archivos gráficos físicos en el proyecto:** 16 archivos (9 en `public/`, 3 en `src/assets/`, más recursos Android en `res/`).
* **Librerías de iconos instaladas:** 1 (`lucide-react` v0.474.0).
* **Iconos únicos de librería identificados:** **75 iconos** importados a lo largo de 35 archivos de componentes y páginas.
* **Componentes con SVG Inline nativo:** 4 componentes (`CountdownRing`, `Sparkline` en `Evolution`, botón FAB en `Session`, botón de edición rápida en `Home` y `SessionReadView`).
* **Gráficos y componentes visuales generados por código:** 7 subsistemas (`TrafficLightBadge`, `CountdownRing`, `ProgressBar`, `StarRating`, `Sparkline`, Gráficos `Recharts`, `BlockTypeSelector`).
* **Mapas de iconos dinámicos y emojis:** 7 mapas estructurales (`SESSION_TYPES`, `SPORTS`, `METRICS/WELLNESS`, `BLOCK_ICONS`, `INDEX_ICONS`, `SPEED_EMOJIS`, `PROGRESS_EMOJIS`).
* **Activos huérfanos / no referenciados detectados:** 5 archivos (`hero.png`, `react.svg`, `vite.svg`, `public/icons.svg`, `public/favicon.svg`) y 14 importaciones de iconos dormidas.

---

### 3. Archivos Gráficos Físicos

#### A. Directorio `public/` (Servidos en la raíz de la PWA)
| Archivo | Extensión | Peso | Tipo / Propósito | Componente / Referencia | Ruta de Navegación |
|---|---|---|---|---|---|
| `/public/Logo_trainingOS.png` | PNG | 91.7 KB | Logo horizontal oficial de la marca | [`SplashScreen.jsx`](file:///c:/Users/victo/.gemini/antigravity/scratch/training-os/src/components/SplashScreen.jsx#L31) | Inicio / Arranque de app (`/`) |
| `/public/Icono_trainingOS.png` | PNG | 215.7 KB | Isotipo de alta resolución | Archivo fuente de marca | — |
| `/public/splash.png` | PNG | 123.8 KB | Pantalla de bienvenida nativa | Splash screen Capacitor / Android | Arranque nativo |
| `/public/icon-48.png` | PNG | 3.6 KB | Favicon PWA / Android | `index.html` (L19), `manifest.json` (L12) | Global |
| `/public/icon-72.png` | PNG | 5.7 KB | Icono PWA Android | `manifest.json` (L17) | Global PWA |
| `/public/icon-96.png` | PNG | 7.8 KB | Favicon PWA / Android | `index.html` (L18), `manifest.json` (L22) | Global |
| `/public/icon-180.png` | PNG | 15.6 KB | Apple Touch Icon / Notificaciones | `index.html` (L15), [`TimerContext.jsx:L47`](file:///c:/Users/victo/.gemini/antigravity/scratch/training-os/src/context/TimerContext.jsx#L47) | Global / Timer push notifications |
| `/public/icon-192.png` | PNG | 16.8 KB | Icono PWA Android estándar | `manifest.json` (L27) | Global PWA |
| `/public/icon-512.png` | PNG | 70.6 KB | Icono PWA Splash/Store | `manifest.json` (L32) | Global PWA |
| `/public/favicon.svg` | SVG | 9.5 KB | Favicon vectorial Vite/Plantilla | *Sin referencia activa* | — |
| `/public/icons.svg` | SVG | 5.0 KB | SVG Sprite (Bluesky, Discord, GitHub, etc.) | *Sin referencia activa* | — |

#### B. Directorio `src/assets/`
| Archivo | Extensión | Peso | Tipo / Propósito | Componente / Referencia | Estado |
|---|---|---|---|---|---|
| `/src/assets/hero.png` | PNG | 44.9 KB | Imagen publicitaria/banner | *Sin referencia activa* | Huérfano |
| `/src/assets/react.svg` | SVG | 4.1 KB | Logo oficial de React | *Sin referencia activa* | Huérfano (Vite scaffold) |
| `/src/assets/vite.svg` | SVG | 8.7 KB | Logo oficial de Vite | *Sin referencia activa* | Huérfano (Vite scaffold) |

#### C. Recursos Nativos Android (`android/app/src/main/res/`)
* **Splash screens:** `drawable/splash.png`, `drawable-land-*/splash.png`, `drawable-port-*/splash.png` (hdpi, mdpi, xhdpi, xxhdpi, xxxhdpi).
* **Launchers:** `mipmap-*/ic_launcher.png`, `mipmap-*/ic_launcher_round.png`, `mipmap-*/ic_launcher_foreground.png`.
* **Vectores XML:** `drawable/ic_launcher_background.xml`, `drawable-v24/ic_launcher_foreground.xml`, `mipmap-anydpi-v26/ic_launcher.xml`.

---

### 4. Inventario Exhaustivo de Iconos de Librerías

#### Librería: `lucide-react` (v0.474.0)
Se han identificado **75 iconos únicos**. La siguiente tabla detalla cada icono, su número de renderizados efectivos en JSX, y todos los archivos y rutas donde se utiliza:

| # | Icono | Renders JSX | Archivos donde se importa | Rutas / Vistas de aparición |
|---|---|---|---|---|
| 1 | **Activity** | 2 | [`AthleteDetail.jsx`](file:///c:/Users/victo/.gemini/antigravity/scratch/training-os/src/pages/coach/AthleteDetail.jsx) (x2), [`Evolution.jsx`](file:///c:/Users/victo/.gemini/antigravity/scratch/training-os/src/pages/Evolution.jsx) (x0) | `/coach/:id` |
| 2 | **AlertCircle** | 2 | [`Login.jsx`](file:///c:/Users/victo/.gemini/antigravity/scratch/training-os/src/pages/Login.jsx) (x1), [`Register.jsx`](file:///c:/Users/victo/.gemini/antigravity/scratch/training-os/src/pages/Register.jsx) (x1) | `/login`, `/register` |
| 3 | **AlertTriangle** | 3 | [`WeekRepetitionModal.jsx`](file:///c:/Users/victo/.gemini/antigravity/scratch/training-os/src/components/planner/WeekRepetitionModal.jsx) (x1), [`ExerciseReview.jsx`](file:///c:/Users/victo/.gemini/antigravity/scratch/training-os/src/pages/coach/ExerciseReview.jsx) (x1), [`ImportSession.jsx`](file:///c:/Users/victo/.gemini/antigravity/scratch/training-os/src/pages/ImportSession.jsx) (x1) | `/plan`, `/exercises/review`, `/import/:code` |
| 4 | **ArrowDown** | 1 | [`EditableBlock.jsx`](file:///c:/Users/victo/.gemini/antigravity/scratch/training-os/src/components/planner/EditableBlock.jsx) (x1) | `/plan/session/new`, `/plan/session/:id/edit` |
| 5 | **ArrowLeft** | 4 | [`ImportSession.jsx`](file:///c:/Users/victo/.gemini/antigravity/scratch/training-os/src/pages/ImportSession.jsx) (x2), [`PerformanceDashboard.jsx`](file:///c:/Users/victo/.gemini/antigravity/scratch/training-os/src/pages/PerformanceDashboard.jsx) (x1), [`SessionDetailView.jsx`](file:///c:/Users/victo/.gemini/antigravity/scratch/training-os/src/pages/planner/SessionDetailView.jsx) (x1) | `/import`, `/performance`, `/plan/session-detail` |
| 6 | **ArrowRight** | 2 | [`SetLoggerSheet.jsx`](file:///c:/Users/victo/.gemini/antigravity/scratch/training-os/src/components/SetLoggerSheet.jsx) (x2) | `/session` |
| 7 | **ArrowUp** | 1 | [`EditableBlock.jsx`](file:///c:/Users/victo/.gemini/antigravity/scratch/training-os/src/components/planner/EditableBlock.jsx) (x1) | `/plan/session/new`, `/plan/session/:id/edit` |
| 8 | **Award** | 0 | [`Onboarding.jsx`](file:///c:/Users/victo/.gemini/antigravity/scratch/training-os/src/pages/Onboarding.jsx) (x0) | *Dormido en `/onboarding`* |
| 9 | **BarChart2** | 1 | [`Home.jsx`](file:///c:/Users/victo/.gemini/antigravity/scratch/training-os/src/pages/Home.jsx) (x1) | `/` |
| 10 | **Bell** | 1 | [`Profile.jsx`](file:///c:/Users/victo/.gemini/antigravity/scratch/training-os/src/pages/Profile.jsx) (x1) | `/profile` |
| 11 | **Calendar** | 2 | [`SeasonList.jsx`](file:///c:/Users/victo/.gemini/antigravity/scratch/training-os/src/pages/planner/SeasonList.jsx) (x2) | `/plan/seasons` |
| 12 | **CalendarDays** | 3 | [`BottomNav.jsx`](file:///c:/Users/victo/.gemini/antigravity/scratch/training-os/src/components/BottomNav.jsx) (dinámico), [`AthleteDetail.jsx`](file:///c:/Users/victo/.gemini/antigravity/scratch/training-os/src/pages/coach/AthleteDetail.jsx) (x1), [`Home.jsx`](file:///c:/Users/victo/.gemini/antigravity/scratch/training-os/src/pages/Home.jsx) (x1), [`SessionEditor.jsx`](file:///c:/Users/victo/.gemini/antigravity/scratch/training-os/src/pages/planner/SessionEditor.jsx) (x1) | Global (`BottomNav`), `/`, `/coach/:id`, `/plan/session/new` |
| 13 | **Check** | 10 | [`ExerciseRow.jsx`](file:///c:/Users/victo/.gemini/antigravity/scratch/training-os/src/components/ExerciseRow.jsx) (x1), [`ReadinessModal.jsx`](file:///c:/Users/victo/.gemini/antigravity/scratch/training-os/src/components/ReadinessModal.jsx) (x1), [`SetLoggerSheet.jsx`](file:///c:/Users/victo/.gemini/antigravity/scratch/training-os/src/components/SetLoggerSheet.jsx) (x1), [`SessionReadView.jsx`](file:///c:/Users/victo/.gemini/antigravity/scratch/training-os/src/components/planner/SessionReadView.jsx) (x2), [`WeekRepetitionModal.jsx`](file:///c:/Users/victo/.gemini/antigravity/scratch/training-os/src/components/planner/WeekRepetitionModal.jsx) (x1), [`BlockTypeSelector.jsx`](file:///c:/Users/victo/.gemini/antigravity/scratch/training-os/src/components/timer/BlockTypeSelector.jsx) (x2), [`MyRoutines.jsx`](file:///c:/Users/victo/.gemini/antigravity/scratch/training-os/src/pages/coach/MyRoutines.jsx) (x2) | `/session`, `/plan`, `/coach/routines`, modals |
| 14 | **CheckCircle** | 2 | [`ImportSession.jsx`](file:///c:/Users/victo/.gemini/antigravity/scratch/training-os/src/pages/ImportSession.jsx) (x1), [`SessionEditor.jsx`](file:///c:/Users/victo/.gemini/antigravity/scratch/training-os/src/pages/planner/SessionEditor.jsx) (x1) | `/import`, `/plan/session/new` |
| 15 | **CheckCircle2** | 5 | [`ExerciseReview.jsx`](file:///c:/Users/victo/.gemini/antigravity/scratch/training-os/src/pages/coach/ExerciseReview.jsx) (x1), [`Onboarding.jsx`](file:///c:/Users/victo/.gemini/antigravity/scratch/training-os/src/pages/Onboarding.jsx) (x2), [`Profile.jsx`](file:///c:/Users/victo/.gemini/antigravity/scratch/training-os/src/pages/Profile.jsx) (x2), [`Session.jsx`](file:///c:/Users/victo/.gemini/antigravity/scratch/training-os/src/pages/Session.jsx) (x0) | `/exercises/review`, `/onboarding`, `/profile` |
| 16 | **ChevronDown** | 5 | [`SportSelector.jsx`](file:///c:/Users/victo/.gemini/antigravity/scratch/training-os/src/components/SportSelector.jsx) (x1), [`EditableExercise.jsx`](file:///c:/Users/victo/.gemini/antigravity/scratch/training-os/src/components/planner/EditableExercise.jsx) (x1), [`PerformanceDashboard.jsx`](file:///c:/Users/victo/.gemini/antigravity/scratch/training-os/src/pages/PerformanceDashboard.jsx) (x1), [`ExerciseReview.jsx`](file:///c:/Users/victo/.gemini/antigravity/scratch/training-os/src/pages/coach/ExerciseReview.jsx) (x1), [`ImportSession.jsx`](file:///c:/Users/victo/.gemini/antigravity/scratch/training-os/src/pages/ImportSession.jsx) (x1), [`Evolution.jsx`](file:///c:/Users/victo/.gemini/antigravity/scratch/training-os/src/pages/Evolution.jsx) (x0) | `/evolution`, `/performance`, `/coach/review`, `/import`, selector |
| 17 | **ChevronLeft** | 8 | [`SessionReadView.jsx`](file:///c:/Users/victo/.gemini/antigravity/scratch/training-os/src/components/planner/SessionReadView.jsx) (x1), [`WeekRepetitionModal.jsx`](file:///c:/Users/victo/.gemini/antigravity/scratch/training-os/src/components/planner/WeekRepetitionModal.jsx) (x1), [`Plan.jsx`](file:///c:/Users/victo/.gemini/antigravity/scratch/training-os/src/pages/Plan.jsx) (x1), [`Profile.jsx`](file:///c:/Users/victo/.gemini/antigravity/scratch/training-os/src/pages/Profile.jsx) (x1), [`AthleteDetail.jsx`](file:///c:/Users/victo/.gemini/antigravity/scratch/training-os/src/pages/coach/AthleteDetail.jsx) (x1), [`ExerciseReview.jsx`](file:///c:/Users/victo/.gemini/antigravity/scratch/training-os/src/pages/coach/ExerciseReview.jsx) (x1), [`MyRoutines.jsx`](file:///c:/Users/victo/.gemini/antigravity/scratch/training-os/src/pages/coach/MyRoutines.jsx) (x1), [`SessionEditor.jsx`](file:///c:/Users/victo/.gemini/antigravity/scratch/training-os/src/pages/planner/SessionEditor.jsx) (x1) | Navegación hacia atrás en subpáginas y modales |
| 18 | **ChevronRight** | 9 | [`ReadinessModal.jsx`](file:///c:/Users/victo/.gemini/antigravity/scratch/training-os/src/components/ReadinessModal.jsx) (x1), [`SessionReadView.jsx`](file:///c:/Users/victo/.gemini/antigravity/scratch/training-os/src/components/planner/SessionReadView.jsx) (x2), [`WeekRepetitionModal.jsx`](file:///c:/Users/victo/.gemini/antigravity/scratch/training-os/src/components/planner/WeekRepetitionModal.jsx) (x1), [`Evolution.jsx`](file:///c:/Users/victo/.gemini/antigravity/scratch/training-os/src/pages/Evolution.jsx) (x1), [`Onboarding.jsx`](file:///c:/Users/victo/.gemini/antigravity/scratch/training-os/src/pages/Onboarding.jsx) (x1), [`Plan.jsx`](file:///c:/Users/victo/.gemini/antigravity/scratch/training-os/src/pages/Plan.jsx) (x1), [`CoachDashboard.jsx`](file:///c:/Users/victo/.gemini/antigravity/scratch/training-os/src/pages/coach/CoachDashboard.jsx) (x1), [`MesocycleList.jsx`](file:///c:/Users/victo/.gemini/antigravity/scratch/training-os/src/pages/planner/MesocycleList.jsx) (x1), [`SeasonList.jsx`](file:///c:/Users/victo/.gemini/antigravity/scratch/training-os/src/pages/planner/SeasonList.jsx) (x1) | Listas, paginadores semanales, onboarding |
| 19 | **ChevronUp** | 2 | [`EditableExercise.jsx`](file:///c:/Users/victo/.gemini/antigravity/scratch/training-os/src/components/planner/EditableExercise.jsx) (x1), [`PerformanceDashboard.jsx`](file:///c:/Users/victo/.gemini/antigravity/scratch/training-os/src/pages/PerformanceDashboard.jsx) (x1), [`ExerciseReview.jsx`](file:///c:/Users/victo/.gemini/antigravity/scratch/training-os/src/pages/coach/ExerciseReview.jsx) (x0) | Acordeones y colapsables |
| 20 | **Circle** | 2 | [`Onboarding.jsx`](file:///c:/Users/victo/.gemini/antigravity/scratch/training-os/src/pages/Onboarding.jsx) (x2) | `/onboarding` (radio buttons) |
| 21 | **ClipboardEdit** | 1 | [`SessionReadView.jsx`](file:///c:/Users/victo/.gemini/antigravity/scratch/training-os/src/components/planner/SessionReadView.jsx) (x1) | `/plan/session-detail` / modal lectura |
| 22 | **ClipboardList** | 2 | [`AthleteDetail.jsx`](file:///c:/Users/victo/.gemini/antigravity/scratch/training-os/src/pages/coach/AthleteDetail.jsx) (x1), [`ExerciseReview.jsx`](file:///c:/Users/victo/.gemini/antigravity/scratch/training-os/src/pages/coach/ExerciseReview.jsx) (x1), [`Evolution.jsx`](file:///c:/Users/victo/.gemini/antigravity/scratch/training-os/src/pages/Evolution.jsx) (x0) | `/coach/:id`, `/exercises/review` |
| 23 | **Clock** | 3 | [`SessionReadView.jsx`](file:///c:/Users/victo/.gemini/antigravity/scratch/training-os/src/components/planner/SessionReadView.jsx) (x1), [`ImportSession.jsx`](file:///c:/Users/victo/.gemini/antigravity/scratch/training-os/src/pages/ImportSession.jsx) (x1), [`SessionDetailView.jsx`](file:///c:/Users/victo/.gemini/antigravity/scratch/training-os/src/pages/planner/SessionDetailView.jsx) (x1) | Indicador de duración de sesión |
| 24 | **CloudUpload** | 1 | [`Session.jsx`](file:///c:/Users/victo/.gemini/antigravity/scratch/training-os/src/pages/Session.jsx) (x1) | `/session` (banner offline/sync) |
| 25 | **Copy** | 3 | [`ExportSessionModal.jsx`](file:///c:/Users/victo/.gemini/antigravity/scratch/training-os/src/components/ExportSessionModal.jsx) (x1), [`EditableBlock.jsx`](file:///c:/Users/victo/.gemini/antigravity/scratch/training-os/src/components/planner/EditableBlock.jsx) (x1), [`CircuitConfigurator.jsx`](file:///c:/Users/victo/.gemini/antigravity/scratch/training-os/src/components/timer/CircuitConfigurator.jsx) (x1) | Modales de exportación y duplicación |
| 26 | **DownloadCloud** | 7 | [`AthleteDetail.jsx`](file:///c:/Users/victo/.gemini/antigravity/scratch/training-os/src/pages/coach/AthleteDetail.jsx) (x1), [`ImportSession.jsx`](file:///c:/Users/victo/.gemini/antigravity/scratch/training-os/src/pages/ImportSession.jsx) (x3), [`Plan.jsx`](file:///c:/Users/victo/.gemini/antigravity/scratch/training-os/src/pages/Plan.jsx) (x2), [`Profile.jsx`](file:///c:/Users/victo/.gemini/antigravity/scratch/training-os/src/pages/Profile.jsx) (x1) | Sincronización desde Sheets / Import |
| 27 | **Dumbbell** | 11 | [`SessionReadView.jsx`](file:///c:/Users/victo/.gemini/antigravity/scratch/training-os/src/components/planner/SessionReadView.jsx) (x2), [`Login.jsx`](file:///c:/Users/victo/.gemini/antigravity/scratch/training-os/src/pages/Login.jsx) (x1), [`Register.jsx`](file:///c:/Users/victo/.gemini/antigravity/scratch/training-os/src/pages/Register.jsx) (x1), [`AthleteDetail.jsx`](file:///c:/Users/victo/.gemini/antigravity/scratch/training-os/src/pages/coach/AthleteDetail.jsx) (x1), [`CoachDashboard.jsx`](file:///c:/Users/victo/.gemini/antigravity/scratch/training-os/src/pages/coach/CoachDashboard.jsx) (x1), [`MyRoutines.jsx`](file:///c:/Users/victo/.gemini/antigravity/scratch/training-os/src/pages/coach/MyRoutines.jsx) (x1), [`ImportSession.jsx`](file:///c:/Users/victo/.gemini/antigravity/scratch/training-os/src/pages/ImportSession.jsx) (x2), [`SessionDetailView.jsx`](file:///c:/Users/victo/.gemini/antigravity/scratch/training-os/src/pages/planner/SessionDetailView.jsx) (x2), [`Onboarding.jsx`](file:///c:/Users/victo/.gemini/antigravity/scratch/training-os/src/pages/Onboarding.jsx) (x0) | Login, Register, Coach, contador de ejercicios |
| 28 | **Eye** | 0 | [`SessionEditor.jsx`](file:///c:/Users/victo/.gemini/antigravity/scratch/training-os/src/pages/planner/SessionEditor.jsx) (x0) | *Dormido en `/plan/session/new` (sustituido por 👁)* |
| 29 | **FastForward** | 2 | [`GlobalRestModal.jsx`](file:///c:/Users/victo/.gemini/antigravity/scratch/training-os/src/components/GlobalRestModal.jsx) (x1), [`TimerViews.jsx`](file:///c:/Users/victo/.gemini/antigravity/scratch/training-os/src/components/TimerViews.jsx) (x1) | Botón +10s / adelantar temporizador |
| 30 | **Flame** | 1 | [`Home.jsx`](file:///c:/Users/victo/.gemini/antigravity/scratch/training-os/src/pages/Home.jsx) (x1) | `/` (Racha actual) |
| 31 | **Heart** | 0 | [`Evolution.jsx`](file:///c:/Users/victo/.gemini/antigravity/scratch/training-os/src/pages/Evolution.jsx) (x0) | *Dormido en `/evolution`* |
| 32 | **History** | 1 | [`SetLoggerSheet.jsx`](file:///c:/Users/victo/.gemini/antigravity/scratch/training-os/src/components/SetLoggerSheet.jsx) (x1) | `/session` (Referencia semana anterior) |
| 33 | **Home** | 1 | [`BottomNav.jsx`](file:///c:/Users/victo/.gemini/antigravity/scratch/training-os/src/components/BottomNav.jsx) (dinámico) | Barra inferior de navegación |
| 34 | **Hourglass** | 1 | [`SetLoggerSheet.jsx`](file:///c:/Users/victo/.gemini/antigravity/scratch/training-os/src/components/SetLoggerSheet.jsx) (x1) | `/session` (Mini timer opciones) |
| 35 | **Layers** | 2 | [`WeekRepetitionModal.jsx`](file:///c:/Users/victo/.gemini/antigravity/scratch/training-os/src/components/planner/WeekRepetitionModal.jsx) (x1), [`SeasonList.jsx`](file:///c:/Users/victo/.gemini/antigravity/scratch/training-os/src/pages/planner/SeasonList.jsx) (x1) | `/plan`, `/plan/seasons` |
| 36 | **Loader2** | 2 | [`Login.jsx`](file:///c:/Users/victo/.gemini/antigravity/scratch/training-os/src/pages/Login.jsx) (x1), [`Register.jsx`](file:///c:/Users/victo/.gemini/antigravity/scratch/training-os/src/pages/Register.jsx) (x1) | Spinners de carga en autenticación |
| 37 | **Lock** | 2 | [`Login.jsx`](file:///c:/Users/victo/.gemini/antigravity/scratch/training-os/src/pages/Login.jsx) (x1), [`Register.jsx`](file:///c:/Users/victo/.gemini/antigravity/scratch/training-os/src/pages/Register.jsx) (x1) | Inputs de contraseña |
| 38 | **LogOut** | 1 | [`Profile.jsx`](file:///c:/Users/victo/.gemini/antigravity/scratch/training-os/src/pages/Profile.jsx) (x1) | `/profile` (Cerrar sesión) |
| 39 | **Mail** | 2 | [`Login.jsx`](file:///c:/Users/victo/.gemini/antigravity/scratch/training-os/src/pages/Login.jsx) (x1), [`Register.jsx`](file:///c:/Users/victo/.gemini/antigravity/scratch/training-os/src/pages/Register.jsx) (x1) | Inputs de correo electrónico |
| 40 | **MessageCircle** | 2 | [`Profile.jsx`](file:///c:/Users/victo/.gemini/antigravity/scratch/training-os/src/pages/Profile.jsx) (x2) | `/profile` (Feedback sin leer / soporte) |
| 41 | **Minus** | 1 | [`EditableExercise.jsx`](file:///c:/Users/victo/.gemini/antigravity/scratch/training-os/src/components/planner/EditableExercise.jsx) (x1) | Contador decremental de series |
| 42 | **MoreVertical** | 1 | [`EditableBlock.jsx`](file:///c:/Users/victo/.gemini/antigravity/scratch/training-os/src/components/planner/EditableBlock.jsx) (x1) | Menú contextual de bloque |
| 43 | **MoveDown** | 1 | [`CircuitConfigurator.jsx`](file:///c:/Users/victo/.gemini/antigravity/scratch/training-os/src/components/timer/CircuitConfigurator.jsx) (x1) | Reordenar bloque hacia abajo |
| 44 | **MoveUp** | 1 | [`CircuitConfigurator.jsx`](file:///c:/Users/victo/.gemini/antigravity/scratch/training-os/src/components/timer/CircuitConfigurator.jsx) (x1) | Reordenar bloque hacia arriba |
| 45 | **Music** | 1 | [`CircuitConfigurator.jsx`](file:///c:/Users/victo/.gemini/antigravity/scratch/training-os/src/components/timer/CircuitConfigurator.jsx) (x1) | Selector de sonido de intervalo |
| 46 | **Pause** | 4 | [`CircuitPlayer.jsx`](file:///c:/Users/victo/.gemini/antigravity/scratch/training-os/src/components/timer/CircuitPlayer.jsx) (x1), [`TimerViews.jsx`](file:///c:/Users/victo/.gemini/antigravity/scratch/training-os/src/components/TimerViews.jsx) (x3) | `/timer` (Pausa en cronómetros) |
| 47 | **Pencil** | 1 | [`Profile.jsx`](file:///c:/Users/victo/.gemini/antigravity/scratch/training-os/src/pages/Profile.jsx) (x1) | `/profile` (Editar perfil) |
| 48 | **Play** | 14 | [`BottomNav.jsx`](file:///c:/Users/victo/.gemini/antigravity/scratch/training-os/src/components/BottomNav.jsx) (dinámico), [`DraftRecoveryModal.jsx`](file:///c:/Users/victo/.gemini/antigravity/scratch/training-os/src/components/DraftRecoveryModal.jsx) (x1), [`SessionReadView.jsx`](file:///c:/Users/victo/.gemini/antigravity/scratch/training-os/src/components/planner/SessionReadView.jsx) (x1), [`CircuitConfigurator.jsx`](file:///c:/Users/victo/.gemini/antigravity/scratch/training-os/src/components/timer/CircuitConfigurator.jsx) (x1), [`CircuitPlayer.jsx`](file:///c:/Users/victo/.gemini/antigravity/scratch/training-os/src/components/timer/CircuitPlayer.jsx) (x1), [`TimerViews.jsx`](file:///c:/Users/victo/.gemini/antigravity/scratch/training-os/src/components/TimerViews.jsx) (x6), [`Home.jsx`](file:///c:/Users/victo/.gemini/antigravity/scratch/training-os/src/pages/Home.jsx) (x2), [`ImportSession.jsx`](file:///c:/Users/victo/.gemini/antigravity/scratch/training-os/src/pages/ImportSession.jsx) (x1) | Botones de inicio de sesión, timer, reanudar |
| 49 | **PlayCircle** | 1 | [`Profile.jsx`](file:///c:/Users/victo/.gemini/antigravity/scratch/training-os/src/pages/Profile.jsx) (x1) | `/profile` (Probar sonido de timer) |
| 50 | **Plus** | 22 | [`EditableBlock.jsx`](file:///c:/Users/victo/.gemini/antigravity/scratch/training-os/src/components/planner/EditableBlock.jsx) (x1), [`EditableExercise.jsx`](file:///c:/Users/victo/.gemini/antigravity/scratch/training-os/src/components/planner/EditableExercise.jsx) (x1), [`ExerciseLibrarySheet.jsx`](file:///c:/Users/victo/.gemini/antigravity/scratch/training-os/src/components/planner/ExerciseLibrarySheet.jsx) (x2), [`BlockTypeSelector.jsx`](file:///c:/Users/victo/.gemini/antigravity/scratch/training-os/src/components/timer/BlockTypeSelector.jsx) (x1), [`CircuitConfigurator.jsx`](file:///c:/Users/victo/.gemini/antigravity/scratch/training-os/src/components/timer/CircuitConfigurator.jsx) (x2), [`AthleteDetail.jsx`](file:///c:/Users/victo/.gemini/antigravity/scratch/training-os/src/pages/coach/AthleteDetail.jsx) (x1), [`CoachDashboard.jsx`](file:///c:/Users/victo/.gemini/antigravity/scratch/training-os/src/pages/coach/CoachDashboard.jsx) (x1), [`MyRoutines.jsx`](file:///c:/Users/victo/.gemini/antigravity/scratch/training-os/src/pages/coach/MyRoutines.jsx) (x2), [`Onboarding.jsx`](file:///c:/Users/victo/.gemini/antigravity/scratch/training-os/src/pages/Onboarding.jsx) (x1), [`Plan.jsx`](file:///c:/Users/victo/.gemini/antigravity/scratch/training-os/src/pages/Plan.jsx) (x4), [`MesocycleList.jsx`](file:///c:/Users/victo/.gemini/antigravity/scratch/training-os/src/pages/planner/MesocycleList.jsx) (x2), [`SeasonList.jsx`](file:///c:/Users/victo/.gemini/antigravity/scratch/training-os/src/pages/planner/SeasonList.jsx) (x1), [`SessionEditor.jsx`](file:///c:/Users/victo/.gemini/antigravity/scratch/training-os/src/pages/planner/SessionEditor.jsx) (x1), [`Profile.jsx`](file:///c:/Users/victo/.gemini/antigravity/scratch/training-os/src/pages/Profile.jsx) (x2) | Añadir ejercicio, bloque, atleta, temporada, deporte |
| 51 | **RefreshCw** | 0 | [`Profile.jsx`](file:///c:/Users/victo/.gemini/antigravity/scratch/training-os/src/pages/Profile.jsx) (x0) | *Dormido en `/profile`* |
| 52 | **Repeat** | 3 | [`WeekRepetitionModal.jsx`](file:///c:/Users/victo/.gemini/antigravity/scratch/training-os/src/components/planner/WeekRepetitionModal.jsx) (x1), [`SetLoggerSheet.jsx`](file:///c:/Users/victo/.gemini/antigravity/scratch/training-os/src/components/SetLoggerSheet.jsx) (x1), [`Plan.jsx`](file:///c:/Users/victo/.gemini/antigravity/scratch/training-os/src/pages/Plan.jsx) (x1) | Replicar semana / Generar circuito |
| 53 | **RotateCcw** | 4 | [`DraftRecoveryModal.jsx`](file:///c:/Users/victo/.gemini/antigravity/scratch/training-os/src/components/DraftRecoveryModal.jsx) (x1), [`ProgressBar.jsx`](file:///c:/Users/victo/.gemini/antigravity/scratch/training-os/src/components/ProgressBar.jsx) (x1), [`TimerViews.jsx`](file:///c:/Users/victo/.gemini/antigravity/scratch/training-os/src/components/TimerViews.jsx) (x1), [`Evolution.jsx`](file:///c:/Users/victo/.gemini/antigravity/scratch/training-os/src/pages/Evolution.jsx) (x1), [`CircuitPlayer.jsx`](file:///c:/Users/victo/.gemini/antigravity/scratch/training-os/src/components/timer/CircuitPlayer.jsx) (x0) | Reset de temporizadores, borrado de filtros, reinicio |
| 54 | **Save** | 2 | [`CircuitConfigurator.jsx`](file:///c:/Users/victo/.gemini/antigravity/scratch/training-os/src/components/timer/CircuitConfigurator.jsx) (x1), [`SessionEditor.jsx`](file:///c:/Users/victo/.gemini/antigravity/scratch/training-os/src/pages/planner/SessionEditor.jsx) (x1) | Guardar sesión / circuito |
| 55 | **Search** | 3 | [`ExerciseLibrarySheet.jsx`](file:///c:/Users/victo/.gemini/antigravity/scratch/training-os/src/components/planner/ExerciseLibrarySheet.jsx) (x1), [`Evolution.jsx`](file:///c:/Users/victo/.gemini/antigravity/scratch/training-os/src/pages/Evolution.jsx) (x1), [`ImportSession.jsx`](file:///c:/Users/victo/.gemini/antigravity/scratch/training-os/src/pages/ImportSession.jsx) (x1) | Buscadores de ejercicios y sesiones |
| 56 | **Send** | 1 | [`FeedbackSection.jsx`](file:///c:/Users/victo/.gemini/antigravity/scratch/training-os/src/components/FeedbackSection.jsx) (x1) | Enviar nota de feedback |
| 57 | **Share** | 1 | [`ExportSessionModal.jsx`](file:///c:/Users/victo/.gemini/antigravity/scratch/training-os/src/components/ExportSessionModal.jsx) (x1), [`SessionDetailView.jsx`](file:///c:/Users/victo/.gemini/antigravity/scratch/training-os/src/pages/planner/SessionDetailView.jsx) (x0) | Modal de compartir sesión |
| 58 | **Share2** | 3 | [`ExportSessionModal.jsx`](file:///c:/Users/victo/.gemini/antigravity/scratch/training-os/src/components/ExportSessionModal.jsx) (x1), [`Evolution.jsx`](file:///c:/Users/victo/.gemini/antigravity/scratch/training-os/src/pages/Evolution.jsx) (x1), [`Session.jsx`](file:///c:/Users/victo/.gemini/antigravity/scratch/training-os/src/pages/Session.jsx) (x1) | Botones de WhatsApp y compartir resumen |
| 59 | **ShieldCheck** | 4 | [`AthleteDetail.jsx`](file:///c:/Users/victo/.gemini/antigravity/scratch/training-os/src/pages/coach/AthleteDetail.jsx) (x1), [`Onboarding.jsx`](file:///c:/Users/victo/.gemini/antigravity/scratch/training-os/src/pages/Onboarding.jsx) (x1), [`Profile.jsx`](file:///c:/Users/victo/.gemini/antigravity/scratch/training-os/src/pages/Profile.jsx) (x2) | Badges de rol (Coach / Atleta) |
| 60 | **SkipBack** | 1 | [`CircuitPlayer.jsx`](file:///c:/Users/victo/.gemini/antigravity/scratch/training-os/src/components/timer/CircuitPlayer.jsx) (x1) | Intervalo anterior en circuito |
| 61 | **SkipForward** | 1 | [`CircuitPlayer.jsx`](file:///c:/Users/victo/.gemini/antigravity/scratch/training-os/src/components/timer/CircuitPlayer.jsx) (x1) | Intervalo siguiente en circuito |
| 62 | **Square** | 4 | [`GlobalRestModal.jsx`](file:///c:/Users/victo/.gemini/antigravity/scratch/training-os/src/components/GlobalRestModal.jsx) (x1), [`TimerViews.jsx`](file:///c:/Users/victo/.gemini/antigravity/scratch/training-os/src/components/TimerViews.jsx) (x3) | Botón de Parar / Detener temporizador |
| 63 | **Star** | 2 | [`FeedbackSection.jsx`](file:///c:/Users/victo/.gemini/antigravity/scratch/training-os/src/components/FeedbackSection.jsx) (x1), [`Profile.jsx`](file:///c:/Users/victo/.gemini/antigravity/scratch/training-os/src/pages/Profile.jsx) (x1) | Calificación por estrellas (1 a 5) |
| 64 | **Target** | 1 | [`MesocycleList.jsx`](file:///c:/Users/victo/.gemini/antigravity/scratch/training-os/src/pages/planner/MesocycleList.jsx) (x1) | `/plan/seasons/:id` (Objetivo del mesociclo) |
| 65 | **Timer** | 5 | [`BottomNav.jsx`](file:///c:/Users/victo/.gemini/antigravity/scratch/training-os/src/components/BottomNav.jsx) (dinámico), [`SetLoggerSheet.jsx`](file:///c:/Users/victo/.gemini/antigravity/scratch/training-os/src/components/SetLoggerSheet.jsx) (x3), [`Home.jsx`](file:///c:/Users/victo/.gemini/antigravity/scratch/training-os/src/pages/Home.jsx) (x1) | Botones de acceso a Timer y auto-timer |
| 66 | **Trash2** | 8 | [`EditableBlock.jsx`](file:///c:/Users/victo/.gemini/antigravity/scratch/training-os/src/components/planner/EditableBlock.jsx) (x1), [`EditableExercise.jsx`](file:///c:/Users/victo/.gemini/antigravity/scratch/training-os/src/components/planner/EditableExercise.jsx) (x1), [`SessionReadView.jsx`](file:///c:/Users/victo/.gemini/antigravity/scratch/training-os/src/components/planner/SessionReadView.jsx) (x2), [`BlockTypeSelector.jsx`](file:///c:/Users/victo/.gemini/antigravity/scratch/training-os/src/components/timer/BlockTypeSelector.jsx) (x1), [`CircuitConfigurator.jsx`](file:///c:/Users/victo/.gemini/antigravity/scratch/training-os/src/components/timer/CircuitConfigurator.jsx) (x1), [`AthleteDetail.jsx`](file:///c:/Users/victo/.gemini/antigravity/scratch/training-os/src/pages/coach/AthleteDetail.jsx) (x1), [`Plan.jsx`](file:///c:/Users/victo/.gemini/antigravity/scratch/training-os/src/pages/Plan.jsx) (x1) | Eliminar bloque, ejercicio, sesión, atleta |
| 67 | **TrendingUp** | 3 | [`BottomNav.jsx`](file:///c:/Users/victo/.gemini/antigravity/scratch/training-os/src/components/BottomNav.jsx) (dinámico), [`AthleteDetail.jsx`](file:///c:/Users/victo/.gemini/antigravity/scratch/training-os/src/pages/coach/AthleteDetail.jsx) (x1), [`Home.jsx`](file:///c:/Users/victo/.gemini/antigravity/scratch/training-os/src/pages/Home.jsx) (x1), [`Evolution.jsx`](file:///c:/Users/victo/.gemini/antigravity/scratch/training-os/src/pages/Evolution.jsx) (x0) | Navegación a Evolución y estadísticas |
| 68 | **Trophy** | 1 | [`Home.jsx`](file:///c:/Users/victo/.gemini/antigravity/scratch/training-os/src/pages/Home.jsx) (x1), [`Evolution.jsx`](file:///c:/Users/victo/.gemini/antigravity/scratch/training-os/src/pages/Evolution.jsx) (x0) | `/` (Récords del atleta) |
| 69 | **UploadCloud** | 2 | [`SessionReadView.jsx`](file:///c:/Users/victo/.gemini/antigravity/scratch/training-os/src/components/planner/SessionReadView.jsx) (x1), [`SessionDetailView.jsx`](file:///c:/Users/victo/.gemini/antigravity/scratch/training-os/src/pages/planner/SessionDetailView.jsx) (x1) | Exportar/Publicar sesión compartida |
| 70 | **User** | 2 | [`Onboarding.jsx`](file:///c:/Users/victo/.gemini/antigravity/scratch/training-os/src/pages/Onboarding.jsx) (x1), [`Register.jsx`](file:///c:/Users/victo/.gemini/antigravity/scratch/training-os/src/pages/Register.jsx) (x1) | Rol atleta / Nombre de registro |
| 71 | **UserCheck** | 1 | [`MyRoutines.jsx`](file:///c:/Users/victo/.gemini/antigravity/scratch/training-os/src/pages/coach/MyRoutines.jsx) (x1) | Asignar rutina a atleta |
| 72 | **UserCircle** | 0 | [`Register.jsx`](file:///c:/Users/victo/.gemini/antigravity/scratch/training-os/src/pages/Register.jsx) (x0) | *Dormido en `/register`* |
| 73 | **Users** | 4 | [`BottomNav.jsx`](file:///c:/Users/victo/.gemini/antigravity/scratch/training-os/src/components/BottomNav.jsx) (dinámico), [`MyRoutines.jsx`](file:///c:/Users/victo/.gemini/antigravity/scratch/training-os/src/pages/coach/MyRoutines.jsx) (x1), [`Onboarding.jsx`](file:///c:/Users/victo/.gemini/antigravity/scratch/training-os/src/pages/Onboarding.jsx) (x1), [`Profile.jsx`](file:///c:/Users/victo/.gemini/antigravity/scratch/training-os/src/pages/Profile.jsx) (x1), [`CoachDashboard.jsx`](file:///c:/Users/victo/.gemini/antigravity/scratch/training-os/src/pages/coach/CoachDashboard.jsx) (x0) | Rol coach / Lista de atletas |
| 74 | **Volume2** | 3 | [`GlobalRestModal.jsx`](file:///c:/Users/victo/.gemini/antigravity/scratch/training-os/src/components/GlobalRestModal.jsx) (x1), [`TimerViews.jsx`](file:///c:/Users/victo/.gemini/antigravity/scratch/training-os/src/components/TimerViews.jsx) (x1), [`Profile.jsx`](file:///c:/Users/victo/.gemini/antigravity/scratch/training-os/src/pages/Profile.jsx) (x1) | Control de sonido / Selector de audio |
| 75 | **X** | 24 | Presente en 18 archivos de componentes y páginas | Cierre de modales, sheets, filtros y badges |

---

### 5. SVG Inline y Dibujos Vectoriales Nativos en JSX

Se han detectado **5 implementaciones vectoriales inline** en componentes:

1. **Icono Lápiz / Edición Rápida (Duplicado inline en dos archivos):**
   * **Archivos:** [`SessionReadView.jsx:L592`](file:///c:/Users/victo/.gemini/antigravity/scratch/training-os/src/components/planner/SessionReadView.jsx#L592) y [`Home.jsx:L152`](file:///c:/Users/victo/.gemini/antigravity/scratch/training-os/src/pages/Home.jsx#L152).
   * **Código:**
     ```jsx
     <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
       <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>
     </svg>
     ```
   * **Propósito:** Botón de renombrar inline el título de la sesión sin importar el icono `Pencil` de Lucide.

2. **Icono Temporizador / FAB Flotante de Sesión:**
   * **Archivo:** [`Session.jsx:L492-495`](file:///c:/Users/victo/.gemini/antigravity/scratch/training-os/src/pages/Session.jsx#L492-L495).
   * **Código:**
     ```jsx
     <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
       <circle cx="12" cy="12" r="10"/>
       <polyline points="12 6 12 12 16 14"/>
     </svg>
     ```
   * **Propósito:** Botón de acción flotante (FAB) para desplegar el temporizador global.

3. **Anillo de Progreso 3D con Gradientes y Filtros Blur:**
   * **Archivo:** [`CountdownRing.jsx:L28-133`](file:///c:/Users/victo/.gemini/antigravity/scratch/training-os/src/components/timer/CountdownRing.jsx#L28-L133).
   * **Estructura vectorial:**
     * `<defs>`: 3 gradientes lineales (`linearGradient` para color principal, highlight bevel 3D y sombra profunda) y 1 filtro `<feGaussianBlur stdDeviation="5">` para efecto neón/glow.
     * `<circle>`: 6 capas concéntricas de círculos superpuestos (track fondo, track highlight, glow difuso, anillo principal, highlight bisel, sombra de profundidad exterior).
   * **Propósito:** Cronómetro circular responsive con profundidad 3D en la pantalla `/timer`.

4. **Gráfica Sparkline Vectorial con Gradiente de Área:**
   * **Archivo:** [`Evolution.jsx:L127-138`](file:///c:/Users/victo/.gemini/antigravity/scratch/training-os/src/pages/Evolution.jsx#L127-L138).
   * **Estructura vectorial:**
     * `<defs>`: `<linearGradient id="sg">` naranja degradado de opacidad 0.3 a 0.
     * `<path d={fillPath}>`: Relleno poligonal del área bajo la curva de 1RM.
     * `<polyline>`: Línea de tendencia continua naranja de 2px con puntas redondeadas.
     * `<circle>`: Punto focal en el dato más reciente con borde blanco.
   * **Propósito:** Mini gráfica de evolución histórica por ejercicio en las tarjetas de PRs.

---

### 6. Componentes Gráficos y Visuales Especializados

| Componente | Archivo | Tipo de Renderizado | Propósito Visual |
|---|---|---|---|
| **`TrafficLightBadge`** | [`src/components/performance/TrafficLightBadge.jsx`](file:///c:/Users/victo/.gemini/antigravity/scratch/training-os/src/components/performance/TrafficLightBadge.jsx) | CSS Flexbox + Rectángulos segmentados (16x6px a 40x10px) | Marcador estilo tablero deportivo electrónico de 3 segmentos (Verde: 3 encendidos, Amarillo: 2, Rojo: 1) para el motor de rendimiento. |
| **`CountdownRing`** | [`src/components/timer/CountdownRing.jsx`](file:///c:/Users/victo/.gemini/antigravity/scratch/training-os/src/components/timer/CountdownRing.jsx) | SVG Multicapa interactivo | Anillo de cuenta regresiva con iluminación volumétrica. |
| **`ProgressBar`** | [`src/components/ProgressBar.jsx`](file:///c:/Users/victo/.gemini/antigravity/scratch/training-os/src/components/ProgressBar.jsx) | CSS Gradient + Animación `.flash-green` | Barra horizontal de avance con feedback dinámico textual y destello al llegar al 100%. |
| **`StarRating`** | [`src/components/FeedbackSection.jsx`](file:///c:/Users/victo/.gemini/antigravity/scratch/training-os/src/components/FeedbackSection.jsx#L28-L49) | Lucide Star interactivo (`fill`/`color`) | Sistema de calificación de sesión de 1 a 5 estrellas con relleno naranja `#FF6B00`. |
| **`Sparkline`** | [`src/pages/Evolution.jsx`](file:///c:/Users/victo/.gemini/antigravity/scratch/training-os/src/pages/Evolution.jsx#L112-L139) | SVG Math interpolation | Mini gráfico de tendencia histórica de 1RM. |
| **Gráficos Recharts** | [`src/pages/Evolution.jsx`](file:///c:/Users/victo/.gemini/antigravity/scratch/training-os/src/pages/Evolution.jsx#L12-L14) | SVG vía biblioteca Recharts | `ResponsiveContainer`, `BarChart`, `LineChart`, `CartesianGrid`, `Cell` para volumen semanal, RPE y carga acumulada. |
| **`BlockTypeSelector`** | [`src/components/timer/BlockTypeSelector.jsx`](file:///c:/Users/victo/.gemini/antigravity/scratch/training-os/src/components/timer/BlockTypeSelector.jsx) | Paleta de círculos CSS (8 colores hex) | Selector de tipos de bloque con indicador cromático y creación de tipos personalizados. |
| **Avatar Inicial Monograma** | [`src/pages/Profile.jsx:L187`](file:///c:/Users/victo/.gemini/antigravity/scratch/training-os/src/pages/Profile.jsx#L187) | CSS Box con tipografía display (`Big Shoulders Display`) | Monograma de 80x80px con la letra inicial del atleta en azul `#3B82F6`. |

---

### 7. Elementos Visuales Dinámicos y Mapas de Iconos

#### A. Tipos de Sesión y Colores ([`src/data/mockPlanner.js`](file:///c:/Users/victo/.gemini/antigravity/scratch/training-os/src/data/mockPlanner.js#L230-L239))
```javascript
export const SESSION_TYPES = {
  gym_potencia:    { color: '#e8412a', icon: '⚡',  label: 'Potencia',    sport: 'gym'    },
  gym_fuerza:      { color: '#3d7dd4', icon: '🏋️', label: 'Fuerza',      sport: 'gym'    },
  gym_hipertrofia: { color: '#8e44ad', icon: '💪',  label: 'Hipertrofia', sport: 'gym'    },
  tkd:             { color: '#f5a623', icon: '🥋',  label: 'TKD',         sport: 'tkd'    },
  tkd_sparring:    { color: '#e8412a', icon: '🥊',  label: 'Sparring',    sport: 'tkd'    },
  cardio:          { color: '#16a085', icon: '🚴',  label: 'Cardio',      sport: 'cardio' },
  descanso:        { color: '#2a3050', icon: '😴',  label: 'Descanso',    sport: 'all'    },
  libre:           { color: '#7a8099', icon: '🎯',  label: 'Libre',       sport: 'all'    },
};
```

#### B. Deportes y Actividades ([`src/pages/Onboarding.jsx`](file:///c:/Users/victo/.gemini/antigravity/scratch/training-os/src/pages/Onboarding.jsx#L19-L27))
```javascript
export const DEFAULT_SPORTS = [
  { id: 'gym',   label: 'Gimnasio',  icon: '🏋️' },
  { id: 'tkd',   label: 'Taekwondo', icon: '🥋' },
  { id: 'box',   label: 'Boxeo',     icon: '🥊' },
  { id: 'judo',  label: 'Judo',      icon: '🤼' },
  { id: 'swim',  label: 'Natación',  icon: '🏊' },
  { id: 'cycle', label: 'Ciclismo',  icon: '🚴' },
  { id: 'run',   label: 'Running',   icon: '🏃' },
  { id: 'cf',    label: 'Crossfit',  icon: '⚔️' },
  // Deporte custom fallback:
  { id: 'custom-...', icon: '🎯' }
];
```

#### C. Métricas de Bienestar y Check-In ([`src/components/performance/WellnessCheckIn.jsx`](file:///c:/Users/victo/.gemini/antigravity/scratch/training-os/src/components/performance/WellnessCheckIn.jsx#L4-L34))
* **Sueño (`sleep`):** Icono `😴` — Escala: `['😴','😐','🙂','😊','🤩']`
* **Estrés (`stress`):** Icono `😤` — Escala: `['😤','😟','😐','🙂','😊']`
* **Energía (`energy`):** Icono `⚡` — Escala: `['😴','😐','🙂','😊','🤩']`
* **Dolor muscular (`doms`):** Icono `🦵` — Escala: `['🤩','😊','😐','😟','😤']`

#### D. Velocidad Percibida en Series ([`src/components/SetLoggerSheet.jsx:L571-575`](file:///c:/Users/victo/.gemini/antigravity/scratch/training-os/src/components/SetLoggerSheet.jsx#L571-L575))
* **Lenta:** `🐢` (Badge: fondo `#FFF3EC`, borde `#FF6B00`, texto `#FF6B00`)
* **Media:** `⚡` (Badge: fondo `#FFFBEC`, borde `#f5a623`, texto `#f5a623`)
* **Rápida:** `🚀` (Badge: fondo `#F0FFF4`, borde `#27ae60`, texto `#27ae60`)

#### E. Tarjetas del Performance Dashboard ([`src/pages/PerformanceDashboard.jsx:L40-77`](file:///c:/Users/victo/.gemini/antigravity/scratch/training-os/src/pages/PerformanceDashboard.jsx#L40-L77))
* **Fatiga del Sistema Nervioso:** `🔥`
* **Capacidad de Recuperación:** `💚`
* **Estímulo y Carga Aguda:** `⚡`
* **Sobrecarga y Progresión:** `📈`
* **Balance de Patrones:** `⚖️`
* **Transferencia Deportiva:** `🥋`

#### F. Tipos de Bloque en Timer / Planner ([`src/components/timer/BlockTypeSelector.jsx:L11-17`](file:///c:/Users/victo/.gemini/antigravity/scratch/training-os/src/components/timer/BlockTypeSelector.jsx#L11-L17))
* **Preparación:** `#f5a623` (Amarillo)
* **Calentamiento:** `#e67e22` (Naranja oscuro)
* **Trabajo:** `#FF6B00` (Naranja de carreras)
* **Descanso:** `#3d7dd4` (Azul cobalto)
* **Cooldown:** `#27ae60` (Verde esmeralda)

---

### 8. Detección de Duplicados, Variantes y Equivalencias

1. **Iconos de Check / Confirmación (4 variantes para el mismo concepto):**
   * `Check` (Lucide — línea simple, 10 usos)
   * `CheckCircle` (Lucide — círculo con check, 2 usos)
   * `CheckCircle2` (Lucide — círculo con check estilizado, 5 usos)
   * `Circle` (Lucide — círculo vacío para estado no marcado, 2 usos)
2. **Iconos de Compartir (2 variantes coexistiendo):**
   * `Share` (Lucide — flecha saliente de caja, en modal de exportación)
   * `Share2` (Lucide — nodos de red conectados, en modal de exportación y sesión)
3. **Iconos de Nube / Sincronización (3 variantes):**
   * `DownloadCloud` (Descargar desde la nube, 7 usos)
   * `UploadCloud` (Subir a la nube, 2 usos)
   * `CloudUpload` (Subir a la nube — variante alternativa en `Session.jsx`, 1 uso)
4. **Icono Lápiz / Edición (Librería vs SVG Inline):**
   * `Pencil` de `lucide-react` en `Profile.jsx` (L177).
   * `<svg><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>` inline idéntico en `Home.jsx` (L152) y `SessionReadView.jsx` (L592).
5. **Icono Vista Previa / Ojo (Librería vs Emoji):**
   * Importación de `Eye` de `lucide-react` en `SessionEditor.jsx` (L3) sin usar.
   * Renderizado directo de `<span>👁</span>` en `SessionEditor.jsx` (L517).
6. **Icono Temporizador (Librería vs SVG Inline vs Emoji):**
   * `Timer` de `lucide-react` en `BottomNav`, `Home` y `SetLoggerSheet`.
   * `Clock` de `lucide-react` en `SessionReadView`, `ImportSession` y `SessionDetailView`.
   * SVG Inline de reloj con manecillas en FAB de `Session.jsx` (L492).
   * Emoji `⏱` como prefijo de texto en `Home.jsx` (L158).
7. **Icono Usuario / Identidad:**
   * `User` (1 uso)
   * `Users` (4 usos)
   * `UserCheck` (1 uso)
   * `UserCircle` (importado sin renderizar en `Register.jsx`)

---

### 9. Elementos Cuya Utilización No Ha Podido Determinarse (Huérfanos / Dormidos)

#### A. Archivos Físicos sin Referencia Activa en el Código
1. **`src/assets/hero.png`:** Imagen de banner no referenciada por ningún componente.
2. **`src/assets/react.svg`:** Icono boilerplate de React.
3. **`src/assets/vite.svg`:** Icono boilerplate de Vite.
4. **`public/icons.svg`:** Sprite SVG con símbolos para Bluesky, Discord, GitHub, X, etc. No es consumido por ningún elemento `<use href="...">`.
5. **`public/favicon.svg`:** Favicon SVG no enlazado en `index.html` (que enlaza a `.png`).

#### B. Importaciones de Iconos de Librería Dormidas (Importados pero con 0 renders JSX)
* **`Award`** en `Onboarding.jsx`
* **`Eye`** en `SessionEditor.jsx` (sustituido por emoji `👁`)
* **`Heart`** en `Evolution.jsx`
* **`ClipboardList`** en `Evolution.jsx`
* **`Activity`** en `Evolution.jsx`
* **`Trophy`** en `Evolution.jsx`
* **`TrendingUp`** en `Evolution.jsx`
* **`Dumbbell`** en `Onboarding.jsx`
* **`RefreshCw`** en `Profile.jsx`
* **`UserCircle`** en `Register.jsx`
* **`CheckCircle2`** en `Session.jsx`
* **`RotateCcw`** en `CircuitPlayer.jsx`
* **`ChevronRight`** en `ImportSession.jsx` y `SessionDetailView.jsx`
* **`Users`** en `CoachDashboard.jsx`

#### C. Utilidades CSS Visuales No Enlazadas
* **`.barcode-sim` en [`src/index.css:L249-257`](file:///c:/Users/victo/.gemini/antigravity/scratch/training-os/src/index.css#L249-L257):** Generador CSS de código de barras simulado mediante `repeating-linear-gradient`. No está presente en ningún elemento JSX actual.
* **`.dossier-header-border` en [`src/index.css:L260-262`](file:///c:/Users/victo/.gemini/antigravity/scratch/training-os/src/index.css#L260-L262):** Borde doble de estilo técnico documental sin uso actual en JSX.

---

### 10. Posibles Limitaciones del Análisis

1. **Emojis dependientes de la plataforma/SO:**  
   Gran parte de la iconografía de deportes (`🏋️`, `🥋`, `🥊`, `🤼`, `🏊`, `🚴`, `🏃`, `⚔️`) y métricas de bienestar (`😴`, `😤`, `⚡`, `🦵`, `🐢`, `🚀`) depende de los glifos de fuentes nativas del sistema operativo (Apple Color Emoji en iOS/macOS, Noto Color Emoji en Android/Linux, Segoe UI Emoji en Windows). Su apariencia visual puede variar sensiblemente entre dispositivos móviles y de escritorio.
2. **Iconos dinámicos en `BottomNav` y Session Icons:**  
   En `BottomNav.jsx`, los iconos se instancian como componentes de primera clase pasados como prop (`const Icon = item.icon; <Icon />`). Esto impide el conteo directo estático de etiquetas `<Home />` o `<CalendarDays />`, aunque fueron verificados mediante análisis dinámico en este informe.
3. **Sprites y Mock Data:**  
   Los archivos de mocks (`mockPlanner.js`, `mockSession.js`) definen iconos emoji y tipos de sesión que se cargan condicionalmente si el usuario opera en modo demostración o sin conexión con Google Sheets.
4. **Validación independiente completada:**  
   Se ejecutó un doble barrido recursivo mediante scripts de análisis sintáctico en Node.js sobre todo el árbol de archivos `.jsx`, `.js`, `.css`, `.html` y `.json`, confirmando la ausencia de recursos gráficos ocultos.

---

*Informe generado automáticamente para la Fase 1 de la Auditoría Visual de TrainingOS.*
