# TrainingOS — Contexto de Agente (CLAUDE.md)

## Descripción General del Proyecto

**TrainingOS** es una Progressive Web App (PWA) e híbrida para la gestión de entrenamientos deportivos, enfocada en Taekwondo y entrenamiento de fuerza/gimnasio. Sirve a entrenadores y atletas con herramientas para la planificación de sesiones, cronometraje y seguimiento de programas.

* **Stack**: React + Vite + Tailwind CSS v4
* **Backend**: Google Sheets (vía API REST en Apps Script)
* **Despliegue**: Vercel + GitHub
* **Fase Actual**: Fase 2 — Módulo Planner (navegación de temporadas/mesociclos + constructor de sesiones)
* **Fase 1 (completada)**: Checklist de sesión, timer de circuitos ✅

### Módulos Clave
* **Checklist de Sesión** — tareas antes, durante y después de la sesión ✅
* **Timer de Circuitos** — temporizador de intervalos configurable para circuitos de entrenamiento ✅
* **Planificador (Planner)** — planificación de temporadas con navegación de mesociclos y constructor de sesiones 🔄 (en progreso)

---

## Estándares de Diseño del Frontend

> Todo el trabajo de interfaz de usuario (UI) en este proyecto debe seguir estos principios de diseño. NO produzcas estéticas genéricas de IA.

### Identidad Visual — TrainingOS

**Sensación**: Serio, atlético, premium — al estilo de Nike Training o Whoop.
**Tema**: Interfaz Clara (Light UI) — base blanco cálido (`#FAFAFA`) y gris cálido claro (`#F5F5F0`), **NO usar modo oscuro**.
**Color de Acento**: Naranja de Seguridad (`#FF6B00`).
**Ánimo**: Audaz, limpio, de alto rendimiento.

### Paleta de Colores
```
--color-bg:          #FAFAFA     /* blanco cálido */
--color-surface:     #F5F5F0     /* gris cálido claro */
--color-card:        #FFFFFF     /* blanco puro */
--color-border:      #E8E8E4     /* borde gris cálido */
--color-text:        #1C1C1E     /* negro suave */
--color-muted:       #6E6E73     /* gris suave de metadatos */
--color-accent:      #FF6B00     /* naranja de seguridad — uso moderado, alto impacto */
--color-accent-dark: #E85D04     /* variante oscura para estados hover */
--color-accent-soft: #FFF3EC     /* fondo naranja sutil para destacar elementos activos */
```

Usa el naranja de seguridad para: Botones primarios/llamadas a la acción (CTAs) (`bg-[#FF6B00] text-[#FFFFFF]`), estados activos, indicadores de progreso, métricas clave (1RM, volumen), cronómetros y bordes izquierdos de realce. **NO lo uses para fondos generales o áreas grandes.**

### Tipografía

**Solo dos familias de fuentes de Google Fonts:**

* **Títulos / Datos / Números**: `font-condensed` → **Barlow Condensed** (Google Fonts)
* **Cuerpo / Interfaz / Etiquetas**: `font-sans` → **Outfit** (Google Fonts)
* ❌ **NO utilices DM Sans** en ningún componente — ha sido completamente reemplazada por Outfit.

**Jerarquía Tipográfica:**

| Clase          | Fuente            | Peso | Tamaño                        | Uso                                    |
|----------------|-----------------|--------|-------------------------------|----------------------------------------|
| `.text-hero`   | Barlow Condensed| 900    | clamp(2.5rem, 8vw, 4rem)     | Números hero, títulos de sesión, timer |
| `.text-title`  | Barlow Condensed| 700    | 1.5rem                        | Encabezados de sección                 |
| `.text-label`  | Barlow Condensed| 700    | 0.625rem uppercase           | Insignias (badges), etiquetas pequeñas |
| `.text-body`   | Outfit          | 400    | 0.9375rem                     | Texto de cuerpo principal              |
| `.text-body-bold` | Outfit       | 600    | 0.9375rem                     | Cuerpo enfatizado, nombres de sesión   |
| `.text-meta`   | Outfit          | 400    | 0.8125rem, color muted       | Metadatos, marcas de tiempo            |

**Referencia Rápida:**
* Números hero → Barlow Condensed 900
* Títulos de sección → Barlow Condensed 700
* Texto de cuerpo → Outfit 400/500
* Interfaz en negrita (sesión, métricas) → Outfit 600
* Etiquetas/insignias → Barlow Condensed 700 uppercase
* Textos del menú inferior (BottomNav) → Outfit 600, text-[10px], uppercase, tracking-[0.08em]
* Nombres de ejercicios → Outfit 600, text-sm
* Etiquetas de ejercicios (series, tempo) → Outfit 500, text-xs

### Pensamiento de Diseño — Antes de crear componentes

Antes de escribir código, comprométete con una **dirección estética audaz**:

