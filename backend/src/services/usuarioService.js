import bcrypt from 'bcryptjs';
import prisma from '../config/prisma.js';
import { AppError, NotFoundError } from '../utils/errors.js';
import { registrarLog } from './auditoria/index.js';

export const crearUsuario = async ({ nombreUsuario, contrasena, nombreCompleto, rol }, req) => {
  const claveHash = await bcrypt.hash(contrasena, 10);
  const nuevoUsuario = await prisma.usuario.create({
    data: {
      nombreUsuario,
      contrasena: claveHash,
      nombreCompleto,
      rol: rol.toUpperCase(),
    },
  });

  await registrarLog(req, 'CREAR USUARIO', { nombreUsuario, nombreCompleto, rol });

  return { message: 'Usuario creado', id: nuevoUsuario.id };
};

export const editarUsuario = async (id, { nombreUsuario, nombreCompleto, rol, contrasena }, req) => {
  const anterior = await prisma.usuario.findUnique({
    where: { id: parseInt(id) },
    select: { nombreUsuario: true, nombreCompleto: true, rol: true },
  });

  if (!anterior) throw new NotFoundError('Usuario no encontrado');

  const dataActualizar = {
    nombreUsuario,
    nombreCompleto,
    rol: rol.toUpperCase(),
  };

  if (contrasena && contrasena.trim() !== '') {
    dataActualizar.contrasena = await bcrypt.hash(contrasena, 10);
    dataActualizar.versionSesion = { increment: 1 };
  }

  const actualizado = await prisma.usuario.update({
    where: { id: parseInt(id) },
    data: dataActualizar,
  });

  await registrarLog(
    req,
    'EDITAR USUARIO',
    { nombreUsuario, nombreCompleto, rol, _nombreItem: anterior.nombreCompleto },
    anterior
  );

  return { message: 'Usuario actualizado', id: actualizado.id };
};

export const eliminarUsuario = async (id, req) => {
  const usuario = await prisma.usuario.findUnique({
    where: { id: parseInt(id) },
    select: { nombreCompleto: true, nombreUsuario: true, rol: true },
  });

  if (!usuario) throw new NotFoundError('Usuario no encontrado');

  if (parseInt(id) === req.user.id) {
    throw new AppError('No puedes eliminar tu propia cuenta.');
  }

  try {
    await prisma.usuario.delete({ where: { id: parseInt(id) } });
  } catch {
    throw new AppError('No se puede eliminar: el usuario tiene registros asociados.');
  }

  await registrarLog(req, 'ELIMINAR USUARIO', null, {
    nombreCompleto: usuario.nombreCompleto,
    nombreUsuario: usuario.nombreUsuario,
    rol: usuario.rol,
  });

  return { message: 'Usuario eliminado' };
};

export const toggleActivarUsuario = async (id, req) => {
  const anterior = await prisma.usuario.findUnique({
    where: { id: parseInt(id) },
    select: { activo: true, nombreUsuario: true, nombreCompleto: true },
  });

  if (!anterior) throw new NotFoundError('Usuario no encontrado');

  const data = { activo: !anterior.activo };
  if (anterior.activo) {
    data.versionSesion = { increment: 1 };
  }

  const actualizado = await prisma.usuario.update({
    where: { id: parseInt(id) },
    data,
  });

  const accion = actualizado.activo ? 'ACTIVAR USUARIO' : 'DESACTIVAR USUARIO';

  await registrarLog(
    req,
    accion,
    { activo: actualizado.activo, _nombreItem: anterior.nombreCompleto },
    { activo: anterior.activo }
  );

  return {
    message: `Usuario ${actualizado.activo ? 'activado' : 'desactivado'}`,
    id: actualizado.id,
  };
};

export const listarUsuarios = async () => {
  return prisma.usuario.findMany({
    select: {
      id: true,
      nombreUsuario: true,
      nombreCompleto: true,
      rol: true,
      activo: true,
    },
    orderBy: { nombreCompleto: 'asc' },
  });
};
