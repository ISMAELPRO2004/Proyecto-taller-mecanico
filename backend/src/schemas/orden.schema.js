import { z } from 'zod';

const placaSchema = z.string()
  .regex(/^[A-Z0-9]{3}-[A-Z0-9]{3}$/i, 'La placa debe tener el formato aaa-aaa')
  .transform((v) => v.trim().toUpperCase());

const documentoOpcional = z.union([z.string(), z.null(), z.undefined()]).optional()
  .transform((v) => {
    const limpio = String(v ?? '').replace(/\D/g, '');
    return limpio || null;
  });

const validarDocumentoOpcional = (cliente, ctx, pathPrefix = ['cliente']) => {
  if (cliente?.tipoCliente === 'EMPRESA' && cliente.tipoDocumento !== 'RUC') {
    ctx.addIssue({
      code: 'custom',
      path: [...pathPrefix, 'tipoDocumento'],
      message: 'Una empresa solo puede usar RUC',
    });
  }
  const doc = cliente?.numeroDocumento;
  if (!doc) return;
  if (cliente.tipoDocumento === 'DNI' && doc.length !== 8) {
    ctx.addIssue({ code: 'custom', path: [...pathPrefix, 'numeroDocumento'], message: 'DNI debe tener 8 dígitos' });
  }
  if (cliente.tipoDocumento === 'RUC' && doc.length !== 11) {
    ctx.addIssue({ code: 'custom', path: [...pathPrefix, 'numeroDocumento'], message: 'RUC debe tener 11 dígitos' });
  }
};

const clienteSchema = z.object({
  id: z.union([z.string(), z.number(), z.null()]).optional()
    .transform((v) => {
      if (v === null || v === undefined || v === '') return null;
      const n = parseInt(v, 10);
      return Number.isInteger(n) && n > 0 ? n : null;
    }),
  tipoCliente: z.enum(['PERSONA', 'EMPRESA']),
  tipoDocumento: z.enum(['DNI', 'RUC']),
  numeroDocumento: documentoOpcional,
  nombreRazonSocial: z.string().min(2, 'Nombre / razón social requerido').max(200),
  representante: z.string().max(200).optional().nullable().or(z.literal('')),
  celular: z.union([
    z.literal(''),
    z.null(),
    z.string().regex(/^\d{9}$/, 'Celular debe tener 9 dígitos'),
  ]).optional(),
  correo: z.union([
    z.literal(''),
    z.null(),
    z.string().email('Correo inválido'),
  ]).optional(),
});

const vehiculoSchema = z.object({
  placa: placaSchema,
  marcaId: z.union([z.string(), z.number()]).transform((v) => parseInt(v, 10)),
  modelo: z.string().min(1, 'Modelo requerido').max(100),
  horometro: z.union([z.string(), z.number(), z.null()]).optional()
    .transform((v) => (v === null || v === undefined || v === '' ? null : parseFloat(v))),
  kilometraje: z.union([z.string(), z.number(), z.null()]).optional()
    .transform((v) => (v === null || v === undefined || v === '' ? null : parseFloat(v))),
});

const materialItemSchema = z.object({
  materialId: z.number().int().positive(),
  cantidad: z.union([z.string(), z.number()]).transform((v) => parseFloat(v)),
  precioAlMomento: z.union([z.string(), z.number(), z.null()]).optional()
    .transform((v) => (v === null || v === undefined || v === '' ? null : parseFloat(v))),
});

const servicioItemSchema = z.object({
  servicioId: z.number().int().positive(),
  descripcion: z.string().min(1),
  monto: z.union([z.string(), z.number(), z.null()]).optional()
    .transform((v) => (v === null || v === undefined || v === '' ? null : parseFloat(v))),
});

const terceroItemSchema = z.object({
  terceroId: z.number().int().positive(),
  descripcion: z.string().min(1),
  monto: z.union([z.string(), z.number(), z.null()]).optional()
    .transform((v) => (v === null || v === undefined || v === '' ? null : parseFloat(v))),
});

/** Borrador / recepción: cliente + vehículo + ingreso (flujo legacy completo) */
export const crearBorradorOrdenSchema = z.object({
  cliente: clienteSchema,
  vehiculo: vehiculoSchema,
  descripcionInformal: z.string().max(5000).optional().nullable().or(z.literal('')),
  trabajoSolicitado: z.string().max(5000).optional().nullable().or(z.literal('')),
  estadoIngreso: z.enum(['ACEPTADO', 'OBSERVADO']).default('ACEPTADO'),
  observacionIngreso: z.string().max(5000).optional().nullable().or(z.literal('')),
  responsableId: z.union([z.string(), z.number(), z.null()]).optional()
    .transform((v) => (v === null || v === undefined || v === '' ? null : parseInt(v, 10))),
}).superRefine((data, ctx) => {
  if (data.estadoIngreso === 'OBSERVADO' && !data.observacionIngreso?.trim()) {
    ctx.addIssue({
      code: 'custom',
      path: ['observacionIngreso'],
      message: 'La observación es obligatoria si el ingreso está Observado',
    });
  }
  validarDocumentoOpcional(data.cliente, ctx);
});

