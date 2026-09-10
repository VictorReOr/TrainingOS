# TrainingOS — Functional Visual Analysis

## Analysis Information

| Field | Value |
|---|---|
| **Model** | Claude Sonnet 4.6 (Thinking) |
| **Reasoning level** | Extended thinking |
| **Analysis date** | 2026-08-20 |
| **Source document** | `/docs/visual-assets/PHASE_1_TECHNICAL_DISCOVERY.md` |
| **Scope** | Functional classification of all visual assets identified in Phase 1 |
| **Method** | No design decisions made. Pure functional documentation. |

---

## Executive Summary

Phase 1 identified **122 distinct visual elements** across TrainingOS (75 Lucide icons, 5 inline SVG implementations, 7 specialized visual components, 7 dynamic icon/emoji maps, 16 physical image files, and CSS visual utilities). This Phase 2 analysis groups them into **10 functional families** derived from how TrainingOS actually works — not from file location or library membership.

The families discovered are:

| # | Family | Description | Element count |
|---|---|---|---|
| 01 | **Brand & Identity** | Logo, splash screens, app icons, avatar monogram | 14 |
| 02 | **Navigation & Wayfinding** | Arrows, chevrons, tab bar icons, back buttons | 14 |
| 03 | **Session Execution** | Play/pause/stop, timers, progress, rest controls | 19 |
| 04 | **Training Planning** | Session types, block types, planner actions | 13 |
| 05 | **Data & Progress Visualization** | Charts, sparklines, traffic light, progress bar | 9 |
| 06 | **Athlete & Coach Identity** | Role badges, user icons, profile, onboarding | 9 |
| 07 | **Data Management** | Import, export, sync, save, share, copy | 10 |
| 08 | **Feedback & State** | Alerts, checks, confirmation, loading, ratings | 14 |
| 09 | **Sport & Activity Classification** | Sport emoji icons, session type icons, wellness metrics | 22 |
| 10 | **Form & Input Affordances** | Field prefix icons, search, form navigation | 6 |
| — | **Unclassified** | Orphan/dormant elements without clear active role | 12+ |

**Key structural finding:** TrainingOS uses three parallel icon systems simultaneously — Lucide icons (library), inline SVG (custom hand-coded), and emoji glyphs (system font). These three systems often represent the same semantic concept using different visual implementations, which is documented throughout this analysis.

---

## Functional Families

---

### Family 01 — Brand & Identity

Elements that represent TrainingOS as a product in persistent or system-level surfaces. These appear before the user interacts with the app's content, or at OS level (home screen, notifications).

---

**01.01 — Logo horizontal de la marca**
| Field | Value |
|---|---|
| **Name** | Logo horizontal de TrainingOS |
| **What it represents** | The full wordmark + brand symbol of TrainingOS displayed horizontally |
| **Family** | Brand & Identity |
| **Type** | Raster image |
| **Format** | PNG |
| **File** | `public/Logo_trainingOS.png` |
| **Path** | `/public/Logo_trainingOS.png` |
| **Component** | `SplashScreen.jsx` (L31) |
| **Screen** | Splash / Loading screen |
| **Route** | `/` (app startup) |
| **Use** | App boot sequence. Displayed while Firebase/auth initializes |
| **References** | 1 component, 1 screen |
| **Library** | — (physical file) |
| **Variants** | `Icono_trainingOS.png` (isotipo-only variant), Android launcher icons |
| **Duplicates** | Conceptually equivalent to Android splash.png but different format and context |
| **Notes** | 91.7 KB — largest active image in the web bundle. Served statically from `public/`. |

---

**01.02 — Isotipo fuente de marca**
| Field | Value |
|---|---|
| **Name** | Isotipo de TrainingOS (símbolo aislado) |
| **What it represents** | The standalone symbol/icon of the TrainingOS brand, without the wordmark |
| **Family** | Brand & Identity |
| **Type** | Raster image |
| **Format** | PNG |
| **File** | `public/Icono_trainingOS.png` |
| **Path** | `/public/Icono_trainingOS.png` |
| **Component** | None active |
| **Screen** | Not rendered in app |
| **Route** | — |
| **Use** | Source asset for generating PWA icons and Android launcher images |
| **References** | 0 active references |
| **Library** | — (physical file) |
| **Variants** | `Logo_trainingOS.png` (horizontal variant with wordmark), Android mipmaps |
| **Duplicates** | Android launcher icons at multiple densities are derived from this |
| **Notes** | 215.7 KB. Highest-resolution brand asset in the project. Not served at runtime. |

---

**01.03 — Splash screen nativo Android**
| Field | Value |
|---|---|
| **Name** | Pantalla de arranque nativa Android |
| **What it represents** | The full-screen image displayed by Android while the Capacitor WebView loads |
| **Family** | Brand & Identity |
| **Type** | Raster image |
| **Format** | PNG |
| **File** | `public/splash.png` + `android/app/src/main/res/drawable[-density]/splash.png` |
| **Path** | Multiple: `public/splash.png`, `drawable/`, `drawable-land-*/`, `drawable-port-*/` |
| **Component** | Android native (Capacitor splash plugin) |
| **Screen** | Native OS layer, before app renders |
| **Route** | App launch (before any route) |
| **Use** | Shown by Android during cold start while WebView initializes |
| **References** | Referenced by Capacitor config; 10+ density-specific copies in `res/` |
| **Library** | Capacitor Splash Screen plugin |
| **Variants** | Landscape and portrait variants at hdpi / mdpi / xhdpi / xxhdpi / xxxhdpi |
| **Duplicates** | `public/splash.png` appears to be the source; Android copies are derived |
| **Notes** | 123.8 KB (web copy). The multi-density Android copies vary in size. |

---

**01.04 — Icono de app en launcher / home screen (familia completa)**
| Field | Value |
|---|---|
| **Name** | Iconos de la app TrainingOS (launcher, PWA, notificaciones) |
| **What it represents** | The app's icon as displayed on device home screens, task switchers, and notification trays |
| **Family** | Brand & Identity |
| **Type** | Raster images (PNG) + Vector XML (Android) |
| **Format** | PNG, XML |
| **Files** | `icon-48.png`, `icon-72.png`, `icon-96.png`, `icon-180.png`, `icon-192.png`, `icon-512.png`; Android mipmaps `ic_launcher*.png`, `ic_launcher*.xml` |
| **Path** | `public/` (web) + `android/app/src/main/res/mipmap-*/` (Android) |
| **Component** | `index.html` (link tags), `manifest.json`, `TimerContext.jsx` (L47 — notification icon) |
| **Screen** | OS-level (not in-app) |
| **Route** | Global / system |
| **Use** | PWA install icon, Android launcher icon, Apple touch icon, notification badge image |
| **References** | `index.html` (3 refs), `manifest.json` (5 refs), `TimerContext.jsx` (1 ref for push notifications) |
| **Library** | — (physical files) |
| **Variants** | 6 PNG sizes for web; 15+ files for Android (round, foreground, background, anydpi) |
| **Duplicates** | All sizes are variants of the same brand symbol (`Icono_trainingOS.png`) |
| **Notes** | `icon-180.png` is the only icon actively used at runtime within app code (TimerContext push notification). All others are referenced from `index.html`/`manifest.json` at install time. |

---

**01.05 — Avatar monograma del atleta**
| Field | Value |
|---|---|
| **Name** | Avatar inicial del perfil de atleta |
| **What it represents** | A typographic avatar showing the athlete's initial letter when no photo is available |
| **Family** | Brand & Identity |
| **Type** | CSS-generated typographic element |
| **Format** | CSS box + Big Shoulders Display typeface |
| **File** | `src/pages/Profile.jsx` (L187) |
| **Path** | Rendered inline in Profile page |
| **Component** | `Profile.jsx` |
| **Screen** | Perfil del atleta |
| **Route** | `/profile` |
| **Use** | Identity placeholder. Shows the user's first initial in a styled circular/square container (80×80px, blue `#3B82F6` background) when no profile photo exists |
| **References** | 1 component, 1 screen |
| **Library** | None (CSS + Google Fonts `Big Shoulders Display`) |
| **Variants** | No photo-based variant exists currently |
| **Duplicates** | None |
| **Notes** | Relies on `Big Shoulders Display` display typeface for visual weight. The color is hardcoded to `#3B82F6` (blue) regardless of the user's assigned sport color. |

---

### Family 02 — Navigation & Wayfinding

Elements that help users orient themselves within the app's structure and move between screens. These elements carry no training-specific meaning — their job is purely directional.

---

**02.01 — Barra de navegación inferior (tab bar)**
| Field | Value |
|---|---|
| **Name** | Barra de navegación inferior |
| **What it represents** | The persistent bottom tab bar giving access to the 5 main sections of the app |
| **Family** | Navigation & Wayfinding |
| **Type** | Dynamic icon array (Lucide components passed as props) |
| **Format** | Lucide React components |
| **File** | `src/components/BottomNav.jsx` |
| **Path** | Global (rendered in all authenticated screens) |
| **Component** | `BottomNav.jsx` |
| **Screen** | All authenticated screens |
| **Route** | Global |
| **Use** | Primary navigation. The 5 tabs are: Home (`Home` icon), Plan (`CalendarDays`), Session (`Play`), Timer (`Timer`), Evolution (`TrendingUp`). Coach role adds: Coach Dashboard (`Users`) |
| **References** | 6 icon components rendered dynamically via `const Icon = item.icon; <Icon />` |
| **Library** | `lucide-react` |
| **Variants** | Active tab state changes label color/weight; icon shape stays constant |
| **Duplicates** | `Play` (tab icon) also used for session start buttons throughout the app |
| **Notes** | Icons are not rendered as static `<Play />` JSX — they are passed as component references in a navigation config array. Static grep for `<Home />` returns 0; actual rendering is dynamic. |

**Individual tab icons documented here for reference:**

| Tab | Lucide Icon | Route |
|---|---|---|
| Inicio | `Home` | `/` |
| Plan | `CalendarDays` | `/plan` |
| Sesión | `Play` | `/session` |
| Timer | `Timer` | `/timer` |
| Evolución | `TrendingUp` | `/evolution` |
| Coach (role-gated) | `Users` | `/coach` |

---

**02.02 — Flecha de retroceso (volver a pantalla anterior)**
| Field | Value |
|---|---|
| **Name** | Botón de retroceso / volver atrás |
| **What it represents** | A left-facing arrow or chevron indicating "go back to the previous screen" |
| **Family** | Navigation & Wayfinding |
| **Type** | Lucide icon |
| **Format** | SVG via lucide-react |
| **File** | Multiple: `ImportSession.jsx`, `PerformanceDashboard.jsx`, `SessionDetailView.jsx`, `SessionReadView.jsx`, `Plan.jsx`, `Profile.jsx`, `AthleteDetail.jsx`, `ExerciseReview.jsx`, `MyRoutines.jsx`, `SessionEditor.jsx`, `WeekRepetitionModal.jsx` |
| **Component** | Used in page headers as a back button |
| **Screen** | All sub-pages (not top-level tabs) |
| **Route** | `/import`, `/performance`, `/plan/session-detail`, `/plan/session-detail` (modal), `/plan`, `/profile`, `/coach/:id`, `/exercises/review`, `/coach/routines`, `/plan/session/new` |
| **Use** | Header back navigation |
| **References** | `ArrowLeft`: 4 renders across 3 files; `ChevronLeft`: 8 renders across 8 files |
| **Library** | `lucide-react` |
| **Variants** | Two variants used for the same semantic purpose: `ArrowLeft` (longer, with a shaft) and `ChevronLeft` (shorter, angle-only). No consistent rule governs which is used where. |
| **Duplicates** | `ArrowLeft` and `ChevronLeft` are functional duplicates in the "back" context |
| **Notes** | No consistent rule governs the use of `ArrowLeft` vs `ChevronLeft` as a back button. Both appear in headers across different pages. |

---

**02.03 — Indicador de acción expandible / colapsable**
| Field | Value |
|---|---|
| **Name** | Chevron de expansión / colapso de sección |
| **What it represents** | A chevron pointing up or down to signal that a UI section can be expanded or collapsed |
| **Family** | Navigation & Wayfinding |
| **Type** | Lucide icon |
| **Format** | SVG via lucide-react |
| **File** | `EditableExercise.jsx`, `PerformanceDashboard.jsx`, `ExerciseReview.jsx` |
| **Component** | Accordion / collapsible rows |
| **Screen** | `/plan/session/new`, `/performance`, `/exercises/review` |
| **Use** | Show/hide detail of an exercise, a performance metric card, or a review section |
| **References** | `ChevronDown`: 5 renders; `ChevronUp`: 2 renders |
| **Library** | `lucide-react` |
| **Variants** | `ChevronDown` (collapsed state) ↔ `ChevronUp` (expanded state). Same element toggled programmatically |
| **Duplicates** | None within this specific use |
| **Notes** | `ChevronDown` is also used as a dropdown indicator in `SportSelector.jsx` and `ImportSession.jsx`, which is a different semantic function (selector affordance, not section toggle). See cross-family note. |

---

**02.04 — Flecha de avance en lista / paginador semanal**
| Field | Value |
|---|---|
| **Name** | Indicador de elemento siguiente / avanzar en paginador |
| **What it represents** | A right-facing chevron or arrow indicating "next item," "open detail," or "advance week" |
| **Family** | Navigation & Wayfinding |
| **Type** | Lucide icon |
| **Format** | SVG via lucide-react |
| **File** | `ReadinessModal.jsx`, `SessionReadView.jsx`, `WeekRepetitionModal.jsx`, `Evolution.jsx`, `Onboarding.jsx`, `Plan.jsx`, `CoachDashboard.jsx`, `MesocycleList.jsx`, `SeasonList.jsx` |
| **Component** | List rows (drill-down), week pager, onboarding step indicator |
| **Screen** | `/plan`, `/plan/seasons`, `/plan/seasons/:id`, `/evolution`, `/onboarding`, `/coach`, modals |
| **Use** | Signals that a row is tappable (drill-down), advances weekly plan view, moves to next onboarding step |
| **References** | `ChevronRight`: 9 renders across 9 files |
| **Library** | `lucide-react` |
| **Variants** | `ArrowRight` (2 renders in `SetLoggerSheet.jsx`) is used in a different context — exercise log progression — not list navigation |
| **Duplicates** | `ChevronRight` is also imported but dormant in `ImportSession.jsx` and `SessionDetailView.jsx` |
| **Notes** | In `Plan.jsx`, `ChevronRight` advances the week view calendar. In list contexts (`SeasonList`, `MesocycleList`), it signals drill-down navigation. Two distinct sub-uses under the same icon. |

