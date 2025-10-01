// Variable para controlar vista de tabla
let vistaCompleta = true;

// Variables globales para datos
let resultadosActuales = [];
let datosPrincipales = [];

// Función para cambiar pestañas
function cambiarPestana(pestana) {
  console.log('Cambiando a pestaña:', pestana);
  
  document.querySelectorAll('.contenido-pestana').forEach(contenido => {
    contenido.classList.remove('active');
  });
  
  document.querySelectorAll('.pestana').forEach(boton => {
    boton.classList.remove('active');
  });
  
  document.getElementById(`contenido-${pestana}`).classList.add('active');
  event.target.classList.add('active');
  
  switch(pestana) {
    case 'clasificacion':
      cargarTablaPosiciones();
      break;
    case 'goleadores':
      cargarGoleadores();
      break;
    case 'sanciones':
      cargarSanciones();
      break;
    case 'resultados':
      setTimeout(() => mostrarUltimaFecha(), 100);
      break;
    case 'proxima':
      cargarProximaFecha();
      break;
  }
}

// Función para generar últimos 5 resultados - CORREGIDA
function generarUltimos5Resultados(equipoNombre) {
  console.log(`🔍 Generando últimos 5 para: ${equipoNombre}`);
  
  if (!resultadosActuales || !Array.isArray(resultadosActuales) || resultadosActuales.length === 0) {
    console.warn('⚠️ No hay resultados disponibles');
    return generarResultadosVacios();
  }

  // Equivalencias de nombres para equipos
  const equivalencias = {
    'CRUZAZUL': ['CRUZ AZUL', 'CRUZAZUL'],
    'LA CORUNA': ['LA CORUNA', 'LA CORUÑA'],
    'LA CORUÑA': ['LA CORUNA', 'LA CORUÑA'],
    'LASALLE': ['LA SALLE', 'LASALLE'],
    // Puedes agregar más equivalencias si es necesario
  };

  // Normalizar el nombre para buscar equivalencias
  let nombresBusqueda = [equipoNombre];
  if (equivalencias[equipoNombre.toUpperCase()]) {
    nombresBusqueda = equivalencias[equipoNombre.toUpperCase()];
  }

  // Filtrar partidos del equipo considerando equivalencias
  const partidosEquipo = resultadosActuales.filter(r => 
    nombresBusqueda.includes(r.local) || nombresBusqueda.includes(r.visitante)
  );
  
  console.log(`📋 Partidos encontrados para ${equipoNombre}:`, partidosEquipo.length);

  if (partidosEquipo.length === 0) {
    console.warn(`⚠️ No se encontraron partidos para ${equipoNombre}`);
    return generarResultadosVacios();
  }

  // Ordenar por fecha (más reciente primero)
  partidosEquipo.sort((a, b) => {
    const fechaA = parseFecha(a.fecha);
    const fechaB = parseFecha(b.fecha);
    return fechaB - fechaA;
  });

  // Tomar los últimos 5
  const ultimos5 = partidosEquipo.slice(0, 5);

  // Calcular resultado de cada partido
  const resultados = ultimos5.map(partido => {
    const esLocal = partido.local === equipoNombre;
    const golesPropios = esLocal ? partido.golesLocal : partido.golesVisitante;
    const golesRival = esLocal ? partido.golesVisitante : partido.golesLocal;
    
    let resultado = 'E';
    if (golesPropios > golesRival) resultado = 'V';
    else if (golesPropios < golesRival) resultado = 'D';
    
    return resultado;
  });

  // Invertir para que el más antiguo quede a la izquierda y el más reciente a la derecha
  const resultadosOrdenados = resultados.reverse();
  console.log(`📊 Resultados de ${equipoNombre} (antiguo→reciente):`, resultadosOrdenados);

  return generarHTMLResultados(resultadosOrdenados);
}

// Función auxiliar para parsear fechas en formato DD/MM
function parseFecha(fechaStr) {
  if (!fechaStr) return new Date(0);
  
  const partes = fechaStr.trim().split('/');
  
  if (partes.length === 2) {
    const dia = parseInt(partes[0]);
    const mes = parseInt(partes[1]) - 1;
    return new Date(2025, mes, dia);
  } else if (partes.length === 3) {
    const dia = parseInt(partes[0]);
    const mes = parseInt(partes[1]) - 1;
    let anio = parseInt(partes[2]);
    if (anio < 100) anio += 2000;
    return new Date(anio, mes, dia);
  }
  
  return new Date(fechaStr);
}

