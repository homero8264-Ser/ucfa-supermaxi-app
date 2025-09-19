import json

# Datos de la próxima fecha (FECHA 21) - [local, visitante, horario, cancha]
proxima_fecha_data = [
    "PENAROL", "CHAZON", "20:00", "S3",
    "LA LOMITA", "WARCALDE", "20:00", "S4",
    "SANTOS", "CLINICAS", "20:00", "S5",
    "CRUZ AZUL", "NECAXA", "20:00", "S6",
    "LA SALLE", "CARASUCIAS", "20:00", "S7",
    "LA CORUNA", "CERVECEROS", "21:30", "S3",
    "DINAMO", "LOS MATADORES", "21:30", "S4",
    "UNION Y AMISTAD", "LA CANCHITA", "21:30", "S5",
    "HALCONES", "SAN MARTIN", "21:30", "S6"
]

proxima_fecha = []

# Procesa los datos de 4 en 4 (local, visitante, horario, cancha)
for i in range(0, len(proxima_fecha_data), 4):
    local = proxima_fecha_data[i]
    visitante = proxima_fecha_data[i + 1]
    horario = proxima_fecha_data[i + 2]
    cancha = proxima_fecha_data[i + 3]
    
    proxima_fecha.append({
        "local": local,
        "visitante": visitante,
        "horario": horario,
        "cancha": cancha
    })

# Guarda la próxima fecha en proxima_fecha.json
with open("proxima_fecha.json", "w", encoding="utf-8") as f:
    json.dump(proxima_fecha, f, indent=2, ensure_ascii=False)

print(f"✅ Próxima fecha guardada en proxima_fecha.json ({len(proxima_fecha)} partidos)")