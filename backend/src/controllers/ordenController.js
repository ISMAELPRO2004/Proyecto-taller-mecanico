import prisma from '../config/prisma.js';

export const crearOrden = async (req, res) => {
  const {
    clienteNombre, clienteCelular, trabajoSolicitado,
    placa, marca, modelo, horometro, kilometraje,
    materiales, servicios, terceros, responsableId
  } = req.body;

  try {
    const resultado = await prisma.$transaction(async (tx) => {
      // 1. Generar Código Correlativo Profesional (Ej: OT-2026-0001)
      const year = new Date().getFullYear();
      const count = await tx.ordenTrabajo.count();
      const numeroOrden = `OT-${year}-${(count + 1).toString().padStart(4, '0')}`;

      // 2. Calcular Totales Reales (Conversión explícita a número para seguridad)
      const totalMat = materiales?.reduce((acc, m) => acc + (parseFloat(m.cantidad || 0) * parseFloat(m.precioAlMomento || 0)), 0) || 0;
      const totalServ = servicios?.reduce((acc, s) => acc + parseFloat(s.monto || 0), 0) || 0;
      const totalTerc = terceros?.reduce((acc, t) => acc + parseFloat(t.monto || 0), 0) || 0;
      const totalCalculado = totalMat + totalServ + totalTerc;

      // 3. Upsert del Vehículo
      const vehiculo = await tx.vehiculo.upsert({
        where: { placa: placa.trim().toUpperCase() },
        update: { 
          horometro: parseFloat(horometro || 0), 
          kilometraje: parseFloat(kilometraje || 0) 
        },
        create: { 
          placa: placa.trim().toUpperCase(), 
          marca: marca || 'Genérica', 
          modelo: modelo || 'Genérico', 
          horometro: parseFloat(horometro || 0), 
          kilometraje: parseFloat(kilometraje || 0) 
        }
      });

      // 4. Crear Cabecera de la Orden con el Total Final
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

      // 5. Registrar Detalles de Materiales
      if (materiales?.length > 0) {
        await tx.oTMaterial.createMany({
          data: materiales.map(m => ({
            ordenId: nuevaOrden.id,
            materialId: m.id,
            cantidad: parseFloat(m.cantidad),
            precioAplicado: parseFloat(m.precioAlMomento)
          }))
        });
      }

      // 6. Registrar Detalles de Servicios (Mano de Obra)
      if (servicios?.length > 0) {
        await tx.oTServicio.createMany({
          data: servicios.map(s => ({
            ordenId: nuevaOrden.id,
            servicioId: s.id, // Vinculado al catálogo
            descripcion: s.descripcion,
            monto: parseFloat(s.monto || 0)
          }))
        });
      }

      // 7. Registrar Detalles de Terceros
      if (terceros?.length > 0) {
        await tx.oTTercero.createMany({
          data: terceros.map(t => ({
            ordenId: nuevaOrden.id,
            terceroId: t.id, // Vinculado al catálogo
            descripcion: t.descripcion,
            monto: parseFloat(t.monto || 0)
          }))
        });
      }

      return nuevaOrden;
    });

    res.status(201).json(resultado);
  } catch (error) {
    console.error("❌ Error en la transacción de Prisma:", error.message);
    res.status(400).json({ message: "Error al procesar la orden", error: error.message });
  }
};