---

**02.05 — Reordenar elemento (subir / bajar)**
| Field | Value |
|---|---|
| **Name** | Controles de reordenamiento de bloque o ejercicio |
| **What it represents** | Up and down arrows to change the order of training blocks or exercises in a list |
| **Family** | Navigation & Wayfinding |
| **Type** | Lucide icon |
| **Format** | SVG via lucide-react |
| **File** | `EditableBlock.jsx` (`ArrowUp`, `ArrowDown`), `CircuitConfigurator.jsx` (`MoveUp`, `MoveDown`) |
| **Component** | Block editor, circuit configurator |
| **Screen** | `/plan/session/new`, `/plan/session/:id/edit`, timer configurator |
| **Use** | Reorder training blocks within a session; reorder intervals within a circuit |
| **References** | `ArrowUp`: 1 render; `ArrowDown`: 1 render; `MoveUp`: 1 render; `MoveDown`: 1 render |
| **Library** | `lucide-react` |
| **Variants** | `ArrowUp`/`ArrowDown` (in planner) vs `MoveUp`/`MoveDown` (in circuit configurator). Different icon families for the same concept in two different editors. |
| **Duplicates** | `ArrowUp`/`ArrowDown` and `MoveUp`/`MoveDown` are functional duplicates for list reordering |
| **Notes** | Four distinct Lucide icons used for the single concept of "change order." |

---

### Family 03 — Session Execution

Elements that appear during an active training session — the most time-critical and interaction-dense part of the app. These icons and visuals control timing, logging, progression, and completion.

---

**03.01 — Botón de inicio de sesión de entrenamiento**
| Field | Value |
|---|---|
| **Name** | Botón de iniciar sesión / comenzar entrenamiento |
| **What it represents** | The primary action to start a planned training session |
| **Family** | Session Execution |
| **Type** | Lucide icon |
| **Format** | SVG via lucide-react |
| **File** | `Home.jsx`, `DraftRecoveryModal.jsx`, `SessionReadView.jsx`, `ImportSession.jsx` |
| **Component** | CTA buttons on Home, plan read view, import screen |
| **Screen** | `/` (home), `/plan/session-detail`, `/import/:code` |
| **Use** | The primary CTA that initiates a training session |
| **References** | `Play`: 14 total renders. Relevant to session start: ~4 renders across `Home.jsx` and `SessionReadView.jsx` |
| **Library** | `lucide-react` |
| **Variants** | Same `Play` icon is reused in the timer subsystem (see 03.03). Context distinguishes function. |
| **Duplicates** | `Play` in `BottomNav.jsx` (tab icon for session section) vs `Play` as CTA button — same icon, different affordance |
| **Notes** | The `Play` icon carries triple duty: tab bar destination, session start CTA, and timer control. High semantic load on one symbol. |

---

**03.02 — FAB del temporizador durante sesión activa**
| Field | Value |
|---|---|
| **Name** | Botón flotante de acceso al temporizador (FAB) |
| **What it represents** | A floating action button (FAB) overlaid on the active session screen that opens the global timer |
| **Family** | Session Execution |
| **Type** | Inline SVG (custom) |
| **Format** | SVG hardcoded in JSX |
| **File** | `src/pages/Session.jsx` (L492–495) |
| **Component** | `Session.jsx` — persistent FAB overlay |
| **Screen** | Sesión activa |
| **Route** | `/session` |
| **Use** | Persistent floating button. Tapping opens the full timer view. The clock SVG visually signals "time" |
| **References** | 1 component, 1 screen |
| **Library** | None (custom inline SVG) |
| **Variants** | The same clock concept is expressed as `Timer` (Lucide) in `BottomNav`, `Clock` (Lucide) in `SessionReadView`, and emoji `⏱` in `Home.jsx` |
| **Duplicates** | Functionally related to `Timer` (Lucide) and `Clock` (Lucide). See duplicate group DUP-06. |
| **Notes** | This is the only inline SVG used as an interactive control (vs. decorative). The custom SVG uses `strokeWidth="3"` for heavier visual weight than Lucide's default 2. |

---

**03.03 — Controles de reproducción del temporizador (play / pausa / stop)**
| Field | Value |
|---|---|
| **Name** | Controles de reproducción del temporizador |
| **What it represents** | Standard media playback controls adapted for timer use: start, pause, and stop |
| **Family** | Session Execution |
| **Type** | Lucide icons |
| **Format** | SVG via lucide-react |
| **File** | `TimerViews.jsx`, `CircuitPlayer.jsx`, `GlobalRestModal.jsx` |
| **Component** | Timer views, circuit interval player, global rest modal |
| **Screen** | `/timer`, timer overlay during session |
| **Route** | `/timer`, modal overlaid on `/session` |
| **Use** | Start/resume timer (`Play`), pause timer (`Pause`), stop timer (`Square`) |
| **References** | `Play`: 6 renders in `TimerViews.jsx` + 1 in `CircuitPlayer.jsx`; `Pause`: 3 + 1; `Square`: 3 + 1 |
| **Library** | `lucide-react` |
| **Variants** | `Square` (filled stop) is used instead of a traditional "stop" icon |
| **Duplicates** | `Play` and `Pause` are shared with session-start and draft-recovery contexts |
| **Notes** | Using `Square` as "stop" follows standard media player conventions but is visually distinct from a dedicated "stop" icon. |

---

**03.04 — Adelantar temporizador (+10 segundos)**
| Field | Value |
|---|---|
| **Name** | Botón de adelantar temporizador 10 segundos |
| **What it represents** | Skip forward a fixed duration in the timer (typically +10 seconds) |
| **Family** | Session Execution |
| **Type** | Lucide icon |
| **Format** | SVG via lucide-react |
| **File** | `GlobalRestModal.jsx`, `TimerViews.jsx` |
| **Component** | Rest modal, timer views |
| **Screen** | `/timer`, rest timer modal |
| **Use** | Lets the athlete skip ahead in a rest timer or countdown |
| **References** | `FastForward`: 2 renders |
| **Library** | `lucide-react` |
| **Variants** | None |
| **Duplicates** | None |
| **Notes** | `FastForward` carries a "media skip" metaphor repurposed for interval training. The "+10s" label typically accompanies it. |

---

**03.05 — Reiniciar temporizador**
| Field | Value |
|---|---|
| **Name** | Botón de reiniciar temporizador |
| **What it represents** | Reset the current timer back to its starting value |
| **Family** | Session Execution |
| **Type** | Lucide icon |
| **Format** | SVG via lucide-react |
| **File** | `TimerViews.jsx`, `DraftRecoveryModal.jsx` |
| **Component** | Timer views, draft recovery modal |
| **Screen** | `/timer`, recovery modal |
| **Use** | Resets a countdown or stopwatch. Also used in `DraftRecoveryModal` to discard draft and restart |
| **References** | `RotateCcw`: 4 renders across 4 files (2 timer-related, 1 draft discard, 1 filter reset in Evolution) |
| **Library** | `lucide-react` |
| **Variants** | None |
| **Duplicates** | Same icon used for filter reset in `Evolution.jsx` — semantically different (data filter, not timer) |
| **Notes** | `RotateCcw` spans two distinct functional families: Session Execution (timer reset) and Data Management (filter clear). The shared shape creates cross-context ambiguity. |

---

**03.06 — Anillo de cuenta regresiva (CountdownRing)**
| Field | Value |
|---|---|
| **Name** | Anillo de cuenta regresiva 3D |
| **What it represents** | A circular ring that empties as the timer counts down, providing a visual representation of remaining time |
| **Family** | Session Execution |
| **Type** | Custom inline SVG component |
| **Format** | Multi-layer SVG with gradients and Gaussian blur |
| **File** | `src/components/timer/CountdownRing.jsx` |
| **Component** | `CountdownRing` — rendered by `TimerViews.jsx` and `CircuitPlayer.jsx` |
| **Screen** | `/timer`, circuit interval player |
| **Route** | `/timer` |
| **Use** | Primary visual countdown indicator. A `strokeDashoffset` animation drives the ring progress. The 3D effect comes from 6 concentric SVG circle layers, 3 linear gradients, and 1 Gaussian blur filter |
| **References** | 1 dedicated component, used by at least 2 parent components |
| **Library** | None (custom SVG) |
| **Variants** | Ring color adapts to block type (preparation, work, rest, cooldown) |
| **Duplicates** | None — unique in the codebase |
| **Notes** | The most visually complex element in TrainingOS. This is the focal point of the `/timer` screen. The blur filter creates a glow effect simulating LED/neon display aesthetics. |

---

**03.07 — Controles de intervalo en circuito (anterior / siguiente)**
| Field | Value |
|---|---|
| **Name** | Navegación de intervalos en circuito (anterior / siguiente) |
| **What it represents** | Skip to the previous or next interval in a circuit training sequence |
| **Family** | Session Execution |
| **Type** | Lucide icon |
| **Format** | SVG via lucide-react |
| **File** | `CircuitPlayer.jsx` |
| **Component** | `CircuitPlayer` |
| **Screen** | `/timer` — circuit mode |
| **Use** | Navigate between intervals in an active circuit session. Resembles a media player's track skip controls |
| **References** | `SkipBack`: 1 render; `SkipForward`: 1 render |
| **Library** | `lucide-react` |
| **Variants** | None |
| **Duplicates** | None. Semantically distinct from `ArrowLeft`/`ArrowRight` (navigation) and `FastForward` (time skip) |
| **Notes** | Media player metaphor applied to interval navigation. |

---

**03.08 — Barra de progreso de sesión**
| Field | Value |
|---|---|
| **Name** | Barra de progreso de la sesión |
| **What it represents** | A horizontal bar that fills as exercises are completed during a training session |
| **Family** | Session Execution |
| **Type** | CSS-generated component |
| **Format** | CSS gradient + flash animation |
| **File** | `src/components/ProgressBar.jsx` |
| **Component** | `ProgressBar` |
| **Screen** | Sesión activa |
| **Route** | `/session` |
| **Use** | Provides continuous feedback on overall session completion. At 100%, a green flash animation (`flash-green`) triggers as positive reinforcement |
| **References** | 1 dedicated component |
| **Library** | None (CSS only) |
| **Variants** | None |
| **Duplicates** | None |
| **Notes** | The `RotateCcw` icon appears inside `ProgressBar.jsx` as a "reset" control — that icon instance belongs to Session Execution, not to Data Management. |

---

**03.09 — Referencia de carga de semana anterior**
| Field | Value |
|---|---|
| **Name** | Indicador de referencia histórica de entrenamiento |
| **What it represents** | A clock/history icon that signals "this data comes from a previous session" |
| **Family** | Session Execution |
| **Type** | Lucide icon |
| **Format** | SVG via lucide-react |
| **File** | `SetLoggerSheet.jsx` |
| **Component** | `SetLoggerSheet` — set logging sheet |
| **Screen** | Sesión activa — registro de series |
| **Route** | `/session` |
| **Use** | Shown alongside the weight/reps logged in the equivalent exercise from the previous week, giving the athlete a performance reference |
| **References** | `History`: 1 render |
| **Library** | `lucide-react` |
| **Variants** | None |
| **Duplicates** | None |
| **Notes** | The `History` icon carries a specific domain meaning in this context: "data from the equivalent session last week" — not generic history/undo. |

---

**03.10 — Velocidad percibida de la serie (rápida / media / lenta)**
| Field | Value |
|---|---|
| **Name** | Indicador de velocidad de ejecución de la serie |
| **What it represents** | Emoji glyphs that classify the perceived execution speed of a completed set |
| **Family** | Session Execution |
| **Type** | Emoji system glyph |
| **Format** | Unicode emoji |
| **File** | `src/components/SetLoggerSheet.jsx` (L571–575) |
| **Component** | `SetLoggerSheet` |
| **Screen** | Sesión activa — registro de series |
| **Route** | `/session` |
| **Use** | After logging a set, the athlete tags it as slow (`🐢`), medium (`⚡`), or fast (`🚀`). Displayed as colored badge chips with distinct border colors (`#FF6B00`, `#f5a623`, `#27ae60`) |
| **References** | 3 emoji values, 1 component, 1 screen |
| **Library** | None (Unicode emoji) |
| **Variants** | Each speed has a distinct badge color: slow → orange border, medium → amber border, fast → green border |
| **Duplicates** | `⚡` (lightning bolt) is also used for: Energy wellness metric, gym_potencia session type, and Performance Dashboard "Acute Load" card. Same glyph, four distinct meanings. |
| **Notes** | The `⚡` collision across multiple contexts is the most significant emoji overload in the app. See DUP-02. |

---

**03.11 — Acceso al temporizador automático desde el logger de series**
| Field | Value |
|---|---|
| **Name** | Acceso a temporizador de descanso desde logger de series |
| **What it represents** | An hourglass icon within the set logger that provides quick access to the rest timer |
| **Family** | Session Execution |
| **Type** | Lucide icon |
| **Format** | SVG via lucide-react |
| **File** | `SetLoggerSheet.jsx` |
| **Component** | `SetLoggerSheet` |
| **Screen** | Sesión activa |
| **Route** | `/session` |
| **Use** | Opens a mini-timer or rest timer from within the set logging bottom sheet |
| **References** | `Hourglass`: 1 render |
| **Library** | `lucide-react` |
| **Variants** | None |
| **Duplicates** | `Timer` (Lucide) is also in `SetLoggerSheet.jsx` (3 renders). Both `Hourglass` and `Timer` coexist in the same component for different timer-access functions. |
| **Notes** | `Hourglass` and `Timer` coexist in `SetLoggerSheet.jsx` — they likely serve slightly different timer access points (e.g., auto-start rest timer vs. manual timer). |

