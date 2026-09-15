import { z } from 'zod';

export const loginSchema = z.object({
  username: z.string().min(3, 'Usuario requerido (mínimo 3 caracteres)').max(50),
  password: z.string().min(4, 'Contraseña requerida (mínimo 4 caracteres)').max(100),
});
