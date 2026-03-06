import prisma from '../config/prisma.js';

// Eliminamos "detalles" de los parámetros para que coincida con el controlador
export const registrarLog = async (req, accion, datosNuevos, datosAnteriores = null, ordenId = null) => {
  try {
    const userId = req.user?.id;
    if (!userId) return;

    req.logManualRealizado = true; // Bloquea el duplicado del middleware

    let cambios = {};

    // Solo comparamos si realmente tenemos ambos objetos
    if (datosAnteriores && typeof datosAnteriores === 'object' && datosNuevos) {
      
      // 1. Comparar Cabecera (Estado, Total)
      ['estado', 'totalFinal'].forEach(key => {
        const vV = datosAnteriores[key]?.toString();
        const vN = datosNuevos[key]?.toString();
        // Si hay un cambio real, lo guardamos
        if (vN !== undefined && vV !== vN) {
          cambios[key] = { de: vV, a: vN };
        }
      });

      // 2. Comparar Listas de Detalles (Repuestos, Servicios, Terceros)
      const analizar = (nombreArr, idKey, valorNuevo, valorViejo) => {
        const viejos = datosAnteriores[nombreArr] || [];
        const nuevos = datosNuevos[nombreArr] || [];
        const diffs = [];

        nuevos.forEach(n => {
          const v = viejos.find(item => item[idKey] === n[idKey]);
          const desc = n.descripcion || v?.material?.descripcion || v?.descripcion || "Ítem";

          if (!v) {
            // Es un ítem que no estaba antes en la orden
            diffs.push({ accion: 'AÑADIDO', item: desc, valor: n[valorNuevo] });
          } else {
            // Comprobamos si cambió cantidad o precio
            const cantV = Number(v.cantidad || 1);
            const cantN = Number(n.cantidad || 1);
            const precioV = Number(v[valorViejo]);
            const precioN = Number(n[valorNuevo]);

            if (cantV !== cantN || precioV !== precioN) {
              diffs.push({ 
                accion: 'MODIFICADO', 
                item: desc, 
                de: `Cant: ${cantV} - S/ ${precioV.toFixed(2)}`, 
                a: `Cant: ${cantN} - S/ ${precioN.toFixed(2)}` 
              });
            }
          }
        });

        // Detectar ítems que fueron removidos de la orden
        viejos.forEach(v => {
          if (!nuevos.some(n => n[idKey] === v[idKey])) {
            const desc = v.material?.descripcion || v.descripcion || "Ítem";
            diffs.push({ accion: 'ELIMINADO', item: desc });
          }
        });

        if (diffs.length > 0) cambios[nombreArr] = diffs;
      };

      // Mapeo correcto de campos entre Body y Base de Datos
      analizar('materiales', 'materialId', 'precioAlMomento', 'precioAplicado');
      analizar('servicios', 'servicioId', 'monto', 'monto');
      analizar('terceros', 'terceroId', 'monto', 'monto');
    }

    // Insertar en la base de datos
    await prisma.logActividad.create({
      data: {
        usuarioId: userId,
        accion: accion,
        // Guardamos 'cambios' solo si hay algo, sino el log queda con la acción simple
        detalles: Object.keys(cambios).length > 0 ? JSON.stringify(cambios) : null,
        ordenId: ordenId ? parseInt(ordenId) : null,
      }
    });
  } catch (error) {
    console.error("❌ Error en logger manual:", error.message);
  }
};