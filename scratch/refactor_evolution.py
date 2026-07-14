import re

file_path = r"c:\Users\victo\.gemini\antigravity\scratch\training-os\src\pages\Evolution.jsx"

with open(file_path, "r", encoding="utf-8") as f:
    code = f.read()

# 1. Page Title & Header Layout
code = code.replace(
    '<h1 className="font-condensed font-black text-[42px] leading-none text-[#1C1C1E]">EVOLUCIÓN</h1>',
    '<h1 className="font-display font-black text-[42px] leading-none text-ink uppercase tracking-wide">EVOLUCIÓN</h1>'
)

# 2. General Theme Colors and Card Shadows
code = code.replace('bg-[#F5F5F0]', 'bg-bg')
code = code.replace('bg-white', 'bg-card')
code = code.replace('border-[#E8E8E4]', 'border-border')
code = code.replace('divide-[#E8E8E4]', 'divide-border')
code = code.replace('text-[#1C1C1E]', 'text-ink')
code = code.replace('text-[#6E6E73]', 'text-muted')
code = code.replace('text-[#8E8E93]', 'text-muted')
code = code.replace('bg-[#FFF3EC]', 'bg-signal-orange/10')
code = code.replace('text-[#FF6B00]', 'text-signal-orange')
code = code.replace('border-[#FDDCB5]', 'border-border')
code = code.replace('bg-green-50', 'bg-success-green/10')
code = code.replace('text-green-700', 'text-success-green')
code = code.replace('text-green-600', 'text-success-green')
code = code.replace('text-blue-600', 'text-corner-blue')
code = code.replace('text-purple-600', 'text-corner-blue')
code = code.replace('text-amber-500', 'text-signal-orange')
code = code.replace('bg-[#FFFDF0]', 'bg-bg/25')
code = code.replace('border-yellow-500/20', 'border-border')
code = code.replace('border-yellow-500/40', 'border-border')
code = code.replace('text-[#D4AF37]', 'text-belt-gold')
code = code.replace('bg-green-100', 'bg-success-green/10')
code = code.replace('bg-amber-100', 'bg-signal-orange/10')
code = code.replace('text-amber-700', 'text-signal-orange')
code = code.replace('bg-red-100', 'bg-corner-red/10')
code = code.replace('text-red-700', 'text-corner-red')
code = code.replace('stroke="#E8E8E4"', 'stroke="var(--color-border)"')
code = code.replace('stroke="#FF6B00"', 'stroke="var(--color-signal-orange)"')
code = code.replace('stroke="#007AFF"', 'stroke="var(--color-corner-blue)"')
code = code.replace('stroke="#34C759"', 'stroke="var(--color-success-green)"')
code = code.replace('fill="#FF6B00"', 'fill="var(--color-signal-orange)"')
code = code.replace('fill="#34C759"', 'fill="var(--color-success-green)"')
code = code.replace('shadow-sm', 'shadow-none')
code = code.replace('shadow-xl', 'shadow-none')

# 3. Typography Adjustments
# Barlow Condensed 5xl for 1RM -> Big Shoulders Display (font-display)
code = code.replace(
    'font-condensed font-black text-5xl leading-none text-signal-orange tabular-nums',
    'font-display font-black text-5xl leading-none text-signal-orange uppercase tracking-wide tabular-nums'
)
code = code.replace(
    'font-condensed font-black text-5xl text-signal-orange leading-none mb-1',
    'font-display font-black text-5xl text-signal-orange leading-none mb-1 uppercase tracking-wide'
)

# 4. Tab button styles
code = code.replace(
    "activeTab === key\n                  ? 'bg-[#FF6B00] text-white shadow-none'\n                  : 'text-muted hover:text-ink'",
    "activeTab === key\n                  ? 'bg-signal-orange text-ink font-black shadow-none'\n                  : 'text-muted hover:text-ink'"
)
code = code.replace(
    "activeCategory === cat\n                    ? 'border-signal-orange text-signal-orange bg-signal-orange/10'\n                    : 'border-border text-muted bg-card'",
    "activeCategory === cat\n                    ? 'border-signal-orange text-ink bg-signal-orange'\n                    : 'border-border text-muted bg-card'"
)
code = code.replace(
    "activeTestSubTab === sub.id\n                    ? 'border-signal-orange text-signal-orange bg-signal-orange/10'\n                    : 'border-border text-muted bg-card'",
    "activeTestSubTab === sub.id\n                    ? 'border-signal-orange text-ink bg-signal-orange'\n                    : 'border-border text-muted bg-card'"
)
code = code.replace(
    "activeHistorySubTab === sub.id\n                    ? 'border-signal-orange text-signal-orange bg-signal-orange/10'\n                    : 'border-border text-muted bg-card'",
    "activeHistorySubTab === sub.id\n                    ? 'border-signal-orange text-ink bg-signal-orange'\n                    : 'border-border text-muted bg-card'"
)

# 5. TEST & COMPOSICIÓN Corporal Rows
# CMJ log list row
code = code.replace(
    '<div key={log.id} className="flex justify-between items-center py-2 border-b border-border text-xs">\n                          <span className="font-bold text-ink">{formatDate(log.fecha)}</span>\n                          <span className="font-condensed font-black text-sm text-ink">{log.valor} cm</span>\n                        </div>',
    '<div key={log.id} className="flex justify-between items-center py-2.5 border-b border-border text-xs">\n                          <span className="font-condensed font-bold uppercase text-ink">{formatDate(log.fecha)}</span>\n                          <span className="font-mono font-bold text-signal-orange">{log.valor} CM</span>\n                        </div>'
)