---

**03.12 — Control de volumen del temporizador**
| Field | Value |
|---|---|
| **Name** | Control de volumen / sonido del temporizador |
| **What it represents** | A speaker icon that controls audio feedback during timer sessions |
| **Family** | Session Execution |
| **Type** | Lucide icon |
| **Format** | SVG via lucide-react |
| **File** | `GlobalRestModal.jsx`, `TimerViews.jsx`, `Profile.jsx` |
| **Component** | Rest modal, timer views, profile settings |
| **Screen** | `/timer`, rest modal, `/profile` |
| **Use** | In `/timer` context: toggles or adjusts sound for interval beeps. In `/profile`: configures preferred timer sound |
| **References** | `Volume2`: 3 renders |
| **Library** | `lucide-react` |
| **Variants** | None |
| **Duplicates** | `PlayCircle` in `Profile.jsx` is used to "test" the selected timer sound — functionally adjacent. See 03.13 |
| **Notes** | The same icon bridges two contexts: real-time timer control (Family 03) and settings configuration (could be considered Family 06/07). |

---

**03.13 — Probar sonido de temporizador en ajustes**
| Field | Value |
|---|---|
| **Name** | Botón de prueba de sonido del temporizador |
| **What it represents** | A play-circle icon that previews the selected timer alert sound in profile settings |
| **Family** | Session Execution |
| **Type** | Lucide icon |
| **Format** | SVG via lucide-react |
| **File** | `Profile.jsx` |
| **Component** | `Profile` — timer settings section |
| **Screen** | `/profile` |
| **Use** | Plays a test audio sample of the currently selected timer sound |
| **References** | `PlayCircle`: 1 render |
| **Library** | `lucide-react` |
| **Variants** | None |
| **Duplicates** | Related to `Volume2` (sound control) and `Play` (session start). Distinct function. |
| **Notes** | Appears in Profile settings, but its function belongs to the timer/session execution domain. |

---

**03.14 — Indicador de recuperación / descanso entre series**
| Field | Value |
|---|---|
| **Name** | Flecha de progreso al siguiente ejercicio |
| **What it represents** | A right-facing arrow within the set logger indicating transition to the next exercise |
| **Family** | Session Execution |
| **Type** | Lucide icon |
| **Format** | SVG via lucide-react |
| **File** | `SetLoggerSheet.jsx` |
| **Component** | `SetLoggerSheet` |
| **Screen** | Sesión activa |
| **Route** | `/session` |
| **Use** | Signals progression from current exercise to the next in sequence |
| **References** | `ArrowRight`: 2 renders |
| **Library** | `lucide-react` |
| **Variants** | None |
| **Duplicates** | `ArrowRight` as "next exercise" (session execution) vs. `ChevronRight` as "drill-down list item" (navigation). Different shapes, same directional concept. |
| **Notes** | In session context, this is an action trigger (proceed), not a navigation indicator. |

---

**03.15 — Indicador de músculo de sincronización / descanso (selector de músculo del circuito)**
| Field | Value |
|---|---|
| **Name** | Selector de sonido de intervalo en circuito |
| **What it represents** | A music note icon that opens the audio selection for circuit interval signals |
| **Family** | Session Execution |
| **Type** | Lucide icon |
| **Format** | SVG via lucide-react |
| **File** | `CircuitConfigurator.jsx` |
| **Component** | `CircuitConfigurator` |
| **Screen** | Configurador de circuito (timer) |
| **Use** | Opens a selector for the beep/chime sound that plays when an interval transitions |
| **References** | `Music`: 1 render |
| **Library** | `lucide-react` |
| **Variants** | None |
| **Duplicates** | None |
| **Notes** | The `Music` icon is used narrowly for interval audio selection, not for any music playback feature. |

---

### Family 04 — Training Planning

Elements that appear in the planning and editing workflow — building sessions, configuring blocks, managing the training calendar. These elements help the coach or athlete structure future training.

---

**04.01 — Selector de tipo de bloque (paleta cromática)**
| Field | Value |
|---|---|
| **Name** | Paleta de tipos de bloque de entrenamiento |
| **What it represents** | A color-coded selector that classifies a training block (preparation, warm-up, work, rest, cooldown) |
| **Family** | Training Planning |
| **Type** | CSS-generated color circles |
| **Format** | CSS circular divs with hex colors |
| **File** | `src/components/timer/BlockTypeSelector.jsx` |
| **Component** | `BlockTypeSelector` |
| **Screen** | Session editor, timer configurator |
| **Route** | `/plan/session/new`, `/plan/session/:id/edit` |
| **Use** | Assigns a type and color to a training block. Types: Preparación `#f5a623`, Calentamiento `#e67e22`, Trabajo `#FF6B00`, Descanso `#3d7dd4`, Cooldown `#27ae60`. Custom types possible. |
| **References** | 1 component; used in planning and timer configurator |
| **Library** | None (CSS) |
| **Variants** | Selected type shows `Check` (Lucide) overlay on the color circle |
| **Duplicates** | `SESSION_TYPES` in `mockPlanner.js` is a parallel color coding system for session-level types. Block types and session types share color logic but are different classification layers. |
| **Notes** | Color is the primary information carrier here — not shape or label. The color of each block propagates to `CountdownRing` and session badges elsewhere in the app. |

---

**04.02 — Tipos de sesión con color e icono (mapa dinámico)**
| Field | Value |
|---|---|
| **Name** | Tipos de sesión de entrenamiento (gym, TKD, cardio, descanso) |
| **What it represents** | A structured map of session categories, each with a label, color, emoji icon, and sport association |
| **Family** | Training Planning |
| **Type** | Dynamic emoji + color map |
| **Format** | JavaScript object (`SESSION_TYPES`) with emoji + hex color |
| **File** | `src/data/mockPlanner.js` (L230–239) |
| **Component** | Used across planner, plan view, session cards |
| **Screen** | `/plan`, session cards, week view |
| **Use** | Categorizes sessions in the weekly plan. Each type drives: badge color, icon in calendar view, and session label. |
| **References** | 8 session types defined; consumed by multiple plan-view components |
| **Library** | None (emoji) |
| **Variants** | See individual session type items below |
| **Duplicates** | Block types (Family 04.01) are a separate but related system |
| **Notes** | The `SESSION_TYPES` map is the master record for session-level visual identity. Changes here propagate to all session badges, plan cards, and calendar views. |

**Individual session types:**

| ID | Name | Color | Icon | Sport |
|---|---|---|---|---|
| `gym_potencia` | Potencia | `#e8412a` (red) | `⚡` | gym |
| `gym_fuerza` | Fuerza | `#3d7dd4` (blue) | `🏋️` | gym |
| `gym_hipertrofia` | Hipertrofia | `#8e44ad` (purple) | `💪` | gym |
| `tkd` | TKD | `#f5a623` (amber) | `🥋` | tkd |
| `tkd_sparring` | Sparring | `#e8412a` (red) | `🥊` | tkd |
| `cardio` | Cardio | `#16a085` (teal) | `🚴` | cardio |
| `descanso` | Descanso | `#2a3050` (dark) | `😴` | all |
| `libre` | Libre | `#7a8099` (gray) | `🎯` | all |

---

**04.03 — Acciones del editor de bloques (menú, duplicar, eliminar)**
| Field | Value |
|---|---|
| **Name** | Acciones de gestión de bloque en el editor |
| **What it represents** | Icons for managing training blocks: open context menu, duplicate, delete, reorder |
| **Family** | Training Planning |
| **Type** | Lucide icons |
| **Format** | SVG via lucide-react |
| **File** | `EditableBlock.jsx` |
| **Component** | `EditableBlock` |
| **Screen** | `/plan/session/new`, `/plan/session/:id/edit` |
| **Use** | `MoreVertical`: opens action menu for a block; `Copy`: duplicates block; `Trash2`: deletes block; `ArrowUp`/`ArrowDown`: reorder |
| **References** | 5 icons, 1 component |
| **Library** | `lucide-react` |
| **Variants** | None |
| **Duplicates** | `Trash2` and `Copy` appear in multiple planning contexts (exercise rows, circuit configurator). See Family 07 for data-management instances. |
| **Notes** | `MoreVertical` suggests a contextual menu pattern ("⋮") — the vertical three-dot menu convention. |

---

**04.04 — Acciones del editor de ejercicios individuales**
| Field | Value |
|---|---|
| **Name** | Controles de edición de ejercicio individual en sesión |
| **What it represents** | Icons for managing a single exercise within a block: expand/collapse details, adjust set count, delete |
| **Family** | Training Planning |
| **Type** | Lucide icons |
| **Format** | SVG via lucide-react |
| **File** | `EditableExercise.jsx` |
| **Component** | `EditableExercise` |
| **Screen** | `/plan/session/new`, `/plan/session/:id/edit` |
| **Use** | `ChevronDown`/`ChevronUp`: expand/collapse exercise detail; `Plus`: increment set count; `Minus`: decrement set count; `Trash2`: remove exercise from block |
| **References** | 4 icon types, 1 component |
| **Library** | `lucide-react` |
| **Variants** | None |
| **Duplicates** | `Plus`/`Minus` for set count adjustment are semantically different from `Plus` as "add item" (creation) |
| **Notes** | `Plus` and `Minus` here are quantity controls, not creation/deletion controls — a semantically important distinction from `Plus` in other contexts. |

---

**04.05 — Objetivo del mesociclo**
| Field | Value |
|---|---|
| **Name** | Indicador de objetivo del mesociclo |
| **What it represents** | A target/bullseye icon that labels the training goal of a mesocycle |
| **Family** | Training Planning |
| **Type** | Lucide icon |
| **Format** | SVG via lucide-react |
| **File** | `MesocycleList.jsx` |
| **Component** | `MesocycleList` |
| **Screen** | `/plan/seasons/:id` |
| **Use** | Labels the "objective" field of a mesocycle (e.g., "Hypertrophy phase", "Strength peak") |
| **References** | `Target`: 1 render |
| **Library** | `lucide-react` |
| **Variants** | None |
| **Duplicates** | None |
| **Notes** | Single-use icon with clear domain meaning. `🎯` (dart emoji) is used for "Libre" session type — a visual association between the two "target" concepts worth noting. |

---

**04.06 — Temporada / calendario de planificación**
| Field | Value |
|---|---|
| **Name** | Indicador de temporada o período de planificación |
| **What it represents** | Calendar and layers icons that label structural planning units (seasons, mesocycles) |
| **Family** | Training Planning |
| **Type** | Lucide icons |
| **Format** | SVG via lucide-react |
| **File** | `SeasonList.jsx`, `WeekRepetitionModal.jsx` |
| **Component** | `SeasonList`, `WeekRepetitionModal` |
| **Screen** | `/plan/seasons`, plan modals |
| **Use** | `Calendar`: labels a season or date-range period; `Layers`: represents a mesocycle or stacked training blocks |
| **References** | `Calendar`: 2 renders; `Layers`: 2 renders |
| **Library** | `lucide-react` |
| **Variants** | `CalendarDays` (used in BottomNav and session date fields) vs `Calendar` (used in planning hierarchy) — two related but distinct icons |
| **Duplicates** | `CalendarDays` and `Calendar` are near-variants. Both represent date/calendar concepts. |
| **Notes** | `Layers` carries a metaphor of "stacked" training phases — appropriate for a mesocycle structure. |

---

**04.07 — Replicar semana de entrenamiento**
| Field | Value |
|---|---|
| **Name** | Replicar semana de entrenamiento |
| **What it represents** | A repeat/loop icon that triggers copying one week's plan into subsequent weeks |
| **Family** | Training Planning |
| **Type** | Lucide icon |
| **Format** | SVG via lucide-react |
| **File** | `WeekRepetitionModal.jsx`, `Plan.jsx` |
| **Component** | `WeekRepetitionModal`, `Plan` |
| **Screen** | `/plan` |
| **Use** | Opens and confirms the week repetition feature — a bulk planning operation that copies the current week's sessions into N future weeks |
| **References** | `Repeat`: 3 renders (2 in planner context, 1 in `SetLoggerSheet` for circuit generation — different context) |
| **Library** | `lucide-react` |
| **Variants** | None |
| **Duplicates** | `Repeat` in `SetLoggerSheet.jsx` likely refers to generating a superset or circuit pattern — semantically distinct from week repetition |
| **Notes** | `Repeat` spans planning (week copy) and session execution (circuit) contexts. |

---

**04.08 — Editar contenido de sesión (desde vista de lectura)**
| Field | Value |
|---|---|
| **Name** | Botón de edición de sesión desde vista de sólo lectura |
| **What it represents** | An icon that transitions from the read-only session view to the editable session view |
| **Family** | Training Planning |
| **Type** | Lucide icon |
| **Format** | SVG via lucide-react |
| **File** | `SessionReadView.jsx` |
| **Component** | `SessionReadView` |
| **Screen** | Detalle de sesión (lectura) |
| **Use** | `ClipboardEdit`: signals "click to edit this session" in the read-only plan view |
| **References** | `ClipboardEdit`: 1 render |
| **Library** | `lucide-react` |
| **Variants** | None |
| **Duplicates** | Pencil (inline SVG) in `Home.jsx` and `SessionReadView.jsx` is used for inline rename of the session title — a more granular edit action than `ClipboardEdit` (which edits the full session). |
| **Notes** | A clipboard-with-pencil icon pairs well with a data-form metaphor. |

---

