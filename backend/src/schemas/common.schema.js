import { z } from 'zod';

export const idParamSchema = z.object({
  id: z.string().regex(/^\d+$/, 'ID debe ser numérico').transform((v) => parseInt(v, 10)),
});
