import { z } from 'zod';

export const crearClienteSchema = z.object({
  tipoCliente: z.enum(['PERSONA', 'EMPRESA']),
  tipoDocumento: z.enum(['DNI', 'RUC']),
  numeroDocumento: z.string().min(8).max(11),
  nombreRazonSocial: z.string().min(2).max(200),
  representante: z.string().max(200).optional().nullable().or(z.literal('')),
  celular: z.string().max(15).optional().nullable().or(z.literal('')),
  correo: z.union([z.literal(''), z.null(), z.string().email()]).optional(),
});

export const crearMarcaSchema = z.object({
  nombre: z.string().min(1).max(100).transform((v) => v.trim()),
});

export const upsertVehiculoSchema = z.object({
  placa: z.string()
    .min(7, 'Placa requerida (7 u 8 caracteres)')
    .max(8, 'Placa debe tener máximo 8 caracteres')
    .regex(/^[A-Z0-9-]{7,8}$/i, 'Formato de placa inválido (letras, números y guion)')
    .transform((v) => v.trim().toUpperCase()),
  marcaId: z.union([z.string(), z.number()]).transform((v) => parseInt(v, 10)),
  modelo: z.string().min(1).max(100),
  horometro: z.union([z.string(), z.number(), z.null()]).optional()
    .transform((v) => (v === null || v === undefined || v === '' ? null : parseFloat(v))),
  kilometraje: z.union([z.string(), z.number(), z.null()]).optional()
    .transform((v) => (v === null || v === undefined || v === '' ? null : parseFloat(v))),
});