// Generar HTML para los resultados
function generarHTMLResultados(resultados) {
  return resultados.map(resultado => {
    let color = '#FFC107'; // Empate
    if (resultado === 'V') color = '#4CAF50'; // Victoria
    else if (resultado === 'D') color = '#f44336'; // Derrota
    
    return `<span style="background-color: ${color}; color: white; padding: 2px 4px; margin: 1px; border-radius: 50%; display: inline-block; width: 16px; height: 16px; text-align: center; line-height: 16px; font-size: 9px; font-weight: bold; flex-shrink: 0;">${resultado}</span>`;
  }).join('');
}

// Generar resultados vacíos (5 empates grises)
function generarResultadosVacios() {
  const resultados = ['E', 'E', 'E', 'E', 'E'];
  return resultados.map(() => 
    `<span style="background-color: #cccccc; color: white; padding: 2px 4px; margin: 1px; border-radius: 50%; display: inline-block; width: 16px; height: 16px; text-align: center; line-height: 16px; font-size: 9px; font-weight: bold; flex-shrink: 0;">-</span>`
  ).join('');
}

// Función para cargar y procesar resultados al inicio
function cargarResultadosParaTabla() {
  console.log('📥 Cargando resultados_anteriores.json...');
  
  fetch('resultados_anteriores.json')
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      console.log('✅ JSON cargado correctamente:', data);
      
      // Tu JSON tiene formato: {fechaActualizacion: ..., resultados: [...]}
      if (data.resultados && Array.isArray(data.resultados)) {
        resultadosActuales = data.resultados;
        console.log(`✅ Total resultados procesados: ${resultadosActuales.length}`);
        console.log('📋 Primer resultado:', resultadosActuales[0]);
        
        // Recargar tabla si está activa
        const clasificacionTab = document.getElementById('contenido-clasificacion');
        if (clasificacionTab && clasificacionTab.classList.contains('active')) {
          cargarTablaPosiciones();
        }
      } else {
        console.error('❌ Formato de JSON no reconocido');
        resultadosActuales = [];
      }
    })
    .catch(error => {
      console.error('❌ Error cargando resultados_anteriores.json:', error);
      resultadosActuales = [];
    });
}

// Llamar al cargar la página
document.addEventListener('DOMContentLoaded', function() {
  console.log('✅ DOM cargado, iniciando app...');
  cargarResultadosParaTabla();
  setTimeout(() => cargarTablaPosiciones(), 500);
});

// Función para alternar vista de tabla
function alternarVistaTabla() {
  vistaCompleta = !vistaCompleta;
  cargarTablaPosiciones();
}

function obtenerEscudoEquipo(nombreEquipo) {
  const casosEspeciales = {
    'CLINICAS': 'imagenes/equipos/clinicas.jpg',
    'LOS MATADORES': 'imagenes/equipos/los-matadores.png',
    'UNIÃO Y AMISTAD': 'imagenes/equipos/union-y-amistad.png',
    'UNION Y AMISTAD': 'imagenes/equipos/union-y-amistad.png',
    'CRUZ AZUL': 'imagenes/equipos/cruzazul.png',
    'LASALLE': 'imagenes/equipos/lasalle.png',
    'LA SALLE': 'imagenes/equipos/lasalle.png',
    'BICHOS VERDES': 'imagenes/equipos/carasucias.png',
    'CARASUCIAS': 'imagenes/equipos/carasucias.png'
  };
  
  if (casosEspeciales[nombreEquipo.toUpperCase()]) {
    return casosEspeciales[nombreEquipo.toUpperCase()];
  }
  
  const nombre = nombreEquipo.toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/ñ/g, 'n')
    .replace(/[áäà]/g, 'a')
    .replace(/[éëè]/g, 'e')
    .replace(/[íïì]/g, 'i')
    .replace(/[óöò]/g, 'o')
    .replace(/[úüù]/g, 'u');
  
  return `imagenes/equipos/${nombre}.png`;
}

