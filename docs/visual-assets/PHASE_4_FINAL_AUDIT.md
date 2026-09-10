# TrainingOS — Final Visual Audit
## FASE 4 — Auditoría Crítica y Validación Final

---

## Información del Análisis

| Campo | Valor |
|---|---|
| **Modelo** | Claude Opus 4.6 (Thinking) |
| **Nivel de razonamiento** | Extended thinking |
| **Fecha** | 2026-08-20 |
| **Fuentes** | `PHASE_1_TECHNICAL_DISCOVERY.md`, `PHASE_2_FUNCTIONAL_ANALYSIS.md`, `VISUAL_ASSET_INVENTORY.md`, `VISUAL_ASSET_INVENTORY.html`, `PHASE_3_5_VISUAL_CONSOLIDATION.md` |
| **Fase auditada** | Fase 3.5 — Consolidación y Priorización Visual (Claude Sonnet 4.6) |

---

## 1. Executive Verdict

### VALIDATED WITH CORRECTIONS

La consolidación de la Fase 3.5 es **conceptualmente correcta** en su principio rector ("RECURSO TÉCNICO ≠ CONCEPTO VISUAL") y en sus hallazgos estructurales principales. Sin embargo, presenta:

- **Inflación del alcance de diseño:** marca como "candidatos a diseño propio" elementos que solo necesitan estandarización técnica o que ya funcionan correctamente con iconos de librería.
- **Confusión entre DISEÑAR y ESTANDARIZAR:** varias entradas clasificadas como "Sí — diseño propio" son en realidad decisiones de sistema (elegir un icono Lucide sobre otro) o correcciones de código.
- **Prioridades infladas:** CV-01/CV-02 (brand assets ya existentes) no deberían compartir prioridad P0 con la colisión del ⚡ o el bug semántico del 🥋.
- **Trazabilidad incompleta:** la cifra "122 recursos técnicos → 47 conceptos" no es verificable — hay ~18 iconos Lucide activos sin mención explícita en el catálogo de 47 conceptos, y los "47" incluyen 5 duplicados y 3 grupos dormidos que no son conceptos visuales.
- **Un concepto que es realmente un bug de código** (DV-15 Transferencia deportiva) clasificado como trabajo de diseño P0.

**Balance:** el trabajo de Sonnet es sustancialmente correcto y útil. Las correcciones reducen el alcance de diseño real de ~26 conceptos a **14 conceptos que genuinamente necesitan diseño nuevo**, lo que es un scope manejable y coherente.

---

## 2. Corrections to Phase 3.5

### CORRECCIÓN 1 — CV-01 y CV-02 (Brand) no son P0 CRÍTICO de diseño

**Problema:** La Fase 3.5 los marca como P0 junto a la colisión del ⚡ y el bug del 🥋. Pero el logo y el isotipo ya existen como activos diseñados. No hay "colisión" ni "error semántico" en ellos — funcionan.

**Corrección:** Reclasificar como **REVIEW** con prioridad **P2 MEDIO**. La revisión de formato (PNG→SVG) y resolución es una tarea de optimización técnica, no de diseño conceptual urgente. Solo se convierte en P0 si se decide cambiar la identidad de marca completa — algo que no está en el scope de esta auditoría visual.

---

### CORRECCIÓN 2 — CV-09 (Play / CTA) NO debe diseñarse como icono propio

**Problema:** La Fase 3.5 lo marca como CORE VISUAL P1 ALTO y sugiere "una identidad más propia" para el botón Play. Pero Play es la metáfora multimedia más universalmente comprendida del planeta. Diseñar un "Play propio de TrainingOS" crearía confusión cognitiva.

**Corrección:** Reclasificar como **NO DISEÑAR**. El triángulo Play es correcto. Lo que sí necesita estandarización es su uso inconsistente: distinguir cuándo Play significa "iniciar sesión" (CTA), cuándo significa "tab de navegación" (BottomNav) y cuándo significa "control de timer" (TimerViews). Eso es un problema de jerarquía visual (tamaño, color, contexto), no de forma del icono.

---

### CORRECCIÓN 3 — CV-10 (FAB timer) es una tarea de ESTANDARIZACIÓN, no de diseño

**Problema:** La Fase 3.5 lo marca como CORE VISUAL P1 ALTO y candidato a diseño propio. Pero el FAB es un reloj SVG inline que replica (con diferente strokeWidth) el icono `Timer` de Lucide. La solución es usar `Timer` de Lucide directamente, no diseñar un tercer icono de reloj.

**Corrección:** Reclasificar como **STANDARDIZE**. Eliminar el SVG inline y usar `Timer` de Lucide con el strokeWidth apropiado.

---

### CORRECCIÓN 4 — CV-06 (ProgressBar) y CV-08 (Recharts) no son conceptos de diseño de iconos

**Problema:** La Fase 3.5 los incluye como CORE VISUAL. Pero una barra de progreso y unos gráficos de Recharts no son "conceptos visuales" en el sentido de esta auditoría — son componentes de UI con estilos CSS. "Revisar los colores de la barra de progreso" es theming, no diseño de iconografía.

