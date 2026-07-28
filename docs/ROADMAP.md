# PRODUCT ROADMAP — TrainingOS

## 1. Visión Estratégica
El roadmap de TrainingOS está estructurado en tres versiones principales ordenadas por valor técnico y dependencias funcionales:

---

## 2. Fases del Roadmap

### v1.0 — Estabilización & Experiencia Integrada de Usuario (ACTUAL)
| Tarea | Descripción | Prioridad | Estado |
|---|---|---|---|
| **Motor de Rendimiento (Fases 1 y 2)** | Cálculo puro de los 6 índices de rendimiento en 2 oleadas y motor de decisiones. | `P0 (Bloqueante)` | ✅ COMPLETADO |
| **Adaptador React & Eventos (Fase 3)** | Integration mediante `usePerformanceEngine` e `inputBuilder` con escucha de eventos. | `P0 (Bloqueante)` | ✅ COMPLETADO |
| **UI & Dashboard (Fase 4)** | Creación de componentes visuales (`IndexCard`, `TrafficLightBadge`) y pantalla `/performance`. | `P0 (Bloqueante)` | ✅ COMPLETADO |
| **Sincronización Local Reactiva** | Asegurar que `SessionContext` guarde en `trainingos_session_logs` y dispare eventos. | `P0 (Bloqueante)` | ✅ COMPLETADO |
| **Rutinas de Fallback** | Permitir importar semanas de entrenamiento predefinidas si Sheets falla. | `P1 (Alta)` | ✅ COMPLETADO |

---

### v2.0 — Analítica Avanzada, Red & Entrenador Multi-Atleta
| Tarea | Descripción | Prioridad | Estado |
|---|---|---|---|
| **Completar Apps Script `Code.gs`** | Añadir el endpoint `getWorkouts` en el backend remoto de Google Sheets. | `P1 (Alta)` | ⏳ Pendiente |
| **Panel de Coach Multiatleta** | Permitir a un entrenador alternar entre perfiles de atletas y editar mesociclos remotamente. | `P1 (Alta)` | ⏳ Pendiente |
| **Gráficos Interactivos de Volumen** | Visualización de volumen semanal por patrón de movimiento en `Evolution.jsx`. | `P2 (Media)` | ⏳ Pendiente |
| **Exportación PDF/Excel de Informes** | Generación de reportes descargables del Performance Engine para el entrenador. | `P2 (Media)` | ⏳ Pendiente |
| **PWA Service Workers & Push** | Instalación completa como PWA nativa en dispositivos móviles y notificaciones de descanso. | `P2 (Media)` | ⏳ Pendiente |

---

### v3.0 — Biometría Inteligente & Generación IA
| Tarea | Descripción | Prioridad | Estado |
|---|---|---|---|
| **Integración con Apple Health / Google Fit** | Sincronización automática de variabilidad cardiaca (HRV) y calidad del sueño. | `P3 (Baja)` | 🔮 Futuro |
| **Generador de Mesociclos impulsado por IA** | Auto-confección de bloques de entrenamiento basados en los desequilibrios detectados por el motor. | `P3 (Baja)` | 🔮 Futuro |
| **Multi-Tenancy SaaS / Supabase Migration** | Migración de Google Sheets a PostgreSQL / Supabase para escalabilidad masiva. | `P3 (Baja)` | 🔮 Futuro |