// Cargar tabla de posiciones
function cargarTablaPosiciones() {
  console.log('📊 Cargando tabla de posiciones...');
  
  fetch("datos.json")
    .then(res => res.json())
    .then(datos => {
      datosPrincipales = datos;
      const contenedor = document.getElementById("contenedor-tablas");
      contenedor.innerHTML = '';
      
      // Eliminar el botón VER MENOS de abajo, solo queda el de arriba
      
      // Agrupar equipos por grupo
      const datos_por_grupo = {};
      datos.forEach(equipo => {
        const grupo = equipo.grupo;
        if (!datos_por_grupo[grupo]) {
          datos_por_grupo[grupo] = [];
        }
        datos_por_grupo[grupo].push(equipo);
      });

      Object.entries(datos_por_grupo).forEach(([grupo, equipos]) => {
        const titulo = document.createElement("h2");
        titulo.textContent = `Grupo ${grupo}`;
        titulo.className = "titulo-grupo";
        contenedor.appendChild(titulo);

        const tabla = document.createElement("table");
        tabla.className = vistaCompleta ? "tabla-completa" : "tabla-reducida";

        if (vistaCompleta) {
          tabla.innerHTML = `
            <thead>
              <tr>
                <th style="width:32px;min-width:32px;text-align:center;">🏆</th>
                <th>Equipo</th>
                <th style="width:28px;min-width:28px;text-align:center;">Pts</th>
                <th style="width:28px;min-width:28px;text-align:center;">PJ</th>
                <th style="width:28px;min-width:28px;text-align:center;">PG</th>
                <th style="width:28px;min-width:28px;text-align:center;">PE</th>
                <th style="width:28px;min-width:28px;text-align:center;">PP</th>
                <th style="width:28px;min-width:28px;text-align:center;">GF</th>
                <th style="width:28px;min-width:28px;text-align:center;">GC</th>
                <th style="width:28px;min-width:28px;text-align:center;">Dif</th>
              </tr>
            </thead>
            <tbody>
              ${equipos.map((e, index) => `
                <tr class="${index < 3 ? `posicion-${index + 1}` : ''}">
                  <td class="posicion-equipo" style="width:32px;min-width:32px;text-align:center;">
                    <span class="posicion-num">${index + 1}</span>
                  </td>
                  <td class="equipo-con-escudo">
                    <div class="equipo-info">
                      <div class="equipo-nombre">
                        <img src="${obtenerEscudoEquipo(e.equipo)}" alt="${e.equipo}" class="escudo-equipo">
                        ${e.equipo}
                      </div>
                      <div class="ultimos-resultados-debajo">${generarUltimos5Resultados(e.equipo)}</div>
                    </div>
                  </td>
                  <td style="width:28px;min-width:28px;text-align:center;">${e.puntos}</td>
                  <td style="width:28px;min-width:28px;text-align:center;">${e.PJ}</td>
                  <td style="width:28px;min-width:28px;text-align:center;">${e.PG}</td>
                  <td style="width:28px;min-width:28px;text-align:center;">${e.PE}</td>
                  <td style="width:28px;min-width:28px;text-align:center;">${e.PP}</td>
                  <td style="width:28px;min-width:28px;text-align:center;">${e.GF}</td>
                  <td style="width:28px;min-width:28px;text-align:center;">${e.GC}</td>
                  <td style="width:28px;min-width:28px;text-align:center;">${e.Dif}</td>
                </tr>
              `).join("")}
            </tbody>
          `;
        } else {
          tabla.innerHTML = `
            <thead>
              <tr>
                <th style="width:32px;min-width:32px;text-align:center;">🏆</th>
                <th>Equipo</th>
                <th style="width:28px;min-width:28px;text-align:center;">Pts</th>
                <th style="width:28px;min-width:28px;text-align:center;">PJ</th>
                <th style="width:28px;min-width:28px;text-align:center;">Dif</th>
              </tr>
            </thead>
            <tbody>
              ${equipos.map((e, index) => `
                <tr class="${index < 3 ? `posicion-${index + 1}` : ''}">
                  <td class="posicion-equipo" style="width:32px;min-width:32px;text-align:center;">
                    <span class="posicion-num">${index + 1}</span>
                  </td>
                  <td class="equipo-con-escudo">
                    <div class="equipo-info">
                      <div class="equipo-nombre">
                        <img src="${obtenerEscudoEquipo(e.equipo)}" alt="${e.equipo}" class="escudo-equipo">
                        ${e.equipo}
                      </div>
                      <div class="ultimos-resultados-debajo">${generarUltimos5Resultados(e.equipo)}</div>
                    </div>
                  </td>
                  <td style="width:28px;min-width:28px;text-align:center;">${e.puntos}</td>
                  <td style="width:28px;min-width:28px;text-align:center;">${e.PJ}</td>
                  <td style="width:28px;min-width:28px;text-align:center;">${e.Dif}</td>
                </tr>
              `).join("")}
            </tbody>
          `;
        }
        contenedor.appendChild(tabla);
      });
    })
    .catch(err => console.error("❌ Error al cargar datos:", err));
}