* **Propósito**: ¿Qué problema resuelve esta interfaz y quién la usa? (Atletas, coaches — deportistas enfocados en el rendimiento que necesitan total claridad bajo fatiga).
* **Tono**: Premium atlético — superficies grises/blancas cálidas, tipografía pesada y acentos naranja de seguridad precisos y llenos de energía.
* **Restricciones**: React + Tailwind CSS. Animaciones mediante librerías de movimiento. Mobile-first (PWA).
* **Diferenciación**: ¿Qué hace que este componente sea INOLVIDABLE?

**CRÍTICO**: Fondo claro cálido, contraste alto, acento naranja de seguridad (#FF6B00). Ejecuta con máxima precisión e intención.

### Pautas Estéticas

**Color y Tema**
* Base clara y cálida (#FAFAFA fondo, #FFFFFF tarjetas) con naranja de seguridad (#FF6B00) como único acento de acción.
* Alto contraste entre textos (#1C1C1E) y fondos (#FAFAFA).
* Evitar: fondos oscuros, tonos morados, colores azules (#3d7dd4) o verdes para acciones primarias, y múltiples colores compitiendo entre sí.

**Movimiento**
* Usa clases de escalonamiento (`.stagger-1` a `.stagger-7`) para animaciones de entrada en listas o cuadrículas.
* `pulse-green` para botones de acción flotantes (FABs) o estados de ejecución activos.
* `flash-green` para celebraciones de completado.

**Composición Espacial**
* Tarjetas: `bg-white border border-[#E8E8E4] rounded-2xl shadow-sm`
* Relleno amplio: mínimo `px-5 py-4` para las secciones de la página.
* Encabezados de sección pesados en Barlow Condensed en mayúsculas + tracking-widest.
* Acento de borde izquierdo (`border-l-4 border-l-[#FF6B00]`) para elementos activos.
* Usa `.page-section` (margin-bottom: 1.75rem) para separación de secciones y `.card-padding` (padding: 1.25rem) en el interior de tarjetas.

**Botones y Acciones**
* CTA Primario: `bg-[#FF6B00] text-[#FFFFFF] font-condensed font-black rounded-2xl`
* Sombra CTA: `shadow-[0_4px_16px_rgba(255,107,0,0.3)]`
* Secundario: Solo borde, sin fondo gris — `border border-[#E8E8E4] text-[#6E6E73]`
* Nunca rellenes botones secundarios con fondos grises.

**Pills y Badges**
* Por defecto solo borde: `border border-[#E8E8E4] text-[#6E6E73]`
* Estado activo: `border-[#FF6B00] text-[#FF6B00] bg-[#FFF3EC]`

**Fondos y Detalles Visuales**
* Fondo de página: `bg-[#F5F5F0]` (gris cálido claro), tarjetas: `bg-white`.
* Nunca uses fondos oscuros en componentes.
* Profundidad mediante `shadow-sm` + `border border-[#E8E8E4]`.
* El naranja de seguridad se utiliza en: subrayados, bordes izquierdos, puntos indicadores, barras de progreso, iconos y botones CTA.

### Reglas Estrictas
* **NUNCA** uses fondos oscuros (`bg-[#1e2335]`, `bg-[#181c27]`, etc.) — todo es blanco/gris claro cálido.
* **NUNCA** uses por defecto tipografías como Inter, Roboto, Arial, DM Sans o fuentes del sistema — usa exclusivamente Outfit y Barlow Condensed.
* **NUNCA** utilices azul (#3d7dd4) o verde (#39FF14) como color de acción primario — el naranja de seguridad (#FF6B00) es el único acento.
* **NUNCA** hagas que el fondo de áreas grandes sea naranja — es un color de realce/CTA únicamente.
* **NUNCA** añadas rellenos de color a los chips de filtrado desactivados — solo borde.

---

## Pautas de Desarrollo

* Todos los componentes son **componentes funcionales de React** con hooks.
* Estilo mediante clases de utilidad **Tailwind CSS**.
* Datos recuperados de **Google Sheets** a través de su API REST — maneja siempre estados de carga y error.
* Restricciones de PWA: capacidad offline mediante almacenamiento local e interfaz totalmente móvil (mobile-first).
* Mantén los componentes modulares y autocontenidos.
* Utiliza nombres de variables descriptivos del ámbito deportivo (series, repeticiones, mesociclo, poomsae, RPE, volumen, etc.).

---

## Glosario de Términos (Deporte/Taekwondo)

* **Mesociclo**: bloque de entrenamiento de 2 a 6 semanas con un enfoque específico.
* **Sesión**: unidad individual de entrenamiento (TKD o gimnasio).
* **Circuito**: secuencia de ejercicios con intervalos de tiempo.
* **Poomsae**: formas o patrones oficiales de Taekwondo (series Taegeuk).
* **Dan**: grado de cinturón negro en Taekwondo.
