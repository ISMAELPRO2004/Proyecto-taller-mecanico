# Backend — API LYER

API REST del taller. Arquitectura en **capas**: ruta (auth + Zod) → controlador (HTTP) → servicio (reglas) → Prisma (PostgreSQL).

La orden no es un solo archivo: está partida en `src/services/orden/` (recepción, consulta, trabajo, fotos). La auditoría vive en `src/services/auditoria/`.

## Arranque

```bash
pnpm install
npx prisma migrate deploy   # aplica prisma/migrations (hoy hay una sola: init)
pnpm seed
pnpm dev          # nodemon, puerto 3000 (o PORT)
```

Si el esquema cambia, `npx prisma migrate dev --name descripcion` crea **otra** migración encima. No borren `init`.

Variables en `.env` (nombres; no copiar secretos):

| Variable | Uso |
| --- | --- |
| `DATABASE_URL` | PostgreSQL |
| `JWT_SECRET` | Firma de tokens |
| `PORT` | Por defecto 3000 |
| `FRONTEND_URL` | Origen CORS (puede ser lista separada por comas; incluye el túnel si aplica) |

Prisma 7 usa el adaptador `PrismaPg`. El cliente se crea en `src/config/prisma.js`.

Seed: usuarios `admin`, `supervisor`, `tecnico`, `recepcion` (ver `prisma/seed.js`) y datos de ejemplo (marcas, clientes, vehículos).

## Mapa de carpetas

```
backend/
├── prisma/
│   ├── schema.prisma      Modelos y enums
│   ├── seed.js            Datos iniciales
│   └── migrations/        Una sola baseline (`init`) + las que vengan después
├── uploads/ordenes/{id}/  Fotos (registro | desarrollo)
├── src/
│   ├── server.js          listen()
│   ├── app.js             Express: CORS, JSON, rate limit login, rutas, errores
│   ├── config/            env.js, prisma.js
│   ├── routes/            Un archivo por recurso
│   ├── controllers/       req/res. Casi no hay try/catch (asyncHandler)
│   ├── services/          Reglas de negocio
│   │   ├── orden/         recepción, consulta, trabajo, fotos, comun
│   │   └── auditoria/     eventos, guardar, registros, consulta de logs
│   ├── schemas/           Zod por entidad
│   ├── middleware/        JWT, roles, Zod, multer, audit, errores
│   └── utils/             logger, AppError, asyncHandler, money
```

### `src/app.js`

- `trust proxy: 1` porque Cloudflare Tunnel manda `X-Forwarded-For`. Sin eso, `express-rate-limit` tiraba `ERR_ERL_UNEXPECTED_X_FORWARDED_FOR` (el login igual pasaba).
- Rate limit en `POST /api/auth/login`: 10 intentos / 3 minutos.
- Orden de rutas: `/api/auth`, `/usuarios`, `/auditoria`, `/inventario`, `/servicios`, `/terceros`, `/ordenes`, `/vehiculos`, `/clientes`.
- Al final: 404 JSON + `errorHandler` global.

### `src/config/`

- `env.js`: lee `process.env`. No loguea `JWT_SECRET`.
- `prisma.js`: única conexión.

### `src/routes/`

Cada ruta declara **quién entra** (`authenticateJWT` + `authorize`) y **qué cuerpo/params** (`validateBody` / `validateParams` / `validateQuery`).

| Archivo | Prefijo | Notas |
| --- | --- | --- |
| `authRoutes.js` | `/api/auth` | Login |
| `userRoutes.js` | `/api/usuarios` | CRUD usuarios; `GET /logs` legado |
| `auditoriaRoutes.js` | `/api/auditoria` | Logs y foto de log (admin) |
| `inventarioRoutes.js` | `/api/inventario` | Materiales |
| `serviciosRoutes.js` | `/api/servicios` | Mano de obra |
| `serviciosTercerosRoutes.js` | `/api/terceros` | Trabajos externos |
| `ordenRoutes.js` | `/api/ordenes` | Borrador, taller, fotos, factura |
| `vehiculoRoutes.js` | `/api/vehiculos` | Placa, marcas, `POST /reconocer` |
| `clienteRoutes.js` | `/api/clientes` | CRUD y búsqueda local |

### `src/controllers/`

Traducen HTTP. `catalogoController.js` fabrica listar/crear/actualizar/eliminar para materiales, servicios y terceros.

Los errores se lanzan en el servicio (`NotFoundError`, `UnauthorizedError`, etc.). `asyncHandler` los manda al middleware global. La respuesta JSON lleva `message` y `error` (el front lee ambos).

### `src/services/`

| Módulo | Responsabilidad |
| --- | --- |
| `authService.js` | Login: sube `versionSesion` y firma un JWT de 8 h. Un login nuevo cierra el anterior |
| `usuarioService.js` | Alta/edición (`contrasena` ≥ 6), no borrar la propia cuenta |
| `clienteService.js` | CRUD y listado local por nombre/documento |
| `vehiculoService.js` | Marcas y vehículos; `reconocerPlaca` (stub del modelo de placas) |
| `catalogoService.js` | Factory CRUD; técnico recibe ítems **sin** `precioBase` |
| `fotoOrdenService.js` | Guarda/lee JPG-PNG-WEBP ≤ 5 MB en `uploads/ordenes/{id}/` |
| `orden/recepcion.js` | Pasos del borrador, completar recepción |
| `orden/consulta.js` | Listar / obtener |
| `orden/trabajo.js` | Aceptar, ítems, estados, factura, borrar |
| `orden/fotos.js` | Subir/quitar registro y desarrollo |
| `orden/comun.js` | Includes Prisma, upsert cliente/vehículo, número de orden |
| `auditoria/` | Arma el JSON del log y lo escribe; `consulta.js` lista logs |

