# TrainingOS — Visual Asset Inventory (Fase 3)

---

### Información del Análisis

* **Modelo utilizado:** Gemini 3.7 Flash
* **Nivel de razonamiento utilizado:** Medium
* **Fecha de análisis:** 2026-08-20
* **Archivo complementario interactivo:** [`VISUAL_ASSET_INVENTORY.html`](file:///C:/Users/victo/.gemini/antigravity/scratch/training-os/docs/visual-assets/VISUAL_ASSET_INVENTORY.html)
* **Estado:** Documento de inventario y catálogo técnico independiente (sin modificaciones a la app).

---

### Resumen Ejecutivo Superior

| Métrica | Valor | Descripción |
|---|---|---|
| **Total de Recursos Catalogados** | **54** | Suma de todos los activos visuales, componentes y mapas de la interfaz |
| **Familias Funcionales** | **11** | Clasificación temática y operativa descubierta |
| **Iconos de Librería (`lucide-react`)** | **75** | Iconos únicos de librería activos en el código JSX |
| **Implementaciones SVG Inline** | **5** | Dibujos vectoriales personalizados nativos en JSX |
| **Archivos Raster / PNG** | **16** | Imágenes fijas en `public/`, `src/assets/` y Android `res/` |
| **Mapas Dinámicos / Emojis** | **7** | Mapas estructurados de deportes, sesiones, bienestar y velocidad |
| **Grupos de Duplicados Identificados** | **11** | Conceptos visuales con múltiples representaciones |
| **Iconos Dormidos (0 renders JSX)** | **14** | Importaciones sin invocar en los componentes |

---

## Catálogo Completo por Familias Funcionales

### Familia 01 — Brand & Identity (Marca e Identidad)
> Elementos que representan a TrainingOS como producto en superficies persistentes, de arranque o a nivel de sistema operativo.  
> **Total recursos:** 5

| Recurso / Nombre | Tipo / Formato | Archivo / Componente | Pantalla / Ruta | Uso y Referencias | Librería |
|---|---|---|---|---|---|
| **Logo horizontal oficial de la marca**<br>_Logotipo completo con isotipo + wordmark "TrainingOS" en orientación horizontal._ | `Raster`<br>(PNG) | `public/Logo_trainingOS.png`<br>[`SplashScreen.jsx (L31)`] | Splash / Pantalla de bienvenida web<br>(`/ (Arranque)`) | Pantalla de carga inicial mientras se inicializa Firebase y la autenticación.<br>**Refs:** 1 componente, 1 pantalla | `Archivo físico (Marca)` |
| **Isotipo fuente de alta resolución**<br>_Símbolo gráfico aislado de la marca TrainingOS sin tipografía._ | `Raster`<br>(PNG) | `public/Icono_trainingOS.png`<br>[`Ninguno activo en JSX`] | Asset fuente de diseño<br>(`— (Asset fuente)`) | Fuente maestra para la generación de iconos PWA y recursos Android launcher.<br>**Refs:** 0 referencias en JSX activo | `Archivo físico (Marca)` |
| **Splash screen nativo Android**<br>_Pantalla completa de carga de la aplicación nativa generada por Capacitor._ | `Raster`<br>(PNG) | `public/splash.png / android/res/drawable/splash.png`<br>[`Capacitor SplashScreen Plugin`] | Splash screen nativo Android<br>(`Arranque nativo OS`) | Mostrado por el sistema operativo Android durante el arranque en frío.<br>**Refs:** Configuración Capacitor + 10 densidades en res/ | `Capacitor Native Plugin` |
| **Iconos de App PWA y Notificaciones (Familia icon-*.png)**<br>_Iconos en diferentes resoluciones para el launcher, PWA install y notificaciones push._ | `Raster`<br>(PNG) | `public/icon-48, 72, 96, 180, 192, 512.png`<br>[`index.html, manifest.json, TimerContext.jsx (L47)`] | Escritorio OS / Notificaciones<br>(`Global / OS Level`) | Favicon, icono PWA en home screen y badge de notificaciones push de temporizador.<br>**Refs:** index.html (3), manifest.json (5), TimerContext.jsx (1) | `PWA Standard Assets` |
| **Avatar Inicial Monograma del Atleta**<br>_Monograma tipográfico estilizado con la letra inicial del atleta cuando no hay foto._ | `CSS / Tipográfico`<br>(CSS Box + Big Shoulders Display) | `src/pages/Profile.jsx (L187)`<br>[`Profile.jsx`] | Perfil de usuario<br>(`/profile`) | Placeholder visual del avatar del atleta en dimensiones 80x80px sobre azul #3B82F6.<br>**Refs:** 1 componente, 1 pantalla | `CSS nativo + Google Fonts` |

---

### Familia 02 — Navigation & Wayfinding (Navegación y Orientación)
> Elementos de dirección, barras de navegación, flechas de retroceso, paginadores y reordenamiento.  
> **Total recursos:** 5

| Recurso / Nombre | Tipo / Formato | Archivo / Componente | Pantalla / Ruta | Uso y Referencias | Librería |
|---|---|---|---|---|---|
| **Barra de navegación inferior (BottomNav Tabs)**<br>_Acceso a las 5 pestañas principales: Inicio, Plan, Sesión, Timer, Evolución (+ Coach si rol activo)._ | `Icono de librería (Dinámico)`<br>(SVG via Lucide) | `src/components/BottomNav.jsx`<br>[`BottomNav.jsx`] | Todas las pantallas con BottomNav<br>(`Global (Autenticado)`) | Navegación primaria persistente de la app. Pasa referencias de iconos como props.<br>**Refs:** 6 iconos dinámicos (Home, CalendarDays, Play, Timer, TrendingUp, Users) | `lucide-react` |
| **Flecha de retroceso (ArrowLeft / ChevronLeft)**<br>_Acción de volver a la pantalla o modal anterior._ | `Icono de librería`<br>(SVG via Lucide) | `ImportSession, PerformanceDashboard, SessionDetailView, Plan, Profile, AthleteDetail, etc.`<br>[`Cabeceras de navegación`] | Vistas secundarias<br>(`Subpáginas y modales`) | Botón superior izquierdo para retroceder en la jerarquía de navegación.<br>**Refs:** ArrowLeft (4 renders), ChevronLeft (8 renders) | `lucide-react` |
| **Indicador de colapso / expansión (ChevronDown / ChevronUp)**<br>_Control para mostrar u ocultar el contenido de acordeones o tarjetas._ | `Icono de librería`<br>(SVG via Lucide) | `EditableExercise.jsx, PerformanceDashboard.jsx, ExerciseReview.jsx`<br>[`Acordeones y tarjetas colapsables`] | Editor de sesión, Dashboard de rendimiento<br>(`/plan/session/new, /performance, /exercises/review`) | Conmuta visualmente entre estado colapsado (ChevronDown) y expandido (ChevronUp).<br>**Refs:** ChevronDown (5 renders), ChevronUp (2 renders) | `lucide-react` |
| **Indicador de avance y drill-down (ChevronRight)**<br>_Señal de que un elemento de lista es clickeable, o avance de semana en calendario._ | `Icono de librería`<br>(SVG via Lucide) | `Plan.jsx, SeasonList.jsx, MesocycleList.jsx, Evolution.jsx, Onboarding.jsx`<br>[`Listas, paginador semanal, onboarding`] | Planificador, Listados de temporadas<br>(`/plan, /plan/seasons, /evolution, /onboarding`) | Avanzar al siguiente paso, abrir detalle de elemento o navegar a la semana siguiente.<br>**Refs:** ChevronRight (9 renders en 9 archivos) | `lucide-react` |
| **Controles de reordenamiento (ArrowUp / ArrowDown vs MoveUp / MoveDown)**<br>_Mover bloques o intervalos de entrenamiento hacia arriba o hacia abajo._ | `Icono de librería`<br>(SVG via Lucide) | `EditableBlock.jsx (Arrow*), CircuitConfigurator.jsx (Move*)`<br>[`EditableBlock, CircuitConfigurator`] | Editor de sesión, Configurador de circuito<br>(`/plan/session/new, /timer (circuit)`) | Reordenar la posición secuencial de bloques de entrenamiento e intervalos.<br>**Refs:** ArrowUp (1), ArrowDown (1), MoveUp (1), MoveDown (1) | `lucide-react` |

---

### Familia 03 — Session Execution & Live Workout (Ejecución de Sesión y Entrenamiento en Vivo)
> Controles en tiempo real, cronómetros, temporizadores de descanso, control de volumen y registro de series.  
> **Total recursos:** 10

| Recurso / Nombre | Tipo / Formato | Archivo / Componente | Pantalla / Ruta | Uso y Referencias | Librería |
|---|---|---|---|---|---|
| **Botón CTA de inicio de sesión de entrenamiento**<br>_Acción principal de iniciar o reanudar un entrenamiento planificado._ | `Icono de librería`<br>(SVG via Lucide) | `Home.jsx, DraftRecoveryModal.jsx, SessionReadView.jsx, ImportSession.jsx`<br>[`Botones CTA primarios`] | Home, Detalle de sesión, Importación<br>(`/, /plan/session-detail, /import/:code`) | Disparador central para entrar a la pantalla de sesión activa /session.<br>**Refs:** Play (~4 renders específicos de inicio de sesión) | `lucide-react` |
| **Anillo 3D de cuenta regresiva (CountdownRing)**<br>_Anillo visual de temporizador circular con profundidad 3D, gradientes y brillo neón._ | `SVG Inline multicapa`<br>(SVG personalizado con defs, linearGradient, feGaussianBlur) | `src/components/timer/CountdownRing.jsx`<br>[`CountdownRing.jsx`] | Temporizador y Circuit Player<br>(`/timer`) | Indicador visual primario del tiempo restante con 6 capas concéntricas y animación strokeDashoffset.<br>**Refs:** 1 componente dedicado, usado en TimerViews y CircuitPlayer | `SVG Custom / Sin librería` |
| **FAB flotante de temporizador en sesión activa**<br>_Botón de acción flotante (FAB) superpuesto para desplegar el temporizador global._ | `SVG Inline`<br>(SVG nativo hardcodeado) | `src/pages/Session.jsx (L492-495)`<br>[`Session.jsx`] | Sesión activa de entrenamiento<br>(`/session`) | Acceso rápido persistente al timer durante el entrenamiento.<br>**Refs:** 1 render en Session.jsx | `SVG Custom` |
| **Controles de reproducción del temporizador (Play / Pause / Square)**<br>_Controles clásicos multimedia adaptados al control de cronómetros e intervalos._ | `Icono de librería`<br>(SVG via Lucide) | `TimerViews.jsx, CircuitPlayer.jsx, GlobalRestModal.jsx`<br>[`TimerViews, CircuitPlayer, GlobalRestModal`] | Temporizador, Reproductor de circuito<br>(`/timer, modal de descanso en /session`) | Iniciar (Play), pausar (Pause) o detener completamente (Square) el conteo.<br>**Refs:** Play (6), Pause (4), Square (4) | `lucide-react` |
| **Adelantar / Rebobinar temporizador e intervalos (FastForward / SkipBack / SkipForward)**<br>_Saltar +10s en descanso, o navegar al intervalo anterior/siguiente de un circuito._ | `Icono de librería`<br>(SVG via Lucide) | `GlobalRestModal.jsx, TimerViews.jsx, CircuitPlayer.jsx`<br>[`GlobalRestModal, CircuitPlayer`] | Temporizador e intervalos<br>(`/timer, modal descanso`) | +10s de descanso (FastForward), intervalo previo (SkipBack), intervalo siguiente (SkipForward).<br>**Refs:** FastForward (2), SkipBack (1), SkipForward (1) | `lucide-react` |
| **Reinicio de temporizador o descarte de borrador (RotateCcw)**<br>_Reiniciar el contador a 0 o descartar el borrador para reiniciar la sesión._ | `Icono de librería`<br>(SVG via Lucide) | `TimerViews.jsx, DraftRecoveryModal.jsx, ProgressBar.jsx, Evolution.jsx`<br>[`TimerViews, DraftRecoveryModal, ProgressBar, Evolution`] | Temporizador, Modal de recuperación, Evolución<br>(`/timer, /, /evolution`) | Resetear timer (TimerViews), descartar borrador (DraftRecovery), limpiar filtros (Evolution).<br>**Refs:** RotateCcw (4 renders en 4 archivos) | `lucide-react` |
| **Barra de progreso de sesión con animación flash**<br>_Progreso porcentual de la sesión en curso con destello verde al completar el 100%._ | `CSS animado`<br>(CSS Gradient + animación flash-green) | `src/components/ProgressBar.jsx`<br>[`ProgressBar.jsx`] | Sesión activa<br>(`/session`) | Feedback continuo del avance del entrenamiento.<br>**Refs:** 1 componente | `CSS nativo` |
| **Referencia histórica de carga (History)**<br>_Indica que los datos de carga mostrados corresponden a la semana anterior._ | `Icono de librería`<br>(SVG via Lucide) | `src/components/SetLoggerSheet.jsx`<br>[`SetLoggerSheet.jsx`] | Registro de series<br>(`/session`) | Marcador junto a los kg/reps de referencia del ciclo anterior.<br>**Refs:** History (1 render) | `lucide-react` |
| **Velocidad percibida de la serie (Badges 🐢 / ⚡ / 🚀)**<br>_Clasificación de la velocidad de ejecución: Lenta (grinding), Media o Rápida (explosiva)._ | `Emoji + Badge CSS`<br>(Unicode Emoji + CSS border/bg) | `src/components/SetLoggerSheet.jsx (L571-575)`<br>[`SetLoggerSheet.jsx`] | Registro de series<br>(`/session`) | Tagging de velocidad percibida por serie para análisis de velocidad / RPE.<br>**Refs:** 3 emojis, 1 componente | `Unicode Emojis` |
| **Temporizador de descanso y control de audio (Hourglass, Volume2, Music, PlayCircle)**<br>_Acceso a descanso automático, control de volumen y selector de tono acústico._ | `Icono de librería`<br>(SVG via Lucide) | `SetLoggerSheet.jsx, GlobalRestModal.jsx, Profile.jsx, CircuitConfigurator.jsx`<br>[`SetLoggerSheet, GlobalRestModal, Profile, CircuitConfigurator`] | Sesión activa, Ajustes, Circuito<br>(`/session, /profile, /timer`) | Hourglass (mini-timer), Volume2 (volumen), Music (tono), PlayCircle (test tono).<br>**Refs:** Hourglass (1), Volume2 (3), Music (1), PlayCircle (1) | `lucide-react` |

---

### Familia 04 — Training Planning & Architecture (Planificación y Arquitectura del Entrenamiento)
> Bloques de trabajo, tipos de sesión, repetición de semanas, edición de ejercicios y estructura macro/mesociclo.  
> **Total recursos:** 6

| Recurso / Nombre | Tipo / Formato | Archivo / Componente | Pantalla / Ruta | Uso y Referencias | Librería |
|---|---|---|---|---|---|
| **Paleta de colores de tipos de bloque (BlockTypeSelector)**<br>_Clasificación cromática de bloques de entrenamiento: Preparación, Calentamiento, Trabajo, Descanso, Cooldown._ | `CSS / Paleta de colores`<br>(CSS circular badges con hex codes) | `src/components/timer/BlockTypeSelector.jsx`<br>[`BlockTypeSelector.jsx`] | Editor de sesión y configurador de bloques<br>(`/plan/session/new, /timer`) | Asignar tipo y color al bloque. El tipo seleccionado se marca con un icono Check.<br>**Refs:** 1 componente, 5 tipos estándar + custom | `CSS + Lucide (Check, Plus, Trash2)` |
| **Mapa de tipos de sesión (SESSION_TYPES)**<br>_Tipología global de sesiones: Potencia ⚡, Fuerza 🏋️, Hipertrofia 💪, TKD 🥋, Sparring 🥊, Cardio 🚴, Descanso 😴, Libre 🎯._ | `Mapa dinámico (Emoji + Color)`<br>(JavaScript Object en mockPlanner.js) | `src/data/mockPlanner.js (L230-239)`<br>[`Consumido por múltiples componentes de plan`] | Calendario semanal y vista de plan<br>(`/plan, tarjetas de sesión`) | Define el color, icono emoji y etiqueta de cada sesión en el planificador.<br>**Refs:** 8 tipos de sesión estructurados | `Unicode Emojis` |
| **Acciones del editor de bloques (MoreVertical, Copy, Trash2, Plus)**<br>_Menú contextual, duplicación, eliminación y adición de bloques de entrenamiento._ | `Icono de librería`<br>(SVG via Lucide) | `src/components/planner/EditableBlock.jsx`<br>[`EditableBlock.jsx`] | Editor de sesión<br>(`/plan/session/new, /plan/session/:id/edit`) | Gestión estructural del bloque dentro de la sesión.<br>**Refs:** MoreVertical (1), Copy (1), Trash2 (1), Plus (1) | `lucide-react` |
| **Controles de ejercicio en bloque (Plus / Minus / Trash2)**<br>_Ajuste de series (incrementar/decrementar) y eliminación de ejercicio del bloque._ | `Icono de librería`<br>(SVG via Lucide) | `src/components/planner/EditableExercise.jsx`<br>[`EditableExercise.jsx`] | Editor de sesión<br>(`/plan/session/new`) | Añadir/quitar series planificadas y eliminar el ejercicio.<br>**Refs:** Plus (1), Minus (1), Trash2 (1) | `lucide-react` |
| **Estructura macro/mesociclo (Calendar, Layers, Target, Repeat)**<br>_Unidades temporales superiores: temporadas, capas de mesociclo, objetivos y replicación de semanas._ | `Icono de librería`<br>(SVG via Lucide) | `SeasonList.jsx, MesocycleList.jsx, WeekRepetitionModal.jsx, Plan.jsx`<br>[`SeasonList, MesocycleList, WeekRepetitionModal`] | Jerarquía de planificación<br>(`/plan/seasons, /plan/seasons/:id, /plan`) | Visualizar temporadas (Calendar), fases (Layers), objetivos (Target) y clonar semanas (Repeat).<br>**Refs:** Calendar (2), Layers (2), Target (1), Repeat (3) | `lucide-react` |
| **Renombrar sesión inline (Lápiz SVG Duplicado)**<br>_Edición in-place rápida del nombre de la sesión._ | `SVG Inline (Duplicado en 2 archivos)`<br>(SVG path hardcodeado) | `src/pages/Home.jsx (L152) y src/components/planner/SessionReadView.jsx (L592)`<br>[`Home.jsx, SessionReadView.jsx`] | Home y Detalle de lectura<br>(`/ y vista de lectura de plan`) | Habilitar input editable directo sobre el título de la sesión.<br>**Refs:** 2 renders idénticos en 2 archivos | `SVG Custom / Sin librería` |

---

### Familia 05 — Data & Performance Visualization (Visualización de Datos y Rendimiento)
> Gráficos Recharts, micro-gráficos Sparkline, marcador TrafficLightBadge, trofeos, rachas y métricas calculadas.  
> **Total recursos:** 6

| Recurso / Nombre | Tipo / Formato | Archivo / Componente | Pantalla / Ruta | Uso y Referencias | Librería |
|---|---|---|---|---|---|
| **Gráficos interactivos de evolución (Recharts)**<br>_Volumen semanal, tendencia de RPE y carga acumulada a lo largo del tiempo._ | `Librería de gráficos`<br>(SVG generado por Recharts v3.8.1) | `src/pages/Evolution.jsx`<br>[`Evolution.jsx (ResponsiveContainer, BarChart, LineChart)`] | Evolución / Analítica<br>(`/evolution`) | Visualización analítica para el atleta y el coach.<br>**Refs:** 1 página, 5+ componentes Recharts | `recharts (v3.8.1)` |
| **Mini gráfico Sparkline de tendencia de 1RM**<br>_Curva histórica del 1RM estimado por ejercicio en las tarjetas de PRs._ | `SVG Inline matemático`<br>(SVG con defs, linearGradient sg, path interpolado, polyline y circle) | `src/pages/Evolution.jsx (L112-139)`<br>[`Función Sparkline en Evolution.jsx`] | Tarjetas de récords en Evolución<br>(`/evolution`) | Ver la tendencia histórica inmediata sin abrir gráficos pesados.<br>**Refs:** 1 componente local, renderizado por cada tarjeta de PR | `SVG Custom` |
| **Marcador electrónico de rendimiento (TrafficLightBadge)**<br>_Semáforo de 3 segmentos estilo marcador deportivo electrónico (Verde 3, Amarillo 2, Rojo 1)._ | `CSS Flexbox component`<br>(CSS segment box con estados cromáticos) | `src/components/performance/TrafficLightBadge.jsx`<br>[`TrafficLightBadge.jsx`] | Performance Dashboard<br>(`/performance`) | Indica el estado del sistema en función de fatiga, sobrecarga y preparación.<br>**Refs:** 1 componente dedicado | `CSS nativo` |
| **Tarjetas de métricas del Performance Dashboard**<br>_Métricas bioenergéticas y neuromusculares calculadas por el motor._ | `Emoji + Tarjeta CSS`<br>(Unicode Emoji en contenedor Tailwind) | `src/pages/PerformanceDashboard.jsx (L40-77)`<br>[`PerformanceDashboard.jsx`] | Performance Dashboard<br>(`/performance`) | Fatiga SNS 🔥, Recuperación 💚, Carga Aguda ⚡, Sobrecarga 📈, Balance ⚖️, Transferencia 🥋.<br>**Refs:** 6 emojis, 1 pantalla | `Unicode Emojis` |
| **Trofeo de récords y llama de racha (Trophy, Flame, TrendingUp)**<br>_Logros del atleta: Récords personales (Trophy), racha activa (Flame) y evolución positiva (TrendingUp)._ | `Icono de librería`<br>(SVG via Lucide) | `Home.jsx, Evolution.jsx, BottomNav.jsx`<br>[`Home.jsx, BottomNav.jsx`] | Home y Navegación<br>(`/, /evolution`) | Gamificación y motivación del atleta.<br>**Refs:** Trophy (1), Flame (1), TrendingUp (3) | `lucide-react` |
| **Calificación de satisfacción de sesión (Star Rating)**<br>_Valoración subjetiva post-entrenamiento de 1 a 5 estrellas._ | `Icono de librería interactivo`<br>(SVG via Lucide (Star) con fill condicional) | `src/components/FeedbackSection.jsx (L28-49), Profile.jsx`<br>[`FeedbackSection.jsx`] | Feedback de fin de sesión<br>(`Post-sesión, /profile`) | Permite al atleta calificar cómo se ha sentido con relleno naranja #FF6B00.<br>**Refs:** Star (2 renders) | `lucide-react` |

---

### Familia 06 — Athlete & Coach Identity (Identidad de Atleta y Coach)
> Gestión de roles, lista de atletas, asignación de rutinas y acreditación de perfil.  
> **Total recursos:** 3

| Recurso / Nombre | Tipo / Formato | Archivo / Componente | Pantalla / Ruta | Uso y Referencias | Librería |
|---|---|---|---|---|---|
| **Iconos de rol Atleta vs Coach (User vs Users)**<br>_Diferenciación de rol individual (Atleta / User) y colectivo/gestión (Coach / Users)._ | `Icono de librería`<br>(SVG via Lucide) | `Onboarding.jsx, Register.jsx, BottomNav.jsx, MyRoutines.jsx, Profile.jsx`<br>[`Onboarding, BottomNav, MyRoutines, Profile`] | Onboarding, Registro, Navegación de Coach<br>(`/onboarding, /register, /coach, /profile`) | Seleccionar rol en onboarding y habilitar la pestaña Coach en BottomNav.<br>**Refs:** User (2 renders), Users (4 renders) | `lucide-react` |
| **Acreditación de rol verificado y asignación (ShieldCheck, UserCheck)**<br>_Insignia de rol confirmado (ShieldCheck) y acción de asignar rutina a atleta (UserCheck)._ | `Icono de librería`<br>(SVG via Lucide) | `AthleteDetail.jsx, Onboarding.jsx, Profile.jsx, MyRoutines.jsx`<br>[`AthleteDetail, Onboarding, Profile, MyRoutines`] | Perfil, Detalle de atleta, Rutinas<br>(`/coach/:id, /onboarding, /profile, /coach/routines`) | Acreditar que el usuario es Coach/Atleta verificado y botón de asignar rutina.<br>**Refs:** ShieldCheck (4 renders), UserCheck (1 render) | `lucide-react` |
| **Selector de radio button en onboarding (Circle)**<br>_Estado no seleccionado en los selectores de rol de onboarding._ | `Icono de librería`<br>(SVG via Lucide) | `src/pages/Onboarding.jsx`<br>[`Onboarding.jsx`] | Bienvenida / Onboarding<br>(`/onboarding`) | Icono circular vacío para opción no marcada.<br>**Refs:** Circle (2 renders) | `lucide-react` |

---

### Familia 07 — Data Management & Sync (Gestión de Datos, Nube y Sincronización)
> Sincronización con Google Sheets, exportación a WhatsApp, copiado en portapapeles, guardado y borrado.  
> **Total recursos:** 6

| Recurso / Nombre | Tipo / Formato | Archivo / Componente | Pantalla / Ruta | Uso y Referencias | Librería |
|---|---|---|---|---|---|
| **Sincronización desde Google Sheets (DownloadCloud)**<br>_Descargar e importar planes y sesiones desde hojas de cálculo de Google Sheets._ | `Icono de librería`<br>(SVG via Lucide) | `AthleteDetail.jsx, ImportSession.jsx, Plan.jsx, Profile.jsx`<br>[`Botones de sincronización de plan`] | Plan, Detalle de atleta, Perfil<br>(`/coach/:id, /import/:code, /plan, /profile`) | Disparar el motor de parsing e ingesta de entrenamientos desde Sheets.<br>**Refs:** DownloadCloud (7 renders en 4 archivos) | `lucide-react` |
| **Subir sesión y estado offline (UploadCloud / CloudUpload)**<br>_Publicar sesión compartida o alertar de cambios pendientes de sincronización offline._ | `Icono de librería`<br>(SVG via Lucide) | `SessionReadView.jsx, SessionDetailView.jsx, Session.jsx`<br>[`SessionReadView, SessionDetailView, Session (banner offline)`] | Detalle de sesión y Sesión activa<br>(`/plan/session-detail, /session`) | Publicar sesión (UploadCloud) y banner de aviso de conectividad (CloudUpload).<br>**Refs:** UploadCloud (2), CloudUpload (1) | `lucide-react` |
| **Compartir sesión (Share vs Share2)**<br>_Exportar resumen de entrenamiento vía Web Share API o WhatsApp._ | `Icono de librería`<br>(SVG via Lucide) | `ExportSessionModal.jsx, Session.jsx, Evolution.jsx`<br>[`ExportSessionModal, Session, Evolution`] | Fin de sesión y modal de compartir<br>(`Modal exportación, /session, /evolution`) | Abrir hoja de compartir nativa del dispositivo con el texto formateado de la sesión.<br>**Refs:** Share2 (3 renders), Share (1 render) | `lucide-react` |
| **Guardar cambios (Save)**<br>_Persistir en base de datos local / Firebase la sesión o el circuito creado._ | `Icono de librería`<br>(SVG via Lucide) | `CircuitConfigurator.jsx, SessionEditor.jsx`<br>[`CircuitConfigurator, SessionEditor`] | Editor de sesión y editor de circuitos<br>(`/plan/session/new, /timer`) | Botón de confirmación de guardado estructural.<br>**Refs:** Save (2 renders) | `lucide-react` |
| **Eliminación universal de elementos (Trash2)**<br>_Eliminación definitiva de sesiones, bloques, ejercicios, atletas o filtros._ | `Icono de librería`<br>(SVG via Lucide) | `EditableBlock, EditableExercise, SessionReadView, BlockTypeSelector, CircuitConfigurator, AthleteDetail, Plan`<br>[`7 componentes distintos`] | Toda la app<br>(`Múltiples rutas de edición`) | Eliminar elementos con confirmación.<br>**Refs:** Trash2 (8 renders en 7 archivos) | `lucide-react` |
| **Buscador de ejercicios y sesiones (Search)**<br>_Campo de texto con filtrado en tiempo real._ | `Icono de librería`<br>(SVG via Lucide) | `ExerciseLibrarySheet.jsx, Evolution.jsx, ImportSession.jsx`<br>[`Librería de ejercicios, Buscador de evolución, Input de código`] | Sheet de librería, Evolución, Importar<br>(`/plan/session/new, /evolution, /import/:code`) | Filtrar biblioteca de ejercicios o buscar sesiones por código/nombre.<br>**Refs:** Search (3 renders) | `lucide-react` |

---

### Familia 08 — Feedback, Alerts & System State (Feedback, Alertas y Estado del Sistema)
> Marcas de verificación, alertas críticas, advertencias de planificación, spinners y botón universal de cierre.  
> **Total recursos:** 5

| Recurso / Nombre | Tipo / Formato | Archivo / Componente | Pantalla / Ruta | Uso y Referencias | Librería |
|---|---|---|---|---|---|
| **Sistema de verificación y confirmación (Check, CheckCircle, CheckCircle2)**<br>_Acción completada con éxito, serie registrada o validación de formulario._ | `Icono de librería`<br>(SVG via Lucide) | `14 archivos distintos a lo largo de la app`<br>[`ExerciseRow, ReadinessModal, SetLoggerSheet, SessionReadView, Onboarding, Profile, etc.`] | Toda la app<br>(`Global`) | Check simple para micro-acciones (10), CheckCircle para éxito de guardado (2), CheckCircle2 para onboarding/perfil (5).<br>**Refs:** 17 renders en total combinados | `lucide-react` |
| **Alertas de error vs advertencias (AlertCircle vs AlertTriangle)**<br>_Errores bloqueantes en autenticación (AlertCircle) vs advertencias suaves en planificación (AlertTriangle)._ | `Icono de librería`<br>(SVG via Lucide) | `Login.jsx, Register.jsx (AlertCircle), WeekRepetitionModal.jsx, ExerciseReview.jsx, ImportSession.jsx (AlertTriangle)`<br>[`Formularios auth y modales de plan`] | Auth, Planificador, Revisión de coach<br>(`/login, /register, /plan, /exercises/review, /import/:code`) | AlertCircle para fallos de login; AlertTriangle para sobreescritura de sesiones o datos incompletos.<br>**Refs:** AlertCircle (2 renders), AlertTriangle (3 renders) | `lucide-react` |
| **Spinner de carga asíncrona (Loader2)**<br>_Operación asíncrona en curso (login, registro, comunicación con Firebase)._ | `Icono de librería animado`<br>(SVG via Lucide + Tailwind animate-spin) | `src/pages/Login.jsx, src/pages/Register.jsx`<br>[`Botones submit de auth`] | Pantallas de acceso<br>(`/login, /register`) | Reemplaza el texto del botón mientras la petición está en vuelo.<br>**Refs:** Loader2 (2 renders) | `lucide-react` |
| **Cierre universal de modales y sheets (X)**<br>_Descartar o cerrar cualquier superficie superpuesta (modal, bottom sheet, filtro, badge)._ | `Icono de librería`<br>(SVG via Lucide) | `18 archivos distintos`<br>[`Todos los modales y sheets`] | Toda la aplicación<br>(`Global`) | Cerrar ReadinessModal, SetLoggerSheet, WeekRepetitionModal, ExportSessionModal, etc.<br>**Refs:** X (24 renders — el icono más utilizado de toda la app) | `lucide-react` |
| **Notificaciones, mensajes y envío (Bell, MessageCircle, Send)**<br>_Avisos del sistema (Bell), hilos de soporte/coach (MessageCircle) y envío de feedback (Send)._ | `Icono de librería`<br>(SVG via Lucide) | `Profile.jsx, FeedbackSection.jsx`<br>[`Profile, FeedbackSection`] | Perfil y feedback de sesión<br>(`/profile, fin de sesión`) | Configurar notificaciones, ver mensajes pendientes y enviar notas post-entrenamiento.<br>**Refs:** Bell (1), MessageCircle (2), Send (1) | `lucide-react` |

---

### Familia 09 — Sports & Wellness Vocabulary (Vocabulario de Deportes y Bienestar)
> Catálogo de deportes, disciplinas de combate, escalas de check-in de bienestar y métricas subjetivas.  
> **Total recursos:** 3

| Recurso / Nombre | Tipo / Formato | Archivo / Componente | Pantalla / Ruta | Uso y Referencias | Librería |
|---|---|---|---|---|---|
| **Catálogo oficial de deportes (DEFAULT_SPORTS)**<br>_Disciplinas configurables para el perfil del atleta y motor de planificación._ | `Emoji + Metadata`<br>(Unicode Emojis estructurados) | `src/pages/Onboarding.jsx (L19-27)`<br>[`Onboarding.jsx, SportSelector.jsx`] | Onboarding y Configuración de perfil<br>(`/onboarding, /profile`) | Gimnasio 🏋️, Taekwondo 🥋, Boxeo 🥊, Judo 🤼, Natación 🏊, Ciclismo 🚴, Running 🏃, Crossfit ⚔️, Custom 🎯.<br>**Refs:** 9 deportes estándar | `Unicode Emojis` |
| **Escalas de check-in de bienestar (WellnessCheckIn)**<br>_Valoración diaria de 4 dimensiones: Sueño 😴, Estrés 😤, Energía ⚡, Dolor Muscular (DOMS) 🦵._ | `Matriz de Emojis (5 niveles por métrica)`<br>(Unicode Emojis en escala de 5 pasos) | `src/components/performance/WellnessCheckIn.jsx (L4-34)`<br>[`WellnessCheckIn.jsx`] | Modal de preparación diaria<br>(`Pre-sesión / Readiness`) | Capturar el estado subjetivo pre-entrenamiento. Alimenta el semáforo y volumen recomendado.<br>**Refs:** 4 métricas x 5 niveles = 20 estados de emoji | `Unicode Emojis` |
| **Icono de halteras / fuerza (Dumbbell)**<br>_Entrenamiento de fuerza con pesas y contador de ejercicios en cabeceras._ | `Icono de librería`<br>(SVG via Lucide) | `SessionReadView, Login, Register, AthleteDetail, CoachDashboard, MyRoutines, ImportSession, SessionDetailView`<br>[`8 componentes distintos`] | Auth, Sesión, Coach, Plan<br>(`Toda la aplicación`) | Icono de marca en login/registro y contador de número de ejercicios en vistas de sesión.<br>**Refs:** Dumbbell (11 renders activos) | `lucide-react` |

---

### Familia 10 — Form & Input Affordances (Affordances de Formularios e Inputs)
> Iconos decorativos de prefijo en campos de entrada, indicadores de duración y fecha.  
> **Total recursos:** 2

| Recurso / Nombre | Tipo / Formato | Archivo / Componente | Pantalla / Ruta | Uso y Referencias | Librería |
|---|---|---|---|---|---|
| **Prefijos de campos de autenticación (Mail, Lock, User)**<br>_Affordance visual para identificar inputs de email, contraseña y nombre completo._ | `Icono de librería`<br>(SVG via Lucide) | `src/pages/Login.jsx, src/pages/Register.jsx`<br>[`Inputs de formulario de auth`] | Login y Registro<br>(`/login, /register`) | Icono fijo a la izquierda dentro del campo de texto.<br>**Refs:** Mail (2), Lock (2), User (1) | `lucide-react` |
| **Metadatos de sesión en cabeceras (Clock, CalendarDays)**<br>_Indicador de duración estimada (Clock) y fecha asignada (CalendarDays) en cabeceras de sesión._ | `Icono de librería`<br>(SVG via Lucide) | `SessionReadView.jsx, ImportSession.jsx, SessionDetailView.jsx, SessionEditor.jsx, Home.jsx`<br>[`Cabeceras y tarjetas de sesión`] | Vistas de sesión y planificador<br>(`/plan/session-detail, /import/:code, /plan/session/new, /`) | Etiquetar la duración prevista (ej. "45 min") y la fecha de ejecución.<br>**Refs:** Clock (3 renders), CalendarDays (3 renders) | `lucide-react` |

---

### Familia 11 — Unclassified & Dormant Assets (Activos No Clasificados y Dormidos)
> Archivos huérfanos sin referencias activas, imports de iconos sin renderizar en JSX y utilidades CSS no enlazadas.  
> **Total recursos:** 3

| Recurso / Nombre | Tipo / Formato | Archivo / Componente | Pantalla / Ruta | Uso y Referencias | Librería |
|---|---|---|---|---|---|
| **Archivos gráficos huérfanos en bundle (hero.png, react.svg, vite.svg, icons.svg, favicon.svg)**<br>_Restos de plantillas de scaffold o assets publicitarios sin enlace activo en la aplicación._ | `Archivos físicos huérfanos`<br>(PNG / SVG) | `src/assets/hero.png, react.svg, vite.svg, public/icons.svg, favicon.svg`<br>[`Ninguno`] | Ninguna<br>(`— (Sin uso en runtime)`) | Sin referencias en JSX, index.html o manifest.json.<br>**Refs:** 0 referencias | `Scaffold / Plantillas Vite` |
| **Iconos de librería importados pero dormidos (0 renders JSX)**<br>_14 importaciones de Lucide presentes en cabeceras de archivo pero sin invocación JSX._ | `Importaciones inactivas`<br>(JavaScript Imports) | `Evolution (Heart, ClipboardList, Activity, Trophy, TrendingUp), SessionEditor (Eye), Onboarding (Award, Dumbbell), Profile (RefreshCw), etc.`<br>[`7 componentes/páginas distintas`] | —<br>(`— (Dormidos en archivo)`) | Restos de refactorizaciones previas o sustitución por emojis (como Eye por 👁).<br>**Refs:** 14 imports con 0 renders | `lucide-react` |
| **Utilidades CSS decorativas no enlazadas (.barcode-sim, .dossier-header-border)**<br>_Generador de código de barras simulado mediante gradientes y borde técnico de estilo dossier._ | `Clases CSS sin aplicar`<br>(Tailwind / CSS rules en src/index.css) | `src/index.css (L249-262)`<br>[`Ninguno en JSX actual`] | —<br>(`—`) | Posible experimento de estética técnica o dorsal de competición sin uso actual.<br>**Refs:** 0 referencias en JSX | `CSS nativo` |

---

## Resumen de Previews y Limitaciones

1. **Recursos Visualizados en el HTML Interactivo:**
   * Todos los 75 iconos de `lucide-react` se renderizan en tiempo real mediante la librería Lucide CDN.
   * Todos los SVG Inline (`CountdownRing`, `Sparkline`, Lápiz de edición, FAB flotante) se renderizan nativamente con sus gradientes y filtros correspondientes.
   * Los componentes CSS (`TrafficLightBadge`, `ProgressBar`, Avatar Monograma) cuentan con simulación visual idéntica a su renderizado en la aplicación.
   * Las matrices de Emojis (`DEFAULT_SPORTS`, `SESSION_TYPES`, `WellnessCheckIn`, Velocidades `SetLoggerSheet`) se visualizan como chips y matrices estructuradas.

2. **Elementos con Limitación o "Preview Unavailable":**
   * **Archivos físicos huérfanos (`hero.png`, `icons.svg`, `react.svg`, `vite.svg`):** No se renderizan en componentes activos y están catalogados en la Familia 11 como huérfanos.
   * **Utilidades CSS no enlazadas (`.barcode-sim`, `.dossier-header-border`):** Representadas mediante simulación en el catálogo interactivo.

---
*Informe generado para la Fase 3 de la Auditoría Visual de TrainingOS.*
