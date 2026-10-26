import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../config/prisma.js';
import { env } from '../config/env.js';
import { UnauthorizedError } from '../utils/errors.js';

export const login = async ({ nombreUsuario, contrasena }) => {
  const usuario = await prisma.usuario.findUnique({
    where: { nombreUsuario },
  });

  if (!usuario || !usuario.activo) {
    throw new UnauthorizedError('Credenciales inválidas o usuario inactivo');
  }

  const claveValida = await bcrypt.compare(contrasena, usuario.contrasena);
  if (!claveValida) {
    throw new UnauthorizedError('Credenciales inválidas');
  }

  const actualizado = await prisma.usuario.update({
    where: { id: usuario.id },
    data: { versionSesion: { increment: 1 } },
    select: {
      id: true,
      nombreUsuario: true,
      rol: true,
      nombreCompleto: true,
      versionSesion: true,
    },
  });

  const token = jwt.sign(
    { id: actualizado.id, rol: actualizado.rol, sv: actualizado.versionSesion },
    env.jwtSecret,
    { expiresIn: '8h' }
  );

  return {
    token,
    usuario: {
      id: actualizado.id,
      nombreUsuario: actualizado.nombreUsuario,
      rol: actualizado.rol,
      nombre: actualizado.nombreCompleto,
    },
  };
};
