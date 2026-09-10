# TrainingOS — Auditoría Visual
## FASE 3.5 — Consolidación y Priorización Visual

---

## Información del Análisis

| Campo | Valor |
|---|---|
| **Modelo** | Claude Sonnet 4.6 (Thinking) |
| **Nivel de razonamiento** | Extended thinking |
| **Fecha** | 2026-08-20 |
| **Fuentes** | `PHASE_1_TECHNICAL_DISCOVERY.md`, `PHASE_2_FUNCTIONAL_ANALYSIS.md`, `VISUAL_ASSET_INVENTORY.md`, `VISUAL_ASSET_INVENTORY.html` |
| **Propósito** | Convertir el inventario técnico en conceptos visuales reales; priorizar candidatos a diseño propio |

> **Principio rector de esta fase:**
> RECURSO TÉCNICO ≠ CONCEPTO VISUAL.
> El inventario anterior enumera 122 recursos técnicos. Esta fase los agrupa en conceptos visuales reales y determina cuáles tienen sentido como candidatos al lenguaje visual propio de TrainingOS.

---

## Resumen Ejecutivo

| Magnitud | Valor |
|---|---|
| **Total recursos técnicos inventariados** | 122 |
| **Conceptos visuales consolidados** | **47** |
| — de los cuales CORE VISUAL | 12 |
| — de los cuales DOMAIN VISUAL | 15 |
| — de los cuales UTILITY | 8 |
| — de los cuales SYSTEM | 4 |
| — de los cuales DUPLICADO/VARIANTE (a resolver) | 5 |
| — de los cuales DORMIDO/SIN USO | 3 grupos |
| **Candidatos P0 CRÍTICO** | 5 conceptos + 1 colisión a resolver |
| **Candidatos P1 ALTO** | 13 |
| **Candidatos P2 MEDIO** | 9 |
| **Candidatos P3 BAJO** | 4 |
| **NO DISEÑAR (UI funcional estándar)** | 21 |

---

## Consolidación: de 122 recursos a 47 conceptos

### Cómo se consolidan los recursos en conceptos

El inventario de las fases anteriores enumera recursos técnicos individuales: un icono Lucide, un emoji, un SVG inline, un componente CSS. Varios de estos recursos representan el **mismo concepto visual**. A continuación se documentan las consolidaciones principales.

---

### CONSOLIDACIÓN A — El Concepto "Tiempo / Temporizador"
**5 recursos técnicos → 3 sub-conceptos**

| Recurso técnico | Sub-concepto real |
|---|---|
| `Timer` (Lucide) — BottomNav, Home, SetLoggerSheet | → Acceso al temporizador activo |
| `Clock` (Lucide) — SessionReadView, ImportSession, SessionDetailView | → Duración estática de sesión (metadato) |
| SVG inline reloj — Session.jsx FAB | → Acceso al temporizador activo |
| `Hourglass` (Lucide) — SetLoggerSheet | → Temporizador de descanso |
| `⏱` emoji — Home.jsx | → Acceso al temporizador activo |

**Conclusión:** Tres sub-conceptos distintos bajo el paraguas "tiempo". Los 5 recursos son representaciones fragmentadas de estos 3 conceptos.

---

### CONSOLIDACIÓN B — El Concepto "Fuerza / Gimnasio"
**2 recursos técnicos → 1 concepto**

| Recurso técnico | Uso |
|---|---|
| `Dumbbell` (Lucide) — 11 renders en 8 archivos | Brand identity en auth; contador de ejercicios; etiquetas de rutinas |
| `🏋️` emoji — gym en SESSION_TYPES y DEFAULT_SPORTS | Tipo de sesión "Fuerza" y deporte "Gimnasio" |

**Conclusión:** Mismo dominio semántico. El mismo concepto en dos sistemas de iconos paralelos.

---

### CONSOLIDACIÓN C — El Concepto "Logro / Récord"
**2 recursos técnicos → 1 concepto**

| Recurso técnico | Estado |
|---|---|
| `Trophy` (Lucide) — Home.jsx, activo | Sección "Mis récords" |
| `Award` (Lucide) — Onboarding.jsx, dormido | Logro no implementado |

**Conclusión:** Un solo concepto semántico con dos implementaciones, una activa y una obsoleta.

---

### CONSOLIDACIÓN D — El Concepto "Editar / Lápiz"
**3 recursos técnicos → 1 concepto**

| Recurso técnico | Uso |
|---|---|
| `Pencil` (Lucide) — Profile.jsx | Editar perfil |
| SVG inline lápiz — Home.jsx (L152) | Renombrar título de sesión |
| SVG inline lápiz — SessionReadView.jsx (L592) | Renombrar título de sesión |

**Conclusión:** Tres implementaciones del mismo glifo. El SVG inline está duplicado verbatim en dos archivos — el único caso de duplicación de código exacta en toda la app.

---

### CONSOLIDACIÓN E — El concepto "⚡" (el más urgente)
**1 glifo técnico → 4 conceptos semánticos distintos**

| Contexto | Concepto real |
|---|---|
| `gym_potencia` en SESSION_TYPES | → Potencia / entrenamiento de alta intensidad neuromuscular |
| Velocidad de serie "media" en SetLoggerSheet | → Velocidad de ejecución moderada |
| Métrica de bienestar "Energía" en WellnessCheckIn | → Nivel de energía subjetivo del atleta |
| "Carga Aguda" en PerformanceDashboard | → Estímulo de entrenamiento acumulado reciente |

