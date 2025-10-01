import requests
from bs4 import BeautifulSoup
import json

url = "https://www.ucfa.org.ar/web/division/SM"
resp = requests.get(url)
soup = BeautifulSoup(resp.text, "html.parser")

resultados = []

# Encuentra todos los bloques de equipos y goles
bloques = soup.find_all("div", class_="borderBttm2 cell_1 flLeft w_big")
goles_divs = soup.find_all("div", class_="cell_3")

# Extrae los nombres de los equipos
equipos = [b.text.strip() for b in bloques if b.text.strip()]

# Extrae los goles (convierte a entero si es posible)
goles = []
for g in goles_divs:
    try:
        goles.append(int(g.text.strip()))
    except ValueError:
        # Si no es un número, ignora este valor
        continue

# Combina los equipos y goles para formar los resultados
for i in range(0, len(equipos) - 1, 2):
    if i // 2 < len(goles) // 2:
        resultados.append({
            "local": equipos[i],
            "goles_local": goles[i // 2 * 2],
            "visitante": equipos[i + 1],
            "goles_visitante": goles[i // 2 * 2 + 1]
        })

# Guarda los resultados en resultados.json
with open("resultados.json", "w", encoding="utf-8") as f:
    json.dump(resultados, f, indent=2, ensure_ascii=False)

print(f"✅ Resultados guardados en resultados.json ({len(resultados)} partidos)")