# Cardio log list row
code = code.replace(
    '<div key={log.id} className="flex justify-between items-center py-2 border-b border-border text-xs">\n                          <div>\n                            <span className="font-bold block text-ink">{formatDate(log.fecha)}</span>\n                            <span className="text-muted capitalize">{log.tipo === \'cooper\' ? `Test de Cooper: ${log.valorOriginal}m` : `Course-Navette: ${log.valorOriginal} km/h`}</span>\n                          </div>\n                          <span className="font-condensed font-black text-sm text-success-green bg-success-green/10 px-2.5 py-1 rounded">\n                            {log.valor} ml/kg/min\n                          </span>\n                        </div>',
    '<div key={log.id} className="flex justify-between items-center py-2.5 border-b border-border text-xs">\n                          <div>\n                            <span className="font-condensed font-bold block text-ink uppercase tracking-wide">{formatDate(log.fecha)}</span>\n                            <span className="font-mono text-[10px] text-muted uppercase tracking-wider">{log.tipo === \'cooper\' ? `Cooper: ${log.valorOriginal}M` : `Beep: ${log.valorOriginal} KM/H`}</span>\n                          </div>\n                          <span className="font-mono font-bold text-success-green px-2 py-0.5 rounded">\n                            {log.valor} ML/KG/MIN\n                          </span>\n                        </div>'
)

# Composition log list row (tabular card format)
# We can find standard format for body composition measurements
# Under activeTestSubTab === 'composition'
old_comp_part = """                    {/* Historial de Mediciones */}
                    <div className="space-y-3">
                      {bodyMetrics.map((log) => {
                        const hasCircumferences = log.medidaCintura || log.medidaBrazo || log.medidaMuslo;
                        return (
                          <div key={log.id} className="border border-border rounded-xl p-3 bg-bg/25">
                            <div className="flex justify-between items-center mb-1">
                              <span className="font-bold text-xs text-ink">{formatDate(log.fecha)}</span>
                              <span className="font-condensed font-black text-sm text-signal-orange">{log.peso} kg</span>
                            </div>"""

new_comp_part = """                    {/* Historial de Mediciones */}
                    <div className="space-y-4">
                      {bodyMetrics.map((log) => {
                        const hasCircumferences = log.medidaCintura || log.medidaBrazo || log.medidaMuslo;
                        return (
                          <div key={log.id} className="border border-border rounded-xl p-4 bg-card">
                            <div className="flex justify-between items-center border-b border-border pb-2.5 mb-2.5">
                              <span className="font-condensed font-bold text-xs uppercase text-ink">{formatDate(log.fecha)}</span>
                              <span className="font-mono text-sm font-bold text-signal-orange">{log.peso} KG</span>
                            </div>"""

code = code.replace(old_comp_part, new_comp_part)

# Also circumferences inside the loop
code = code.replace(
    'className="grid grid-cols-3 gap-2 mt-2 pt-2 border-t border-border/40 text-[11px] text-muted"',
    'className="grid grid-cols-3 gap-2 mt-2 text-[10px] font-mono text-muted uppercase tracking-wider"'
)

# Circumferences lines
code = code.replace(
    'Cintura: <span className="font-bold text-ink">{log.medidaCintura}cm</span>',
    'Cintura: <span className="font-bold text-ink">{log.medidaCintura}CM</span>'
)
code = code.replace(
    'Brazo: <span className="font-bold text-ink">{log.medidaBrazo}cm</span>',
    'Brazo: <span className="font-bold text-ink">{log.medidaBrazo}CM</span>'
)
code = code.replace(
    'Muslo: <span className="font-bold text-ink">{log.medidaMuslo}cm</span>',
    'Muslo: <span className="font-bold text-ink">{log.medidaMuslo}CM</span>'
)

# 6. Forms inputs styling in Composición Corporal
code = code.replace(
    'className="w-full bg-card border border-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-signal-orange"',
    'className="w-full bg-card border border-border rounded-xl px-3 py-2 text-sm font-mono text-ink focus:outline-none focus:border-signal-orange"'
)
code = code.replace(
    'className="w-full bg-card border border-border rounded-xl px-2.5 py-1.5 text-xs focus:outline-none focus:border-signal-orange"',
    'className="w-full bg-card border border-border rounded-xl px-2.5 py-1.5 text-xs font-mono text-ink focus:outline-none focus:border-signal-orange"'
)
code = code.replace(
    'className="px-3 py-1.5 bg-signal-orange/10 text-signal-orange border border-border rounded-xl font-condensed font-black text-xs hover:bg-signal-orange hover:text-white transition-colors"',
    'className="px-3.5 py-1.5 bg-signal-orange text-ink border border-border rounded-lg font-condensed font-black text-xs hover:bg-signal-orange/95 cursor-pointer uppercase transition-colors"'
)
code = code.replace(
    'className="w-full py-2.5 bg-signal-orange text-white font-condensed font-black text-sm rounded-xl hover:bg-signal-orange/90 transition-colors uppercase tracking-wider"',
    'className="w-full py-2.5 bg-signal-orange text-ink font-display font-black text-base rounded-xl hover:bg-signal-orange/95 transition-colors uppercase tracking-wider cursor-pointer"'
)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(code)

print("Refactored Evolution.jsx successfully!")