**04.09 — Renombrar sesión / título inline**
| Field | Value |
|---|---|
| **Name** | Botón de renombrar título de sesión inline |
| **What it represents** | A small pencil icon that enables in-place editing of the session name |
| **Family** | Training Planning |
| **Type** | Inline SVG (custom, duplicated in 2 files) |
| **Format** | Hardcoded SVG path in JSX |
| **File** | `src/pages/Home.jsx` (L152), `src/components/planner/SessionReadView.jsx` (L592) |
| **Component** | `Home`, `SessionReadView` |
| **Screen** | `/` (home), session detail view |
| **Use** | Inline rename trigger. Clicking this icon makes the session title editable in place |
| **References** | 2 renders in 2 files (identical SVG code duplicated) |
| **Library** | None (custom inline SVG) |
| **Variants** | `Pencil` (Lucide) in `Profile.jsx` is used for "edit profile" — same visual concept, different library source |
| **Duplicates** | Identical SVG `<path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>` duplicated in two files. Also conceptually duplicates `Pencil` (Lucide) which is not used here. See DUP-04. |
| **Notes** | This is the only case of identical custom SVG code duplicated across two separate source files. |

---

### Family 05 — Data & Progress Visualization

Elements that display training data, performance trends, or computed metrics. These are not interactive controls — they communicate information derived from logged sessions.

---

**05.01 — Gráficos de evolución y rendimiento (Recharts)**
| Field | Value |
|---|---|
| **Name** | Gráficos de evolución del rendimiento (barras, líneas) |
| **What it represents** | Bar and line charts showing training load, RPE trends, and accumulated volume over time |
| **Family** | Data & Progress Visualization |
| **Type** | Library chart components |
| **Format** | SVG rendered by `recharts` v3.8.1 |
| **File** | `src/pages/Evolution.jsx` |
| **Component** | `Evolution` page — uses `ResponsiveContainer`, `BarChart`, `LineChart`, `CartesianGrid`, `Cell` |
| **Screen** | Evolución |
| **Route** | `/evolution` |
| **Use** | Visualizes: weekly volume by exercise (BarChart), RPE trend over sessions (LineChart), accumulated load (BarChart). `Cell` enables per-bar coloring. |
| **References** | 1 page, 5+ Recharts components |
| **Library** | `recharts` v3.8.1 |
| **Variants** | None |
| **Duplicates** | None |
| **Notes** | Recharts generates SVG at runtime. The visual output depends on data shape from `SessionContext`. No static SVG assets involved. |

---

**05.02 — Sparkline de evolución de 1RM por ejercicio**
| Field | Value |
|---|---|
| **Name** | Mini gráfica de tendencia de 1RM por ejercicio |
| **What it represents** | A small inline SVG area chart showing the historical progression of estimated 1-Rep Max for a specific exercise |
| **Family** | Data & Progress Visualization |
| **Type** | Custom inline SVG component |
| **Format** | SVG path generated by mathematical interpolation |
| **File** | `src/pages/Evolution.jsx` (L112–139) |
| **Component** | Local `Sparkline` function inside `Evolution.jsx` |
| **Screen** | Evolución — tarjetas de récords |
| **Route** | `/evolution` |
| **Use** | Embedded within each PR exercise card to show 1RM trend without navigating away |
| **References** | 1 component, 1 screen |
| **Library** | None (custom SVG) |
| **Variants** | None |
| **Duplicates** | Conceptually related to Recharts LineChart but used at micro-card scale where a full chart component would be excessive |
| **Notes** | Area gradient uses brand orange (`#FF6B00` → transparent). The most recent data point is highlighted with a white-bordered circle. |

---

**05.03 — Semáforo de rendimiento (TrafficLightBadge)**
| Field | Value |
|---|---|
| **Name** | Marcador de semáforo de rendimiento |
| **What it represents** | A 3-segment electronic scoreboard-style badge (green/amber/red) indicating performance level |
| **Family** | Data & Progress Visualization |
| **Type** | CSS-generated component |
| **Format** | CSS flexbox with colored rectangular segments |
| **File** | `src/components/performance/TrafficLightBadge.jsx` |
| **Component** | `TrafficLightBadge` |
| **Screen** | Performance Dashboard |
| **Route** | `/performance` |
| **Use** | Displays the output of the performance engine as a 3-level rating: green (3 segments lit), amber (2 segments), red (1 segment). Styled like an electronic scoreboard display. |
| **References** | 1 component; used in `PerformanceDashboard.jsx` |
| **Library** | None (CSS only) |
| **Variants** | Segment sizes vary: compact (16×6px), standard (24×8px), large (40×10px) |
| **Duplicates** | None |
| **Notes** | The scoreboard aesthetic is intentional — it aligns with the sports coaching context of TrainingOS. Segment size is controlled by a `size` prop. |

---

**05.04 — Tarjetas del dashboard de rendimiento**
| Field | Value |
|---|---|
| **Name** | Tarjetas de métricas del dashboard de rendimiento |
| **What it represents** | Six performance metric cards, each with an emoji icon and a computed score |
| **Family** | Data & Progress Visualization |
| **Type** | Emoji glyph + CSS card |
| **Format** | Unicode emoji |
| **File** | `src/pages/PerformanceDashboard.jsx` (L40–77) |
| **Component** | `PerformanceDashboard` |
| **Screen** | Performance Dashboard |
| **Route** | `/performance` |
| **Use** | Each card displays a specific computed performance metric with an emoji anchor: Fatiga SNS `🔥`, Recuperación `💚`, Carga Aguda `⚡`, Sobrecarga `📈`, Balance `⚖️`, Transferencia `🥋` |
| **References** | 6 emoji values, 1 page, 1 component |
| **Library** | None (emoji) |
| **Variants** | None |
| **Duplicates** | `⚡` is the most overloaded emoji. `🥋` (Transferencia Deportiva) re-uses the Taekwondo emoji — meaningful if the athlete's sport is TKD, but ambiguous for other sports. |
| **Notes** | The "Transferencia Deportiva" card uses `🥋` regardless of the athlete's configured sport. This is a soft domain assumption baked into the emoji choice. |

---

**05.05 — Récords personales (PRs) en Home y Evolución**
| Field | Value |
|---|---|
| **Name** | Icono de récord personal (trofeo) |
| **What it represents** | A trophy icon that labels a section showing the athlete's personal records |
| **Family** | Data & Progress Visualization |
| **Type** | Lucide icon |
| **Format** | SVG via lucide-react |
| **File** | `Home.jsx` |
| **Component** | `Home` — PR section |
| **Screen** | `/` (home) |
| **Use** | Decorative section header for the "Mis récords" section on the home screen |
| **References** | `Trophy`: 1 active render (also imported but dormant in `Evolution.jsx`) |
| **Library** | `lucide-react` |
| **Variants** | None |
| **Duplicates** | `Award` (Lucide, dormant in `Onboarding.jsx`) represents a similar achievement concept |
| **Notes** | `Trophy` (active in Home) and `Award` (dormant in Onboarding) are near-synonyms unused in combination. |

---

**05.06 — Racha de entrenamiento (streak)**
| Field | Value |
|---|---|
| **Name** | Indicador de racha de entrenamiento continua |
| **What it represents** | A flame icon that displays the current streak of consecutive training days/weeks |
| **Family** | Data & Progress Visualization |
| **Type** | Lucide icon |
| **Format** | SVG via lucide-react |
| **File** | `Home.jsx` |
| **Component** | `Home` — streak section |
| **Screen** | `/` (home) |
| **Use** | Labels or decorates the streak count widget on the home dashboard |
| **References** | `Flame`: 1 render |
| **Library** | `lucide-react` |
| **Variants** | None |
| **Duplicates** | None |
| **Notes** | `Flame` carries a strong motivational/urgency connotation aligned with the streak concept. |

---

**05.07 — Tendencia de progreso (evolución)**
| Field | Value |
|---|---|
| **Name** | Indicador de tendencia de progreso |
| **What it represents** | A rising-line chart icon used to label or navigate to the evolution / progress section |
| **Family** | Data & Progress Visualization |
| **Type** | Lucide icon |
| **Format** | SVG via lucide-react |
| **File** | `BottomNav.jsx` (tab), `Home.jsx`, `AthleteDetail.jsx` |
| **Component** | `BottomNav`, `Home`, `AthleteDetail` |
| **Screen** | Global (nav), `/`, `/coach/:id` |
| **Use** | Tab bar icon for the Evolution section; also used as an inline CTA on home and coach dashboard linking to athlete progress |
| **References** | `TrendingUp`: 3 active renders (also dormant in `Evolution.jsx` itself) |
| **Library** | `lucide-react` |
| **Variants** | None |
| **Duplicates** | `BarChart2` (used in `Home.jsx` for "statistics" section) vs `TrendingUp` (used for "evolution/trend") — related concepts with slightly different implications |
| **Notes** | `TrendingUp` is imported in `Evolution.jsx` but not rendered there — it is rendered in other places that link *to* evolution. |

---

**05.08 — Estadísticas de actividad del coach sobre un atleta**
| Field | Value |
|---|---|
| **Name** | Icono de actividad física del atleta (vista coach) |
| **What it represents** | An activity/pulse icon labeling a section of an athlete's recent training activity |
| **Family** | Data & Progress Visualization |
| **Type** | Lucide icon |
| **Format** | SVG via lucide-react |
| **File** | `AthleteDetail.jsx` |
| **Component** | `AthleteDetail` |
| **Screen** | `/coach/:id` |
| **Use** | Section header icon for the athlete's recent activity log or training history |
| **References** | `Activity`: 2 renders |
| **Library** | `lucide-react` |
| **Variants** | None |
| **Duplicates** | `TrendingUp` (trend chart) vs `Activity` (pulse/activity) — both label data sections in coach context |
| **Notes** | `Activity` (heartbeat/pulse icon) is more associated with live physiological metrics in other design systems, but here it labels training log data. |

---

**05.09 — Calificación por estrellas de la sesión**
| Field | Value |
|---|---|
| **Name** | Calificación de satisfacción de la sesión (1 a 5 estrellas) |
| **What it represents** | An interactive 5-star rating system for the athlete to rate how the training session felt |
| **Family** | Data & Progress Visualization |
| **Type** | Lucide icon (interactive) |
| **Format** | SVG via lucide-react — `Star` rendered 5× with conditional fill |
| **File** | `src/components/FeedbackSection.jsx` (L28–49), `Profile.jsx` |
| **Component** | `FeedbackSection` |
| **Screen** | Post-session feedback, `/profile` |
| **Use** | After a session, the athlete taps 1–5 stars. Filled stars use brand orange (`#FF6B00`). The value is logged alongside session data. |
| **References** | `Star`: 2 renders (feedback component + profile) |
| **Library** | `lucide-react` |
| **Variants** | Filled vs. outlined state (controlled via `fill` and `color` props) |
| **Duplicates** | None |
| **Notes** | The `Star` icon in `Profile.jsx` is likely a static display (e.g., showing average rating) vs. interactive in `FeedbackSection`. |

---

### Family 06 — Athlete & Coach Identity

Elements that represent people, roles, and relational structures within the TrainingOS user model (athlete and coach roles, user identity, profile management).

---

**06.01 — Rol de atleta**
| Field | Value |
|---|---|
| **Name** | Icono de rol atleta |
| **What it represents** | A single-person silhouette icon identifying the athlete user role |
| **Family** | Athlete & Coach Identity |
| **Type** | Lucide icon |
| **Format** | SVG via lucide-react |
| **File** | `Onboarding.jsx`, `Register.jsx` |
| **Component** | Role selection in onboarding, registration name field |
| **Screen** | `/onboarding`, `/register` |
| **Use** | Marks the "Athlete" option in role selection. Also decorates the name input field in registration. |
| **References** | `User`: 2 renders |
| **Library** | `lucide-react` |
| **Variants** | `Users` (group), `UserCheck` (verified), `UserCircle` (dormant) |
| **Duplicates** | Multiple user-icon variants coexist. See DUP-07. |
| **Notes** | `User` (singular) vs `Users` (plural group) correctly communicates the athlete-vs-coach distinction. |

---

**06.02 — Rol de coach / lista de atletas**
| Field | Value |
|---|---|
| **Name** | Icono de rol coach / grupo de atletas |
| **What it represents** | A group-of-people icon identifying the coach role or the athlete roster |
| **Family** | Athlete & Coach Identity |
| **Type** | Lucide icon |
| **Format** | SVG via lucide-react |
| **File** | `BottomNav.jsx`, `MyRoutines.jsx`, `Onboarding.jsx`, `Profile.jsx` |
| **Component** | Role selection, nav bar (coach tab), routines list, profile header |
| **Screen** | Global (nav), `/onboarding`, `/coach/routines`, `/profile` |
| **Use** | Marks the "Coach" role option in onboarding. Tab icon for the Coach section in the bottom nav. Labels athlete rosters. |
| **References** | `Users`: 4 active renders + 1 dormant in `CoachDashboard.jsx` |
| **Library** | `lucide-react` |
| **Variants** | None |
| **Duplicates** | See DUP-07 |
| **Notes** | `Users` (coach) in `BottomNav` replaces `TrendingUp` (evolution tab) when the user has a coach role — the coach tab only appears for coaches. |

---

**06.03 — Asignar rutina a atleta (verificación de usuario)**
| Field | Value |
|---|---|
| **Name** | Botón de asignar rutina a atleta |
| **What it represents** | A person with a checkmark icon indicating the action of assigning a routine to a specific athlete |
| **Family** | Athlete & Coach Identity |
| **Type** | Lucide icon |
| **Format** | SVG via lucide-react |
| **File** | `MyRoutines.jsx` |
| **Component** | `MyRoutines` |
| **Screen** | `/coach/routines` |
| **Use** | Action button that assigns the selected routine/template to one of the coach's athletes |
| **References** | `UserCheck`: 1 render |
| **Library** | `lucide-react` |
| **Variants** | None |
| **Duplicates** | None |
| **Notes** | The checkmark overlay on a person icon specifically communicates assignment/approval in this context. |

---

