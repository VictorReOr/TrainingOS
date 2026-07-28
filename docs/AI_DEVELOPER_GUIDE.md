# AI & DEVELOPER ONBOARDING GUIDE — TrainingOS

Bienvenido a **TrainingOS**. Este documento está redactado explícitamente para que **agentes de Inteligencia Artificial (IA) y nuevos desarrolladores** entiendan la arquitectura del proyecto, sepan dónde añadir nuevas características y eviten cometer errores comunes sin necesidad de explorar todo el código fuente.

---

## 1. Reglas de Oro de la Arquitectura
1. **NUNCA violar el desacoplamiento del Performance Engine**:
   - El código en `src/engine/performance/` DEBE mantenerse como **JavaScript puro**.
   - NUNCA importes React, Hooks (`useState`, `useEffect`), el DOM (`window`, `document`) o `localStorage` dentro de `src/engine/performance/`.
   - Si necesitas datos de la aplicación React en el motor, agrégalos en `inputBuilder.js`.

2. **Sincronización mediante Eventos de Almacenamiento**:
   - Cuando agregues o modifiques un registro en `localStorage` (como sesiones, bienestar o PRs), NUNCA dependas únicamente del estado local del contexto.
   - Emite siempre un evento en el navegador:
     ```js
     window.dispatchEvent(new Event('session_logs_updated'));
     ```

3. **Inmutabilidad de la Salida**:
   - El objeto que devuelve `evaluate()` está congelado (`Object.freeze`). No intentes mutar sus propiedades en la UI; trátalo como un estado de solo lectura.

4. **Estética y Design System**:
   - TrainingOS utiliza un tema claro moderno y técnico (`#FAFAFA`, `#F3F4F6`, `#FFFFFF`).
   - Usa `Barlow Condensed` para encabezados contundentes y números grandes.
   - Usa `IBM Plex Mono` / `font-mono` para labels de telemetría, métricas y datos técnicos en mayúsculas.
   - El color de acento principal es `#FF5A00` (`signal-orange`).

---

## 2. Recetas Paso a Paso para Nuevas Características

### 2.1. Cómo añadir un nuevo Índice al Performance Engine
1. Crea un nuevo archivo en `src/engine/performance/indices/miNuevoIndex.js`.
2. Escribe una función pura:
   ```js
   export function computeMiNuevoIndex(input, config, wave1Results) {
     // Lógica pura determinista
     return { value: 85, label: 'Excelente', detail: '...' };
   }
   ```
3. Registra tu índice en `src/engine/performance/core/engineCore.js`:
   - Si no depende de otros índices, ejecútalo en la **Oleada 1**.
   - Si depende de Fatiga o Recuperación, ejecútalo en la **Oleada 2**.
4. Añade los umbrales de tu índice a `src/engine/performance/performanceConfig.js`.
5. Incluye casos de prueba en `src/engine/performance/__tests__/smoke.test.js` y ejecútalos con:
   ```bash
   node src/engine/performance/__tests__/smoke.test.js
   ```

### 2.2. Cómo crear un nuevo Contexto de Estado en React
1. Crea el archivo `src/context/MiNuevoContext.jsx`.
2. Define la clave de almacenamiento local (`const LS_KEY = 'trainingos_mi_clave';`).
3. Inicializa el estado desde `localStorage` usando la forma perezosa de `useState`:
   ```js
   const [state, setState] = useState(() => {
     try {
       const raw = localStorage.getItem(LS_KEY);
       return raw ? JSON.parse(raw) : initialDefault;
     } catch { return initialDefault; }
   });
   ```
4. Guarda en `localStorage` y emite el evento al modificar:
   ```js
   localStorage.setItem(LS_KEY, JSON.stringify(newValue));
   window.dispatchEvent(new Event('mi_clave_updated'));
   ```
5. Envuelve la aplicación en `src/main.jsx` con `<MiNuevoProvider>`.

### 2.3. Cómo añadir un nuevo ejercicio a la Librería
1. Abre `src/data/exerciseLibrary.js`.
2. Añade el objeto en la categoría correspondiente incluyendo los 4 campos obligatorios del Performance Engine:
   ```js
   {
     id: 'lib-push-99',
     name: 'Press Inclinado con Mancuernas',
     category: 'Fuerza / Hipertrofia',
     pattern: 'push_horizontal',     // patrón de movimiento
     systemicCost: 6,                 // coste de fatiga (1-10)
     sportTransfer: 7,                // relevancia TKD (1-10)
     priority: 'main'                 // 'main' | 'accessory' | 'core' | 'mobility'
   }
   ```

---

## 3. Errores Comunes que Deben Evitarse
- ❌ **Usar `useMemo(..., [])` con dependencias vacías para leer `localStorage`**: Causará que el hook nunca reaccione a los cambios de datos. Usa siempre `useState` + `useEffect` escuchando el evento `session_logs_updated`.
- ❌ **Mutar objetos de estado directamente**: Utiliza siempre copias inmutables (`[...prev]`, `{ ...prev }`).
- ❌ **Ignorar el estado Cold Start**: Cuando `isColdStart` es `true`, las métricas deben presentarse con confianza atenuada o badges explicativos.
- ❌ **Hardcodear colores HEX aleatorios**: Usa las variables del tema de Tailwind definidas en `src/index.css` (`signal-orange`, `corner-red`, `corner-blue`, `ink`, `muted`).
