import prisma from '../config/prisma.js';

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
    await prisma.$transaction([
      prisma.oTMaterial.deleteMany({ where: { ordenId: parseInt(id) } }),
      prisma.oTServicio.deleteMany({ where: { ordenId: parseInt(id) } }),
      prisma.oTTercero.deleteMany({ where: { ordenId: parseInt(id) } }),
      prisma.ordenTrabajo.delete({ where: { id: parseInt(id) } })
    ]);
    res.json({ message: "Orden eliminada exitosamente" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};