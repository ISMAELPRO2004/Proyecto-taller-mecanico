import prisma from '../config/prisma.js';

export const crearOrden = async (req, res) => {
  const {
    clienteNombre, clienteCelular, trabajoSolicitado,
    placa, marca, modelo, horometro, kilometraje,
    materiales, servicios, terceros, responsableId
  } = req.body;

  try {
    const resultado = await prisma.$transaction(async (tx) => {
      // 1. Generar Código Correlativo OT-2026-XXXX
      const count = await tx.ordenTrabajo.count();
      const numeroOrden = `OT-${new Date().getFullYear()}-${(count + 1).toString().padStart(4, '0')}`;

      // 2. Calcular Totales en el servidor
      const totalMat = materiales?.reduce((acc, m) => acc + (parseFloat(m.cantidad) * parseFloat(m.precioAlMomento)), 0) || 0;
      const totalServ = servicios?.reduce((acc, s) => acc + parseFloat(s.monto || 0), 0) || 0;
      const totalTerc = terceros?.reduce((acc, t) => acc + parseFloat(t.monto || 0), 0) || 0;
      const totalFinalCalculado = totalMat + totalServ + totalTerc;

      const vehiculo = await tx.vehiculo.upsert({
        where: { placa: placa.trim().toUpperCase() },
        update: { horometro: parseFloat(horometro || 0), kilometraje: parseFloat(kilometraje || 0) },
        create: { placa: placa.trim().toUpperCase(), marca, modelo, horometro: parseFloat(horometro), kilometraje: parseFloat(kilometraje) }
      });

      const nuevaOrden = await tx.ordenTrabajo.create({
        data: {
          numeroOrden, // Usamos el generado automáticamente
          clienteNombre,
          clienteCelular,
          trabajoSolicitado,
          placa: vehiculo.placa,
          marca: vehiculo.marca,
          modelo: vehiculo.modelo,
          horometro: vehiculo.horometro,
          kilometraje: vehiculo.kilometraje,
          creadorId: req.user.id,
          responsableId: parseInt(responsableId),
          totalFinal: totalFinalCalculado, // <--- GUARDAMOS EL TOTAL CALCULADO
          estado: 'EN_REPARACION'
        }
      });

      // 3. Registrar Materiales
      if (materiales?.length > 0) {
        await tx.oTMaterial.createMany({
          data: materiales.map(m => ({
            ordenId: nuevaOrden.id,
            materialId: m.id,
            cantidad: parseFloat(m.cantidad),
            precioAplicado: parseFloat(m.precioAlMomento) // Forzamos conversión a número
          }))
        });
      }

      // 4. Registrar Servicios (Mano de obra)
      if (servicios?.length > 0) {
        await tx.oTServicio.createMany({
          data: servicios.map(s => ({
            ordenId: nuevaOrden.id,
            descripcion: s.descripcion,
            monto: parseFloat(s.monto || 0)
          }))
        });
      }

      // 5. Registrar Trabajos de Terceros
      if (terceros?.length > 0) {
        await tx.oTTercero.createMany({
          data: terceros.map(t => ({
            ordenId: nuevaOrden.id,
            descripcion: t.descripcion,
            monto: parseFloat(t.monto || 0)
          }))
        });
      }

      return nuevaOrden;
    });

    res.status(201).json(resultado);
  } catch (error) {
    // Log detallado para que sepas exactamente qué falló en la consola del servidor
    console.error("❌ Error en la transacción de Prisma:", error.message);
    res.status(400).json({ message: "Error al procesar la orden", error: error.message });
  }
};

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