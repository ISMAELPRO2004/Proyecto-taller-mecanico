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
| **TECNICO** | Puede hacer recepción. En taller completa la orden ya aceptada. **Sin precios.** Puede ser responsable. |
| **RECEPCIONISTA** | Solo el borrador de recepción (`EN_ESPERA`). **Sin precios.** No entra a taller ni es responsable. |

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
- **Cliente**: persona/empresa, DNI (8) o RUC (11). En recepción se busca por DNI/RUC (taller y luego RENIEC/SUNAT) o por nombre entre los clientes del taller (documento opcional). En registros maestros el documento es obligatorio.
- **Catálogos**: materiales, servicios del taller, terceros (con responsable). Precio base opcional al crear; al editar se pide precio.
- **Auditoría**: un log JSON por acción (quién, cuándo, IP, cambios).

Los precios que se copian a la orden (`precioAplicado` / `monto`) son los del momento; el catálogo puede cambiar después.

## Docker (VPS o PC)

Un comando levanta PostgreSQL, el API (con Python/YOLO) y el front detrás de Nginx. Solo se publica el puerto HTTP.

**Requisitos del VPS:** Docker Engine + Compose v2, **4 GB RAM** (2 GB puede quedarse corto con el YOLO), ~8 GB de disco. El escaneo de placas necesita `backend/ml/placas/modelos/best.pt` (no viaja en git a menos que lo agregues). Sin ese archivo la cámara abre, pero no lee dígitos.

```bash
cp .env.example .env
# Edita PUBLIC_URL (http://IP_DEL_VPS o https://tu-dominio), DB_PASSWORD, JWT_SECRET
# y APISPERU_TOKEN si vas a consultar DNI/RUC.

# El YOLO no lee placas si falta este archivo en el VPS:
# scp backend/ml/placas/modelos/best.pt usuario@vps:~/Proyecto-taller/backend/ml/placas/modelos/

docker compose up -d --build
```

La primera construcción instala Torch CPU (YOLO) y puede tardar varios minutos. Las siguientes son más rápidas.

Entra en `PUBLIC_URL`. El front llama a `/api` del mismo origen; Nginx lo pasa al backend. No hace falta exponer 3000 ni 5432.

Primera vez: si la base está vacía se ejecuta el seed (`admin` / `supervisor` / `tecnico` / `recepcion`, clave `admin123`). Los arranques siguientes no pisan usuarios (`RUN_SEED=if-empty`). Fotos y PostgreSQL quedan en volúmenes Docker.

```bash
docker compose logs -f          # ver arranque
docker compose down             # para, conserva datos
docker compose down -v          # borra también la base y las fotos
```

HTTPS: pon Caddy, Nginx o Cloudflare delante apuntando al puerto `HTTP_PORT` y deja `PUBLIC_URL` con `https://...`.

## Arranque local (sin Docker)

**Base de datos:** PostgreSQL. En `backend/.env` hace falta `DATABASE_URL` y `JWT_SECRET`.

```bash
# backend
cd backend
pnpm install
npx prisma migrate deploy
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

Campos de la base en español (`nombreUsuario`, `contrasena`, `actualizadoEn`). Los códigos de rol y estado (`ADMIN`, `EN_ESPERA`) se quedan igual.

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
