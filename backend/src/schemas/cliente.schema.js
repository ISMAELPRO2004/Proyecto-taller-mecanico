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

export const consultarDocumentoSchema = z.object({
  tipo: z.enum(['DNI', 'RUC']),
  numero: z.string().regex(/^\d+$/, 'Solo dígitos'),
}).superRefine((data, ctx) => {
  if (data.tipo === 'DNI' && data.numero.length !== 8) {
    ctx.addIssue({ code: 'custom', path: ['numero'], message: 'DNI debe tener 8 dígitos' });
  }
  if (data.tipo === 'RUC' && data.numero.length !== 11) {
    ctx.addIssue({ code: 'custom', path: ['numero'], message: 'RUC debe tener 11 dígitos' });
  }
});

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
