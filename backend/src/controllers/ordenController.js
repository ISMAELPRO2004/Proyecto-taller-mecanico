import prisma from '../config/prisma.js';
import { registrarLog } from '../utils/logger.js';

// ─── CREAR ORDEN ──────────────────────────────────────────────────────────────
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
          kilometraje: parseFloat(kilometraje || 0),
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
          estado: 'EN_REPARACION',
        }
      });

      if (materiales?.length > 0) {
        await tx.oTMaterial.createMany({
          data: materiales.map(m => ({
            ordenId: nuevaOrden.id,
            materialId: m.materialId,
            cantidad: parseFloat(m.cantidad),
            precioAplicado: parseFloat(m.precioAlMomento),
          }))
        });
      }

      if (servicios?.length > 0) {
        await tx.oTServicio.createMany({
          data: servicios.map(s => ({
            ordenId: nuevaOrden.id,
            servicioId: s.servicioId,
            descripcion: s.descripcion,
            monto: parseFloat(s.monto || 0),
          }))
        });
      }

      if (terceros?.length > 0) {
        await tx.oTTercero.createMany({
          data: terceros.map(t => ({
            ordenId: nuevaOrden.id,
            terceroId: t.terceroId,
            descripcion: t.descripcion,
            monto: parseFloat(t.monto || 0),
          }))
        });
      }

      return nuevaOrden;
    });

    const responsableCreacion = await prisma.usuario.findUnique({
      where: { id: parseInt(responsableId) },
      select: { nombreCompleto: true }
    });

    await registrarLog(req, 'CREAR ORDEN', {
      ...req.body,
      responsable: responsableCreacion?.nombreCompleto ?? responsableId,
    }, null, resultado.id);

    res.status(201).json(resultado);
  } catch (error) {
    res.status(400).json({ message: 'Error al procesar', error: error.message });
  }
};

// ─── LISTAR TODAS LAS ÓRDENES ─────────────────────────────────────────────────
export const listarOrdenes = async (req, res) => {
  try {
    const ordenes = await prisma.ordenTrabajo.findMany({
      include: { responsable: { select: { nombreCompleto: true } } },
      orderBy: { fechaCreacion: 'desc' }
    });
    res.json(ordenes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ─── OBTENER DETALLE COMPLETO ─────────────────────────────────────────────────
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
        terceros: { include: { tercero: true } },
      }
    });
    if (!orden) return res.status(404).json({ message: 'Orden no encontrada' });
    res.json(orden);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ─── ACTUALIZAR ORDEN ─────────────────────────────────────────────────────────
