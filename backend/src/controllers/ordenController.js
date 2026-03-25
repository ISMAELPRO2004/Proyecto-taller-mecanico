import prisma from '../config/prisma.js';
import { registrarLog } from '../utils/logger.js';

// --- CREAR ORDEN (Tu lógica optimizada) ---
export const crearOrden = async (req, res) => {
  const {
    clienteNombre, clienteCelular, trabajoSolicitado,
    placa, marca, modelo, horometro, kilometraje,
    materiales, servicios, terceros, responsableId
  } = req.body;

  try {
    const resultado = await prisma.$transaction(async (tx) => {
      const year = new Date().getFullYear();
      const count = await tx.ordenTrabajo.count();
      const numeroOrden = `OT-${year}-${(count + 1).toString().padStart(4, '0')}`;

      const totalMat = materiales?.reduce((acc, m) => acc + (parseFloat(m.cantidad || 0) * parseFloat(m.precioAlMomento || 0)), 0) || 0;
      const totalServ = servicios?.reduce((acc, s) => acc + parseFloat(s.monto || 0), 0) || 0;
      const totalTerc = terceros?.reduce((acc, t) => acc + parseFloat(t.monto || 0), 0) || 0;
      const totalCalculado = totalMat + totalServ + totalTerc;

      const vehiculo = await tx.vehiculo.upsert({
        where: { placa: placa.trim().toUpperCase() },
        update: { horometro: parseFloat(horometro || 0), kilometraje: parseFloat(kilometraje || 0) },
        create: {
          placa: placa.trim().toUpperCase(),
          marca: marca || 'Genérica',
          modelo: modelo || 'Genérico',
          horometro: parseFloat(horometro || 0),
          kilometraje: parseFloat(kilometraje || 0)
        }
      });

      const nuevaOrden = await tx.ordenTrabajo.create({
        data: {
          numeroOrden,
          clienteNombre,
          clienteCelular: clienteCelular || '',
          trabajoSolicitado: trabajoSolicitado || 'Mantenimiento General',
          placa: vehiculo.placa,
          marca: vehiculo.marca,
          modelo: vehiculo.modelo,
          horometro: vehiculo.horometro,
          kilometraje: vehiculo.kilometraje,
          creadorId: req.user.id,
          responsableId: parseInt(responsableId),
          totalFinal: totalCalculado,
          estado: 'EN_REPARACION'
        }
      });

      if (materiales?.length > 0) {
        await tx.oTMaterial.createMany({
          data: materiales.map(m => ({
            ordenId: nuevaOrden.id,
            materialId: m.materialId,
            cantidad: parseFloat(m.cantidad),
            precioAplicado: parseFloat(m.precioAlMomento)
          }))
        });
      }

      if (servicios?.length > 0) {
        await tx.oTServicio.createMany({
          data: servicios.map(s => ({
            ordenId: nuevaOrden.id,
            servicioId: s.servicioId,
            descripcion: s.descripcion,
            monto: parseFloat(s.monto || 0)
          }))
        });
      }

      if (terceros?.length > 0) {
        await tx.oTTercero.createMany({
          data: terceros.map(t => ({
            ordenId: nuevaOrden.id,
            terceroId: t.terceroId,
            descripcion: t.descripcion,
            monto: parseFloat(t.monto || 0)
          }))
        });
      }

      return nuevaOrden;
    });

    await registrarLog(req, "REGISTRO DE NUEVA ORDEN DE TRABAJO", resultado, null, resultado.id);

    res.status(201).json(resultado);
  } catch (error) {
    res.status(400).json({ message: "Error al procesar", error: error.message });
  }
};