**06.04 — Badge de rol verificado (coach / atleta)**
| Field | Value |
|---|---|
| **Name** | Badge de rol verificado (escudo con check) |
| **What it represents** | A shield with a checkmark indicating a confirmed user role (coach or athlete) |
| **Family** | Athlete & Coach Identity |
| **Type** | Lucide icon |
| **Format** | SVG via lucide-react |
| **File** | `AthleteDetail.jsx`, `Onboarding.jsx`, `Profile.jsx` |
| **Component** | Role confirmation screens, profile page |
| **Screen** | `/coach/:id`, `/onboarding`, `/profile` |
| **Use** | Displays alongside the user's role label to confirm that the role has been assigned |
| **References** | `ShieldCheck`: 4 renders |
| **Library** | `lucide-react` |
| **Variants** | None |
| **Duplicates** | None |
| **Notes** | Shield metaphor carries connotations of verification and authority, appropriate for role confirmation in a coach-athlete relationship. |

---

**06.05 — Radio button vacío para selección de rol**
| Field | Value |
|---|---|
| **Name** | Indicador de opción de rol no seleccionada |
| **What it represents** | An empty circle acting as a radio button in the role selection UI |
| **Family** | Athlete & Coach Identity |
| **Type** | Lucide icon |
| **Format** | SVG via lucide-react |
| **File** | `Onboarding.jsx` |
| **Component** | `Onboarding` — role selection step |
| **Screen** | `/onboarding` |
| **Use** | Represents the unselected state of a role option. When selected, it toggles to `CheckCircle2` or similar. |
| **References** | `Circle`: 2 renders |
| **Library** | `lucide-react` |
| **Variants** | `CheckCircle` / `CheckCircle2` as the selected state |
| **Duplicates** | Part of the broader check/confirmation icon family. See DUP-01. |
| **Notes** | Using `Circle` (outline) as a radio input state is an unconventional pattern — standard radio inputs use native OS components or filled circles. |

---

**06.06 — Perfil del usuario / editar perfil**
| Field | Value |
|---|---|
| **Name** | Botón de editar perfil del usuario |
| **What it represents** | A pencil icon for editing the user's profile information |
| **Family** | Athlete & Coach Identity |
| **Type** | Lucide icon |
| **Format** | SVG via lucide-react |
| **File** | `Profile.jsx` |
| **Component** | `Profile` |
| **Screen** | `/profile` |
| **Use** | Action to enter edit mode for the athlete's profile (name, sport, avatar) |
| **References** | `Pencil`: 1 render |
| **Library** | `lucide-react` |
| **Variants** | Inline SVG pencil in `Home.jsx` and `SessionReadView.jsx` is a visual equivalent for a different scope of editing |
| **Duplicates** | See DUP-04 |
| **Notes** | `Pencil` (Lucide) for profile editing vs. inline SVG pencil for session title editing. Same visual form, different implementations, different scopes. |

---

**06.07 — Premio / logro del atleta**
| Field | Value |
|---|---|
| **Name** | Icono de logro o reconocimiento del atleta |
| **What it represents** | An award/medal icon representing an achievement in the athlete's training history |
| **Family** | Athlete & Coach Identity |
| **Type** | Lucide icon |
| **Format** | SVG via lucide-react |
| **File** | `Onboarding.jsx` |
| **Component** | `Onboarding` |
| **Screen** | `/onboarding` |
| **Use** | Imported but not rendered (dormant). Likely intended for an onboarding achievement slide or "why TrainingOS" screen. |
| **References** | `Award`: 0 active renders |
| **Library** | `lucide-react` |
| **Variants** | `Trophy` (active in `Home.jsx`) represents the same achievement concept |
| **Duplicates** | See `Trophy` (05.05) |
| **Notes** | Dormant. Cannot confirm intended use without checking git history. |

---

### Family 07 — Data Management

Elements related to moving data between the app and external systems (Google Sheets, clipboard, sharing), saving content, and organizing training records.

---

**07.01 — Sincronización desde Google Sheets (descargar)**
| Field | Value |
|---|---|
| **Name** | Importar / sincronizar datos desde Google Sheets |
| **What it represents** | A cloud-with-download-arrow icon that triggers fetching training data from a Google Sheets source |
| **Family** | Data Management |
| **Type** | Lucide icon |
| **Format** | SVG via lucide-react |
| **File** | `AthleteDetail.jsx`, `ImportSession.jsx`, `Plan.jsx`, `Profile.jsx` |
| **Component** | Sync buttons across multiple screens |
| **Screen** | `/coach/:id`, `/import/:code`, `/plan`, `/profile` |
| **Use** | Triggers Google Sheets sync. This is a core data-entry mechanism in TrainingOS — training plans are authored in Sheets and imported via this action. |
| **References** | `DownloadCloud`: 7 renders across 4 files |
| **Library** | `lucide-react` |
| **Variants** | None |
| **Duplicates** | `CloudUpload` (in `Session.jsx`) is the upload/sync-up direction — the inverse operation. `UploadCloud` (in `SessionReadView`, `SessionDetailView`) is a third variant. See DUP-03. |
| **Notes** | Most-rendered cloud icon in the app. The Google Sheets integration is central to the TrainingOS data model — this icon appears wherever that integration is accessible. |

---

**07.02 — Subir / publicar sesión compartida**
| Field | Value |
|---|---|
| **Name** | Exportar / publicar sesión para compartir |
| **What it represents** | A cloud-with-upload-arrow icon that triggers publishing a session to a shareable location |
| **Family** | Data Management |
| **Type** | Lucide icon |
| **Format** | SVG via lucide-react |
| **File** | `SessionReadView.jsx`, `SessionDetailView.jsx` |
| **Component** | Session read view, session detail view |
| **Screen** | Session plan view |
| **Use** | Exports/publishes a session so it can be shared with athletes or external parties |
| **References** | `UploadCloud`: 2 renders |
| **Library** | `lucide-react` |
| **Variants** | `CloudUpload` (1 render in `Session.jsx`) is functionally equivalent |
| **Duplicates** | See DUP-03 |
| **Notes** | Two different Lucide icons (`UploadCloud` vs `CloudUpload`) used for what appears to be the same upload direction. |

---

**07.03 — Indicador de estado offline / sincronización pendiente**
| Field | Value |
|---|---|
| **Name** | Banner de sincronización pendiente / modo offline |
| **What it represents** | A cloud-upload icon shown in a banner when the session has pending changes that haven't synced |
| **Family** | Data Management |
| **Type** | Lucide icon |
| **Format** | SVG via lucide-react |
| **File** | `Session.jsx` |
| **Component** | `Session` — offline banner |
| **Screen** | Sesión activa |
| **Route** | `/session` |
| **Use** | Displays when the app detects offline mode or a sync failure, alerting the athlete that data may not be saved remotely |
| **References** | `CloudUpload`: 1 render |
| **Library** | `lucide-react` |
| **Variants** | `UploadCloud` (same semantic, different icon name) |
| **Duplicates** | See DUP-03 |
| **Notes** | In `Session.jsx`, `CloudUpload` functions as an informational/warning indicator, not a trigger — different from the interactive upload buttons in other screens. |

---

**07.04 — Guardar sesión o circuito**
| Field | Value |
|---|---|
| **Name** | Botón de guardar sesión / circuito |
| **What it represents** | A floppy disk icon that saves the current session plan or circuit configuration |
| **Family** | Data Management |
| **Type** | Lucide icon |
| **Format** | SVG via lucide-react |
| **File** | `CircuitConfigurator.jsx`, `SessionEditor.jsx` |
| **Component** | Circuit configurator, session editor |
| **Screen** | `/plan/session/new`, timer configurator |
| **Use** | Persists the current state (session plan or circuit) to storage |
| **References** | `Save`: 2 renders |
| **Library** | `lucide-react` |
| **Variants** | None |
| **Duplicates** | None |
| **Notes** | `Save` uses the classic floppy disk metaphor — universally understood even if dated. |

---

**07.05 — Compartir resumen de sesión (WhatsApp / texto)**
| Field | Value |
|---|---|
| **Name** | Compartir resumen de sesión completada |
| **What it represents** | A share icon that exports a formatted summary of a completed session via the device's native share sheet |
| **Family** | Data Management |
| **Type** | Lucide icon |
| **Format** | SVG via lucide-react |
| **File** | `ExportSessionModal.jsx`, `Session.jsx`, `Evolution.jsx` |
| **Component** | Export modal, session completion screen, evolution page |
| **Screen** | Post-session, evolution |
| **Use** | Triggers the device's native share API with a formatted session summary. Often used to share via WhatsApp. |
| **References** | `Share2`: 3 renders; `Share`: 1 render (in `ExportSessionModal`) |
| **Library** | `lucide-react` |
| **Variants** | `Share` (box with arrow) and `Share2` (network nodes) — see DUP-02 |
| **Duplicates** | See DUP-02 |
| **Notes** | `ExportSessionModal.jsx` uses both `Share` and `Share2`, suggesting the two icons may label different share targets or methods within the same modal. |

---

**07.06 — Duplicar bloque / copiar en portapapeles**
| Field | Value |
|---|---|
| **Name** | Duplicar bloque o copiar código de sesión |
| **What it represents** | A copy/duplicate icon used for cloning a training block or copying a session code to clipboard |
| **Family** | Data Management |
| **Type** | Lucide icon |
| **Format** | SVG via lucide-react |
| **File** | `ExportSessionModal.jsx`, `EditableBlock.jsx`, `CircuitConfigurator.jsx` |
| **Component** | Export modal (clipboard copy), block editor (duplicate block), circuit (duplicate interval) |
| **Screen** | Plan editor, export modal |
| **Use** | In `ExportSessionModal`: copies a shareable code to clipboard. In `EditableBlock` / `CircuitConfigurator`: duplicates a block or interval. |
| **References** | `Copy`: 3 renders across 3 files |
| **Library** | `lucide-react` |
| **Variants** | None |
| **Duplicates** | None in terms of icon shape; but the two semantic uses (clipboard copy vs. content duplication) are distinct functions behind the same icon. |
| **Notes** | `Copy` carries two semantic loads: "copy text to clipboard" and "duplicate a structural item." |

---

**07.07 — Importar sesión desde código externo**
| Field | Value |
|---|---|
| **Name** | Importar sesión desde código compartido |
| **What it represents** | The import/receive workflow when an athlete receives a session code from a coach |
| **Family** | Data Management |
| **Type** | Multiple icons (navigation, confirmation, exercises) |
| **Format** | SVG via lucide-react |
| **File** | `ImportSession.jsx` |
| **Component** | `ImportSession` |
| **Screen** | `/import/:code` |
| **Use** | The import screen hosts: `AlertTriangle` (warnings), `CheckCircle` (success state), `Dumbbell` (exercise count), `Search` (code lookup), `DownloadCloud` (trigger import), `ArrowLeft` (back), `ChevronDown` (expand details) |
| **References** | 7+ icon types, 1 screen |
| **Library** | `lucide-react` |
| **Variants** | N/A |
| **Duplicates** | N/A |
| **Notes** | The import screen is one of the densest icon surfaces in the app. Multiple icons work together to communicate multi-step flow state. |

---

**07.08 — Eliminar sesión, bloque, ejercicio, atleta**
| Field | Value |
|---|---|
| **Name** | Botón de eliminar elemento (sesión, bloque, ejercicio, atleta) |
| **What it represents** | A trash can icon for permanently deleting content |
| **Family** | Data Management |
| **Type** | Lucide icon |
| **Format** | SVG via lucide-react |
| **File** | `EditableBlock.jsx`, `EditableExercise.jsx`, `SessionReadView.jsx`, `BlockTypeSelector.jsx`, `CircuitConfigurator.jsx`, `AthleteDetail.jsx`, `Plan.jsx` |
| **Component** | All editing contexts |
| **Screen** | Plan editor, session reader, circuit configurator, coach view |
| **Use** | Deletes: blocks, exercises, sessions, custom block types, circuit intervals, athletes. Always `Trash2` (filled trash with lid) |
| **References** | `Trash2`: 8 renders across 7 files — most widely distributed delete affordance |
| **Library** | `lucide-react` |
| **Variants** | None (`Trash` without the "2" is not used — `Trash2` is consistently used) |
| **Duplicates** | None |
| **Notes** | The consistent use of `Trash2` across all delete actions is one of the most uniform icon conventions in the app. |

---

**07.09 — Búsqueda de ejercicios / sesiones**
| Field | Value |
|---|---|
| **Name** | Campo de búsqueda de ejercicios o sesiones |
| **What it represents** | A magnifying glass icon indicating a text search input field |
| **Family** | Data Management |
| **Type** | Lucide icon |
| **Format** | SVG via lucide-react |
| **File** | `ExerciseLibrarySheet.jsx`, `Evolution.jsx`, `ImportSession.jsx` |
| **Component** | Exercise library picker, evolution filter, import screen |
| **Screen** | `/plan/session/new` (sheet), `/evolution`, `/import/:code` |
| **Use** | Labels search input fields for filtering: exercise library, exercise history, session code |
| **References** | `Search`: 3 renders |
| **Library** | `lucide-react` |
| **Variants** | None |
| **Duplicates** | None |
| **Notes** | `Search` is consistently used for text filter/search input affordance across all three contexts. |

---

**07.10 — Eliminar filtros / restablecer vista**
| Field | Value |
|---|---|
| **Name** | Botón de eliminar filtros activos |
| **What it represents** | A counter-clockwise rotation icon that resets active filters on a data view |
| **Family** | Data Management |
| **Type** | Lucide icon |
| **Format** | SVG via lucide-react |
| **File** | `Evolution.jsx` |
| **Component** | `Evolution` — exercise filter bar |
| **Screen** | `/evolution` |
| **Use** | Clears the exercise filter selection and resets the evolution charts to show all exercises |
| **References** | `RotateCcw`: 1 render (filter reset context; other renders are timer-related) |
| **Library** | `lucide-react` |
| **Variants** | None |
| **Duplicates** | Same `RotateCcw` icon is used for timer reset (Family 03.05) and draft discard — three distinct semantic uses of one shape |
| **Notes** | The cross-context reuse of `RotateCcw` creates semantic ambiguity: "reset timer," "discard draft," and "clear filter" all share the same visual shape. |