export const actualizarOrden = async (req, res) => {
  const { id } = req.params;
  const {
    clienteNombre, clienteCelular, trabajoSolicitado,
    placa, marca, modelo, horometro, kilometraje,
    materiales, servicios, terceros, responsableId, estado
  } = req.body;

  try {
    // ── SNAPSHOT PREVIO ──
    // Crítico: incluir material/servicio/tercero para tener la descripción
    // y usar los mismos campos que normalizarItems espera de la DB
    const ordenPrevia = await prisma.ordenTrabajo.findUnique({
      where: { id: parseInt(id) },
      include: {
        responsable: { select: { nombreCompleto: true } },
        materiales: { include: { material: true } },
        servicios: { include: { servicio: true } },
        terceros: { include: { tercero: true } },
      }
    });

    if (!ordenPrevia) return res.status(404).json({ message: 'Orden no encontrada' });

    if (['TERMINADO', 'CANCELADO'].includes(ordenPrevia.estado)) {
      return res.status(400).json({ message: 'No se puede modificar una orden cerrada o cancelada.' });
    }

    const resultado = await prisma.$transaction(async (tx) => {
      const totalMat = materiales?.reduce((acc, m) => acc + (parseFloat(m.cantidad || 0) * parseFloat(m.precioAlMomento || 0)), 0) || 0;
      const totalServ = servicios?.reduce((acc, s) => acc + parseFloat(s.monto || 0), 0) || 0;
      const totalTerc = terceros?.reduce((acc, t) => acc + parseFloat(t.monto || 0), 0) || 0;
      const totalCalculado = totalMat + totalServ + totalTerc;

      await tx.vehiculo.update({
        where: { placa: placa.trim().toUpperCase() },
        data: {
          horometro: parseFloat(horometro || 0),
          kilometraje: parseFloat(kilometraje || 0),
        }
      });

      await tx.oTMaterial.deleteMany({ where: { ordenId: parseInt(id) } });
      await tx.oTServicio.deleteMany({ where: { ordenId: parseInt(id) } });
      await tx.oTTercero.deleteMany({ where: { ordenId: parseInt(id) } });

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
          estado: estado || ordenPrevia.estado,
        }
      });

      if (materiales?.length > 0) {
        await tx.oTMaterial.createMany({
          data: materiales.map(m => ({
            ordenId: ordenActualizada.id,
            materialId: m.materialId,
            cantidad: parseFloat(m.cantidad),
            precioAplicado: parseFloat(m.precioAlMomento),
          }))
        });
      }

      if (servicios?.length > 0) {
        await tx.oTServicio.createMany({
          data: servicios.map(s => ({
            ordenId: ordenActualizada.id,
            servicioId: s.servicioId,
            descripcion: s.descripcion,
            monto: parseFloat(s.monto || 0),
          }))
        });
      }

      if (terceros?.length > 0) {
        await tx.oTTercero.createMany({
          data: terceros.map(t => ({
            ordenId: ordenActualizada.id,
            terceroId: t.terceroId,
            descripcion: t.descripcion,
            monto: parseFloat(t.monto || 0),
          }))
        });
      }

      return ordenActualizada;
    });

    const nuevoResponsable = await prisma.usuario.findUnique({
      where: { id: parseInt(responsableId) },
      select: { nombreCompleto: true }
    });

    // Normalizar anterior: reemplazar objeto responsable por nombre legible
    const anteriorNormalizado = {
      clienteNombre: ordenPrevia.clienteNombre,
      clienteCelular: ordenPrevia.clienteCelular,
      trabajoSolicitado: ordenPrevia.trabajoSolicitado,
      placa: ordenPrevia.placa,
      marca: ordenPrevia.marca,
      modelo: ordenPrevia.modelo,
      horometro: ordenPrevia.horometro,
      kilometraje: ordenPrevia.kilometraje,
      estado: ordenPrevia.estado,
      totalFinal: ordenPrevia.totalFinal,
      responsable: ordenPrevia.responsable?.nombreCompleto ?? '—', // ← nombre legible
      materiales: ordenPrevia.materiales,
      servicios: ordenPrevia.servicios,
      terceros: ordenPrevia.terceros,
    };

    // Normalizar nuevo: reemplazar responsableId número por nombre legible
    const nuevoNormalizado = {
      clienteNombre,
      clienteCelular,
      trabajoSolicitado,
      placa,
      marca,
      modelo,
      horometro,
      kilometraje,
      estado: estado || ordenPrevia.estado,
      totalFinal: resultado.totalFinal,
      responsable: nuevoResponsable?.nombreCompleto ?? responsableId, // ← mismo campo
      materiales,
      servicios,
      terceros,
    };

    // ── LOG EDICIÓN ──
    // anteriores = snapshot de DB con includes (tiene material.descripcion)
    // nuevos     = req.body del frontend (tiene precioAlMomento)
    // normalizarItems en el logger unifica ambos formatos correctamente
    await registrarLog(req, 'ACTUALIZAR ORDEN', nuevoNormalizado, anteriorNormalizado, id);

    res.json(resultado);
  } catch (error) {
    console.error('❌ Error al actualizar la orden:', error.message);
    res.status(400).json({ message: error.message });
  }
};

// ─── ACTUALIZAR ESTADO ────────────────────────────────────────────────────────
// Este endpoint estaba sin log — ahora registra el cambio de estado
export const actualizarEstadoOrden = async (req, res) => {
  const { id } = req.params;
  const { estado } = req.body;

  try {
    // Snapshot previo para registrar de qué estado a cuál cambió
    const ordenPrevia = await prisma.ordenTrabajo.findUnique({
      where: { id: parseInt(id) },
      select: { estado: true, clienteNombre: true, numeroOrden: true }
    });

    if (!ordenPrevia) return res.status(404).json({ message: 'Orden no encontrada' });

    const actualizada = await prisma.ordenTrabajo.update({
      where: { id: parseInt(id) },
      data: { estado }
    });

    // LOG: compara { estado } nuevo vs snapshot previo
    await registrarLog(
      req,
      'CAMBIO DE ESTADO',
      { estado },
      { estado: ordenPrevia.estado },
      id
    );

    res.json(actualizada);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// ─── ELIMINAR ORDEN ───────────────────────────────────────────────────────────
export const eliminarOrden = async (req, res) => {
  const { id } = req.params;
  try {
    const ordenPrevia = await prisma.ordenTrabajo.findUnique({
      where: { id: parseInt(id) },
      include: {
        responsable: { select: { nombreCompleto: true } },
        materiales: { include: { material: true } },
        servicios: { include: { servicio: true } },
        terceros: { include: { tercero: true } },
      }
    });

    if (!ordenPrevia) return res.status(404).json({ message: 'Orden no encontrada' });

    await prisma.$transaction([
      prisma.oTMaterial.deleteMany({ where: { ordenId: parseInt(id) } }),
      prisma.oTServicio.deleteMany({ where: { ordenId: parseInt(id) } }),
      prisma.oTTercero.deleteMany({ where: { ordenId: parseInt(id) } }),
      prisma.ordenTrabajo.delete({ where: { id: parseInt(id) } }),
    ]);

    // LOG: sin ordenId porque la orden ya no existe en DB
    await registrarLog(req, 'ELIMINAR ORDEN', null, {
      ...ordenPrevia,
      responsable: ordenPrevia.responsable?.nombreCompleto ?? '—',
    }, null);

    res.json({ message: 'Orden eliminada exitosamente' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};