import bcrypt from 'bcryptjs';
import prisma from '../config/prisma.js';
import { AppError } from '../utils/errors.js';
import { registrarLog } from '../utils/logger.js';

export const crearUsuario = async ({ username, password, nombreCompleto, rol }, req) => {
  const hashedPassword = await bcrypt.hash(password, 10);
  const nuevoUsuario = await prisma.usuario.create({
    data: {
      username,
      password: hashedPassword,
      nombreCompleto,
      rol: rol.toUpperCase(),
    },
  });

  await registrarLog(req, 'CREAR USUARIO', { username, nombreCompleto, rol });

  return { message: 'Usuario creado', id: nuevoUsuario.id };
};

export const editarUsuario = async (id, { username, nombreCompleto, rol, password }, req) => {
  const anterior = await prisma.usuario.findUnique({
    where: { id: parseInt(id) },
    select: { username: true, nombreCompleto: true, rol: true },
  });

  if (!anterior) throw new AppError('Usuario no encontrado', 404);

  const dataActualizar = {
    username,
    nombreCompleto,
    rol: rol.toUpperCase(),
  };

  if (password && password.trim() !== '') {
    dataActualizar.password = await bcrypt.hash(password, 10);
  }

  const actualizado = await prisma.usuario.update({
    where: { id: parseInt(id) },
    data: dataActualizar,
  });

  await registrarLog(
    req,
    'EDITAR USUARIO',
    { username, nombreCompleto, rol, _nombreItem: anterior.nombreCompleto },
    anterior
  );

  return { message: 'Usuario actualizado', id: actualizado.id };
};

export const eliminarUsuario = async (id, req) => {
  const usuario = await prisma.usuario.findUnique({
    where: { id: parseInt(id) },
    select: { nombreCompleto: true, username: true, rol: true },
  });

  if (!usuario) throw new AppError('Usuario no encontrado', 404);

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
    username: usuario.username,
    rol: usuario.rol,
  });

  return { message: 'Usuario eliminado' };
};

export const toggleActivarUsuario = async (id, req) => {
  const anterior = await prisma.usuario.findUnique({
    where: { id: parseInt(id) },
    select: { activo: true, username: true, nombreCompleto: true },
  });

  if (!anterior) throw new AppError('Usuario no encontrado', 404);

  const actualizado = await prisma.usuario.update({
    where: { id: parseInt(id) },
    data: { activo: !anterior.activo },
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
      username: true,
      nombreCompleto: true,
      rol: true,
      activo: true,
    },
    orderBy: { nombreCompleto: 'asc' },
  });
};
