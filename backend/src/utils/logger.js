import prisma from '../config/prisma.js';

/**
 * Registra actividad en la base de datos de forma inteligente.
 * @param {Object} req - Request de Express para usuario e IP.
 * @param {String} accion - Título de la acción (Ej: 'CREAR USUARIO').
 * @param {Object} nuevos - Datos que se están guardando (opcional).
 * @param {Object} anteriores - Datos previos de la DB para comparar (opcional).
 * @param {Number} ordenId - ID de la orden si aplica (opcional).
 */
export const registrarLog = async (req, accion, nuevos = null, anteriores = null, ordenId = null) => {
  try {
    const userId = req.user?.id;
    if (!userId) return;

    req.logManualRealizado = true; // Evita duplicados del middleware global
    let detallesFinales = null;

    // --- CASO 1: CREACIÓN (Hay nuevos, pero no anteriores) ---
    if (nuevos && !anteriores) {
      // Guardamos un snapshot completo de lo que se creó
      detallesFinales = { tipo: 'CREACION', datos: nuevos };
    }

    // --- CASO 2: ELIMINACIÓN (Hay anteriores, pero no nuevos) ---
    else if (anteriores && !nuevos) {
      // Guardamos lo que se borró para tener un respaldo (Snapshot de seguridad)
      detallesFinales = { tipo: 'ELIMINACION', datos_borrados: anteriores };
    }

    // --- CASO 3: EDICIÓN (Existen ambos) ---
    else if (anteriores && nuevos) {
      const cambios = {};

      // A. Lógica para Órdenes (Comparación Profunda)
      if (accion.includes('ORDEN')) {
        // Mantenemos tu lógica de cabecera
        ['estado', 'totalFinal', 'clienteNombre', 'placa'].forEach(key => {
          if (nuevos[key] !== undefined && anteriores[key]?.toString() !== nuevos[key]?.toString()) {
            cambios[key] = { de: anteriores[key], a: nuevos[key] };
          }
        });

        // Tu lógica de analizar listas (materiales, servicios, terceros)
        const analizarLista = (nombreArr, idKey, valN, valV) => {
          const vjs = anteriores[nombreArr] || [];
          const nvs = nuevos[nombreArr] || [];
          const diffs = [];

          nvs.forEach(n => {
            const v = vjs.find(item => item[idKey] === n[idKey]);
            const desc = n.descripcion || v?.material?.descripcion || v?.descripcion || "Item";
            if (!v) diffs.push({ accion: 'AÑADIDO', item: desc, valor: n[valN] });
            else {
              const pV = Number(v[valV]); const pN = Number(n[valN]);
              const cV = Number(v.cantidad || 1); const cN = Number(n.cantidad || 1);
              if (cV !== cN || pV !== pN) {
                diffs.push({ accion: 'MODIFICADO', item: desc, de: `Cant: ${cV} - S/ ${pV}`, a: `Cant: ${cN} - S/ ${pN}` });
              }
            }
          });

          vjs.forEach(v => {
            if (!nvs.some(n => n[idKey] === v[idKey])) {
              const desc = v.material?.descripcion || v.descripcion || "Item";
              diffs.push({ accion: 'ELIMINADO', item: desc });
            }
          });
          if (diffs.length > 0) cambios[nombreArr] = diffs;
        };

        analizarLista('materiales', 'materialId', 'precioAlMomento', 'precioAplicado');
        analizarLista('servicios', 'servicioId', 'monto', 'monto');
        analizarLista('terceros', 'terceroId', 'monto', 'monto');
      } 
      
      // B. Lógica para Usuarios / Inventario / Otros (Comparación Simple)
      else {
        // Comparamos todas las llaves que vengan en el objeto nuevo
        Object.keys(nuevos).forEach(key => {
          // Ignoramos campos técnicos o sensibles como el password
          if (['password', 'ActualizadoEn', 'CreadoEn'].includes(key)) return;
          
          if (anteriores[key] !== undefined && anteriores[key]?.toString() !== nuevos[key]?.toString()) {
            cambios[key] = { de: anteriores[key], a: nuevos[key] };
          }
        });
      }

      detallesFinales = Object.keys(cambios).length > 0 ? { tipo: 'EDICION', cambios } : null;
    }

    // Insertar en la tabla LogActividad
    await prisma.logActividad.create({
      data: {
        usuarioId: userId,
        accion: accion,
        detalles: detallesFinales ? JSON.stringify(detallesFinales) : null,
        ordenId: ordenId ? parseInt(ordenId) : null,
      }
    });
  } catch (error) {
    console.error("❌ Error Auditoría Universal:", error.message);
  }
};