import { z } from 'zod';

export const crearMarcaSchema = z.object({
  nombre: z.string().min(1).max(100).transform((v) => v.trim()),
});

export const upsertVehiculoSchema = z.object({
  placa: z.string()
    .regex(/^[A-Z0-9]{3}-[A-Z0-9]{3}$/i, 'La placa debe tener el formato aaa-aaa')
    .transform((v) => v.trim().toUpperCase()),
  marcaId: z.union([z.string(), z.number()]).transform((v) => parseInt(v, 10)),
  modelo: z.string().min(1).max(100),
  horometro: z.union([z.string(), z.number(), z.null()]).optional()
    .transform((v) => (v === null || v === undefined || v === '' ? null : parseFloat(v))),
  kilometraje: z.union([z.string(), z.number(), z.null()]).optional()
    .transform((v) => (v === null || v === undefined || v === '' ? null : parseFloat(v))),
});

export const placaParamSchema = z.object({
  placa: z.string()
    .regex(/^[A-Z0-9]{3}-[A-Z0-9]{3}$/i, 'La placa debe tener el formato aaa-aaa')
    .transform((v) => v.trim().toUpperCase()),
});
