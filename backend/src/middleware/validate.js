import { z } from 'zod';

export const loginSchema = z.object({
  username: z.string().min(3, 'Usuario requerido (mínimo 3 caracteres)').max(50),
  password: z.string().min(4, 'Contraseña requerida (mínimo 4 caracteres)').max(100),
});

const materialItemSchema = z.object({
  materialId: z.number().int().positive('materialId debe ser positivo'),
  cantidad: z.union([z.string(), z.number()]).transform((v) => parseFloat(v)),
  precioAlMomento: z.union([z.string(), z.number()]).transform((v) => parseFloat(v)),
});

const servicioItemSchema = z.object({
  servicioId: z.number().int().positive('servicioId debe ser positivo'),
  descripcion: z.string().min(1, 'Descripción requerida'),
  monto: z.union([z.string(), z.number()]).transform((v) => parseFloat(v)),
});

const terceroItemSchema = z.object({
  terceroId: z.number().int().positive('terceroId debe ser positivo'),
  descripcion: z.string().min(1, 'Descripción requerida'),
  monto: z.union([z.string(), z.number()]).transform((v) => parseFloat(v)),
});

export const crearOrdenSchema = z.object({
  clienteNombre: z.string().min(2, 'Nombre del cliente requerido').max(200),
  clienteCelular: z.union([
    z.literal(''),
    z.string().regex(/^\d{9}$/, 'Debe contener exactamente 9 dígitos'),
  ]).optional(),
  trabajoSolicitado: z.string().max(2000).optional().or(z.literal('')),
  placa: z.string()
    .min(6, 'Placa requerida (mínimo 6 caracteres)')
    .max(8, 'Placa debe tener máximo 8 caracteres')
    .regex(/^[A-Z0-9-]{6,8}$/i, 'Formato de placa inválido (solo letras, números y guiones)')
    .transform((v) => v.trim().toUpperCase().replace(/-/g, '')),
  marca: z.string().max(100).optional().or(z.literal('')),
  modelo: z.string().max(100).optional().or(z.literal('')),
  horometro: z.union([z.string(), z.number()]).optional().transform((v) => (v !== undefined ? parseFloat(v) : undefined)),
  kilometraje: z.union([z.string(), z.number()]).optional().transform((v) => (v !== undefined ? parseFloat(v) : undefined)),
  responsableId: z.union([z.string(), z.number()]).transform((v) => parseInt(v, 10)),
  materiales: z.array(materialItemSchema).optional().default([]),
  servicios: z.array(servicioItemSchema).optional().default([]),
  terceros: z.array(terceroItemSchema).optional().default([]),
});

export const actualizarOrdenSchema = crearOrdenSchema.extend({
  estado: z.enum(['EN_REPARACION', 'CAMBIO_ACEITE', 'ESPERANDO_REPUESTO', 'TERMINADO', 'CANCELADO']).optional(),
});

export const actualizarEstadoSchema = z.object({
  estado: z.enum(['EN_REPARACION', 'CAMBIO_ACEITE', 'ESPERANDO_REPUESTO', 'TERMINADO', 'CANCELADO']),
});

export const idParamSchema = z.object({
  id: z.string().regex(/^\d+$/, 'ID debe ser numérico').transform((v) => parseInt(v, 10)),
});
