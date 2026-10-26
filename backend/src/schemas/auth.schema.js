import { z } from 'zod';

export const loginSchema = z.object({
  nombreUsuario: z.string().min(3, 'Usuario requerido (mínimo 3 caracteres)').max(50),
  contrasena: z.string().min(4, 'Contraseña requerida (mínimo 4 caracteres)').max(100),
});