**Corrección:** Reclasificar CV-06 y CV-08 como **THEMING** — entran en la fase de definición de paleta y estilo, no en la fase de diseño de conceptos visuales. Excluirlos del conteo de "conceptos a diseñar".

---

### CORRECCIÓN 5 — CV-11 (StarRating) NO necesita diseño propio

**Problema:** La Fase 3.5 lo marca como CORE VISUAL P2 "Posible" candidato. Pero un sistema de 5 estrellas con la `Star` de Lucide rellena en naranja `#FF6B00` es un patrón universal que ya funciona correctamente. No hay ninguna razón de producto para diseñar una estrella propia.

**Corrección:** Reclasificar como **NO DISEÑAR**. El StarRating funciona. La estrella de Lucide con fill naranja es brand-consistent. No invertir tiempo de diseño aquí.

---

### CORRECCIÓN 6 — DV-05 (Fuerza/Dumbbell) no necesita diseño nuevo — necesita estandarización

**Problema:** La Fase 3.5 lo marca como P0 CRÍTICO y candidato a diseño propio, argumentando que `Dumbbell` (Lucide) y `🏋️` (emoji) deben "unificarse bajo un icono propio". Pero `Dumbbell` ya funciona perfectamente como icono de fuerza/gimnasio — tiene 11 renders consistentes y es universalmente reconocido. El emoji `🏋️` se usa solo en el mapa de datos `SESSION_TYPES`, que es un sistema separado.

**Corrección:** Reclasificar como **STANDARDIZE** con prioridad **P2 MEDIO**. La decisión es: ¿usar `Dumbbell` de Lucide también para SESSION_TYPES en vez del emoji? Eso es una decisión de sistema, no un diseño nuevo. `Dumbbell` de Lucide ya ES el icono de fuerza de TrainingOS.

---

### CORRECCIÓN 7 — DV-07 (Racha/Flame) y DV-08 (PR/Trophy) funcionan con Lucide

**Problema:** La Fase 3.5 los marca como DOMAIN VISUAL P1 y sugiere diseñar iconos propios. Pero `Flame` (racha) y `Trophy` (récord) son metáforas universales en apps de fitness (Strava, Nike Run Club, Fitbit). No hay colisión semántica, no hay confusión, tienen 1 render cada uno, son conceptos limpios.

**Corrección:** Reclasificar ambos como **NO DISEÑAR** a menos que el futuro lenguaje visual de TrainingOS requiera explícitamente abandonar Lucide como librería base. Si se mantiene Lucide, Flame y Trophy son perfectamente adecuados. Si se decide crear una iconografía 100% propia en el futuro, estos entrarían como parte de esa migración masiva, no como prioridad individual.

---

### CORRECCIÓN 8 — DV-14 (Fatiga SNS / 🔥) no necesita diseño

**Problema:** La Fase 3.5 lo marca como P1 ALTO y candidato a icono propio. Pero `🔥` tiene una sola instancia, sin colisión, en un contexto analítico donde va acompañado de texto descriptivo ("Fatiga del SNS"). El emoji funciona.

**Corrección:** Reclasificar como **NO DISEÑAR**. Si se resuelve que todos los emojis del PerformanceDashboard se sustituyen por un sistema de iconos propio, entra como parte de ese esfuerzo — pero no como candidato individual de diseño.

---

### CORRECCIÓN 9 — DV-15 (Transferencia deportiva / 🥋) es un CODE FIX, no un trabajo de diseño

**Problema:** La Fase 3.5 lo marca correctamente como P0 CRÍTICO, pero lo clasifica como "candidato a diseño propio". El problema real es que el código hardcodea `🥋` para todos los atletas. La solución es: leer el deporte del atleta y mostrar el emoji correspondiente de `DEFAULT_SPORTS`. Esto es un fix de 3 líneas de código, no un diseño de icono.

**Corrección:** Reclasificar como **CODE FIX** P0. Sí debe resolverse urgentemente, pero no es trabajo de diseño visual. Eliminarlo del scope de diseño.

*Nota:* Si en el futuro se decide crear un icono abstracto de "transferencia deportiva" que no dependa del deporte específico, eso sería un diseño nuevo. Pero la solución inmediata es código.

---

### CORRECCIÓN 10 — F4 (Execution Metrics) no es una familia viable

**Problema:** F4 contiene un solo concepto (DV-03 Velocidad de ejecución). Una familia de diseño con un solo miembro no es una familia — es un concepto huérfano.

**Corrección:** Fusionar DV-03 en **F3 (Execution & Timer)**. La velocidad de ejecución se registra durante la sesión activa, que es el dominio de F3.

---

### CORRECCIÓN 11 — La cifra "47 conceptos" incluye elementos que no son conceptos visuales

**Problema:** Los 47 incluyen:
- 5 entradas DR (duplicados/variantes) — son problemas de consistencia, no conceptos
- 3 entradas DO (dormidos) — son tareas de limpieza de código, no conceptos

El conteo real de conceptos visuales es **39** (12 CV + 15 DV + 8 UT + 4 SY). Y de esos 39, ~18 son UTILITY/SYSTEM marcados como NO DISEÑAR. Los conceptos candidatos a algún tipo de trabajo son ~21.