export const actualizarBorradorOrdenSchema = crearBorradorOrdenSchema;

/** Paso 1 recepción: solo vehículo */
export const pasoVehiculoSchema = z.object({
  vehiculo: vehiculoSchema,
  /** Si true, actualiza un vehículo ya existente (solo si el borrador lo permite) */
  actualizarDatos: z.boolean().optional().default(false),
});

/** Paso 2 recepción: cliente */
export const pasoClienteSchema = z.object({
  cliente: clienteSchema,
  actualizarDatos: z.boolean().optional().default(false),
}).superRefine((data, ctx) => {
  validarDocumentoOpcional(data.cliente, ctx);
});

/** Paso 3 recepción: trabajo + ingreso */
export const completarRecepcionSchema = z.object({
  descripcionInformal: z.string().max(5000).optional().nullable().or(z.literal('')),
  trabajoSolicitado: z.string().max(5000).optional().nullable().or(z.literal('')),
  estadoIngreso: z.enum(['ACEPTADO', 'OBSERVADO']).default('ACEPTADO'),
  observacionIngreso: z.string().max(5000).optional().nullable().or(z.literal('')),
}).superRefine((data, ctx) => {
  if (!data.descripcionInformal?.trim()) {
    ctx.addIssue({
      code: 'custom',
      path: ['descripcionInformal'],
      message: 'La solicitud del cliente es obligatoria',
    });
  }
  if (data.estadoIngreso === 'OBSERVADO' && !data.observacionIngreso?.trim()) {
    ctx.addIssue({
      code: 'custom',
      path: ['observacionIngreso'],
      message: 'La observación es obligatoria si el ingreso está Observado',
    });
  }
});

export const actualizarOrdenSchema = z.object({
  descripcionInformal: z.string().max(5000).optional().nullable(),
  trabajoSolicitado: z.string().max(5000).optional().nullable(),
  estadoIngreso: z.enum(['ACEPTADO', 'OBSERVADO']).optional(),
  observacionIngreso: z.string().max(5000).optional().nullable(),
  responsableId: z.union([z.string(), z.number(), z.null()]).optional()
    .transform((v) => (v === null || v === undefined || v === '' ? null : parseInt(v, 10))),
  estado: z.enum([
    'EN_ESPERA', 'ACEPTADO', 'EN_REPARACION', 'CAMBIO_ACEITE',
    'ESPERANDO_REPUESTO', 'TERMINADO', 'CANCELADO',
  ]).optional(),
  requiereFactura: z.boolean().optional(),
  numeroFactura: z.string().max(50).optional().nullable(),
  montoFactura: z.union([z.string(), z.number(), z.null()]).optional()
    .transform((v) => (v === null || v === undefined || v === '' ? null : parseFloat(v))),
  materiales: z.array(materialItemSchema).optional(),
  servicios: z.array(servicioItemSchema).optional(),
  terceros: z.array(terceroItemSchema).optional(),
  vehiculo: vehiculoSchema.partial().optional(),
  cliente: clienteSchema.partial().optional(),
});

export const actualizarEstadoSchema = z.object({
  estado: z.enum([
    'EN_ESPERA', 'ACEPTADO', 'EN_REPARACION', 'CAMBIO_ACEITE',
    'ESPERANDO_REPUESTO', 'TERMINADO', 'CANCELADO',
  ]),
  requiereFactura: z.boolean().optional(),
  numeroFactura: z.string().max(50).optional().nullable(),
  montoFactura: z.union([z.string(), z.number(), z.null()]).optional()
    .transform((v) => (v === null || v === undefined || v === '' ? null : parseFloat(v))),
});

export const aceptarOrdenSchema = z.object({
  responsableId: z.union([z.string(), z.number()]).optional()
    .transform((v) => (v === null || v === undefined || v === '' ? undefined : parseInt(v, 10))),
});

export const actualizarFacturaSchema = z.object({
  requiereFactura: z.boolean(),
  numeroFactura: z.union([z.string().max(50), z.literal(''), z.null()]).optional(),
  montoFactura: z.union([z.string(), z.number(), z.null()]).optional()
    .transform((v) => (v === null || v === undefined || v === '' ? null : parseFloat(v))),
});
