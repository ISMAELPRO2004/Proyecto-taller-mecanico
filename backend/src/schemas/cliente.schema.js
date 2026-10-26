import { z } from 'zod';

export const crearClienteSchema = z.object({
  tipoCliente: z.enum(['PERSONA', 'EMPRESA']),
  tipoDocumento: z.enum(['DNI', 'RUC']),
  numeroDocumento: z.string().min(8).max(11),
  nombreRazonSocial: z.string().min(2).max(200),
  representante: z.string().max(200).optional().nullable().or(z.literal('')),
  celular: z.string().max(15).optional().nullable().or(z.literal('')),
  correo: z.union([z.literal(''), z.null(), z.string().email()]).optional(),
}).superRefine((data, ctx) => {
  if (data.tipoCliente === 'EMPRESA' && data.tipoDocumento !== 'RUC') {
    ctx.addIssue({ code: 'custom', path: ['tipoDocumento'], message: 'Una empresa solo puede usar RUC' });
  }
  if (data.tipoDocumento === 'DNI' && data.numeroDocumento.length !== 8) {
    ctx.addIssue({ code: 'custom', path: ['numeroDocumento'], message: 'DNI debe tener 8 dígitos' });
  }
  if (data.tipoDocumento === 'RUC' && data.numeroDocumento.length !== 11) {
    ctx.addIssue({ code: 'custom', path: ['numeroDocumento'], message: 'RUC debe tener 11 dígitos' });
  }
});
