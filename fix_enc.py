import os

filepath = r'src\pages\Evolution.jsx'

with open(filepath, 'r', encoding='utf-8-sig') as f: # Reads and strips BOM
    bad_text = f.read()

try:
    good_text = bad_text.encode('cp1252').decode('utf-8')
    with open(filepath, 'w', encoding='utf-8') as f: # Write without BOM
        f.write(good_text)
    print("Fixed mojibake encoding successfully")
except Exception as e:
    print("Error doing full mojibake reverse:", e)