**Corrección:** Separar claramente: **39 conceptos visuales** + **5 problemas de consistencia** + **3 tareas de limpieza**. No mezclar categorías.

---

### CORRECCIÓN 12 — Iconos Lucide activos no mencionados en el catálogo

Los siguientes iconos Lucide con renders activos no tienen entrada explícita en el catálogo de 47 conceptos:

| Icono | Renders | Uso | Debería estar en |
|---|---|---|---|
| `ArrowRight` | 2 | Navegación entre series en SetLoggerSheet | UT (Navigation) |
| `BarChart2` | 1 | Sección de estadísticas en Home | SY o CV-08 (Charts) |
| `ClipboardEdit` | 1 | Editar sesión desde vista lectura | UT (Edit action) |
| `ClipboardList` | 2 | Logs de sesión en AthleteDetail | UT (Data label) |
| `Copy` | 3 | Duplicar bloque/copiar texto | UT (Standard action) |
| `LogOut` | 1 | Cerrar sesión en Profile | SY (Auth) |
| `Minus` | 1 | Decrementar series | UT (Quantity control) |
| `MoreVertical` | 1 | Menú contextual de bloque | UT (Standard affordance) |
| `Volume2` | 3 | Control de sonido de timer | SY (Audio) |
| `Music` | 1 | Selector de tono | SY (Audio) |
| `PlayCircle` | 1 | Test de sonido en Profile | SY (Audio) |
| `Repeat` | 3 | Clonar semana / generar circuito | UT (Planning action) |
| `History` | 1 | Referencia de carga semana anterior | UT (Data label) |
| `Target` | 1 | Objetivo de mesociclo | UT (Planning label) |
| `Layers` | 2 | Estructura de temporadas | UT (Planning label) |
| `Calendar` | 2 | Temporadas en SeasonList | UT (Planning label) |
| `ShieldCheck` | 4 | Badge de rol verificado | SY (Identity) |
| `Activity` | 2 | Sección actividad en AthleteDetail | UT (Data label) |

**Impacto:** Ninguno de estos necesita diseño. Todos son UI funcional estándar. Pero su ausencia del catálogo rompe la trazabilidad "122 → 47". Si se incluyen, el conteo de UTILITY/SYSTEM sube a ~26, y el total de conceptos sube a ~57.

---

## 3. Final Concept Inventory

### Conceptos que SÍ necesitan diseño nuevo

| ID | Concepto | Familia | Acción | Prioridad | Motivo |
|---|---|---|---|---|---|
| DV-01 | Potencia (capacidad gym) | F2 | **YES** | **P0** | Colisión ⚡ activa. Necesita glifo propio que no sea ⚡. |
| DV-02 | Energía subjetiva (wellness) | F6 | **YES** | **P0** | Colisión ⚡ activa. Concepto distinto a potencia/carga. |
| DV-03 | Velocidad de ejecución (escala 3 niveles) | F3 | **YES** | **P1** | El valor "medio" usa ⚡ (colisión). Necesita sistema propio de 3 badges. |
| DV-04 | Carga aguda (estímulo acumulado) | F5 | **YES** | **P1** | Colisión ⚡ en PerformanceDashboard. Necesita glifo propio. |
| DV-06 | Hipertrofia (capacidad gym) | F2 | **YES** | **P1** | 💪 rendering variable entre plataformas. Coherencia con Potencia y Fuerza. |
| CV-04 | CountdownRing | F3 | **YES** | **P1** | Ya es diseño propio. Revisar coherencia con lenguaje futuro. |
| CV-05 | TrafficLightBadge | F5 | **YES** | **P1** | Sin equivalente en librerías. Elemento de identidad del motor de rendimiento. |
| CV-07 | Sparkline 1RM | F5 | **YES** | **P2** | SVG custom de alta expresividad. Revisar estilo cuando se defina paleta. |
| CV-03 | Avatar del atleta | F1 | **YES** | **P2** | Monograma con color fijo. Candidato a evolución (color según deporte). |
| CV-12 | Paleta de tipos de bloque | F9 | **YES** | **P2** | Sistema cromático propio. Revisar paleta cuando se defina lenguaje. |
| DV-09 | Deporte: Taekwondo | F7 | **YES** | **P2** | Solo si se decide sustituir emojis por iconos propios de deporte. |
| DV-10 | Deporte: Boxeo | F7 | **YES** | **P2** | Mismo criterio que TKD — solo si se migra de emojis a iconos. |
| DV-11 | Deporte: Gym/Crossfit | F7 | **YES** | **P2** | ⚔️ para Crossfit es semánticamente débil. Candidato a mejora. |
| DV-12 | Deportes de resistencia | F7 | **YES** | **P3** | Solo si se migra de emojis a iconos propios de deporte. |

**TOTAL A DISEÑAR: 14**

---

### Conceptos que necesitan estandarización técnica (no diseño)

