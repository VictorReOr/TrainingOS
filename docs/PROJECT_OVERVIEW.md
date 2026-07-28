# PROJECT OVERVIEW — TrainingOS

## 1. Objetivo del Proyecto
**TrainingOS** es una plataforma web progresiva (PWA/Web App) orientada a la **gestión, planificación y autorregulación del entrenamiento de alto rendimiento**, diseñada específicamente para atletas híbridos y entrenadores de **Fuerza / Hipertrofia** y **Taekwondo (TKD)**.

La aplicación combina un planificador semanal estructurado, un diario de entrenamiento en tiempo real, un sistema de récords personales (PRs), un timer/cronómetro interactivo para circuitos y un **Performance Engine (Motor de Rendimiento)** determinista en JavaScript puro que calcula fatiga, recuperación, estímulo muscular, progresión por ejercicio, equilibrio de patrones y transferencia deportiva a las artes marciales.

---

## 2. Problema que Resuelve
1. **Falta de autorregulación basada en evidencia**: La mayoría de los atletas entrenan fijando cargas fijas sin considerar su fatiga neuromuscular acumulada ni su nivel diario de preparación (sueño, estrés, dolor muscular).
2. **Desconexión entre el trabajo de gimnasio y el deporte específico**: En deportes de combate como el Taekwondo, el entrenamiento de pesas tradicional a menudo crea desequilibrios musculares o interfiere con la explosividad y flexibilidad requeridas en el tapiz.
3. **Complejidad de las hojas de cálculo**: Los entrenadores suelen usar plantillas de Excel/Google Sheets difíciles de usar e interpretar desde un teléfono móvil durante la sesión.

---

## 3. Filosofía de Diseño y Arquitectura
- **Local-First & Offline Ready**: Toda la aplicación funciona inmediatamente desde `localStorage`, sincronizando en segundo plano con servicios remotos (Google Sheets / Firebase) cuando hay conexión.
- **Desacoplamiento Estricto del Motor**: El `Performance Engine` es una librería pura en JavaScript sin dependencias de React, DOM o almacenamiento. Recibe DTOs inmutables y devuelve resultados inmutables.
- **Autorregulación Inteligente**: Prioriza la calidad técnica y la velocidad de ejecución sobre el peso bruto, aplicando la tabla Prilepin, estimación de 1RM y análisis de RPE/RIR.
- **Estética "Dossier Técnico de Alto Rendimiento"**: Interfaz limpia en modo claro (`#FAFAFA`), bordes de precisión de 1px, badges en `IBM Plex Mono` y encabezados contundentes en `Barlow Condensed` y `Outfit`.

---

## 4. Perfiles de Usuario
| Rol | Descripción | Capacidades Clave |
|---|---|---|
| **Atleta** | Usuario final que ejecuta los entrenamientos diarios. | Registra series (carga, reps, RPE, velocidad), hace check-in de bienestar diario, consulta sugerencias de carga y analiza su evolución. |
| **Entrenador (Coach)** | Profesional que planifica y supervisa a múltiples atletas. | Diseña temporadas/mesociclos, crea y asigna plantillas de sesión, ajusta la configuración del Performance Engine y revisa el feedback. |
| **Híbrido (Both)** | Atleta auto-entrenado o entrenador-atleta (Modo por defecto). | Acceso total tanto a la interfaz del atleta como al panel del entrenador. |

---

## 5. Casos de Uso Principales
1. **Check-in Diario de Bienestar**: Registrar nivel de sueño, estrés, energía, dolor muscular (DOMS) y peso corporal antes de entrenar.
2. **Ejecución y Registro de Sesión**: Iniciar un entrenamiento, visualizar sugerencias de sobrecarga progresiva en tiempo real, ajustar cargas según RPE y velocidad percibida, y marcar series completadas.
3. **Análisis de Rendimiento (Performance Dashboard)**: Inspeccionar el semáforo global de entrenamiento y los 6 índices analíticos del Performance Engine.
4. **Planificación de Temporadas y Mesociclos**: Estructurar bloques de entrenamiento (Fuerza, Hipertrofia, Potencia, Peaking, Competición, Recuperación) y asignar sesiones al calendario semanal.
5. **Control de Récords Personales (PRs)**: Seguimiento automático de 1RMs estimados y marcas máximas por ejercicio.

---

## 6. Stack Tecnológico
- **Frontend Core**: React 19, React Router DOM v7.
- **Build Tool & Bundler**: Vite v6.
- **Estilos**: Tailwind CSS v4 con variables CSS personalizadas para el tema claro.
- **Iconografía**: Lucide React.
- **Backend & Autenticación**:
  - **Firebase Auth**: Gestión de sesiones de usuario y registro.
  - **Google Sheets API / Apps Script**: Almacenamiento distribuido y sincronización de datos con hojas de cálculo.
- **Persistencia Local**: Web Storage API (`localStorage` & `sessionStorage`).

---

## 7. Estado Actual del Proyecto
- **Fase 1 (Motor Base Puro)**: Totalmente implementada y validada (`fatigueIndex`, `recoveryIndex`, `stimulusIndex`).
- **Fase 2 (Oleada 2 & Decision Engine)**: Totalmente implementada y validada (`progressionIndex`, `patternBalanceIndex`, `sportTransferIndex`, `decisionEngine`).
- **Fase 3 (Integración React & Contexts)**: Hook adaptador `usePerformanceEngine`, constructor de DTOs `inputBuilder` y sincronización reactiva por eventos.
- **Fase 4 (UI & Visualización)**: Componentes `TrafficLightBadge`, `IndexCard`, `RecommendationCard`, `ColdStartBanner`, `WellnessCheckIn`, y pantalla `/performance`.

---

## 8. Roadmap Resumido
- **v1.0 (Actual)**: Motor analítico completo, interfaz PWA responsiva, persistencia local y sincronización Google Sheets.
- **v2.0 (Próxima)**: Notificaciones push de recuperación, gráficos interactivos de volumen semanal por patrón muscular y exportación PDF/Excel.
- **v3.0 (Futura)**: Integración con dispositivos wearables (Apple Health / Google Fit / Garmin) e IA generativa para confección de plantillas.