// Resto de funciones (goleadores, sanciones, etc.)
function cargarGoleadores() {
  console.log('⚽ Cargando goleadores...');
  const contenedor = document.getElementById("contenedor-goleadores");
  if (!contenedor) return;
  
  contenedor.innerHTML = '<p style="text-align: center;">Cargando goleadores...</p>';
  
  fetch('goleadores.json')
    .then(response => response.json())
    .then(data => {
      const tabla = document.createElement("table");
      tabla.style.cssText = "width: 100%; border-collapse: collapse;";
      tabla.innerHTML = `
        <thead>
          <tr style="background: #D2691E; color: white;">
            <th style="padding: 12px 8px;">POS</th>
            <th style="padding: 12px 15px; text-align: left;">JUGADOR</th>
            <th style="padding: 12px 8px;">EQUIPO</th>
            <th style="padding: 12px 8px;">GOLES</th>
          </tr>
        </thead>
        <tbody>
          ${data.jugadores.map(g => `
            <tr>
              <td style="font-weight: bold; color: #D2691E;">${g.posicion}°</td>
              <td style="text-align: left; padding-left: 15px;">${g.nombre}</td>
              <td><img src="${obtenerEscudoEquipo(g.equipo)}" alt="${g.equipo}" class="escudo-goleador" style="width: 30px; height: 30px; border-radius: 50%;" title="${g.equipo}"></td>
              <td style="font-weight: bold; font-size: 1.3em;">${g.goles}</td>
            </tr>
          `).join("")}
        </tbody>
      `;
      
      contenedor.innerHTML = '';
      contenedor.appendChild(tabla);
    })
    .catch(error => {
      console.error('❌ Error cargando goleadores:', error);
      contenedor.innerHTML = '<p style="text-align: center; color: red;">Error cargando goleadores</p>';
    });
}

function cargarSanciones() {
  console.log('🟨 Cargando sanciones...');
  const contenedor = document.getElementById("contenedor-sanciones");
  if (!contenedor) return;
  
  contenedor.innerHTML = '<p style="text-align: center;">Cargando sanciones...</p>';
  
  fetch('sanciones.json')
    .then(response => response.json())
    .then(data => {
      const tabla = document.createElement("table");
      tabla.innerHTML = `
        <thead>
          <tr style="background: #D2691E; color: white;">
            <th>JUGADOR</th>
            <th>EQUIPO</th>
            <th>FECHAS</th>
            <th>MOTIVO</th>
          </tr>
        </thead>
        <tbody>
          ${data.sanciones.map(s => `
            <tr>
              <td style="font-weight: bold; text-align: left;">${s.jugador}</td>
              <td><img src="${obtenerEscudoEquipo(s.equipo)}" alt="${s.equipo}" style="width: 20px; height: 20px; border-radius: 50%;" title="${s.equipo}"></td>
              <td style="font-weight: bold; color: ${s.fechas > 0 ? '#ff0000' : '#00aa00'};">${s.fechas}</td>
              <td style="font-size: 0.8em;">${s.motivo || '-'}</td>
            </tr>
          `).join("")}
        </tbody>
      `;
      
      contenedor.innerHTML = '';
      contenedor.appendChild(tabla);
    })
    .catch(error => {
      console.error('❌ Error cargando sanciones:', error);
      contenedor.innerHTML = '<p style="text-align: center; color: red;">Error cargando sanciones</p>';
    });
}

function cargarProximaFecha() {
  console.log('📅 Cargando próxima fecha...');
  const contenedor = document.getElementById("contenedor-proxima-fecha");
  if (!contenedor) return;
  
  fetch('proxima_fecha.json')
    .then(res => res.json())
    .then(partidos => {
      if (!partidos || partidos.length === 0) {
        contenedor.innerHTML = '<p style="text-align: center;">No hay partidos programados</p>';
        return;
      }
      
      const tabla = document.createElement("table");
      tabla.innerHTML = `
        <thead>
          <tr style="background: #D2691E; color: white;">
            <th>LOCAL</th>
            <th>VS</th>
            <th>VISITANTE</th>
            <th>FECHA</th>
            <th>HORA</th>
            <th>CANCHA</th>
          </tr>
        </thead>
        <tbody>
          ${partidos.map(p => `
            <tr>
              <td><img src="${p.equipo_local.escudo}" style="width: 30px; height: 30px;"> ${p.equipo_local.nombre}</td>
              <td style="font-weight: bold;">VS</td>
              <td><img src="${p.equipo_visitante.escudo}" style="width: 30px; height: 30px;"> ${p.equipo_visitante.nombre}</td>
              <td>${p.fecha}</td>
              <td>${p.hora}</td>
              <td>${p.cancha}</td>
            </tr>
          `).join("")}
        </tbody>
      `;
      
      contenedor.innerHTML = '';
      contenedor.appendChild(tabla);
    })
    .catch(error => {
      console.error('❌ Error cargando próxima fecha:', error);
      contenedor.innerHTML = '<p style="text-align: center; color: red;">Error cargando próxima fecha</p>';
    });
}

function mostrarUltimaFecha() {
  console.log('📋 Mostrando última fecha...');
  // Implementar según necesites
}

console.log('✅ App.js cargado completamente');