| ID | Concepto | Acción | Prioridad | Decisión requerida |
|---|---|---|---|---|
| DR-01 | ⚡ colisión | **STANDARDIZE** | **P0** | Asignar un glifo distinto a cada uno de los 4 conceptos. |
| DR-02 | Tiempo/Reloj (5 impls) | **STANDARDIZE** | P1 | Clock=duración, Timer=acceso, Hourglass=descanso. Eliminar SVG inline y ⏱ emoji. |
| DR-03 | Lápiz (3 impls) | **STANDARDIZE** | P2 | Eliminar SVG inline. Usar siempre Pencil de Lucide. |
| DR-04 | Check (3 variantes) | **STANDARDIZE** | P3 | Check=inline, CheckCircle2=éxito. Eliminar CheckCircle. |
| DR-05 | Share (2 variantes) | **STANDARDIZE** | P3 | Auditar ExportSessionModal. Unificar en Share2. |
| UT-04 | Back navigation | **STANDARDIZE** | P2 | Elegir ChevronLeft. Eliminar ArrowLeft para "volver". |
| SY-04 | Cloud sync (3 variantes) | **STANDARDIZE** | P3 | Eliminar CloudUpload. Usar DownloadCloud/UploadCloud. |
| DV-05 | Fuerza (Dumbbell vs 🏋️) | **STANDARDIZE** | P2 | Decidir: ¿Dumbbell de Lucide también en SESSION_TYPES? |
| CV-10 | FAB timer (SVG inline) | **STANDARDIZE** | P2 | Eliminar SVG inline. Usar Timer de Lucide. |

**TOTAL A ESTANDARIZAR: 9**

---

### Conceptos que deben mantenerse como UI estándar (NO DISEÑAR)

| ID | Concepto | Razón |
|---|---|---|
| UT-01 | X (cerrar) | Convención universal. 24 renders consistentes. |
| UT-02 | Trash2 (eliminar) | Convención más uniforme de la app. |
| UT-03 | Plus (añadir) | Convención universal. |
| UT-05 | Search (buscar) | Convención universal. |
| UT-06 | Save (guardar) | Convención universal. |
| UT-07 | Share2 (compartir) | Convención universal (tras estandarizar). |
| UT-08 | Pencil (editar) | Convención universal (tras estandarizar). |
| SY-01 | BottomNav tabs | Lucide estándar para navegación. |
| SY-02 | Form prefixes (Mail, Lock, User) | Decoración de inputs estándar. |
| SY-03 | Alertas y estados (AlertCircle, AlertTriangle, Check, Loader2) | Convenciones de sistema estándar. |
| CV-01 | Logo TrainingOS | Ya existe. No rediseñar (posible optimización técnica PNG→SVG). |
| CV-02 | Isotipo TrainingOS | Ya existe. No rediseñar (ídem). |
| CV-09 | Play (CTA / timer) | Triángulo Play = convención universal. No diseñar forma propia. |
| CV-11 | StarRating | Star de Lucide + fill naranja funciona perfectamente. |
| DV-07 | Racha (Flame) | Lucide Flame funciona. Sin colisión. |
| DV-08 | PR (Trophy) | Lucide Trophy funciona. Sin colisión. |
| DV-14 | Fatiga SNS (🔥) | Única instancia, sin colisión. Funciona con texto descriptivo. |
| DV-13 | Judo (🤼) | Emoji funcional. Secundario. |
| — | Controles de media (Pause, Square, SkipBack, SkipForward, FastForward) | Metáfora multimedia estándar. |
| — | Navegación (ChevronRight, ChevronDown, ChevronUp) | Convención de listas y acordeones. |
| — | Iconos menores activos (ArrowRight, BarChart2, Copy, LogOut, Minus, MoreVertical, Volume2, Music, PlayCircle, Repeat, History, Target, Layers, Calendar, ShieldCheck, ClipboardEdit, ClipboardList, Activity) | UI funcional estándar sin necesidad de diseño. |

**TOTAL A MANTENER: ~38 conceptos + iconos menores**

---

### Conceptos que deben eliminarse del código

| ID | Concepto | Acción |
|---|---|---|
| DO-01 | react.svg, vite.svg, favicon.svg | Eliminar — scaffolding de Vite. |
| DO-02 | icons.svg (social sprite) | Eliminar — sin `<use href>` activo. |
| DO-03 | 14 imports Lucide dormidos | Eliminar — inflan bundle y ruido. |
| — | hero.png | Eliminar o documentar propósito. Sin referencia activa. |
| — | .barcode-sim, .dossier-header-border CSS | Eliminar — CSS sin aplicar a ningún elemento. |

**TOTAL A ELIMINAR: 5 grupos (~22 recursos técnicos)**

---

### Conceptos que requieren revisión posterior (CODE FIX, no diseño)

| ID | Concepto | Acción | Prioridad |
|---|---|---|---|
| DV-15 | Transferencia deportiva (🥋 hardcodeado) | **CODE FIX** | **P0** |
| CV-06 | ProgressBar (estilo CSS) | **THEMING** | P2 — entra cuando se defina paleta |
| CV-08 | Recharts (estilo gráficos) | **THEMING** | P2 — entra cuando se defina paleta |

**TOTAL A REVISAR: 3**

---

## 4. Final Design Families

### Familias que sobreviven para la fase de diseño

