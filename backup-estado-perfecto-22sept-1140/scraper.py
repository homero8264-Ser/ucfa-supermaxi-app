import json
import re
import os

# Pegá el texto completo acá
texto = """GRUPO A
1. LA LOMITA
43
19
12
7
0
42
13
29
0
3
2. LOS MATADORES
29
19
8
5
6
45
35
10
0
0
3. SAN MARTIN
27
19
8
3
8
27
30
-3
0
2
4. HALCONES
24
19
7
3
9
29
29
0
0
3
5. DINAMO
24
19
6
6
7
28
36
-8
0
0
6. WARCALDE
8
19
2
2
15
14
52
-38
0
1
GRUPO B
1. PENAROL
38
19
11
5
3
46
17
29
0
0
2. CERVECEROS
30
19
9
3
7
33
26
7
0
0
3. NECAXA
29
19
8
5
6
30
30
0
0
2
4. LA CORUNA
22
19
6
4
9
29
26
3
0
0
5. CRUZ AZUL
22
19
6
4
9
25
34
-9
0
1
6. CHAZON
19
19
5
4
10
25
42
-17
0
4
GRUPO C
1. SANTOS
35
19
10
5
4
44
25
19
0
0
2. LA CANCHITA
33
19
10
3
6
25
16
9
0
1
3. CARASUCIAS
28
19
7
7
5
27
21
6
0
0
4. UNION Y AMISTAD
24
19
7
3
9
30
38
-8
0
1
5. LA SALLE
23
19
7
2
10
29
45
-16
0
2
6. CLINICAS
19
19
6
1
12
25
38
-13
0
0

"""

# Separar por grupo
grupos = re.split(r"GRUPO\s+([A-C])", texto)
datos = []

for i in range(1, len(grupos), 2):
    grupo = grupos[i]
    contenido = grupos[i+1].strip().splitlines()

    j = 0
    while j < len(contenido):
        linea = contenido[j].strip()
        if re.match(r"\d+\.\s+", linea):
            nombre = re.sub(r"^\d+\.\s+", "", linea).strip()
            stats = []
            for k in range(1, 11):
                if j + k < len(contenido):
                    try:
                        stats.append(int(contenido[j + k].strip()))
                    except ValueError:
                        stats.append(0)
            if len(stats) == 10:
                datos.append({
                    "grupo": grupo,
                    "equipo": nombre,
                    "puntos": stats[0],
                    "PJ": stats[1],
                    "PG": stats[2],
                    "PE": stats[3],
                    "PP": stats[4],
                    "GF": stats[5],
                    "GC": stats[6],
                    "Dif": stats[7],
                    "Des": stats[8],
                    "Am": stats[9]
                })
            else:
                print(f"⚠️ Datos incompletos para: {nombre}")
            j += 11
        else:
            j += 1

# Guardar en JSON en la misma carpeta que el script
output_path = os.path.join(os.path.dirname(__file__), "datos.json")
try:
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(datos, f, indent=2)
    print(f"✅ Equipos procesados: {len(datos)}")
    print(f"Archivo guardado en: {output_path}")
except Exception as e:
    print(f"❌ Error al guardar datos.json: {e}")