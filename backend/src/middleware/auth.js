import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import prisma from '../config/prisma.js';

const responderNoAutorizado = (res, message, error) => {
  return res.status(401).json({ message, error });
};

export const authenticateJWT = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    return responderNoAutorizado(res, 'No autorizado', 'NO_AUTORIZADO');
  }

  let payload;
  try {
    payload = jwt.verify(token, env.jwtSecret);
  } catch {
    return responderNoAutorizado(res, 'Sesión expirada o inválida', 'SESION_INVALIDA');
  }

  try {
    const usuario = await prisma.usuario.findUnique({
      where: { id: payload.id },
      select: { id: true, rol: true, activo: true, sesionVersion: true },
    });

    if (!usuario || !usuario.activo) {
      return responderNoAutorizado(res, 'Sesión inválida', 'SESION_INVALIDA');
    }

    if (payload.sv !== usuario.sesionVersion) {
      return responderNoAutorizado(
        res,
        'Se inició sesión en otro dispositivo',
        'SESION_REEMPLAZADA'
      );
    }

    req.user = { id: usuario.id, rol: usuario.rol };
    next();
  } catch (err) {
    next(err);
  }
};

export const authorize = (rolesPermitidos = []) => {
  return (req, res, next) => {
    if (!rolesPermitidos.includes(req.user.rol)) {
      return res.status(403).json({ message: 'No tienes permisos para esta acción' });
    }
    next();
  };
};