| # | Familia | Conceptos | Notas |
|---|---|---|---|
| **F1** | Brand & Identity | CV-03 (Avatar) | Logo e isotipo ya existen — solo optimización técnica. Avatar sí es candidato a evolución. |
| **F2** | Training Capabilities | DV-01 (Potencia), DV-06 (Hipertrofia) | Fuerza/Dumbbell se mantiene con Lucide. Potencia e Hipertrofia necesitan iconos nuevos. |
| **F3** | Execution & Timer | CV-04 (CountdownRing), DV-03 (Velocidad) | CountdownRing ya es diseño propio. Velocidad necesita 3 badges propios. F4 absorbida aquí. |
| **F5** | Performance & Analytics | CV-05 (TrafficLight), CV-07 (Sparkline), DV-04 (Carga Aguda) | Motor de rendimiento. Los 3 necesitan diseño o revisión de estilo. |
| **F7** | Sport Classification | DV-09, DV-10, DV-11, DV-12 | Solo si se decide migrar de emojis a iconos propios. Si no, esta familia NO se diseña. |
| **F9** | Training Planning | CV-12 (Paleta de bloques) | Sistema cromático propio. Revisar cuando se defina paleta. |

### Familias eliminadas o absorbidas

| Familia original | Disposición | Razón |
|---|---|---|
| **F4** — Execution Metrics | Absorbida en F3 | Solo tenía 1 concepto (DV-03 Velocidad). |
| **F6** — Wellness & Recovery | Absorbida en F2 | DV-02 (Energía) necesita diseño como parte de la resolución ⚡ (F2-adjacent). Las escalas de bienestar son datos emoji, no diseño de iconos. |
| **F8** — Athlete Motivation | Eliminada | Flame y Trophy se mantienen con Lucide. StarRating se mantiene con Lucide. No hay trabajo de diseño. |
| **F10** — UI Functional | Eliminada como "familia de diseño" | No se diseña. Se estandariza. Lista de tareas de código, no de diseño. |

### Familias finales: 6 (F1, F2, F3, F5, F7, F9)

---

## 5. Concepts That Should NOT Be Redesigned

La siguiente lista es la respuesta directa a la pregunta:

> "¿Qué elementos de TrainingOS NO merece la pena rediseñar?"

### Iconos Lucide que funcionan correctamente y no deben tocarse

| Icono | Renders | Razón para no tocar |
|---|---|---|
| `X` | 24 | La convención más fuerte de la app. Universal. |
| `Trash2` | 8 | La convención más uniforme de la app. |
| `Plus` | 22 | Universal. Segundo más consistente. |
| `Play` | 14 | Metáfora multimedia universal. |
| `Search` | 3 | Lupa = buscar. Sin alternativa mejor. |
| `Save` | 2 | Disquete = guardar. Universal. |
| `Dumbbell` | 11 | Funciona perfectamente como "fuerza/gym". Estandarizar, no rediseñar. |
| `Flame` | 1 | "Racha" / "streak". Estándar en fitness apps. Sin colisión. |
| `Trophy` | 1 | "Récord personal". Estándar. Sin colisión. |
| `Star` | 2 | Calificación 5 estrellas. Patrón universal con fill brand-orange. |
| `Pause`, `Square` | 4 cada uno | Controles de media estándar. |
| `Check` | 10 | Confirmación micro-inline. Universal. |
| `ChevronRight` | 9 | Drill-down en listas. Universal. |

### Emojis que funcionan correctamente

| Emoji | Concepto | Razón |
|---|---|---|
| 🔥 | Fatiga SNS | 1 sola instancia, sin colisión, con texto descriptivo. |
| 🐢 | Velocidad lenta | Intuitivo, sin colisión. (Solo ⚡ de "medio" tiene problema.) |
| 🚀 | Velocidad rápida | Intuitivo, sin colisión. |
| 😴 | Sueño (wellness) | Sin colisión, contexto claro en WellnessCheckIn. |
| 😤 | Estrés (wellness) | Sin colisión, contexto claro. |
| 🦵 | DOMS (wellness) | Sin colisión, contexto claro. |

### Componentes que funcionan pero no son "diseño de iconos"

| Componente | Razón para no incluir en scope de diseño de iconos |
|---|---|
| ProgressBar | Es theming CSS, no iconografía. Entra en la definición de paleta. |
| Recharts | Es theming de gráficos. Entra en la definición de paleta y tipografía. |
| StarRating | Patrón universal. Lucide Star + fill naranja funciona. |

---

## 6. Concepts Requiring Standardization (Not Design)