// --- LISTAR TODAS LAS ÓRDENES ---
export const listarOrdenes = async (req, res) => {
  try {
    const ordenes = await prisma.ordenTrabajo.findMany({
      include: {
        responsable: { select: { nombreCompleto: true } }
      },
      orderBy: { fechaCreacion: 'desc' }
    });
    res.json(ordenes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// --- OBTENER DETALLE COMPLETO (Para el Modal) ---
export const obtenerOrdenPorId = async (req, res) => {
  const { id } = req.params;
  try {
    const orden = await prisma.ordenTrabajo.findUnique({
      where: { id: parseInt(id) },
      include: {
        responsable: true,
        creador: true,
        materiales: { include: { material: true } },
        servicios: { include: { servicio: true } },
        terceros: { include: { tercero: true } }
      }
    });
    if (!orden) return res.status(404).json({ message: "Orden no encontrada" });
    res.json(orden);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const actualizarOrden = async (req, res) => {
  const { id } = req.params;
  const {
    clienteNombre, clienteCelular, trabajoSolicitado,
    placa, marca, modelo, horometro, kilometraje,
    materiales, servicios, terceros, responsableId, estado
  } = req.body;

  try {
    const ordenPrevia = await prisma.ordenTrabajo.findUnique({
      where: { id: parseInt(id) },
      include: {
        materiales: { include: { material: true } }, // Incluimos para tener la descripción
        servicios: true,
        terceros: true
      }
    });

    if (!ordenPrevia) throw new Error("Orden no encontrada");

    const resultado = await prisma.$transaction(async (tx) => {
      // 1. Verificar si la orden existe y su estado actual
      const ordenExistente = await tx.ordenTrabajo.findUnique({
        where: { id: parseInt(id) }
      });

      if (!ordenExistente) throw new Error("La orden no existe.");

      // 2. Bloqueo de seguridad: Si ya está terminada o cancelada, no se toca
      if (['TERMINADO', 'CANCELADO'].includes(ordenExistente.estado)) {
        throw new Error("No se puede modificar una orden que ya ha sido cerrada o cancelada.");
      }

      // 3. Recalcular Totales con los nuevos datos recibidos
      const totalMat = materiales?.reduce((acc, m) => acc + (parseFloat(m.cantidad || 0) * parseFloat(m.precioAlMomento || 0)), 0) || 0;
      const totalServ = servicios?.reduce((acc, s) => acc + parseFloat(s.monto || 0), 0) || 0;
      const totalTerc = terceros?.reduce((acc, t) => acc + parseFloat(t.monto || 0), 0) || 0;
      const totalCalculado = totalMat + totalServ + totalTerc;

      // 4. Actualizar datos del Vehículo (por si cambiaron km u horómetro durante el servicio)
      await tx.vehiculo.update({
        where: { placa: placa.trim().toUpperCase() },
        data: {
          horometro: parseFloat(horometro || 0),
          kilometraje: parseFloat(kilometraje || 0)
        }
      });

      // 5. Limpiar detalles antiguos para evitar duplicados o IDs huérfanos
      await tx.oTMaterial.deleteMany({ where: { ordenId: parseInt(id) } });
      await tx.oTServicio.deleteMany({ where: { ordenId: parseInt(id) } });
      await tx.oTTercero.deleteMany({ where: { ordenId: parseInt(id) } });

      // 6. Actualizar Cabecera de la Orden
      const ordenActualizada = await tx.ordenTrabajo.update({
        where: { id: parseInt(id) },
        data: {
          clienteNombre,
          clienteCelular,
          trabajoSolicitado,
          marca,
          modelo,
          horometro: parseFloat(horometro || 0),
          kilometraje: parseFloat(kilometraje || 0),
          responsableId: parseInt(responsableId),
          totalFinal: totalCalculado,
          estado: estado || ordenExistente.estado // Permite cambiar el estado en la misma edición
        }
      });

      // 7. Reinsertar los nuevos Detalles
      if (materiales?.length > 0) {
        await tx.oTMaterial.createMany({
          data: materiales.map(m => ({
            ordenId: ordenActualizada.id,
            materialId: m.materialId,
            cantidad: parseFloat(m.cantidad),
            precioAplicado: parseFloat(m.precioAlMomento)
          }))
        });
      }

      if (servicios?.length > 0) {
        await tx.oTServicio.createMany({
          data: servicios.map(s => ({
            ordenId: ordenActualizada.id,
            servicioId: s.servicioId,
            descripcion: s.descripcion,
            monto: parseFloat(s.monto || 0)
          }))
        });
      }

      if (terceros?.length > 0) {
        await tx.oTTercero.createMany({
          data: terceros.map(t => ({
            ordenId: ordenActualizada.id,
            terceroId: t.terceroId,
            descripcion: t.descripcion,
            monto: parseFloat(t.monto || 0)
          }))
        });
      }

      return ordenActualizada;
    });

    await registrarLog(req, "ACTUALIZAR ORDEN DE TRABAJO", req.body, ordenPrevia, id);

    res.json(resultado);
  } catch (error) {
    console.error("❌ Error al actualizar la orden:", error.message);
    res.status(400).json({ message: error.message });
  }
};

// --- ACTUALIZAR ESTADO ---
export const actualizarEstadoOrden = async (req, res) => {
  const { id } = req.params;
  const { estado } = req.body;
  try {
    const actualizada = await prisma.ordenTrabajo.update({
      where: { id: parseInt(id) },
      data: { estado }
    });
    res.json(actualizada);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// --- ELIMINAR ORDEN (Con limpieza de detalles) ---
export const eliminarOrden = async (req, res) => {
  const { id } = req.params;
  try {
    // 1. Obtener snapshot completo antes de borrarlo todo
    const ordenPrevia = await prisma.ordenTrabajo.findUnique({
      where: { id: parseInt(id) },
      include: { materiales: true, servicios: true, terceros: true }
    });
    
      await prisma.$transaction([
        prisma.oTMaterial.deleteMany({ where: { ordenId: parseInt(id) } }),
        prisma.oTServicio.deleteMany({ where: { ordenId: parseInt(id) } }),
        prisma.oTTercero.deleteMany({ where: { ordenId: parseInt(id) } }),
        prisma.ordenTrabajo.delete({ where: { id: parseInt(id) } })
      ]);
      await registrarLog(req, "ELIMINAR ORDEN DE TRABAJO", null, ordenPrevia, id);
      res.json({ message: "Orden eliminada exitosamente" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};