**Conclusión:** `⚡` es el recurso técnico con mayor polisemia de toda la app. Son **4 conceptos distintos** que comparten accidentalmente el mismo glifo. Necesitan iconos diferenciados.

---

### CONSOLIDACIÓN F — Confirmación / Check
**4 recursos técnicos → 2 conceptos**

| Recurso técnico | Concepto real |
|---|---|
| `Check` (10 renders) | → Confirmación micro-inline (serie completada, opción seleccionada) |
| `CheckCircle` (2 renders) | → Éxito de operación completa |
| `CheckCircle2` (5 renders) | → Éxito de operación completa (variante visual) |
| `Circle` (2 renders) — estado vacío | → Estado no seleccionado (radio button inverso) |

**Conclusión:** Tres variantes para "éxito de proceso" sin regla documentada.

---

### CONSOLIDACIÓN G — Nube / Sincronización
**3 recursos técnicos → 2 conceptos**

| Recurso técnico | Concepto real |
|---|---|
| `DownloadCloud` (7 renders) | → Importar desde Google Sheets |
| `UploadCloud` (2 renders) | → Publicar/compartir sesión |
| `CloudUpload` (1 render) | → Estado offline / sincronización pendiente |

**Conclusión:** Dos nombres distintos (`UploadCloud` vs `CloudUpload`) para el mismo icono Lucide de subida. Dos conceptos reales: importar datos y publicar datos.

---

### CONSOLIDACIÓN H — Vuelta atrás / Retroceso
**2 recursos técnicos → 1 concepto**

| Recurso técnico | Uso |
|---|---|
| `ArrowLeft` (4 renders) | Botón "volver" en cabeceras de subpáginas |
| `ChevronLeft` (8 renders) | Botón "volver" en cabeceras de subpáginas |

**Conclusión:** Mismo concepto, dos iconos sin regla documentada. Necesitan estandarización técnica, no diseño propio.

---

## Catálogo de los 47 Conceptos Visuales

---

## BLOQUE I — CORE VISUAL (12)
*Elementos visuales que definen la identidad y las interacciones más frecuentes de TrainingOS.*

---

### CV-01 — Marca TrainingOS (Logo horizontal)

| Campo | Valor |
|---|---|
| **Recursos técnicos origen** | `Logo_trainingOS.png` (SplashScreen.jsx) |
| **Clasificación** | CORE VISUAL |
| **Prioridad** | **P0 CRÍTICO** |
| **Candidato a diseño propio** | Ya existe como archivo físico. Revisar formato SVG y resolución futura. |
| **Familia futura** | F1 — Brand & Identity |
| **Nota** | 91.7 KB PNG. Único punto de entrada visual de la marca al inicio de la app. |

---

### CV-02 — Isotipo / Símbolo de la marca

| Campo | Valor |
|---|---|
| **Recursos técnicos origen** | `Icono_trainingOS.png`, familia PWA (icon-48 a icon-512), Android mipmap-* |
| **Clasificación** | CORE VISUAL |
| **Prioridad** | **P0 CRÍTICO** |
| **Candidato a diseño propio** | Sí — es la pieza central de identidad. Toda la familia de iconos deriva de este concepto. |
| **Familia futura** | F1 — Brand & Identity |
| **Nota** | 215.7 KB PNG. Activo fuente para 16 archivos derivados (PWA + Android). |

---

### CV-03 — Avatar del atleta (monograma inicial)

