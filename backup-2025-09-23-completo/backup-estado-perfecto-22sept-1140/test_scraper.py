import json

datos = [
    {"equipo": "LA LOMITA", "puntos": 43},
    {"equipo": "PEÑAROL", "puntos": 38},
    {"equipo": "SANTOS", "puntos": 35}
]

with open("datos.json", "w", encoding="utf-8") as f:
    json.dump(datos, f, indent=2)

print("Archivo generado correctamente.")