| # | Inconsistencia | Recursos en conflicto | Decisión requerida | Prioridad |
|---|---|---|---|---|
| S-01 | ⚡ polisemia | Potencia, Energía, Velocidad media, Carga Aguda | Asignar glifo distinto a cada concepto | **P0** |
| S-02 | Back navigation | `ArrowLeft` (4) vs `ChevronLeft` (8) | Unificar en `ChevronLeft` | P2 |
| S-03 | Pencil duplicado | `Pencil` (Lucide) vs SVG inline ×2 | Eliminar SVG inline. Usar `Pencil`. | P2 |
| S-04 | Time icons | `Timer`, `Clock`, SVG FAB, `Hourglass`, ⏱ | Clock=duración, Timer=acceso, Hourglass=descanso. Eliminar SVG y ⏱. | P1 |
| S-05 | Check variants | `Check`, `CheckCircle`, `CheckCircle2` | Check=inline, CheckCircle2=éxito. Eliminar CheckCircle. | P3 |
| S-06 | Share variants | `Share` vs `Share2` en ExportSessionModal | Auditar. Unificar en `Share2`. | P3 |
| S-07 | Cloud sync | `UploadCloud` vs `CloudUpload` | Eliminar `CloudUpload`. | P3 |
| S-08 | Fuerza (Dumbbell vs 🏋️) | Lucide Dumbbell (11 renders) vs emoji 🏋️ en SESSION_TYPES | Elegir uno. Recomendación: Dumbbell de Lucide para todo. | P2 |
| S-09 | FAB timer inline | SVG inline en Session.jsx vs Timer de Lucide | Eliminar SVG inline. Usar `Timer` de Lucide. | P2 |

---

## 7. Semantic Collisions

### COLISIÓN 1 — ⚡ Lightning Bolt (CONFIRMADA, P0)

| Uso | Archivo | Concepto real | ¿Se ven simultáneamente? |
|---|---|---|---|
| Tipo de sesión "Potencia" | mockPlanner.js → tarjetas de Plan | Capacidad neuromuscular | No (Plan view) |
| Velocidad "media" de serie | SetLoggerSheet.jsx | Velocidad de ejecución | No (Session logging) |
| Energía (wellness check-in) | WellnessCheckIn.jsx | Vitalidad subjetiva | No (Pre-session modal) |
| Carga Aguda (métrica) | PerformanceDashboard.jsx | Estímulo acumulado | No (Performance view) |

**Observación crítica que difiere de la Fase 3.5:** Los 4 usos aparecen en **pantallas diferentes** y nunca coexisten visualmente en la misma vista. La colisión es conceptual (el mismo glifo para 4 significados) pero no genera confusión visual directa en la UI actual. Dicho esto, la colisión sigue siendo real porque:
1. Un usuario que ve ⚡ en una tarjeta de sesión (potencia) y luego ⚡ en el wellness check-in (energía) experimenta incoherencia semántica.
2. Si se añaden vistas combinadas en el futuro (dashboard unificado), la colisión se vuelve visible.

**Veredicto:** La colisión es real y debe resolverse, pero su impacto práctico actual es menor de lo que sugiere la urgencia P0 de la Fase 3.5. Mantener P0 por razones de coherencia conceptual y prevención de problemas futuros.

---

### COLISIÓN 2 — 🥋 Kimono (CONFIRMADA, P0 — pero es CODE FIX)

| Uso | Archivo | Problema |
|---|---|---|
| Deporte TKD | DEFAULT_SPORTS, SESSION_TYPES | Correcto |
| Transferencia deportiva | PerformanceDashboard.jsx | **Incorrecto** para atletas no-TKD |

**Veredicto:** Confirmada. La solución es código (leer `athlete.sport` y mostrar el emoji correspondiente), no diseño de iconos.

---

### COLISIÓN 3 — Play (NUEVA — no identificada en Fase 3.5)

| Uso | Archivo | Concepto |
|---|---|---|
| Tab "Sesión" en BottomNav | BottomNav.jsx | Navegación a pantalla |
| CTA "Iniciar entrenamiento" | Home.jsx, SessionReadView.jsx | Acción principal de producto |
| Control de timer | TimerViews.jsx (×6), CircuitPlayer.jsx | Control multimedia |
| Iniciar circuito configurado | CircuitConfigurator.jsx | Acción de confirmación |

**Observación:** Play tiene 14 renders con 4 significados distintos. No es una colisión semántica del glifo (Play siempre significa "iniciar/reproducir"), sino una sobrecarga de jerarquía visual: el CTA más importante de la app usa el mismo icono sin diferenciación visual que un control de timer secundario.

**Veredicto:** No necesita un icono nuevo — necesita diferenciación por tamaño, color y contexto (botón primario vs. control inline). Esto es estandarización visual, no diseño de forma.

---

### COLISIÓN 4 — RotateCcw / "Reset" (CONFIRMADA)

| Uso | Archivo | Concepto |
|---|---|---|
| Reset timer | TimerViews.jsx | Reiniciar cuenta regresiva |
| Descartar borrador | DraftRecoveryModal.jsx | Abandonar sesión pendiente |
| Limpiar filtros | Evolution.jsx | Resetear selección de filtro |
| Reset progress | ProgressBar.jsx | Volver a 0% |

**Veredicto:** 4 significados distintos del mismo "undo rotation". No genera confusión práctica (los contextos son inequívocos por el UI circundante). No necesita acción.

---

## 8. Priority Map

### P0 — CRÍTICO (resolver antes de cualquier diseño)

| Concepto | Tipo de trabajo |
|---|---|
| Resolver colisión ⚡: diseñar glifos para Potencia y Energía | **DESIGN** |
| Fix 🥋 en PerformanceDashboard | **CODE FIX** |
| Limpiar DO-01, DO-02, DO-03 (dormidos y huérfanos) | **CODE CLEANUP** |