| Campo | Valor |
|---|---|
| **Recursos técnicos origen** | CSS box + tipografía `Big Shoulders Display` en Profile.jsx (L187) |
| **Clasificación** | CORE VISUAL |
| **Prioridad** | **P1 ALTO** |
| **Candidato a diseño propio** | Sí — actualmente es solo la inicial en azul fijo (#3B82F6). Podría evolucionar a un sistema de avatares que incorpore el deporte del atleta y su color asociado. |
| **Familia futura** | F1 — Brand & Identity |
| **Nota** | Color hardcodeado sin relación con el deporte configurado del atleta. |

---

### CV-04 — Anillo de cuenta regresiva (CountdownRing)

| Campo | Valor |
|---|---|
| **Recursos técnicos origen** | `CountdownRing.jsx` — 6 capas SVG, 3 gradientes lineales, 1 filtro Gaussian blur (stdDeviation=5) |
| **Clasificación** | CORE VISUAL |
| **Prioridad** | **P0 CRÍTICO** |
| **Candidato a diseño propio** | Ya es diseño propio — el único elemento sin equivalente en ninguna librería. Es el focal point del screen /timer. Revisar coherencia con lenguaje visual futuro. |
| **Familia futura** | F3 — Execution & Timer |
| **Nota** | Animación strokeDashoffset + efecto neón/glow. Color adaptable al tipo de bloque en runtime. El elemento visual más sofisticado de la app. |

---

### CV-05 — Semáforo de rendimiento (TrafficLightBadge)

| Campo | Valor |
|---|---|
| **Recursos técnicos origen** | `TrafficLightBadge.jsx` — CSS flexbox con segmentos rectangulares |
| **Clasificación** | CORE VISUAL |
| **Prioridad** | **P1 ALTO** |
| **Candidato a diseño propio** | Sí — sin equivalente en librerías estándar. Estética de scoreboard deportivo electrónico. Define la identidad visual del Performance Dashboard. |
| **Familia futura** | F5 — Performance & Analytics |
| **Nota** | 3 variantes de tamaño: compact (16×6px) / standard (24×8px) / large (40×10px). |

---

### CV-06 — Barra de progreso de sesión

| Campo | Valor |
|---|---|
| **Recursos técnicos origen** | `ProgressBar.jsx` — CSS gradient + animación flash-green al 100% |
| **Clasificación** | CORE VISUAL |
| **Prioridad** | **P2 MEDIO** |
| **Candidato a diseño propio** | Sí — tiene comportamiento de feedback propio (destello verde al llegar al 100%). Candidato a revisión de estilo. |
| **Familia futura** | F3 — Execution & Timer |
| **Nota** | Única barra de progreso en la app. Comunica avance de la sesión en tiempo real. |

---

### CV-07 — Mini-gráfica de tendencia 1RM (Sparkline)

| Campo | Valor |
|---|---|
| **Recursos técnicos origen** | SVG inline en Evolution.jsx (L112–139) — path de área + polyline + círculo focal |
| **Clasificación** | CORE VISUAL |
| **Prioridad** | **P1 ALTO** |
| **Candidato a diseño propio** | Sí — SVG custom de alta expresividad. Muestra evolución histórica de fuerza dentro de una tarjeta compacta. Gradiente naranja brand-consistent. |
| **Familia futura** | F5 — Performance & Analytics |
| **Nota** | Naranja #FF6B00 → transparente. Punto focal blanco en el dato más reciente. |

---

### CV-08 — Gráficos de evolución Recharts (barras y líneas)

| Campo | Valor |
|---|---|
| **Recursos técnicos origen** | recharts v3.8.1 — BarChart, LineChart, ResponsiveContainer, Cell en Evolution.jsx |
| **Clasificación** | CORE VISUAL |
| **Prioridad** | **P2 MEDIO** |
| **Candidato a diseño propio** | Parcial — Recharts genera SVG en runtime. El estilo (colores, ejes, tipografía) sí es candidato a unificación. No sustituir la librería. |
| **Familia futura** | F5 — Performance & Analytics |
| **Nota** | Volumen semanal (BarChart), RPE trend (LineChart), carga acumulada (BarChart). |

---

### CV-09 — Botón de inicio de sesión de entrenamiento (Play / CTA principal)

| Campo | Valor |
|---|---|
| **Recursos técnicos origen** | `Play` (Lucide) — 14 renders en Home, SessionReadView, BottomNav, ImportSession, TimerViews, CircuitPlayer |
| **Clasificación** | CORE VISUAL |
| **Prioridad** | **P1 ALTO** |
| **Candidato a diseño propio** | Sí — Play es la acción más importante de la app (iniciar entrenamiento). El CTA principal merece una identidad propia en el lenguaje visual de TrainingOS. |
| **Familia futura** | F3 — Execution & Timer |
| **Nota** | Triple carga semántica: tab de sesión en BottomNav, CTA de inicio, control de timer. |

---

### CV-10 — FAB del temporizador durante sesión activa

| Campo | Valor |
|---|---|
| **Recursos técnicos origen** | SVG inline en Session.jsx (L492–495) — círculo + manecillas, strokeWidth=3 |
| **Clasificación** | CORE VISUAL |
| **Prioridad** | **P1 ALTO** |
| **Candidato a diseño propio** | Sí — único SVG inline usado como control interactivo. Actualmente difiere visualmente de `Timer` (Lucide) en peso visual. Candidato a unificación con CV-09. |
| **Familia futura** | F3 — Execution & Timer |
| **Nota** | Pantalla de mayor frecuencia de uso diario (/session). |

---

### CV-11 — Calificación de sesión por estrellas (StarRating)

| Campo | Valor |
|---|---|
| **Recursos técnicos origen** | `Star` (Lucide) ×5 en FeedbackSection.jsx — fill condicional #FF6B00 |
| **Clasificación** | CORE VISUAL |
| **Prioridad** | **P2 MEDIO** |
| **Candidato a diseño propio** | Posible — sistema de calificación con Lucide Star + color de marca. Funciona correctamente pero podría integrarse mejor en el lenguaje visual. |
| **Familia futura** | F8 — Athlete Motivation |

---

### CV-12 — Selector de tipo de bloque (paleta cromática)

| Campo | Valor |
|---|---|
| **Recursos técnicos origen** | `BlockTypeSelector.jsx` — círculos CSS con 5 colores hex |
| **Clasificación** | CORE VISUAL |
| **Prioridad** | **P2 MEDIO** |
| **Candidato a diseño propio** | Sí — la paleta de bloques es el sistema de identidad visual del planner y del timer. Los colores propagan al CountdownRing. Sistema visual propio de TrainingOS. |
| **Familia futura** | F9 — Training Planning |
| **Nota** | Paleta: #f5a623 Preparación / #e67e22 Calentamiento / #FF6B00 Trabajo / #3d7dd4 Descanso / #27ae60 Cooldown. Color es el carrier principal de información. |

---

## BLOQUE II — DOMAIN VISUAL (15)
*Elementos que representan conceptos propios del dominio de TrainingOS: deportes, capacidades físicas, métricas.*

---

### DV-01 — Potencia (capacidad de entrenamiento)

| Campo | Valor |
|---|---|
| **Recursos técnicos origen** | ⚡ en SESSION_TYPES gym_potencia; color #e8412a |
| **Clasificación** | DOMAIN VISUAL |
| **Prioridad** | **P0 CRÍTICO** |
| **Candidato a diseño propio** | **SÍ — URGENTE.** ⚡ lleva 4 significados distintos. "Potencia" necesita un icono propio que no colisione con energía, velocidad o carga aguda. |
| **Familia futura** | F2 — Training Capabilities |
| **Nota** | Potencia = capacidad neuromuscular de alta velocidad (saltos, sprints, arranques). Distinto de energía subjetiva y carga acumulada. |

---

### DV-02 — Energía subjetiva del atleta (wellness)

| Campo | Valor |
|---|---|
| **Recursos técnicos origen** | ⚡ en WellnessCheckIn.jsx métrica de energía; escala 😴→🤩 |
| **Clasificación** | DOMAIN VISUAL |
| **Prioridad** | **P0 CRÍTICO** |
| **Candidato a diseño propio** | **SÍ — URGENTE.** Actualmente indistinguible de "Potencia" y "Carga Aguda" al usar el mismo ⚡. Necesita concepto visual propio que indique estado vital subjetivo. |
| **Familia futura** | F6 — Wellness & Recovery |
| **Nota** | Es la percepción de vitalidad del atleta antes de entrenar — no la capacidad muscular de potencia. |

---

### DV-03 — Velocidad de ejecución de la serie (🐢 / ⚡ / 🚀)

| Campo | Valor |
|---|---|
| **Recursos técnicos origen** | 🐢 (lento), ⚡ (medio), 🚀 (rápido) en SetLoggerSheet.jsx — badges con colores naranja/ámbar/verde |
| **Clasificación** | DOMAIN VISUAL |
| **Prioridad** | **P1 ALTO** |
| **Candidato a diseño propio** | Sí — ⚡ de "medio" colisiona con 3 otros usos. Los colores de badge sobreviven al cambio de emoji. Candidato a un sistema de badges de velocidad con iconos propios (ej. barras de velocidad o flechas). |
| **Familia futura** | F4 — Execution Metrics |
| **Nota** | 🐢 y 🚀 no colisionan con otros usos — solo el valor "medio" tiene conflicto por usar ⚡. |

---

### DV-04 — Carga aguda / estímulo acumulado de entrenamiento

| Campo | Valor |
|---|---|
| **Recursos técnicos origen** | ⚡ en PerformanceDashboard.jsx métrica "Carga Aguda" |
| **Clasificación** | DOMAIN VISUAL |
| **Prioridad** | **P1 ALTO** |
| **Candidato a diseño propio** | Sí — concepto analítico propio del motor de rendimiento. Necesita iconografía que evoque "acumulación reciente de trabajo" sin colisionar con potencia o energía. |
| **Familia futura** | F5 — Performance & Analytics |

---

### DV-05 — Fuerza como capacidad de entrenamiento

| Campo | Valor |
|---|---|
| **Recursos técnicos origen** | 🏋️ en SESSION_TYPES gym_fuerza; `Dumbbell` (Lucide) — 11 renders en 8 archivos |
| **Clasificación** | DOMAIN VISUAL |
| **Prioridad** | **P0 CRÍTICO** |
| **Candidato a diseño propio** | **SÍ.** Es la capacidad central del gimnasio y el icono más presente en contextos de ejercicio (11 renders). Un icono propio unificaría Lucide + emoji bajo un mismo concepto. |
| **Familia futura** | F2 — Training Capabilities |
| **Nota** | Dumbbell tiene doble rol: brand/identity en auth Y contador de ejercicios en vistas de entrenamiento. Estos dos usos merecen separación semántica futura. |

---

### DV-06 — Hipertrofia como capacidad de entrenamiento

| Campo | Valor |
|---|---|
| **Recursos técnicos origen** | 💪 en SESSION_TYPES gym_hipertrofia; color #8e44ad |
| **Clasificación** | DOMAIN VISUAL |
| **Prioridad** | **P1 ALTO** |
| **Candidato a diseño propio** | Sí — 💪 tiene rendering variable entre plataformas (emoji de sistema). Junto con Potencia y Fuerza forma la triada de capacidades gym. Los tres requieren coherencia visual conjunta. |
| **Familia futura** | F2 — Training Capabilities |

---

### DV-07 — Racha de entrenamiento (streak)

| Campo | Valor |
|---|---|
| **Recursos técnicos origen** | `Flame` (Lucide) en Home.jsx — 1 render |
| **Clasificación** | DOMAIN VISUAL |
| **Prioridad** | **P1 ALTO** |
| **Candidato a diseño propio** | Sí — concepto motivacional potente. Un icono de "racha" propio podría ser más específico al contexto deportivo. |
| **Familia futura** | F8 — Athlete Motivation |
| **Nota** | Único uso de Flame en toda la app. Sin colisiones. |

---

### DV-08 — Récord personal (PR / logro)

| Campo | Valor |
|---|---|
| **Recursos técnicos origen** | `Trophy` (Lucide, activo en Home.jsx); `Award` (Lucide, dormido en Onboarding.jsx) |
| **Clasificación** | DOMAIN VISUAL |
| **Prioridad** | **P1 ALTO** |
| **Candidato a diseño propio** | Sí — "Récord personal" es un hito central en el entrenamiento de fuerza. Trophy y Award son genéricos; un icono propio de PR sería específico al dominio. |
| **Familia futura** | F8 — Athlete Motivation |
| **Nota** | Award está dormido — debería eliminarse. No mantener duplicados inactivos para el mismo concepto. |

---

### DV-09 — Deporte: Taekwondo

| Campo | Valor |
|---|---|
| **Recursos técnicos origen** | 🥋 en DEFAULT_SPORTS (tkd), SESSION_TYPES (tkd, tkd_sparring), PerformanceDashboard ("Transferencia Deportiva") |
| **Clasificación** | DOMAIN VISUAL |
| **Prioridad** | **P2 MEDIO** |
| **Candidato a diseño propio** | Sí — especialmente para el contexto de "Transferencia Deportiva" donde 🥋 es incorrecto para atletas de otro deporte. Como icono de tipo de sesión TKD, es correcto. |
| **Familia futura** | F7 — Sport Classification |

---

### DV-10 — Deporte: Boxeo / Sparring

| Campo | Valor |
|---|---|
| **Recursos técnicos origen** | 🥊 en DEFAULT_SPORTS (box) y SESSION_TYPES (tkd_sparring) |
| **Clasificación** | DOMAIN VISUAL |
| **Prioridad** | **P2 MEDIO** |
| **Candidato a diseño propio** | Posible — emoji de sistema con rendering variable entre plataformas. También se usa para sparring de TKD, no solo boxeo puro. |
| **Familia futura** | F7 — Sport Classification |

---

### DV-11 — Deporte: Gimnasio / Crossfit

| Campo | Valor |
|---|---|
| **Recursos técnicos origen** | 🏋️ en DEFAULT_SPORTS (gym); ⚔️ en DEFAULT_SPORTS (cf) |
| **Clasificación** | DOMAIN VISUAL |
| **Prioridad** | **P2 MEDIO** |
| **Candidato a diseño propio** | Sí para 🏋️ (coincide con el concepto DV-05). ⚔️ para Crossfit es semánticamente ambiguo — metáfora medieval, no deportiva. Candidato a revisión urgente. |
| **Familia futura** | F7 — Sport Classification |

---

### DV-12 — Deportes de resistencia (ciclismo, running, natación)

| Campo | Valor |
|---|---|
| **Recursos técnicos origen** | 🚴 (ciclismo/cardio), 🏃 (running), 🏊 (natación) en DEFAULT_SPORTS y SESSION_TYPES |
| **Clasificación** | DOMAIN VISUAL |
| **Prioridad** | **P2 MEDIO** |
| **Candidato a diseño propio** | Posible — emojis estándar y reconocibles. Candidatos a futuro sistema de iconos propios si el app expande cobertura de deportes de resistencia. |
| **Familia futura** | F7 — Sport Classification |
| **Nota** | 🚴 se usa también en SESSION_TYPES para tipo "Cardio" — correcto conceptualmente. |

---

### DV-13 — Deporte: Judo

| Campo | Valor |
|---|---|
| **Recursos técnicos origen** | 🤼 en DEFAULT_SPORTS (judo) |
| **Clasificación** | DOMAIN VISUAL |
| **Prioridad** | **P3 BAJO** |
| **Candidato a diseño propio** | Posible futuro — 🤼 (lucha genérica) no es específico a Judo. Secundario en la base de usuarios actual. |
| **Familia futura** | F7 — Sport Classification |

---

### DV-14 — Fatiga del sistema nervioso (SNS)

| Campo | Valor |
|---|---|
| **Recursos técnicos origen** | 🔥 en PerformanceDashboard.jsx — métrica "Fatiga del SNS" |
| **Clasificación** | DOMAIN VISUAL |
| **Prioridad** | **P1 ALTO** |
| **Candidato a diseño propio** | Sí — "Fatiga del sistema nervioso" es un concepto específico del análisis de rendimiento deportivo. 🔥 es potente pero genérico. Un icono propio sería más preciso semánticamente. |
| **Familia futura** | F5 — Performance & Analytics |
| **Nota** | Única instancia de 🔥 en toda la app. Sin colisiones. |

---

### DV-15 — Transferencia deportiva (métrica adaptativa al deporte)

| Campo | Valor |
|---|---|
| **Recursos técnicos origen** | 🥋 en PerformanceDashboard.jsx — métrica "Transferencia Deportiva" |
| **Clasificación** | DOMAIN VISUAL |
| **Prioridad** | **P0 CRÍTICO** |
| **Candidato a diseño propio** | **SÍ — URGENTE.** Error semántico activo: el icono hardcodea TKD para todos los atletas independientemente de su deporte. Necesita iconografía adaptativa (dinámica según el sport del atleta) o un icono abstracto de "transferencia al deporte" en general. |
| **Familia futura** | F5 — Performance & Analytics |
| **Nota** | Para un atleta de gym o running, 🥋 no tiene ningún sentido. Es a la vez un problema de diseño y un bug de lógica de datos que requiere corrección en código. |

---

## BLOQUE III — UTILITY (8)
*Iconos de interfaz estándar: consistentes pero no candidatos a diseño propio.*

---

### UT-01 — Cerrar / Descartar (X)
- **Recursos:** `X` (Lucide) — 24 renders en 18 archivos
- **Prioridad:** NO DISEÑAR
- **Nota:** Icono más renderizado de la app. Convención universal. La única acción necesaria es mantener la consistencia.

### UT-02 — Eliminar / Borrar (Trash2)
- **Recursos:** `Trash2` (Lucide) — 8 renders en 7 archivos
- **Prioridad:** NO DISEÑAR
- **Nota:** Convención más uniforme de toda la app. Siempre Trash2, sin variantes. El modelo de coherencia a seguir.

### UT-03 — Añadir elemento (Plus)
- **Recursos:** `Plus` (Lucide) — 22 renders en 14 archivos
- **Prioridad:** NO DISEÑAR
- **Nota:** Segunda convención más consistente de la app.

### UT-04 — Navegar atrás (ArrowLeft / ChevronLeft)
- **Recursos:** `ArrowLeft` (4 renders), `ChevronLeft` (8 renders) — sin regla documentada
- **Prioridad:** NO DISEÑAR. Estandarizar en `ChevronLeft` (estándar mobile).
- **Nota:** Mismo concepto, dos iconos. Inconsistencia técnica, no de diseño.

### UT-05 — Buscar (Search)
- **Recursos:** `Search` (Lucide) — 3 renders
- **Prioridad:** NO DISEÑAR. Lupa = convención universal.

### UT-06 — Guardar (Save)
- **Recursos:** `Save` (Lucide) — 2 renders
- **Prioridad:** NO DISEÑAR. Disquete = convención universal de guardar.

### UT-07 — Compartir (Share2 — a estandarizar)
- **Recursos:** `Share2` (3 renders), `Share` (1 render) — coexisten en ExportSessionModal
- **Prioridad:** NO DISEÑAR. Estandarizar en `Share2` y eliminar `Share`.

### UT-08 — Editar / Lápiz (Pencil — a unificar)
- **Recursos:** `Pencil` (Lucide, Profile.jsx), SVG inline ×2 (Home.jsx + SessionReadView.jsx, verbatim duplicados)
- **Prioridad:** NO DISEÑAR. Acción: eliminar SVG inline y usar siempre `Pencil` de Lucide.

---

## BLOQUE IV — SYSTEM (4)
*Iconos de sistema, formularios y navegación global. No son candidatos a diseño propio.*

---

### SY-01 — Barra de navegación inferior (BottomNav)
- **Recursos:** `Home`, `CalendarDays`, `Play`, `Timer`, `TrendingUp`, `Users` (Lucide) — dinámicos
- **Prioridad:** NO DISEÑAR. Revisar coherencia de stroke, tamaño y peso visual entre tabs.

### SY-02 — Prefijos de formularios de autenticación
- **Recursos:** `Mail`, `Lock`, `User` (Lucide) en Login.jsx y Register.jsx
- **Prioridad:** NO DISEÑAR. Convenciones universales de input.

### SY-03 — Indicadores de estado del sistema
- **Recursos:** `AlertCircle`, `AlertTriangle`, `Check`, `CheckCircle`, `CheckCircle2`, `Loader2` (Lucide)
- **Prioridad:** NO DISEÑAR. Acción: documentar regla AlertCircle (error crítico) vs AlertTriangle (advertencia recuperable).

### SY-04 — Sincronización con Google Sheets (nube)
- **Recursos:** `DownloadCloud` (7), `UploadCloud` (2), `CloudUpload` (1)
- **Prioridad:** NO DISEÑAR. Acción: eliminar `CloudUpload`, estandarizar en `DownloadCloud` / `UploadCloud`.

---

## BLOQUE V — DUPLICADOS/VARIANTES A RESOLVER (5)
*No son nuevos conceptos visuales — son inconsistencias técnicas que deben resolverse antes de diseñar.*

---

### DR-01 — ⚡ Lightning bolt: 4 significados, 1 glifo (**BLOQUEA DISEÑO**)

| Campo | Valor |
|---|---|
| **Recursos en conflicto** | Potencia (SESSION_TYPES), Energía (WellnessCheckIn), Velocidad media (SetLoggerSheet), Carga Aguda (PerformanceDashboard) |
| **Acción requerida** | Resolver la colisión: cada uno de los 4 conceptos necesita su propio glifo. Ver DV-01, DV-02, DV-03, DV-04. |
| **Prioridad resolución** | **P0 CRÍTICO — bloquea diseño de F2, F3, F5, F6** |

---

### DR-02 — Reloj/Tiempo: 5 implementaciones para 3 conceptos

| Campo | Valor |
|---|---|
| **Recursos en conflicto** | `Timer`, `Clock`, SVG inline (Session.jsx), `Hourglass`, ⏱ emoji |
| **Acción requerida** | Unificar: (1) `Clock` → duración estática, (2) `Timer` → acceso al temporizador activo, (3) `Hourglass` → descanso. Eliminar ⏱ emoji y SVG inline. |
| **Prioridad resolución** | P1 ALTO |

---

### DR-03 — Lápiz/Editar: 3 implementaciones del mismo icono

| Campo | Valor |
|---|---|
| **Recursos en conflicto** | `Pencil` (Lucide), SVG inline verbatim ×2 (Home.jsx, SessionReadView.jsx) |
| **Acción requerida** | Eliminar los dos SVG inline. Usar siempre `Pencil` de Lucide. |
| **Prioridad resolución** | P2 MEDIO |

---

### DR-04 — Check: 3 variantes para "éxito/confirmación" sin regla

| Campo | Valor |
|---|---|
| **Recursos en conflicto** | `Check` (micro-inline), `CheckCircle` (éxito), `CheckCircle2` (éxito variante) |
| **Acción requerida** | Regla: Check = micro-confirmación inline; CheckCircle2 = éxito de proceso completo. Reemplazar CheckCircle por CheckCircle2. |
| **Prioridad resolución** | P3 BAJO |

---

### DR-05 — Share: 2 iconos en el mismo modal sin regla

| Campo | Valor |
|---|---|
| **Recursos en conflicto** | `Share` y `Share2` coexisten en ExportSessionModal.jsx |
| **Acción requerida** | Auditar el modal: si representan acciones distintas, documentarlo; si no, unificar en `Share2`. |
| **Prioridad resolución** | P3 BAJO |

---

## BLOQUE VI — DORMIDOS/SIN USO (3 grupos)
*No son candidatos a diseño. Deben eliminarse del código.*

---

### DO-01 — Activos de scaffold de Vite
**Archivos:** `src/assets/react.svg`, `src/assets/vite.svg`, `public/favicon.svg`
**Acción:** Eliminar — artefactos del boilerplate de Vite sin relación con TrainingOS.

### DO-02 — SVG Sprite de redes sociales
**Archivo:** `public/icons.svg` — Bluesky, Discord, GitHub, X icons
**Acción:** Eliminar o mover a documentación. No hay ningún `<use href>` que lo consuma en la app.

### DO-03 — Importaciones de iconos Lucide dormidas (14 importaciones)
**Lista:** Award, Eye, Heart, ClipboardList, Activity, Trophy (Evolution.jsx), TrendingUp (Evolution.jsx), Dumbbell (Onboarding.jsx), RefreshCw (Profile.jsx), UserCircle (Register.jsx), CheckCircle2 (Session.jsx), RotateCcw (CircuitPlayer.jsx), ChevronRight (ImportSession.jsx + SessionDetailView.jsx), Users (CoachDashboard.jsx)
**Acción:** Eliminar todas las importaciones sin render activo. Inflan el bundle y el ruido cognitivo.

---

## Mapa de Prioridades de Diseño

---

### P0 CRÍTICO — Diseñar primero

| Concepto | ID | Razón de criticidad |
|---|---|---|
| Marca TrainingOS / Isotipo | CV-01, CV-02 | Identidad fundamental. Punto de entrada de cualquier lenguaje visual. |
| Anillo de cuenta regresiva | CV-04 | El screen /timer es el más usado diariamente. Único elemento ya con diseño propio — revisar coherencia. |
| Potencia (capacidad gym) | DV-01 | Actualmente confundida con Energía, Velocidad y Carga Aguda (mismo ⚡). |
| Fuerza (capacidad gym) | DV-05 | Concepto central del gym, 11 renders activos. |
| Transferencia deportiva | DV-15 | Error semántico activo: 🥋 hardcodeado para todos los atletas. |
| **Resolver ⚡ colisión** | **DR-01** | **Bloquea diseño de DV-01, DV-02, DV-03, DV-04. Resolver antes de diseñar esos conceptos.** |

---

### P1 ALTO — Segunda oleada

| Concepto | ID |
|---|---|
| Avatar del atleta | CV-03 |
| Semáforo de rendimiento (TrafficLightBadge) | CV-05 |
| Mini-gráfica de tendencia 1RM (Sparkline) | CV-07 |
| Botón de inicio de sesión (Play CTA) | CV-09 |
| FAB del temporizador | CV-10 |
| Energía subjetiva del atleta (wellness) | DV-02 |
| Velocidad de ejecución (🐢/⚡/🚀) | DV-03 |
| Carga aguda / estímulo acumulado | DV-04 |
| Hipertrofia (capacidad gym) | DV-06 |
| Racha de entrenamiento (streak) | DV-07 |
| Récord personal (Trophy) | DV-08 |
| Fatiga del SNS | DV-14 |
| Unificar 5 implementaciones de "tiempo" | DR-02 |

---

### P2 MEDIO — Tercera oleada

| Concepto | ID |
|---|---|
| Barra de progreso de sesión | CV-06 |
| Gráficos Recharts (estilo visual) | CV-08 |
| Calificación por estrellas | CV-11 |
| Selector de tipo de bloque | CV-12 |
| Deporte: Taekwondo | DV-09 |
| Deporte: Boxeo/Sparring | DV-10 |
| Deporte: Gimnasio/Crossfit | DV-11 |
| Deportes de resistencia | DV-12 |
| Unificar 3 implementaciones de "lápiz" | DR-03 |

---

### P3 BAJO — Cuarta oleada

| Concepto | ID |
|---|---|
| Deporte: Judo | DV-13 |
| Check variants — documentar y unificar | DR-04 |
| Share variants — auditar y unificar | DR-05 |
| (Deportes custom futuros) | — |

---

### NO DISEÑAR (21 conceptos)

| Razón | Conceptos |
|---|---|
| Convención universal — no tocar | X (cerrar), Trash2 (eliminar), Plus (añadir), Search (buscar), Save (guardar), Share2 (compartir) |
| UI de sistema | Mail, Lock, User (form prefixes), BottomNav tabs, AlertCircle/AlertTriangle, Loader2 |
| Navegación estándar | ArrowLeft/ChevronLeft (back), ChevronRight (list), ChevronDown/Up (accordion) |
| Controles de media | Play/Pause/Square (timer), SkipBack/SkipForward (circuit), FastForward (+10s) |
| Sincronización infra | DownloadCloud/UploadCloud (Google Sheets) |

---

## Propuesta de Familias de Diseño Futuras

*Organiza los 47 conceptos en familias coherentes para cuando se defina el estilo visual en Fase 4. No propone estilo — propone estructura.*

| # | Familia | Conceptos incluidos | Prioridad |
|---|---|---|---|
| **F1** | Brand & Identity | CV-01 (logo), CV-02 (isotipo), CV-03 (avatar atleta) | P0/P1 |
| **F2** | Training Capabilities | DV-01 (Potencia), DV-05 (Fuerza), DV-06 (Hipertrofia) | P0/P1 — triada del gym, coherencia interna obligatoria |
| **F3** | Execution & Timer | CV-04 (CountdownRing), CV-06 (ProgressBar), CV-09 (Play/iniciar), CV-10 (FAB timer) | P0/P1 — máxima frecuencia de uso |
| **F4** | Execution Metrics | DV-03 (Velocidad de ejecución) | P1 |
| **F5** | Performance & Analytics | CV-05 (TrafficLight), CV-07 (Sparkline), CV-08 (Charts), DV-04 (Carga Aguda), DV-14 (Fatiga SNS), DV-15 (Transferencia deportiva) | P0/P1 — motor de rendimiento |
| **F6** | Wellness & Recovery | DV-02 (Energía subjetiva), escalas de bienestar | P1 |
| **F7** | Sport Classification | DV-09 (TKD), DV-10 (Boxeo), DV-11 (Gym/CF), DV-12 (Resistencia), DV-13 (Judo) | P2 — sistema coherente de disciplinas |
| **F8** | Athlete Motivation | DV-07 (Racha), DV-08 (PR/logro), CV-11 (estrellas) | P1/P2 |
| **F9** | Training Planning | CV-12 (paleta de bloques), tipos de sesión | P2 |
| **F10** | UI Functional | Todos los UTILITY y SYSTEM | NO DISEÑAR — mantener Lucide, revisar coherencia de stroke |

---

## Hallazgos Estructurales Clave

### H-01 — El principal problema de diseño no es la cantidad de iconos, es la polisemia del ⚡
El ⚡ representa cuatro conceptos distintos que pueden aparecer en la misma sesión de usuario. Este es el conflicto más urgente a resolver. Cualquier lenguaje visual nuevo debe empezar aquí.

### H-02 — TrainingOS tiene 3 sistemas de iconos paralelos sin gobierno
Lucide, inline SVG y emoji funcionan en paralelo sin regla sobre cuándo usar cada uno. La prioridad de diseño debería ser definir esa regla antes de diseñar iconos nuevos.

### H-03 — El 🥋 en Performance Dashboard es un bug semántico, no solo un problema de diseño
El icono de "Transferencia Deportiva" hardcodea TKD. Requiere corrección de lógica en el código (detectar el deporte del atleta y mostrar el emoji correspondiente) además de diseño.

### H-04 — Los conceptos de mayor valor de diseño son los propios del dominio deportivo
Los iconos de UI genéricos (cerrar, añadir, buscar) no necesitan diseño propio. Los conceptos que hacen de TrainingOS algo único — potencia, fuerza, hipertrofia, racha, récord personal, transferencia deportiva — son los que justifican un lenguaje visual propio.

### H-05 — CountdownRing es el único elemento que ya ES diseño propio
De los 122 recursos técnicos, CountdownRing es el único que no tiene equivalente en ninguna librería y que ya expresa una identidad visual deliberada. Es el punto de partida para el lenguaje visual del timer.

### H-06 — 14 importaciones dormidas y 5 archivos huérfanos inflan el inventario
Antes de diseñar nuevos recursos, conviene limpiar el código. El inventario tiene 122 recursos técnicos pero ~19 de ellos no tienen uso activo — reducen el problema real a ~103 recursos activos que generan los 47 conceptos.

---

## Orden de Trabajo Recomendado para Fase 4

| Paso | Tarea | Razón |
|---|---|---|
| 1 | Resolver DR-01 (⚡ colisión) | Define los 4 conceptos que necesitan iconos propios; desbloquea diseño de F2, F5, F6 |
| 2 | Limpiar DO-01, DO-02, DO-03 | Eliminar ruido del inventario antes de diseñar |
| 3 | Diseñar F1 (Brand: logo, isotipo, avatar) | Establece el DNA visual de todo lo demás |
| 4 | Diseñar F3 (Timer: CountdownRing revisión, ProgressBar, Play, FAB) | Pantalla de mayor frecuencia de uso diario |
| 5 | Diseñar F2 (Training Capabilities: Potencia, Fuerza, Hipertrofia) | La triada del gym — base de la identidad de dominio |
| 6 | Diseñar F5 (Performance: TrafficLight, Sparkline, métricas del motor) | Motor analítico — diferenciador de TrainingOS |
| 7 | Diseñar F7 (Sport Classification) | Sistema de deportes coherente y adaptativo |
| 8 | Diseñar F6, F8, F9 (Wellness, Motivación, Planning) | Capas secundarias de la experiencia |
| 9 | Revisar F10 (UI Functional) | Estandarizar Lucide, eliminar inconsistencias técnicas |

---

*Fin de la Fase 3.5 — Consolidación y Priorización Visual*
*Siguiente fase: Fase 4 — Definición del Lenguaje Visual de TrainingOS*
