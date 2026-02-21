import bcrypt from 'bcryptjs';
import prisma from '../config/prisma.js';

export const crearUsuario = async (req, res) => {
  const { username, password, nombreCompleto, rol } = req.body;

  try {
    const hashedParams = await bcrypt.hash(password, 10);
    const nuevoUsuario = await prisma.usuario.create({
      data: {
        username,
        password: hashedParams,
        nombreCompleto,
        rol: rol.toUpperCase()
      }
    });

    res.status(201).json({ message: "Usuario creado", id: nuevoUsuario.id });
  } catch (error) {
    res.status(400).json({ message: "Error al crear usuario", error: error.message });
  }
};

export const listarLogs = async (req, res) => {
  try {
    const logs = await prisma.logActividad.findMany({
      include: { usuario: { select: { username: true, rol: true } } },
      orderBy: { fecha: 'desc' }
    });
    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const listarUsuarios = async (req, res) => {
  try {
    const usuarios = await prisma.usuario.findMany({
      where: { activo: true },
      select: {
        id: true,
        username: true,
        nombreCompleto: true,
        rol: true
      },
      orderBy: { nombreCompleto: 'asc' }
    });
    res.json(usuarios);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};