### P1 — ALTO (segunda oleada)

| Concepto | Tipo de trabajo |
|---|---|
| Diseñar glifos para Carga Aguda (DV-04) y Velocidad (DV-03) | **DESIGN** |
| Diseñar Hipertrofia (DV-06) — coherencia con Potencia | **DESIGN** |
| Revisar CountdownRing (CV-04) — coherencia con lenguaje futuro | **DESIGN REVIEW** |
| Revisar TrafficLightBadge (CV-05) — estilo del motor de rendimiento | **DESIGN REVIEW** |
| Estandarizar Time icons (S-04) | **STANDARDIZE** |

### P2 — MEDIO (tercera oleada)

| Concepto | Tipo de trabajo |
|---|---|
| Revisar Sparkline (CV-07) — estilo cuando se defina paleta | **DESIGN REVIEW** |
| Evolucionar Avatar (CV-03) — color según deporte | **DESIGN** |
| Revisar Paleta de bloques (CV-12) — sistema cromático | **DESIGN REVIEW** |
| Estandarizar Pencil (S-03), Back nav (S-02), Fuerza (S-08), FAB (S-09) | **STANDARDIZE** |
| Theming ProgressBar (CV-06) y Recharts (CV-08) | **THEMING** |
| Decidir si migrar Sport Classification (F7) de emojis a iconos | **DECISION** |

### P3 — BAJO (cuarta oleada)

| Concepto | Tipo de trabajo |
|---|---|
| Estandarizar Check (S-05), Share (S-06), Cloud (S-07) | **STANDARDIZE** |
| Sport: Judo (DV-13) — solo si F7 se decide migrar | **DESIGN (conditional)** |
| Deportes de resistencia (DV-12) — solo si F7 se decide migrar | **DESIGN (conditional)** |

---

## 9. Final Design Scope

| Categoría | Cantidad | Detalle |
|---|---|---|
| **TOTAL A DISEÑAR** | **14** | 4 conceptos ⚡ (Potencia, Energía, Velocidad, Carga Aguda) + Hipertrofia + CountdownRing review + TrafficLightBadge review + Sparkline review + Avatar + Paleta bloques + 4 Sport Classification (condicional) |
| **TOTAL A ESTANDARIZAR** | **9** | ⚡ asignación, Time icons, Pencil, Back nav, Check, Share, Cloud, Fuerza emoji, FAB timer |
| **TOTAL A MANTENER** | **~38** | Todos los UTILITY, SYSTEM, y los Lucide/emoji que funcionan |
| **TOTAL A ELIMINAR** | **5 grupos (~22 recursos)** | Vite scaffolding, social sprite, imports dormidos, hero.png, CSS huérfano |
| **TOTAL A REVISAR (código/theming)** | **3** | DV-15 (code fix), ProgressBar (theming), Recharts (theming) |

### Comparación con la Fase 3.5

| Métrica | Fase 3.5 (Sonnet) | Fase 4 (Opus) | Diferencia |
|---|---|---|---|
| Conceptos "a diseñar" | ~26 | **14** | -12 (46% de reducción) |
| P0 CRÍTICO de diseño | 6 | **2** (+ 1 code fix + 1 cleanup) | Reducción significativa |
| Familias de diseño | 10 | **6** | F4, F6, F8, F10 eliminadas/absorbidas |
| Concepto real de diseño más urgente | Colisión ⚡ | Colisión ⚡ | **Coincidencia** |

---

## 10. CountdownRing — Análisis Específico

### Características que lo hacen diferente

1. **Complejidad técnica:** 6 capas SVG, 3 gradientes, 1 filtro Gaussian blur — muy por encima de cualquier otro elemento de la app.
2. **Diseño deliberado:** Es el único elemento donde alguien tomó decisiones estéticas intencionadas (bisel 3D, efecto neón, profundidad de capas).
3. **Adaptabilidad al contexto:** El color cambia dinámicamente según el tipo de bloque (usando la paleta de BlockTypeSelector).
4. **Focal point de la pantalla más usada:** /timer es la pantalla de mayor interacción diaria.

### ¿Debe usarse como referencia del futuro sistema?

**Parcialmente sí:**
- Su principio de **capas concéntricas con profundidad** es expresivo y diferenciador.
- Su **adaptabilidad al color de bloque** demuestra que el sistema de bloques funciona como carrier de identidad visual.

**Lo que NO debería copiarse necesariamente:**
- El **efecto neón/glow** (feGaussianBlur stdDeviation=5) es estéticamente específico y puede no encajar con un lenguaje visual más limpio.
- El **bisel 3D** (highlight + shadow layers) añade complejidad visual que puede chocar con iconos planos Lucide. Si el resto de la app es flat, el CountdownRing parece de otra app.
- Los **3 gradientes lineales** son pesados de renderizar en dispositivos bajos y difíciles de mantener consistentes.

### Otros elementos que pueden servir como referencia visual

