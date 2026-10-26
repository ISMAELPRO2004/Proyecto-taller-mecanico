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

  const actualizado = await prisma.usuario.update({
    where: { id: usuario.id },
    data: { sesionVersion: { increment: 1 } },
    select: {
      id: true,
      username: true,
      rol: true,
      nombreCompleto: true,
      sesionVersion: true,
    },
  });

  const token = jwt.sign(
    { id: actualizado.id, rol: actualizado.rol, sv: actualizado.sesionVersion },
    env.jwtSecret,
    { expiresIn: '8h' }
  );

  return {
    token,
    usuario: {
      id: actualizado.id,
      username: actualizado.username,
      rol: actualizado.rol,
      nombre: actualizado.nombreCompleto,
    },
  };
};
