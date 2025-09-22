import json

# Datos de los partidos en orden: [equipo1, goles1, equipo2, goles2]
partidos_data = [
    "LA LOMITA", 1, "SAN MARTIN", 1,
    "WARCALDE", 1, "LOS MATADORES", 5,
    "PENAROL", 2, "NECAXA", 2,
    "HALCONES", 3, "DINAMO", 0,
    "CHAZON", 2, "CERVECEROS", 1,
    "CRUZ AZUL", 2, "LA CORUNA", 2,
    "SANTOS", 1, "CARASUCIAS", 1,
    "CLINICAS", 2, "LA CANCHITA", 2,
    "LA SALLE", 4, "UNION Y AMISTAD", 1
]

resultados = []

# Procesa los datos de 4 en 4
for i in range(0, len(partidos_data), 4):
    equipo1 = partidos_data[i]
    goles1 = partidos_data[i + 1]
    equipo2 = partidos_data[i + 2]
    goles2 = partidos_data[i + 3]
    
    resultados.append({
        "local": equipo1,
        "goles_local": goles1,
        "visitante": equipo2,
        "goles_visitante": goles2
    })

# Guarda los resultados en resultados.json
with open("resultados.json", "w", encoding="utf-8") as f:
    json.dump(resultados, f, indent=2, ensure_ascii=False)

print(f"✅ Resultados guardados en resultados.json ({len(resultados)} partidos)")