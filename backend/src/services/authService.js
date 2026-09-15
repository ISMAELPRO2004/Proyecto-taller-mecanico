import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../config/prisma.js';
import { env } from '../config/env.js';
import { AppError } from '../utils/errors.js';

export const login = async ({ username, password }) => {
  const usuario = await prisma.usuario.findUnique({
    where: { username },
  });

  if (!usuario || !usuario.activo) {
    throw new AppError('Credenciales inválidas o usuario inactivo', 401);
  }

  const passwordValida = await bcrypt.compare(password, usuario.password);
  if (!passwordValida) {
    throw new AppError('Credenciales inválidas', 401);
  }

  const token = jwt.sign(
    { id: usuario.id, rol: usuario.rol },
    env.jwtSecret,
    { expiresIn: '8h' }
  );

  return {
    token,
    usuario: {
      id: usuario.id,
      username: usuario.username,
      rol: usuario.rol,
      nombre: usuario.nombreCompleto,
    },
  };
};
