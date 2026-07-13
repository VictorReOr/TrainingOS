import os

files = [
    "src/main.jsx",
    "src/App.jsx",
    "src/context/SessionContext.jsx",
    "src/context/PRContext.jsx",
    "src/context/PlannerContext.jsx",
    "src/context/TimerContext.jsx",
    "src/context/CircuitContext.jsx",
    "src/context/AthleteContext.jsx",
    "src/context/CoachContext.jsx",
    "src/hooks/useRole.js",
    "src/hooks/useEvolutionData.js",
    "src/services/sheets.js",
    "package.json"
]

base_dir = r"c:\Users\victo\.gemini\antigravity\scratch\training-os"
output_path = os.path.join(base_dir, "codigo_auditoria.md")

with open(output_path, "w", encoding="utf-8") as out:
    out.write("# Auditoría de Código - TrainingOS\n\n")
    for f in files:
        fpath = os.path.join(base_dir, f.replace("/", "\\"))
        try:
            with open(fpath, "r", encoding="utf-8") as file:
                content = file.read()
            ext = f.split('.')[-1]
            if ext == 'js' or ext == 'jsx':
                lang = 'javascript'
            elif ext == 'json':
                lang = 'json'
            else:
                lang = ''
            out.write(f"## Archivo: `{f}`\n\n")
            out.write(f"```{lang}\n{content}\n```\n\n")
        except Exception as e:
            out.write(f"## Archivo: `{f}`\n\n")
            out.write(f"**Error al leer el archivo:** {e}\n\n")

print(f"Archivo generado exitosamente en: {output_path}")