---

### Family 08 — Feedback & State

Elements that communicate system state to the user: success, error, warning, loading, confirmation, and user-generated ratings.

---

**08.01 — Error en formulario de autenticación**
| Field | Value |
|---|---|
| **Name** | Indicador de error en formulario de login / registro |
| **What it represents** | An alert-circle icon that appears alongside error messages in authentication forms |
| **Family** | Feedback & State |
| **Type** | Lucide icon |
| **Format** | SVG via lucide-react |
| **File** | `Login.jsx`, `Register.jsx` |
| **Component** | Auth forms |
| **Screen** | `/login`, `/register` |
| **Use** | Displayed inline with error text when authentication fails (wrong password, email taken, etc.) |
| **References** | `AlertCircle`: 2 renders |
| **Library** | `lucide-react` |
| **Variants** | `AlertTriangle` (used in other warning contexts) |
| **Duplicates** | See DUP-08. `AlertCircle` (auth errors) vs `AlertTriangle` (planner warnings) — different shapes for same concept |
| **Notes** | The choice of `AlertCircle` for auth errors vs `AlertTriangle` for planning warnings has no explicit documented rationale. |

---

**08.02 — Advertencia en flujos de planificación e importación**
| Field | Value |
|---|---|
| **Name** | Indicador de advertencia en planificación e importación |
| **What it represents** | A triangle-with-exclamation alert for non-critical warnings that require attention but not immediate action |
| **Family** | Feedback & State |
| **Type** | Lucide icon |
| **Format** | SVG via lucide-react |
| **File** | `WeekRepetitionModal.jsx`, `ExerciseReview.jsx`, `ImportSession.jsx` |
| **Component** | Plan modals, coach review, import screen |
| **Screen** | `/plan`, `/exercises/review`, `/import/:code` |
| **Use** | `WeekRepetitionModal`: warns about overwriting sessions. `ExerciseReview`: flags exercises with data issues. `ImportSession`: warns about compatibility or missing data. |
| **References** | `AlertTriangle`: 3 renders |
| **Library** | `lucide-react` |
| **Variants** | `AlertCircle` (auth errors) |
| **Duplicates** | See DUP-08 |
| **Notes** | `AlertTriangle` is used for "soft" warnings in editorial/planning flows. `AlertCircle` is used for hard errors in auth. |

---

**08.03 — Indicador de carga / spinner**
| Field | Value |
|---|---|
| **Name** | Indicador de carga (spinner animado) |
| **What it represents** | An animated spinning icon indicating an asynchronous operation in progress |
| **Family** | Feedback & State |
| **Type** | Lucide icon (CSS animated) |
| **Format** | SVG via lucide-react with Tailwind `animate-spin` class |
| **File** | `Login.jsx`, `Register.jsx` |
| **Component** | Auth forms |
| **Screen** | `/login`, `/register` |
| **Use** | Replaces the submit button label while a login/register request is in flight |
| **References** | `Loader2`: 2 renders |
| **Library** | `lucide-react` |
| **Variants** | None |
| **Duplicates** | None |
| **Notes** | `Loader2` (circular arc, not full circle) is a standard Lucide spinner. It's only used in auth — no other loading states in the app use a visual spinner. |

---

**08.04 — Confirmación de acción completada (check simple)**
| Field | Value |
|---|---|
| **Name** | Marca de verificación — confirmación de acción |
| **What it represents** | A checkmark that confirms a completed action (set logged, option selected, step confirmed) |
| **Family** | Feedback & State |
| **Type** | Lucide icon |
| **Format** | SVG via lucide-react |
| **File** | `ExerciseRow.jsx`, `ReadinessModal.jsx`, `SetLoggerSheet.jsx`, `SessionReadView.jsx`, `WeekRepetitionModal.jsx`, `BlockTypeSelector.jsx`, `MyRoutines.jsx` |
| **Component** | Exercise row, set logger, readiness modal, session read view, week repetition, block type selector, routines |
| **Screen** | `/session`, `/plan`, `/coach/routines`, modals |
| **Use** | Marks: a completed set, a confirmed option, a selected block type, an assigned routine. Always inline with the item it confirms. |
| **References** | `Check`: 10 renders across 7 files — most-rendered confirmation icon |
| **Library** | `lucide-react` |
| **Variants** | `CheckCircle` (circle container), `CheckCircle2` (styled circle) for more prominent confirmations |
| **Duplicates** | See DUP-01 |
| **Notes** | `Check` (bare checkmark) is the inline micro-confirmation; `CheckCircle`/`CheckCircle2` are used for more visible, standalone confirmations (success states, profile verification). |

---

**08.05 — Confirmación de importación o guardado exitoso**
| Field | Value |
|---|---|
| **Name** | Icono de éxito de importación o guardado |
| **What it represents** | A checkmark-in-circle icon that signals a successful operation completion |
| **Family** | Feedback & State |
| **Type** | Lucide icon |
| **Format** | SVG via lucide-react |
| **File** | `ImportSession.jsx`, `SessionEditor.jsx` |
| **Component** | Import screen, session editor |
| **Screen** | `/import/:code`, `/plan/session/new` |
| **Use** | Shown after successful import or session save as a prominent success indicator |
| **References** | `CheckCircle`: 2 renders |
| **Library** | `lucide-react` |
| **Variants** | `Check` (inline micro), `CheckCircle2` (styled variant) |
| **Duplicates** | See DUP-01 |
| **Notes** | `CheckCircle` (standard) vs `CheckCircle2` (variant shape) — both express success. No documented rule for which to use when. |

---

**08.06 — Verificación de estado de onboarding / perfil**
| Field | Value |
|---|---|
| **Name** | Icono de verificación de perfil o paso de onboarding |
| **What it represents** | A styled check-in-circle icon that marks completed onboarding steps or verified profile items |
| **Family** | Feedback & State |
| **Type** | Lucide icon |
| **Format** | SVG via lucide-react |
| **File** | `ExerciseReview.jsx`, `Onboarding.jsx`, `Profile.jsx` |
| **Component** | Coach review, onboarding steps, profile page |
| **Screen** | `/exercises/review`, `/onboarding`, `/profile` |
| **Use** | Marks completed onboarding steps and verified profile completions |
| **References** | `CheckCircle2`: 5 renders across 3 files |
| **Library** | `lucide-react` |
| **Variants** | `CheckCircle` (simpler variant), `Check` (inline) |
| **Duplicates** | See DUP-01 |
| **Notes** | `CheckCircle2` is the most commonly used "success/verified" icon across identity and onboarding flows. Its visual difference from `CheckCircle` is subtle. |

---

**08.07 — Recuperación de borrador de sesión**
| Field | Value |
|---|---|
| **Name** | Modal de recuperación de sesión interrumpida |
| **What it represents** | System state notification that a previously interrupted session can be recovered |
| **Family** | Feedback & State |
| **Type** | Lucide icons |
| **Format** | SVG via lucide-react |
| **File** | `DraftRecoveryModal.jsx` |
| **Component** | `DraftRecoveryModal` |
| **Screen** | Home (modal overlay) |
| **Use** | `Play`: resume the interrupted session; `RotateCcw`: discard draft and start fresh |
| **References** | `Play`: 1 render; `RotateCcw`: 1 render |
| **Library** | `lucide-react` |
| **Variants** | None |
| **Duplicates** | `Play` and `RotateCcw` are reused from other contexts but carry clear meaning here |
| **Notes** | This modal is triggered automatically when a session draft is detected. It is a pure system-state communication surface. |

---

**08.08 — Notificaciones en perfil (sin leer)**
| Field | Value |
|---|---|
| **Name** | Indicador de notificaciones sin leer / soporte |
| **What it represents** | A bell icon for notification settings and a message-circle for support/feedback communications |
| **Family** | Feedback & State |
| **Type** | Lucide icons |
| **Format** | SVG via lucide-react |
| **File** | `Profile.jsx` |
| **Component** | `Profile` |
| **Screen** | `/profile` |
| **Use** | `Bell`: notification preferences. `MessageCircle`: displays pending coach messages or support threads. |
| **References** | `Bell`: 1 render; `MessageCircle`: 2 renders |
| **Library** | `lucide-react` |
| **Variants** | None |
| **Duplicates** | None |
| **Notes** | `MessageCircle` in the coach context suggests an asynchronous communication thread between athlete and coach. |

---

**08.09 — Enviar nota de feedback post-sesión**
| Field | Value |
|---|---|
| **Name** | Botón de enviar feedback post-sesión |
| **What it represents** | A paper airplane icon that submits written feedback after a session |
| **Family** | Feedback & State |
| **Type** | Lucide icon |
| **Format** | SVG via lucide-react |
| **File** | `FeedbackSection.jsx` |
| **Component** | `FeedbackSection` |
| **Screen** | Post-session |
| **Use** | Submits the athlete's written notes and star rating after session completion |
| **References** | `Send`: 1 render |
| **Library** | `lucide-react` |
| **Variants** | None |
| **Duplicates** | None |
| **Notes** | `Send` (paper airplane metaphor) is standard for "submit message" affordance. |

---

**08.10 — Menú contextual de elemento (tres puntos vertical)**
| Field | Value |
|---|---|
| **Name** | Menú contextual de opciones de bloque |
| **What it represents** | A three-dot vertical ellipsis menu that reveals additional actions for a training block |
| **Family** | Feedback & State |
| **Type** | Lucide icon |
| **Format** | SVG via lucide-react |
| **File** | `EditableBlock.jsx` |
| **Component** | `EditableBlock` |
| **Screen** | Plan editor |
| **Use** | Opens a contextual menu with block actions (duplicate, delete, reorder, change type) |
| **References** | `MoreVertical`: 1 render |
| **Library** | `lucide-react` |
| **Variants** | None |
| **Duplicates** | None |
| **Notes** | The vertical three-dot menu is the standard mobile overflow pattern. Its actions are handled by other icons (`Copy`, `Trash2`, arrows). |

---

**08.11 — Cerrar modal, sheet, filtro o badge**
| Field | Value |
|---|---|
| **Name** | Botón de cerrar / descartar |
| **What it represents** | An X (close) icon that dismisses a modal, bottom sheet, filter chip, or overlay |
| **Family** | Feedback & State |
| **Type** | Lucide icon |
| **Format** | SVG via lucide-react |
| **File** | 18 files across components and pages |
| **Component** | All modals, bottom sheets, filter chips, overlay panels |
| **Screen** | All screens |
| **Use** | Dismisses: modals (ReadinessModal, WeekRepetitionModal, DraftRecoveryModal, ExportSessionModal, GlobalRestModal), bottom sheets (SetLoggerSheet, ExerciseLibrarySheet), filter badges, the FeedbackSection form |
| **References** | `X`: 24 renders — most frequently rendered icon in the app |
| **Library** | `lucide-react` |
| **Variants** | None |
| **Duplicates** | None |
| **Notes** | `X` is the single most-rendered Lucide icon in TrainingOS. Its consistent use for all dismiss/close actions represents the most uniform icon convention in the codebase. |

---

### Family 09 — Sport & Activity Classification

Elements that represent athletic disciplines, physical characteristics, and body state. These are primarily emoji-based and form the semantic vocabulary for what kind of training is happening.

---

**09.01 — Iconos de deportes en el selector de onboarding**
| Field | Value |
|---|---|
| **Name** | Iconos de disciplina deportiva |
| **What it represents** | Emoji glyphs that identify each sport available in the athlete's profile configuration |
| **Family** | Sport & Activity Classification |
| **Type** | Emoji glyph |
| **Format** | Unicode emoji |
| **File** | `src/pages/Onboarding.jsx` (L19–27) — `DEFAULT_SPORTS` array |
| **Component** | `Onboarding` — sport selector |
| **Screen** | `/onboarding`, `/profile` (sport settings) |
| **Use** | Each sport option in the athlete's profile is labeled with its emoji. The selected sport determines which `SESSION_TYPES` are available in the planner. |
| **References** | 8 sport emoji values (+ custom fallback `🎯`) |
| **Library** | None (Unicode emoji) |
| **Variants** | Custom sport: `🎯` fallback |
| **Duplicates** | Several sport emoji also appear in `SESSION_TYPES` (`🏋️`, `🥋`, `🥊`, `🚴`) — the session type emoji must match the discipline |
| **Notes** | Sport emoji are platform-rendered. Visual consistency depends on the user's OS and font stack. |

**Sport emoji inventory:**

| ID | Sport | Emoji |
|---|---|---|
| `gym` | Gimnasio | `🏋️` |
| `tkd` | Taekwondo | `🥋` |
| `box` | Boxeo | `🥊` |
| `judo` | Judo | `🤼` |
| `swim` | Natación | `🏊` |
| `cycle` | Ciclismo | `🚴` |
| `run` | Running | `🏃` |
| `cf` | Crossfit | `⚔️` |
| `custom` | (Personalizado) | `🎯` |

---

**09.02 — Iconos de tipo de sesión de gimnasio**
| Field | Value |
|---|---|
| **Name** | Iconos de capacidad de entrenamiento (potencia, fuerza, hipertrofia) |
| **What it represents** | Emoji glyphs that classify the physical capability being trained in a gym session |
| **Family** | Sport & Activity Classification |
| **Type** | Emoji glyph |
| **Format** | Unicode emoji |
| **File** | `src/data/mockPlanner.js` — `SESSION_TYPES` |
| **Component** | Session cards, plan view, weekly calendar |
| **Screen** | `/plan`, session cards |
| **Use** | Labels gym training sessions by their primary physical adaptation target: power (`⚡`), strength (`🏋️`), hypertrophy (`💪`) |
| **References** | 3 emoji values, consumed by all plan-view components |
| **Library** | None (emoji) |
| **Variants** | None |
| **Duplicates** | `⚡` (power training) also appears in: set speed (fast), energy wellness metric, Acute Load performance card. `🏋️` (strength) also appears in sport selector. |
| **Notes** | `⚡` is the most semantically overloaded emoji in the app — it represents four different things across different contexts. See DUP-02. |

