import bcrypt from 'bcryptjs';
import prisma from '../config/prisma.js';
import { registrarLog } from '../utils/logger.js';

// ─── CREAR USUARIO ────────────────────────────────────────────────────────────
export const crearUsuario = async (req, res) => {
  const { username, password, nombreCompleto, rol } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const nuevoUsuario = await prisma.usuario.create({
      data: { username, password: hashedPassword, nombreCompleto, rol: rol.toUpperCase() }
    });

    await registrarLog(req, 'CREAR USUARIO', { username, nombreCompleto, rol });

    res.status(201).json({ message: 'Usuario creado', id: nuevoUsuario.id });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// ─── EDITAR USUARIO ───────────────────────────────────────────────────────────
// Faltaba completamente en tu versión anterior
export const editarUsuario = async (req, res) => {
  const { id } = req.params;
  const { username, nombreCompleto, rol, password } = req.body;

  try {
    const anterior = await prisma.usuario.findUnique({
      where:  { id: parseInt(id) },
      select: { username: true, nombreCompleto: true, rol: true }
    });

    if (!anterior) return res.status(404).json({ message: 'Usuario no encontrado' });

    const dataActualizar = { username, nombreCompleto, rol: rol.toUpperCase() };

    // Solo re-hashear si viene una contraseña nueva
    if (password && password.trim() !== '') {
      dataActualizar.password = await bcrypt.hash(password, 10);
    }

    const actualizado = await prisma.usuario.update({
      where: { id: parseInt(id) },
      data:  dataActualizar,
    });

    // LOG: compara solo campos visibles, password queda excluido
    // por la lista IGNORAR_SIEMPRE del logger
    await registrarLog(
      req,
      'EDITAR USUARIO',
      { username, nombreCompleto, rol, _nombreItem: anterior.nombreCompleto },
      anterior
    );

    res.json({ message: 'Usuario actualizado', id: actualizado.id });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// ─── ELIMINAR USUARIO ─────────────────────────────────────────────────────────
export const eliminarUsuario = async (req, res) => {
  const { id } = req.params;
  try {
    const usuario = await prisma.usuario.findUnique({
      where:  { id: parseInt(id) },
      select: { nombreCompleto: true, username: true, rol: true }
    });

    if (!usuario) return res.status(404).json({ message: 'Usuario no encontrado' });

    // Protección: no se puede eliminar el propio usuario logueado
    if (parseInt(id) === req.user.id) {
      return res.status(400).json({ message: 'No puedes eliminar tu propia cuenta.' });
    }

    await prisma.usuario.delete({ where: { id: parseInt(id) } });

    await registrarLog(req, 'ELIMINAR USUARIO', null, {
      nombreCompleto: usuario.nombreCompleto,
      username:       usuario.username,
      rol:            usuario.rol,
    });

    res.json({ message: 'Usuario eliminado' });
  } catch (error) {
    // Si tiene órdenes relacionadas Prisma lanzará un error de FK
    res.status(400).json({ error: 'No se puede eliminar: el usuario tiene registros asociados.' });
  }
};

// ─── ACTIVAR / DESACTIVAR USUARIO ─────────────────────────────────────────────
// También faltaba en tu versión anterior
export const toggleActivarUsuario = async (req, res) => {
  const { id } = req.params;

  try {
    const anterior = await prisma.usuario.findUnique({
      where:  { id: parseInt(id) },
      select: { activo: true, username: true, nombreCompleto: true }
    });

    if (!anterior) return res.status(404).json({ message: 'Usuario no encontrado' });

    const actualizado = await prisma.usuario.update({
      where: { id: parseInt(id) },
      data:  { activo: !anterior.activo }
    });

    const accion = actualizado.activo ? 'ACTIVAR USUARIO' : 'DESACTIVAR USUARIO';

    await registrarLog(
      req,
      accion,
      { activo: actualizado.activo, _nombreItem: anterior.nombreCompleto },
      { activo: anterior.activo }
    );

    res.json({ message: `Usuario ${actualizado.activo ? 'activado' : 'desactivado'}`, id: actualizado.id });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// ─── LISTAR USUARIOS ──────────────────────────────────────────────────────────
export const listarUsuarios = async (req, res) => {
  try {
    const usuarios = await prisma.usuario.findMany({
      select: {
        id:            true,
        username:      true,
        nombreCompleto: true,
        rol:           true,
        activo:        true,
      },
      orderBy: { nombreCompleto: 'asc' }
    });
    res.json(usuarios);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ─── LISTAR LOGS ──────────────────────────────────────────────────────────────
// Mejorado con filtros y paginación básica
export const listarLogs = async (req, res) => {
  try {
    const {
      usuarioId,
      ordenId,
      accion,
      fechaDesde,
      fechaHasta,
      page  = 1,
      limit = 50,
    } = req.query;

    // Construir filtros dinámicamente solo con los que vengan
    const where = {};
    if (usuarioId) where.usuarioId = parseInt(usuarioId);
    if (ordenId)   where.ordenId   = parseInt(ordenId);
    if (accion)    where.accion    = { contains: accion, mode: 'insensitive' };
    if (fechaDesde || fechaHasta) {
      where.fecha = {};
      if (fechaDesde) where.fecha.gte = new Date(fechaDesde);
      if (fechaHasta) where.fecha.lte = new Date(fechaHasta);
    }

    const skip  = (parseInt(page) - 1) * parseInt(limit);
    const take  = parseInt(limit);

    // Ejecutar conteo y datos en paralelo para no hacer dos queries secuenciales
    const [total, logs] = await Promise.all([
      prisma.logActividad.count({ where }),
      prisma.logActividad.findMany({
        where,
        include: {
          usuario: { select: { username: true, nombreCompleto: true, rol: true } },
          orden:   { select: { numeroOrden: true, clienteNombre: true, responsable:   { select: { nombreCompleto: true } }, } },
        },
        orderBy: { fecha: 'desc' },
        skip,
        take,
      }),
    ]);

    res.json({
      data:       logs,
      total,
      page:       parseInt(page),
      totalPages: Math.ceil(total / take),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};