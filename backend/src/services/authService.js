import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../config/prisma.js';
import { env } from '../config/env.js';
import { UnauthorizedError } from '../utils/errors.js';

export const login = async ({ username, password }) => {
  const usuario = await prisma.usuario.findUnique({
    where: { username },
  });

  if (!usuario || !usuario.activo) {
    throw new UnauthorizedError('Credenciales inválidas o usuario inactivo');
  }

  const passwordValida = await bcrypt.compare(password, usuario.password);
  if (!passwordValida) {
    throw new UnauthorizedError('Credenciales inválidas');
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