---

**09.03 — Icono de sesión de descanso**
| Field | Value |
|---|---|
| **Name** | Icono de día de descanso en el plan |
| **What it represents** | A sleeping face emoji marking a rest day in the weekly training plan |
| **Family** | Sport & Activity Classification |
| **Type** | Emoji glyph |
| **Format** | Unicode emoji |
| **File** | `mockPlanner.js` (`SESSION_TYPES.descanso`), `WellnessCheckIn.jsx` (sleep metric) |
| **Component** | Session cards, wellness check-in |
| **Screen** | `/plan`, wellness modal |
| **Use** | In plan view: marks rest days. In wellness: represents the "sleep quality" metric at its lowest value (fully depleted state). |
| **References** | `😴` in 2 contexts |
| **Library** | None (emoji) |
| **Variants** | None |
| **Duplicates** | `😴` appears in both "rest day" (plan type) and "poor sleep" (wellness metric) — different concepts, same glyph |
| **Notes** | The same `😴` emoji means "rest from training" in one context and "bad sleep" in another. This semantic overlap could create confusion in combined views. |

---

**09.04 — Métricas de bienestar del atleta (wellness check-in)**
| Field | Value |
|---|---|
| **Name** | Escalas de bienestar subjetivo pre-sesión |
| **What it represents** | Four emoji-based scales that capture the athlete's subjective wellbeing before a training session |
| **Family** | Sport & Activity Classification |
| **Type** | Emoji glyph arrays |
| **Format** | Unicode emoji in arrays of 5 values |
| **File** | `src/components/performance/WellnessCheckIn.jsx` (L4–34) |
| **Component** | `WellnessCheckIn` |
| **Screen** | Pre-session readiness check |
| **Use** | Athlete taps their current state on 4 scales. Data feeds into the performance engine. |
| **References** | 4 metrics, 5 emoji per scale = 20 distinct emoji states |
| **Library** | None (emoji) |
| **Variants** | Each metric uses a different emoji subset |
| **Duplicates** | Multiple collisions with other contexts. See below. |
| **Notes** | The emoji scales use `😴` (poor sleep at level 1) through `🤩` (excellent sleep at level 5). The `😴` collision with "rest day" type is documented in 09.03. |

**Wellness emoji inventory:**

| Metric | Icon | Scale (low → high) |
|---|---|---|
| Sueño | `😴` | `😴` `😐` `🙂` `😊` `🤩` |
| Estrés | `😤` | `😤` `😟` `😐` `🙂` `😊` |
| Energía | `⚡` | `😴` `😐` `🙂` `😊` `🤩` |
| Dolor muscular (DOMS) | `🦵` | `🤩` `😊` `😐` `😟` `😤` (reversed: low DOMS = good) |

---

**09.05 — Velocidad de ejecución percibida**
| Field | Value |
|---|---|
| **Name** | Indicador de velocidad de ejecución de la serie |
| **What it represents** | Emoji chips that classify how fast a set was performed relative to maximum capacity |
| **Family** | Sport & Activity Classification |
| **Type** | Emoji glyph with colored badge |
| **Format** | Unicode emoji + CSS badge |
| **File** | `src/components/SetLoggerSheet.jsx` (L571–575) |
| **Component** | `SetLoggerSheet` |
| **Screen** | Sesión activa |
| **Route** | `/session` |
| **Use** | After logging a set, athlete classifies execution speed: `🐢` (slow/grinding), `⚡` (moderate), `🚀` (fast/crisp). Used to track proximity to failure and velocity-based training metrics. |
| **References** | 3 emoji values, 1 component |
| **Library** | None (emoji) |
| **Variants** | Each has a distinct badge background/border color |
| **Duplicates** | `⚡` as "medium speed" overlaps with `⚡` as energy wellness metric and `⚡` as power training session type. See DUP-02. |
| **Notes** | The velocity classification (`🐢`/`⚡`/`🚀`) is one of the more sophisticated data entry concepts in TrainingOS and relies entirely on culturally-interpreted emoji. |

---

**09.06 — Métricas de rendimiento del motor de análisis**
| Field | Value |
|---|---|
| **Name** | Iconos de métricas del motor de análisis de rendimiento |
| **What it represents** | Six emoji anchors for the computed performance metrics in the Performance Dashboard |
| **Family** | Sport & Activity Classification |
| **Type** | Emoji glyph |
| **Format** | Unicode emoji |
| **File** | `src/pages/PerformanceDashboard.jsx` (L40–77) |
| **Component** | `PerformanceDashboard` |
| **Screen** | `/performance` |
| **Use** | Each emoji labels a computed metric card. They provide immediate semantic context for what the metric measures. |
| **References** | 6 emoji values, 1 page |
| **Library** | None (emoji) |
| **Variants** | None |
| **Duplicates** | `⚡` (Carga Aguda) and `🥋` (Transferencia Deportiva) overlap with other uses |
| **Notes** | `🥋` for "Sport Transfer" hardcodes a Taekwondo assumption. For athletes whose sport is `gym` or `run`, this emoji is semantically inaccurate. |

**Performance metric emoji:**

| Metric | Emoji | Semantic meaning of emoji in context |
|---|---|---|
| Fatiga del SNS | `🔥` | Intensity / overheating |
| Recuperación | `💚` | Green = good health/recovery |
| Carga Aguda | `⚡` | Energy / acute stimulus |
| Sobrecarga | `📈` | Upward trend / progression |
| Balance de Patrones | `⚖️` | Balance / equilibrium |
| Transferencia Deportiva | `🥋` | Sport-specific (TKD-centric) |

---

