import { z } from 'zod';

const roles = z.enum(['ADMIN', 'SUPERVISOR', 'TECNICO', 'RECEPCIONISTA']);

export const crearUsuarioSchema = z.object({
  nombreUsuario: z.string().trim().min(3, 'Usuario: mínimo 3 caracteres').max(50),
  contrasena: z.string().min(6, 'Contraseña: mínimo 6 caracteres').max(100),
  nombreCompleto: z.string().trim().min(2, 'Nombre obligatorio').max(200),
  rol: roles,
});

export const editarUsuarioSchema = z.object({
  nombreUsuario: z.string().trim().min(3, 'Usuario: mínimo 3 caracteres').max(50),
  nombreCompleto: z.string().trim().min(2, 'Nombre obligatorio').max(200),
  rol: roles,
  contrasena: z.union([z.string().max(100), z.literal('')]).optional(),
}).superRefine((data, ctx) => {
  if (data.contrasena && data.contrasena.length > 0 && data.contrasena.length < 6) {
    ctx.addIssue({ code: 'custom', path: ['contrasena'], message: 'Contraseña: mínimo 6 caracteres' });
  }
});
