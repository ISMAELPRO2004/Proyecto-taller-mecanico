import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'clave_secreta_por_defecto';

export const login = async (req: Request, res: Response) => {
  const { username, password } = req.body;

  try {
    // 1. Buscar al usuario en la DB del taller
    const usuario = await prisma.usuario.findUnique({
      where: { username }
    });

    if (!usuario || !usuario.activo) {
      return res.status(401).json({ message: 'Credenciales inválidas o usuario inactivo' });
    }

    // 2. Verificar la contraseña (comparar el hash)
    const passwordValida = await bcrypt.compare(password, usuario.password);

    if (!passwordValida) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    // 3. Generar el Token JWT con el rol y el ID
    const token = jwt.sign(
      { id: usuario.id, rol: usuario.rol },
      JWT_SECRET,
      { expiresIn: '8h' } // Tiempo suficiente para una jornada laboral
    );

    res.json({
      token,
      usuario: {
        id: usuario.id,
        username: usuario.username,
        rol: usuario.rol,
        nombre: usuario.nombreCompleto
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error en el servidor', error });
  }
};