**09.07 — Indicador de halteras / ejercicio de fuerza**
| Field | Value |
|---|---|
| **Name** | Icono de ejercicio con pesas / halteras |
| **What it represents** | A dumbbell icon that represents gym-based strength training exercises or exercise counts |
| **Family** | Sport & Activity Classification |
| **Type** | Lucide icon |
| **Format** | SVG via lucide-react |
| **File** | `SessionReadView.jsx`, `Login.jsx`, `Register.jsx`, `AthleteDetail.jsx`, `CoachDashboard.jsx`, `MyRoutines.jsx`, `ImportSession.jsx`, `SessionDetailView.jsx` |
| **Component** | Many — brand identity, exercise counters, section labels |
| **Screen** | Login, register, coach, session views |
| **Use** | Decorative brand icon on auth screens (Login, Register). Exercise count indicator in session headers. Section label for routine/exercise lists. |
| **References** | `Dumbbell`: 11 active renders across 8 files |
| **Library** | `lucide-react` |
| **Variants** | None |
| **Duplicates** | `🏋️` emoji covers the same domain concept (gym/lifting) |
| **Notes** | `Dumbbell` carries dual use: as a brand/identity icon on auth screens (represents the app's domain), and as a functional exercise-count label in training views. |

---

### Family 10 — Form & Input Affordances

Elements that prefix, decorate, or label form fields — helping users understand what type of data to enter.

---

**10.01 — Prefijo de campo de correo electrónico**
| Field | Value |
|---|---|
| **Name** | Icono de campo de correo electrónico |
| **What it represents** | An envelope icon prefixing the email input field |
| **Family** | Form & Input Affordances |
| **Type** | Lucide icon |
| **Format** | SVG via lucide-react |
| **File** | `Login.jsx`, `Register.jsx` |
| **Component** | Auth forms |
| **Screen** | `/login`, `/register` |
| **Use** | Left-aligned prefix icon inside the email input field to identify the field type at a glance |
| **References** | `Mail`: 2 renders |
| **Library** | `lucide-react` |
| **Variants** | None |
| **Duplicates** | None |
| **Notes** | Standard input-prefix pattern. No interaction — purely decorative/affordance. |

---

**10.02 — Prefijo de campo de contraseña**
| Field | Value |
|---|---|
| **Name** | Icono de campo de contraseña |
| **What it represents** | A padlock icon prefixing the password input field |
| **Family** | Form & Input Affordances |
| **Type** | Lucide icon |
| **Format** | SVG via lucide-react |
| **File** | `Login.jsx`, `Register.jsx` |
| **Component** | Auth forms |
| **Screen** | `/login`, `/register` |
| **Use** | Left-aligned prefix icon inside the password input field |
| **References** | `Lock`: 2 renders |
| **Library** | `lucide-react` |
| **Variants** | None |
| **Duplicates** | None |
| **Notes** | Standard input-prefix pattern. |

---

**10.03 — Prefijo de campo de nombre de usuario**
| Field | Value |
|---|---|
| **Name** | Icono de campo de nombre de registro |
| **What it represents** | A person icon prefixing the name input field during registration |
| **Family** | Form & Input Affordances |
| **Type** | Lucide icon |
| **Format** | SVG via lucide-react |
| **File** | `Register.jsx` |
| **Component** | `Register` — registration form |
| **Screen** | `/register` |
| **Use** | Left-aligned prefix for the full name input |
| **References** | `User`: 1 render (the other render of `User` is in `Onboarding.jsx` for role selection — different context) |
| **Library** | `lucide-react` |
| **Variants** | None |
| **Duplicates** | `User` is used both as a form field prefix (here) and as a role identifier (Family 06) — same icon, different semantic weight |
| **Notes** | The dual use of `User` as form icon and role identifier is the only cross-family semantic overlap within the icon library. |

---

**10.04 — Prefijo de selector de deporte / dropdown**
| Field | Value |
|---|---|
| **Name** | Indicador de selector desplegable de deporte |
| **What it represents** | A downward chevron that signals a dropdown / picker control |
| **Family** | Form & Input Affordances |
| **Type** | Lucide icon |
| **Format** | SVG via lucide-react |
| **File** | `SportSelector.jsx`, `ImportSession.jsx` |
| **Component** | `SportSelector`, import form |
| **Screen** | Profile settings, import flow |
| **Use** | Indicates that tapping the field will open a picker/dropdown. Standard select-field affordance. |
| **References** | `ChevronDown`: appears in 5+ files but only 2 are in this form-affordance role |
| **Library** | `lucide-react` |
| **Variants** | None |
| **Duplicates** | `ChevronDown` is also used for section expand/collapse (Family 02.03) — two distinct uses of the same icon |
| **Notes** | `ChevronDown` in a form context signals "picker" whereas in an accordion context it signals "expand." The icon is identical; the surrounding UI determines meaning. |

---

**10.05 — Indicador de duración de sesión en formulario / cabecera**
| Field | Value |
|---|---|
| **Name** | Indicador de duración estimada de sesión |
| **What it represents** | A clock icon that labels the estimated duration field of a training session |
| **Family** | Form & Input Affordances |
| **Type** | Lucide icon |
| **Format** | SVG via lucide-react |
| **File** | `SessionReadView.jsx`, `ImportSession.jsx`, `SessionDetailView.jsx` |
| **Component** | Session headers, import detail |
| **Screen** | Session read view, import screen, session detail |
| **Use** | Labels the duration metadata field on session cards and headers |
| **References** | `Clock`: 3 renders |
| **Library** | `lucide-react` |
| **Variants** | None |
| **Duplicates** | `Clock` (duration label) vs `Timer` (timer access) vs inline clock SVG (FAB) vs `Hourglass` (mini-timer) — four clock-adjacent concepts. See DUP-06. |
| **Notes** | `Clock` specifically labels static metadata (the scheduled duration), not a running timer. This is a key semantic distinction from `Timer` and `Hourglass`. |

---

**10.06 — Fecha de sesión en formulario / cabecera**
| Field | Value |
|---|---|
| **Name** | Indicador de fecha de sesión |
| **What it represents** | A calendar-with-days icon that labels the date field of a training session |
| **Family** | Form & Input Affordances |
| **Type** | Lucide icon |
| **Format** | SVG via lucide-react |
| **File** | `SessionEditor.jsx`, `Home.jsx`, `AthleteDetail.jsx` |
| **Component** | Session editor, home, athlete detail |
| **Screen** | `/plan/session/new`, `/`, `/coach/:id` |
| **Use** | Labels the date field in a session editor; also labels the weekly plan section on the home screen |
| **References** | `CalendarDays`: 3 active renders (+ 1 in `BottomNav` as nav tab icon) |
| **Library** | `lucide-react` |
| **Variants** | `Calendar` (used in `SeasonList` for planning hierarchy labels) |
| **Duplicates** | `CalendarDays` and `Calendar` are near-variants. `CalendarDays` shows day-grid lines; `Calendar` is plainer. No documented rule for distinguishing them. |
| **Notes** | `CalendarDays` serves both as a tab bar icon (navigation) and as a field label (form affordance) — two distinct functional roles. |

---

---

## Cross-Family Duplicates

The following entries document cases where the same visual element (or semantically equivalent elements) are used for different purposes across the app.

---

### DUP-01 — Check / Confirmación (4 variantes para el mismo concepto)

| Icon | Renders | Family | Use context |
|---|---|---|---|
| `Check` | 10 | Feedback & State | Inline micro-confirmation: set logged, option selected |
| `CheckCircle` | 2 | Feedback & State | Import/save success state |
| `CheckCircle2` | 5 | Feedback & State | Onboarding step verified, profile completion |
| `Circle` | 2 | Athlete & Coach Identity | Unselected radio button in role selector |

**Observation:** Four distinct Lucide icons represent the binary "confirmed/unconfirmed" concept. `Check`, `CheckCircle`, and `CheckCircle2` are positive states; `Circle` (empty) is the inverse. No documented rule governs when each is appropriate.

---

### DUP-02 — ⚡ Lightning bolt (4 semantic meanings)

| Context | File | Meaning |
|---|---|---|
| Session type `gym_potencia` | `mockPlanner.js` | Power training session |
| Set execution speed "medium" | `SetLoggerSheet.jsx` | Moderate/medium speed |
| Wellness metric "Energía" | `WellnessCheckIn.jsx` | Energy level indicator |
| Performance metric "Carga Aguda" | `PerformanceDashboard.jsx` | Acute training load |

**Observation:** The single Unicode glyph `⚡` carries four distinct domain meanings. In combined views, these meanings are distinguishable only by surrounding UI context.

---

### DUP-03 — Cloud / Nube (3 variantes upload/download)

| Icon | Direction | File | Context |
|---|---|---|---|
| `DownloadCloud` | Download ↓ | `ImportSession.jsx`, `Plan.jsx`, `AthleteDetail.jsx`, `Profile.jsx` | Import data from Google Sheets |
| `UploadCloud` | Upload ↑ | `SessionReadView.jsx`, `SessionDetailView.jsx` | Publish/share session |
| `CloudUpload` | Upload ↑ | `Session.jsx` | Offline sync warning banner |

**Observation:** Two different Lucide icon names (`UploadCloud` and `CloudUpload`) are used for the same upload direction in different files. `DownloadCloud` is used consistently. The upload direction has no naming consistency.

---

### DUP-04 — Pencil / Lápiz (3 implementations of the same icon)

| Implementation | File | Use |
|---|---|---|
| `Pencil` (Lucide) | `Profile.jsx` | Edit profile |
| Inline SVG (`<path d="M17 3...">`) | `Home.jsx` (L152) | Rename session title inline |
| Inline SVG (`<path d="M17 3...">`) | `SessionReadView.jsx` (L592) | Rename session title inline |

**Observation:** Three implementations of a pencil icon exist. The Lucide component and the two inline SVGs are conceptually equivalent but implemented differently. The inline SVG is duplicated verbatim across two files.

---

### DUP-05 — Eye / Ojo (Lucide import vs emoji)

| Implementation | File | Use | Status |
|---|---|---|---|
| `Eye` (Lucide) | `SessionEditor.jsx` | Preview session | Dormant (imported, not rendered) |
| `👁` emoji (`<span>`) | `SessionEditor.jsx` (L517) | Preview session | Active |

**Observation:** The Lucide `Eye` icon was imported but replaced by an emoji `👁` rendered directly in JSX. The import was not removed, creating a dormant import alongside its active emoji replacement in the same file.

---

### DUP-06 — Clock / Temporizador (4 implementations of the time concept)

| Implementation | File | Semantic meaning |
|---|---|---|
| `Timer` (Lucide) | `BottomNav.jsx`, `Home.jsx`, `SetLoggerSheet.jsx` | Timer screen / start timer |
| `Clock` (Lucide) | `SessionReadView.jsx`, `ImportSession.jsx`, `SessionDetailView.jsx` | Session duration label |
| Inline SVG clock | `Session.jsx` (L492) | FAB to open timer during session |
| `Hourglass` (Lucide) | `SetLoggerSheet.jsx` | Mini/rest timer access |
| `⏱` emoji | `Home.jsx` (L158) | Timer display (text prefix) |

**Observation:** Five distinct visual representations of the "time/clock" concept coexist in the app. `Timer`, `Clock`, an inline SVG clock, `Hourglass`, and the `⏱` emoji each carry slightly different sub-meanings, but the visual vocabulary is fragmented.

---

### DUP-07 — User / Usuario (4 icon variants)

| Icon | Renders | Use |
|---|---|---|
| `User` | 2 | Athlete role indicator; registration name field prefix |
| `Users` | 4 active | Coach role indicator; athlete roster label |
| `UserCheck` | 1 | Assign routine to athlete action |
| `UserCircle` | 0 (dormant) | Unknown — imported in `Register.jsx`, never rendered |

**Observation:** Four user-related icons exist. `User`/`Users` correctly express singular/plural person concepts. `UserCheck` adds approval semantics. `UserCircle` is dormant. The family is internally coherent but `UserCircle` has no active role.

---

### DUP-08 — Alert / Alerta (2 shapes for warning/error)

| Icon | Renders | Use | Shape metaphor |
|---|---|---|---|
| `AlertCircle` | 2 | Auth form errors | Circle with `!` — hard error |
| `AlertTriangle` | 3 | Planning/import warnings | Triangle with `!` — soft warning |

**Observation:** Two alert shapes coexist. By convention in many design systems, `AlertTriangle` = warning (recoverable) and `AlertCircle` = error (critical). In TrainingOS, this convention appears to be followed but is not documented.

---

### DUP-09 — Share / Compartir (2 icon shapes for the same action)

| Icon | Renders | File | Context |
|---|---|---|---|
| `Share` | 1 | `ExportSessionModal.jsx` | Unknown specific share target |
| `Share2` | 3 | `ExportSessionModal.jsx`, `Evolution.jsx`, `Session.jsx` | Share session summary (WhatsApp, clipboard) |

**Observation:** `Share` and `Share2` coexist in `ExportSessionModal.jsx`. `Share2` (network-nodes icon) is used more widely. The two may label different share destinations within the modal, but this is not confirmed without deeper code inspection.

---

### DUP-10 — RotateCcw / Reinicio (3 semantic uses)

| Context | File | Meaning |
|---|---|---|
| Timer reset | `TimerViews.jsx` | Restart the countdown |
| Draft discard | `DraftRecoveryModal.jsx` | Discard the draft and start a fresh session |
| Filter reset | `Evolution.jsx` | Clear exercise filter selection |

**Observation:** `RotateCcw` is used in three functionally unrelated contexts. The "undo rotation" metaphor is interpreted as "reset to start" in all cases, but the objects being reset are completely different.

---

### DUP-11 — ChevronDown (2 semantic uses)

| Context | Files | Meaning |
|---|---|---|
| Section collapse/expand | `EditableExercise.jsx`, `PerformanceDashboard.jsx` | Toggle collapsible section |
| Dropdown picker | `SportSelector.jsx`, `ImportSession.jsx` | Indicates a select/picker field |

**Observation:** `ChevronDown` serves both as a collapsible-section toggle and as a dropdown affordance. The surrounding UI (accordion vs. select field) disambiguates, but the icon shape is identical.

---

## Unclassified Elements

The following elements cannot be assigned to a functional family because they have no active reference in the codebase, their intended function is unclear, or they are infrastructure/toolchain artifacts rather than app-level visuals.

---

| ID | Element | File | Reason for no classification |
|---|---|---|---|
| U-01 | `hero.png` | `src/assets/hero.png` | No active reference in any component. Purpose (marketing banner, onboarding illustration?) cannot be confirmed from code alone. |
| U-02 | `react.svg` | `src/assets/react.svg` | Vite scaffold artifact. Not part of TrainingOS design. |
| U-03 | `vite.svg` | `src/assets/vite.svg` | Vite scaffold artifact. Not part of TrainingOS design. |
| U-04 | `favicon.svg` | `public/favicon.svg` | Not referenced in `index.html`. `index.html` uses `.png` icons instead. Likely leftover from Vite's default template. |
| U-05 | `icons.svg` | `public/icons.svg` | SVG sprite containing Bluesky, Discord, GitHub, X social media icons. No `<use href>` reference anywhere in the codebase. Possibly intended for a footer or "about" screen that was not built. |
| U-06 | `.barcode-sim` CSS class | `src/index.css` (L249–257) | CSS utility that generates a simulated barcode using `repeating-linear-gradient`. Not applied to any element in current JSX. Intent unknown — possible decorative element for a future "bib/race number" UI concept. |
| U-07 | `.dossier-header-border` CSS class | `src/index.css` (L260–262) | Double-border decorative CSS for a "dossier" or technical-document header style. Not applied to any JSX element. |
| U-08 | `Award` (Lucide) | `Onboarding.jsx` | Imported, not rendered. Likely intended for an achievement or "why use TrainingOS" onboarding slide. `Trophy` (active in Home) covers a similar concept. |
| U-09 | `Eye` (Lucide) | `SessionEditor.jsx` | Imported but replaced by `👁` emoji in the same file. Dormant import. |
| U-10 | `Heart` (Lucide) | `Evolution.jsx` | Imported, not rendered. Possible intent: labeling cardiovascular/cardio metrics in Evolution. |
| U-11 | `ClipboardList` (Lucide) | `Evolution.jsx` | Imported, not rendered. Active in `AthleteDetail.jsx` for session logs. |
| U-12 | `Activity` (Lucide) | `Evolution.jsx` | Imported, not rendered. Active in `AthleteDetail.jsx` for activity sections. |
| U-13 | `Trophy` (Lucide) | `Evolution.jsx` | Imported, not rendered. Active in `Home.jsx` for PR section. |
| U-14 | `TrendingUp` (Lucide) | `Evolution.jsx` | Imported, not rendered. Active in `BottomNav` as Evolution tab icon. |
| U-15 | `Dumbbell` (Lucide) | `Onboarding.jsx` | Imported, not rendered. |
| U-16 | `RefreshCw` (Lucide) | `Profile.jsx` | Imported, not rendered. Possible intent: "refresh sync" — similar to `RotateCcw` but clockwise. |
| U-17 | `UserCircle` (Lucide) | `Register.jsx` | Imported, not rendered. `User` (active) and `UserCircle` (dormant) coexist in same file. |
| U-18 | `CheckCircle2` (Lucide) | `Session.jsx` | Imported, not rendered. |
| U-19 | `RotateCcw` (Lucide) | `CircuitPlayer.jsx` | Imported, not rendered. |
| U-20 | `ChevronRight` (Lucide) | `ImportSession.jsx`, `SessionDetailView.jsx` | Imported but dormant in these two specific files. Active in 9 other files. |
| U-21 | `Users` (Lucide) | `CoachDashboard.jsx` | Imported, not rendered in this specific file. Active in 4 other files. |
| U-22 | `Share` (Lucide) | `SessionDetailView.jsx` | Imported, not rendered here. Active in `ExportSessionModal.jsx`. |
| U-23 | `Icono_trainingOS.png` | `public/Icono_trainingOS.png` | Highest-resolution brand asset, not directly referenced at runtime. Functions as the source file for all PWA icons but is not rendered in any component. Classification as "Brand & Identity" is clear for the derived assets, but this specific file has no runtime role. |

---

## Observations

### O-01 — Three Parallel Icon Systems Without a Governing Rule

TrainingOS uses three independent icon implementation approaches simultaneously:
1. **`lucide-react` library components** — 75 unique icons
2. **Custom inline SVG** — 5 hand-coded implementations (CountdownRing, Sparkline, pencil ×2, FAB clock)
3. **Unicode emoji** — approximately 35 distinct glyphs across 7 data maps

No visible rule governs when to use each system. Some concepts have representations in all three (e.g., time/clock concept uses Lucide `Timer`, Lucide `Clock`, custom SVG, Lucide `Hourglass`, and the `⏱` emoji). Others use only one system consistently (e.g., `Trash2` for all delete actions).

---

### O-02 — ⚡ Emoji Carries the Highest Semantic Load

The `⚡` glyph is used in four distinct semantic contexts:
1. **Session type:** Power training session (`gym_potencia`)
2. **Set speed:** Medium execution velocity
3. **Wellness metric:** Energy level
4. **Performance metric:** Acute training load

In views that show multiple contexts simultaneously, disambiguation relies entirely on surrounding text and layout. There is no visual differentiation.

---

### O-03 — 14 Dormant Icon Imports

14 Lucide icons are imported but never rendered. The highest concentration is in `Evolution.jsx` (5 dormant imports: `Heart`, `ClipboardList`, `Activity`, `Trophy`, `TrendingUp`). This suggests that `Evolution.jsx` went through significant redesign iterations. Dormant imports do not affect runtime functionality but increase bundle size and cognitive overhead.

---

### O-04 — Trash2 is the Most Uniform Convention

`Trash2` is the single most consistently implemented icon in the app: it is always used for delete actions across all contexts, all components, all user roles. It is never confused with another icon and has no variant. This represents the strongest visual convention in TrainingOS.

---

### O-05 — X is the Most Frequently Rendered Icon

`X` (close/dismiss) has 24 renders across 18 files — the highest render count of any single icon. Its use is consistent and unambiguous: it always means "dismiss this overlaid surface." This is the second-strongest convention after `Trash2`.

---

### O-06 — Emoji Rendering is Platform-Dependent

Approximately 35 emoji glyphs carry significant semantic weight in TrainingOS (sport classification, session types, wellness metrics, execution speed, performance metrics). Their visual appearance varies across iOS, Android, and web platforms:
- Apple Color Emoji (iOS/macOS)
- Noto Color Emoji (Android/Linux)
- Segoe UI Emoji (Windows)

The `🏋️` (weightlifter) emoji, for example, renders with noticeably different proportions and color across platforms. This creates visual inconsistency in the app's session-type badges across devices.

---

### O-07 — The Upload Cloud Direction Has No Naming Consistency

Three cloud icons are used for synchronization:
- `DownloadCloud` — consistent for import (Google Sheets → app)
- `UploadCloud` — used in 2 files for publish/share
- `CloudUpload` — used in 1 file for offline/sync warning

`UploadCloud` and `CloudUpload` are two different Lucide icon names that draw visually similar icons (cloud with upward arrow). The inconsistency is in the icon name selection, not necessarily the visual output.

---

### O-08 — The Performance Dashboard's 🥋 Icon Assumes TKD

The "Sport Transfer" metric in the Performance Dashboard uses `🥋` (martial arts / kimono) as its emoji. This makes semantic sense for athletes whose configured sport is Taekwondo (`tkd`), but is visually inaccurate for athletes in other disciplines (gym, cycling, swimming, etc.). No sport-adaptive logic was found for this emoji.

---

### O-09 — CountdownRing is the Most Complex Single Visual Element

The `CountdownRing` component is the most visually sophisticated element in the codebase: 6 SVG circle layers, 3 linear gradients, 1 Gaussian blur filter (`stdDeviation="5"`), and a `strokeDashoffset` animation. It is also the primary visual focal point of the `/timer` screen, which is a core daily interaction surface for athletes. No other element comes close to this visual complexity.

---

### O-10 — The Inline Pencil SVG is the Only Verbatim Code Duplicate

Among the 5 inline SVG implementations, the pencil icon (`<path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>`) is the only one that appears verbatim in two separate source files (`Home.jsx` and `SessionReadView.jsx`). All other inline SVGs are unique to their component.
