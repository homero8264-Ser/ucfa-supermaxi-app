import requests
from bs4 import BeautifulSoup
import json

url = "https://www.ucfa.org.ar/web/division/SM"
resp = requests.get(url)
soup = BeautifulSoup(resp.text, "html.parser")

equipos = [e.text.strip() for e in soup.find_all("span") if e.text.strip()]
goles = [int(g.text.strip()) for g in soup.find_all("div", class_="cell_3") if g.text.strip().isdigit()]

resultados = []
for i in range(0, len(equipos), 2):
    if i+1 < len(equipos) and i+1 < len(goles):
        resultados.append({
            "local": equipos[i],
            "goles_local": goles[i],
            "visitante": equipos[i+1],
            "goles_visitante": goles[i+1]
        })

with open("resultados.json", "w", encoding="utf-8") as f:
    json.dump(resultados, f, ensure_ascii=False, indent=2)

print(f"✅ Resultados guardados en resultados.json ({len(resultados)} partidos)")