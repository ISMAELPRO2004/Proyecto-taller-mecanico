import { z } from 'zod';

export const idParamSchema = z.object({
  id: z.string().regex(/^\d+$/, 'ID debe ser numérico').transform((v) => parseInt(v, 10)),
});

export const fotoParamSchema = z.object({
  id: z.string().regex(/^\d+$/, 'ID debe ser numérico').transform((v) => parseInt(v, 10)),
  tipo: z.enum(['registro', 'desarrollo']),
});
