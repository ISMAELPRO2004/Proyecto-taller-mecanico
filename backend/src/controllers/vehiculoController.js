import prisma from '../config/prisma.js';

export const buscarPorPlaca = async (req, res) => {
  const { placa } = req.params;

  try {
    const vehiculo = await prisma.vehiculo.findUnique({
      where: { placa: placa.toUpperCase() }
    });

    if (!vehiculo) {
      return res.status(404).json({ message: 'Vehículo no encontrado' });
    }

    res.json(vehiculo);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};