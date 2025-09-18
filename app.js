fetch("datos.json")
  .then(res => res.json())
  .then(datos => {
    const contenedor = document.getElementById("contenedor-tablas");

    // Agrupar equipos por grupo
    const datos_por_grupo = {};
    datos.forEach(equipo => {
      const grupo = equipo.grupo;
      if (!datos_por_grupo[grupo]) {
        datos_por_grupo[grupo] = [];
      }
      datos_por_grupo[grupo].push(equipo);
    });

    // Crear tabla por grupo
    Object.entries(datos_por_grupo).forEach(([grupo, equipos]) => {
      const titulo = document.createElement("h2");
      titulo.textContent = `Grupo ${grupo}`;
      contenedor.appendChild(titulo);

      const tabla = document.createElement("table");
      tabla.innerHTML = `
        <thead>
          <tr>
            <th>Equipo</th>
            <th>Pts</th>
            <th>PJ</th>
            <th>PG</th>
            <th>PE</th>
            <th>PP</th>
            <th>GF</th>
            <th>GC</th>
            <th>Dif</th>
            <th>Des</th>
            <th>Am</th>
          </tr>
        </thead>
        <tbody>
          ${equipos.map(e => `
            <tr>
              <td>${e.equipo}</td>
              <td>${e.puntos}</td>
              <td>${e.PJ}</td>
              <td>${e.PG}</td>
              <td>${e.PE}</td>
              <td>${e.PP}</td>
              <td>${e.GF}</td>
              <td>${e.GC}</td>
              <td>${e.Dif}</td>
              <td>${e.Des}</td>
              <td>${e.Am}</td>
            </tr>
          `).join("")}
        </tbody>
      `;
      contenedor.appendChild(tabla);
    });
  })
  .catch(err => {
    console.error("Error al cargar datos:", err);
  });  // ...existing code...
  
  // Mostrar resultados de la última fecha con grupo y mejor diseño
    // ...existing code...
  
  fetch("resultados.json")
    .then(res => res.json())
    .then(resultados => {
      const contenedor = document.getElementById("contenedor-resultados");
      if (!contenedor) return;
  
      let html = `
        <table style="border-collapse:collapse;width:100%;margin-top:10px;">
          <thead>
            <tr>
              <th>Grupo</th>
              <th>Local</th>
              <th>Goles Local</th>
              <th>Visitante</th>
              <th>Goles Visitante</th>
            </tr>
          </thead>
          <tbody>
            ${resultados.map(r => {
              let claseLocal = "", claseVisitante = "";
              if (r.goles_local > r.goles_visitante) {
                claseLocal = "resultado-ganador";
                claseVisitante = "resultado-perdedor";
              } else if (r.goles_local < r.goles_visitante) {
                claseLocal = "resultado-perdedor";
                claseVisitante = "resultado-ganador";
              } else {
                claseLocal = claseVisitante = "resultado-empate";
              }
              return `
                <tr>
                  <td>${r.grupo || ""}</td>
                  <td class="${claseLocal}"><b>${r.local}</b></td>
                  <td class="${claseLocal}">${r.goles_local}</td>
                  <td class="${claseVisitante}"><b>${r.visitante}</b></td>
                  <td class="${claseVisitante}">${r.goles_visitante}</td>
                </tr>
              `;
            }).join("")}
          </tbody>
        </table>
      `;
      contenedor.innerHTML = html;
    })
    .catch(err => {
      console.error("Error al cargar resultados:", err);
    });