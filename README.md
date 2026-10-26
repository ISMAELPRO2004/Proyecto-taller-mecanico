# Sistema de gestión — Mecánica LYER

Aplicación para digitalizar las **órdenes de trabajo** del taller: recepción del vehículo, trabajo en piso, catálogo de insumos, registros maestros y auditoría.

El repositorio es un **cliente-servidor desacoplado**:

- **Backend** (`/backend`): API REST en Node.js + Express, capas Controller → Service → Prisma (PostgreSQL).
- **Frontend** (`/frontend`): SPA Vue 3. Pantallas por característica (órdenes, inventario, registros, seguridad).

Detalle de cada carpeta: [backend/README.md](backend/README.md) y [frontend/README.md](frontend/README.md).

## Qué resuelve

1. La recepcionista identifica la placa (a mano o con cámara), carga cliente y evidencia, y deja un **borrador** `EN_ESPERA`.
2. Supervisor o admin **acepta** el borrador. Pasa a taller (`ACEPTADO` y estados de trabajo).
3. El técnico registra materiales, servicios, terceros y foto de desarrollo. **No ve precios**.
4. `TERMINADO` bloquea la orden. Solo el admin puede pasarla a `CANCELADO` y cargar factura.

## Stack

| Capa | Tecnología |
| --- | --- |
| Front | Vue 3.5, Vite 7, Pinia, Vue Router, Tailwind CSS 4, DaisyUI 5, Axios, Lucide, SweetAlert2, jsPDF |
| Back | Node.js, Express 5, Prisma 7 + PostgreSQL, Zod, JWT, Multer, bcryptjs |
| Paquetes | pnpm |

## Roles

| Rol | Qué puede hacer |
| --- | --- |
| **ADMIN** | Todo: usuarios, logs, precios, borrar, factura, cancelar un Terminado. |
| **SUPERVISOR** | Aceptar borradores, taller, catálogo, ve precios. No gestiona usuarios ni logs. |
| **TECNICO** | Taller y crear ítems de catálogo. **Sin precios.** |
| **RECEPCIONISTA** | Crear/editar borradores de recepción. **Sin precios.** No entra a taller. |

Precios visibles solo para ADMIN y SUPERVISOR.

## Flujo de una orden

```
Recepción (borrador)          Taller                         Cierre
EN_ESPERA ──aceptar──► ACEPTADO ──► EN_REPARACION
                                      CAMBIO_ACEITE
                                      ESPERANDO_REPUESTO
                                      TERMINADO ──(solo admin)──► CANCELADO + factura
```

- `EN_ESPERA`: wizard de 3 pasos (vehículo → cliente → recepción). `pasoRecepcion` 1, 2 o `null` (completo).
- Al aceptar debe estar la recepción completa (cliente, solicitud y foto de registro).
- `TERMINADO` cierra la orden (`estaCerrada`). Nadie edita el trabajo.
- `CANCELADO` después de Terminado es **solo admin**, con decisión de factura.

## Datos principales

- **Orden**: número anual, placa, cliente opcional hasta el paso 2, fotos, ítems, total, factura.
- **Vehículo**: placa `AAA-AAA` (clave), marca, modelo, km, horómetro.
- **Cliente**: persona/empresa, DNI (8) o RUC (11). En recepción el documento se consulta (local o APIsPeru); en registros maestros es obligatorio.
- **Catálogos**: materiales, servicios del taller, terceros (con responsable). Precio base opcional al crear; al editar se pide precio.
- **Auditoría**: un log JSON por acción (quién, cuándo, IP, cambios).

Los precios que se copian a la orden (`precioAplicado` / `monto`) son los del momento; el catálogo puede cambiar después.

## Arranque local

**Base de datos:** PostgreSQL. En `backend/.env` hace falta `DATABASE_URL` y `JWT_SECRET`.

```bash
# backend
cd backend
pnpm install
npx prisma migrate dev
pnpm seed          # usuarios admin / supervisor / tecnico / recepcion (clave en prisma/seed.js)
pnpm dev           # http://localhost:3000

# frontend (otra terminal)
cd frontend
pnpm install
# .env: VITE_API_URL=http://localhost:3000/api
pnpm dev           # http://localhost:5173
```

`FRONTEND_URL` del backend debe coincidir con el origen del front (si usan túnel Cloudflare, esa URL, no localhost).

Usuarios de prueba: `admin`, `supervisor`, `tecnico`, `recepcion`. Contraseña de seed: `admin123`.

Un mismo usuario **solo puede estar logueado en un dispositivo**. Si entra en el celular, la PC se cierra en la siguiente acción (y al revés).

Un mismo usuario **solo puede estar logueado en un dispositivo**. Si entra en el celular, la PC se cierra en la siguiente acción (y al revés).

## Dónde vive el “borrador” al recargar

Hay **dos capas**, no se mezclan:

| Qué | Dónde | Para qué |
| --- | --- | --- |
| Borrador de recepción ya guardado | PostgreSQL (`OrdenTrabajo` en `EN_ESPERA`) | Fuente de verdad. Sobrevive a cualquier recarga. |
| Lo que aún no se mandó al API | Navegador: `sessionStorage` + IndexedDB | Recarga (F5), cámara en el celular, Vite. **Solo esa pestaña.** |
| Sesión | `localStorage` (`token`, `user`) | Login. Persiste al cerrar el navegador. |

Claves del navegador: `lyer.recepcion.borrador` y `lyer.taller.borrador`. Las fotos pendientes van a IndexedDB (`lyer-recepcion`, `lyer-taller`).

Si sales del listado y vuelves a “Crear orden”, Vue destruye la pantalla: el restore local **solo corre si hubo recarga de página**, no un simple cambio de ruta. Detalle en [frontend/README.md](frontend/README.md#persistencia-y-recargas).

## Túnel (celular / red)

El front llama a `VITE_API_URL`. El back acepta CORS de `FRONTEND_URL`. Si el túnel rota, hay que actualizar ambos `.env`. No suban tokens ni `JWT_SECRET` al repositorio.
