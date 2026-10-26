import { z } from 'zod';

const precio = z.union([z.string(), z.number(), z.null()]).optional();

export const crearItemCatalogoSchema = z.object({
  descripcion: z.string().trim().min(1, 'La descripción es obligatoria').max(200),
  precioBase: precio,
  responsable: z.string().max(200).optional().nullable().or(z.literal('')),
});

export const actualizarItemCatalogoSchema = z.object({
  descripcion: z.string().trim().min(1, 'La descripción es obligatoria').max(200),
  precioBase: z.union([z.string(), z.number()]),
  responsable: z.string().max(200).optional().nullable().or(z.literal('')),
});

export const crearTerceroSchema = crearItemCatalogoSchema.extend({
  responsable: z.string().trim().min(1, 'El responsable del tercero es obligatorio').max(200),
});

export const actualizarTerceroSchema = actualizarItemCatalogoSchema.extend({
  responsable: z.string().trim().min(1, 'El responsable del tercero es obligatorio').max(200),
});