| Elemento | Razón |
|---|---|
| **TrafficLightBadge** | Estética de scoreboard deportivo electrónico — comparte el espíritu de "esto no existe en ninguna librería, es nuestro". |
| **Sparkline naranja** | El gradiente naranja #FF6B00 → transparente es brand-consistent y elegante. |
| **Paleta de bloques** | El sistema de 5 colores que propaga al CountdownRing es la decisión de diseño de sistema más coherente de la app. |

---

## 11. Elementos Dormidos — Disposición Final

| Elemento | ¿Parte del proyecto visual? | Acción |
|---|---|---|
| `src/assets/react.svg` | **NO** — scaffolding de Vite | Eliminar |
| `src/assets/vite.svg` | **NO** — scaffolding de Vite | Eliminar |
| `public/favicon.svg` | **NO** — index.html usa .png | Eliminar |
| `public/icons.svg` | **NO** — social sprite sin consumidor | Eliminar |
| `src/assets/hero.png` | **DUDOSO** — posible asset de marketing no implementado | Preguntar al owner. Si no recuerda, eliminar. |
| `.barcode-sim` CSS | **NO** — experimento decorativo sin uso | Eliminar |
| `.dossier-header-border` CSS | **NO** — decoración sin aplicar | Eliminar |
| 14 imports Lucide dormidos | **NO** — código muerto | Eliminar (tree-shaking no es suficiente con import explícito) |

**Ninguno de estos elementos debe incluirse en futuros trabajos de diseño.**

---

## Recommended Design Sequence

| Paso | Tarea | Tipo | Entregable esperado |
|---|---|---|---|
| **0** | Limpiar código muerto (DO-01, DO-02, DO-03) | CODE | PR de limpieza |
| **1** | Fix 🥋 en PerformanceDashboard | CODE | PR de corrección (leer athlete.sport) |
| **2** | Resolver colisión ⚡ — definir qué glifo/icono representa Potencia, Energía, Velocidad media, Carga Aguda | DECISION + DESIGN | Mapa de conceptos → glifos |
| **3** | Diseñar los glifos de Potencia (DV-01) y Energía (DV-02) | DESIGN | 2 iconos nuevos |
| **4** | Diseñar el sistema de 3 badges de Velocidad (DV-03) | DESIGN | 3 badges (reemplazando 🐢/⚡/🚀) |
| **5** | Diseñar glifo de Carga Aguda (DV-04) e Hipertrofia (DV-06) | DESIGN | 2 iconos nuevos |
| **6** | Estandarizar Time icons (S-04) — eliminar SVG inline y ⏱ | STANDARDIZE | PR de código |
| **7** | Revisar CountdownRing — definir si el estilo 3D/neón encaja con el lenguaje emergente | DESIGN REVIEW | Decisión: mantener, simplificar o evolucionar |
| **8** | Revisar TrafficLightBadge y Sparkline — coherencia de estilo | DESIGN REVIEW | Decisión de estilo |
| **9** | Evolucionar Avatar (CV-03) — color dinámico según deporte | DESIGN | Sistema de colores de avatar |
| **10** | Revisar Paleta de bloques (CV-12) — validar los 5 colores | DESIGN REVIEW | Paleta final |
| **11** | Decidir: ¿Migrar Sport Classification de emojis a iconos propios? | DECISION | Si YES → diseñar F7 (4–5 iconos). Si NO → mantener emojis. |
| **12** | Estandarizar inconsistencias menores (S-02, S-03, S-05, S-06, S-07, S-08, S-09) | STANDARDIZE | PR de código |
| **13** | Theming: ProgressBar, Recharts — cuando la paleta esté definida | THEMING | CSS updates |

---

## Respuesta Final

> "¿Qué elementos de TrainingOS merece realmente la pena rediseñar y cuáles NO?"

### REDISEÑAR (14):
Los 4 conceptos atrapados en la colisión ⚡ (Potencia, Energía, Velocidad, Carga Aguda), Hipertrofia, el CountdownRing (revisión), el TrafficLightBadge (revisión), el Sparkline (revisión), el Avatar, la Paleta de bloques, y condicionalmente los 4 iconos de Sport Classification si se decide migrar de emojis.

### NO REDISEÑAR (~38):
Todo Lucide estándar (X, Trash2, Plus, Play, Search, Save, Dumbbell, Flame, Trophy, Star, Check, etc.), todos los controles de media, toda la navegación, todos los prefijos de formulario, los emojis sin colisión (🔥, 🐢, 🚀, 😴, 😤, 🦵), y los activos de brand que ya existen (Logo, Isotipo).

### ESTANDARIZAR (9):
Resolver la asignación de ⚡, unificar variantes de Time/Pencil/Check/Share/Cloud/Back, y eliminar SVG inlines redundantes.

### ELIMINAR (~22 recursos):
Scaffolding de Vite, sprite social, imports dormidos, CSS huérfano, hero.png.

### CODE FIX (1):
🥋 hardcodeado en PerformanceDashboard — leer el deporte del atleta.

---

*Fin de la Fase 4 — Auditoría Crítica y Validación Final*
*La próxima fase puede proceder a definir el lenguaje visual de TrainingOS con un scope de diseño de 14 conceptos.*