Un servicio **no** arma el HTML. Si cambia un dato, llama a `registrarLog` / `auditarBorrador` / `auditarOrden`.

### `src/schemas/`

Zod. El middleware parsea y, si falla, 400 con `{ message, errors: [{ campo, mensaje }] }`.

- `auth.schema.js` — login
- `orden.schema.js` — borrador, taller, factura, pasos
- `cliente.schema.js` — alta de cliente
- `vehiculo.schema.js` — marca, upsert, param placa
- `inventario.schema.js` — material/servicio/tercero
- `user.schema.js` — crear/editar usuario
- `common.schema.js` — `:id`, foto `registro|desarrollo`

### `src/middleware/`

| Archivo | Qué hace |
| --- | --- |
| `auth.js` | Bearer JWT; compara `sv` del token con `Usuario.versionSesion`; `authorize(roles)` |
| `validateBody.js` | Body, query (`req.validatedQuery`, Express 5 no deja asignar `req.query`) y params |
| `uploadFoto.js` | Multer memoria, 5 MB, jpeg/png/webp |
| `audit.js` | Avisa en consola si una ruta de escritura no dejó log |
| `errorHandler.js` | AppError → status; Prisma/conexión → log + 400/503; el resto 500 |

### `src/utils/`

- `logger.js`: consola con `[INFO|WARN|ERROR]` e ISO date. No imprime secretos.
- `errors.js`: `AppError` (400) y subclases 401/403/404/409.
- `asyncHandler.js`: `catch(next)`.
- `money.js`: total de la orden.

Errores de PostgreSQL (pool), Prisma (`P1001` conexión, `P2002` duplicado, etc.) y excepciones no capturadas se registran ahí. El cliente recibe un mensaje corto, no el stack.

## HTTP de órdenes (resumen)

| Método | Ruta | Quién | Efecto |
| --- | --- | --- | --- |
| POST | `/ordenes/borrador/vehiculo` | recepción | Crea borrador paso 1 |
| PUT | `/ordenes/:id/borrador/vehiculo` | recepción | Actualiza vehículo |
| PUT | `/ordenes/:id/borrador/cliente` | recepción | Paso 2 |
| PUT | `/ordenes/:id/borrador/completar` | recepción | Foto + solicitud; `pasoRecepcion` null |
| POST | `/ordenes/:id/aceptar` | admin/supervisor | `EN_ESPERA` → `ACEPTADO` |
| PUT | `/ordenes/:id` | taller | Ítems, estado, responsable |
| PUT | `/ordenes/:id/estado` | taller / admin cancelar | Estados de trabajo o cancelado |
| PUT | `/ordenes/:id/factura` | admin | Solo si `CANCELADO` |
| POST/GET/DELETE | `/ordenes/:id/foto/:tipo` | según reglas | `registro` (casi inmutable) / `desarrollo` |

Fotos en disco, no en PostgreSQL. La columna guarda la ruta relativa.

## Escaneo de placas (preparado)

`POST /api/vehiculos/reconocer` (multipart `foto`). Hoy `reconocerPlaca` responde `{ disponible: false, placa: null, mensaje }` sin adivinar dígitos. Cuando exista el modelo, este servicio es el único sitio a cambiar.

## Modelos Prisma (visión)

`Usuario`, `Cliente`, `MarcaVehiculo`, `Vehiculo` (PK placa), `OrdenTrabajo`, `ContadorOrden` (número por año), `CatalogoMaterial|Servicio|Tercero`, `OTMaterial|OTServicio|OTTercero`, `LogActividad`.

Enums: `Rol`, `EstadoOrden`, `EstadoIngreso`, `TipoCliente`, `TipoDocumento`.

## Sesión única

Un usuario solo puede tener **una sesión viva**. En cada login se incrementa `Usuario.versionSesion` y el JWT lleva ese número (`sv`). El middleware lo compara con la base: si no coincide, responde 401 `SESION_REEMPLAZADA` y el dispositivo anterior cae al login.

También sube la versión (y cierra sesiones) al **cambiar la contraseña** o **desactivar** al usuario.

No es un cierre instantáneo en el otro celular: ocurre en la **siguiente petición** al API (guardar, listar, etc.). El JWT sigue 8 h si nadie más entra.

## Auditoría

Los servicios llaman a `src/services/auditoria`. Un log de actividad tiene `accion`, `detalles` (JSON de cambios), `usuarioId`, `ordenId` opcional y `fecha`. No se guarda IP ni user-agent.

Listado: `GET /api/auditoria/logs` (admin, paginado).

## Nombres en español

Las columnas van en español (`nombreUsuario`, `contrasena`, `versionSesion`, `actualizadoEn`). Los enums de negocio (`ADMIN`, `EN_ESPERA`, `DNI`) se quedan como códigos estables. El login y el CRUD de usuarios usan el mismo contrato JSON.
