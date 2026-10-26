# Frontend — SPA LYER

SPA Vue 3. Arquitectura **por características**: cada pantalla es `views/<modulo>/` con vista, composables y piezas. El HTTP está en `services/` (solo Axios, sin `ref`). El estado de sesión está en Pinia.

Flujo de una pantalla: **ruta → vista → composable → service**.

## Arranque

```bash
pnpm install
# .env
# VITE_API_URL=http://localhost:3000/api
# (en celular / túnel: la URL pública del API, con /api al final)
pnpm dev
```

`vite.config.js` permite cualquier host (`allowedHosts: true`) para Cloudflare Tunnel.

Tema: `src/style.css` (`@theme`) y DaisyUI tema `lyer`. El violeta `#480078` es `lyer-green` / primary. No usar `emerald-*` como verde real; el verde de **Terminado** es `green-*`.

## Mapa de `src/`

```
src/
├── main.js                 Vue + Pinia + router
├── App.vue                 Login sin layout; el resto MainLayout
├── style.css               Tailwind 4, paleta, toasts
├── api/axios.js            Instancia + JWT + 401 → /login
├── router/index.js         Rutas y guards por rol
├── stores/auth.js          token + user (localStorage)
├── constants/estadosOrden.js   ESTADOS, labels, roles de UI
├── services/               Solo promesas HTTP
├── composables/            usePaginacion (compartido)
├── components/
│   ├── layout/MainLayout.vue
│   └── ui/                 Paginador, Tabs, StatusBadge
├── utils/                  alertas, placa, borradores, PDF, roles
└── views/                  Una carpeta por pantalla
```

### `api/axios.js`

Pone `Authorization: Bearer` desde `localStorage.token`. Si el API responde **401** (excepto el propio login), borra token/user y hace `window.location.href = '/login'` (recarga completa a propósito). Un 403 no desloguea.

Si el código es `SESION_REEMPLAZADA` (ese usuario acaba de entrar en otro dispositivo), deja un aviso en `lyer.aviso.login` para mostrarlo en la pantalla de login.

### `stores/auth.js`

Login vía `authService`. Logout limpia `localStorage` **y** los borradores locales de recepción/taller.

### `services/`

| Archivo | Recurso |
| --- | --- |
| `authService.js` | `POST /auth/login` |
| `ordenService.js` | Órdenes, borrador, fotos, factura |
| `vehiculoService.js` | Placa, marcas, `reconocerPlaca` |
| `clienteService.js` | CRUD + consulta DNI/RUC |
| `catalogoService.js` | inventario / servicios / terceros |
| `usuarioService.js` | Usuarios |

Nada de Vue aquí. `loading` / `error` / listas viven en el composable de la vista.

### `constants/estadosOrden.js`

Única fuente de `EN_ESPERA`, `TERMINADO`, etc. Las pantallas importan `ESTADO` / `labelEstadoOrden`, no strings sueltos.

### `components/ui/`

- `StatusBadge.vue` — pastilla de estado.
- `Paginador.vue` — página + “filas por página”.
- `Tabs.vue` — pestañas (inventario, registros, usuarios/logs).

### `utils/`

| Archivo | Uso |
| --- | --- |
| `alerts.js` | Toast (arriba centro en desktop, abajo en celular). `confirm` sigue modal. |
| `placa.js` | Formato `AAA-AAA` al escribir |
| `borradorRecepcion.js` | sessionStorage + IndexedDB del wizard |
| `borradorTaller.js` | Igual para la orden en trabajo |
| `roles.js` | Precios, impresión, factura pendiente |
| `ordenPdf.js` | jsPDF de la OT |
| `ordenDisplay.js` | Nombre cliente / marca / modelo |
| `fecha.js` | Fechas `es-PE` |
| `agruparLogs.js` | Agrupa auditoría por día |

## Vistas (`src/views/`)

### `login/`

`LoginView` + encabezado, formulario, panel de bienvenida. Copia fija del login (no revertir).

### `dashboard/`

Stats por estado, últimas 5 órdenes, CTA “Crear orden”, accesos rápidos. Datos: `ordenService.listar()`.

### `ordenes/listado/`

Tabla, filtros, paginación local, detalle (`OrdenDetalleModal`), factura (`ModalFacturaOrden`). Acciones según rol y estado (editar borrador, taller, aceptar, cancelar Terminado, imprimir).

### `ordenes/creacion/`

Wizard de recepción (`NuevaOrdenView` también sirve en `/ordenes/editar/:id`).

| Carpeta | Paso |
| --- | --- |
| `vehiculo/` | Elegir escanear o escribir, buscar placa, historial, marca/modelo |
| `cliente/` | DNI/RUC, APIsPeru vía backend, datos |
| `recepcion/` | Solicitud, foto de registro, observaciones |
| `pasos/` | Indicador 1-2-3 |
| `composables/` | Junta el estado, el borrador local y la carga inicial |

`useRecepcionOrden.js` no tiene las 900 líneas de negocio: delega en `usePasoVehiculo`, `usePasoCliente`, `usePasoRecepcion`, `useBorradorRecepcion`, `useCargaRecepcion`.

### `ordenes/taller` (`TallerOrdenView.vue` + `composables/useTallerOrden.js`)

Ítems, fotos, estado, selector de catálogo, footer de totales (oculto al técnico). Piezas en `ordenes/componentes/` y fotos en `ordenes/compartido/CampoFoto.vue`.

### `inventario/`

Tabs materiales / servicios / terceros. Tabla + tarjetas en móvil. Modal de alta/edición. Técnico crea; solo admin/supervisor editan y ven precio.

### `registros/`

Tabs clientes / vehículos / marcas. Validación DNI 8 / RUC 11, celular 9, email si se llena.

### `seguridad/`

Solo admin. Usuarios (tarjetas) y logs (`logs/`: filtros, tabla, detalle).

### `ordenes/compartido/`

`EncabezadoOrdenForm` (recepción y taller) y `CampoFoto` (galería o cámara nativa del teléfono).

## Persistencia y recargas

### Dónde se guarda

**1. Servidor (verdad)**  
Cuando pulsas “Continuar al cliente” / “Continuar” / “Finalizar recepción”, el API escribe la OT en PostgreSQL. Eso no depende del celular.

**2. `sessionStorage` (pestaña actual)**

| Clave | Contenido |
| --- | --- |
| `lyer.recepcion.borrador` | JSON: paso, form (placa, cliente, textos), flags, `ordenId`, ruta |
| `lyer.recepcion.recarga` | `"1"` si la página se está yendo (cámara, F5, app en segundo plano) |
| `lyer.taller.borrador` | Ítems, estado, trabajo solicitado de la OT abierta |
| `lyer.taller.recarga` | Igual, para taller |

Se escribe en cada cambio del form (`watch`) y al ocultar la página (`pagehide`, `beforeunload`, `visibilitychange` → `hidden`).

**No es `localStorage`.** Si cierras la pestaña, se pierde el JSON local. El borrador **ya enviado** al API sigue en la base.

**3. IndexedDB (fotos que aún no subieron)**

- Base `lyer-recepcion`, store `foto` — foto de registro pendiente.
- Base `lyer-taller`, store `foto` — registro/desarrollo pendientes.

Al volver de una recarga, si hay archivo local se reintenta el `POST` de foto.

**4. `localStorage`**

Solo `token` y `user`. El interceptor 401 y el logout los borran. El logout también limpia los borradores de sesión. El JWT dura 8 h, pero un login nuevo en otro dispositivo invalida el token anterior (`versionSesion` en el servidor).

### Cuándo se **restaura** el JSON local

Al montar recepción o taller, solo si detecta **recarga de esa URL**:

- `performance.navigation.type === 'reload'`, o
- la bandera `lyer.*.recarga === '1'` (la pone `pagehide` al irse a la cámara o al recargar).

Si navegas con el menú (Listado → Dashboard → Crear orden) Vue **destruye** el componente. Eso **no** cuenta como recarga, así que el wizard puede verse vacío aunque `sessionStorage` aún tenga datos. El borrador del servidor se recupera al abrir `/ordenes/editar/:id` o el lápiz del listado.

### Por qué a veces “se resetea” al volver (celular)

En iOS/Android, al abrir la **cámara**, al cambiar de app o al volver de otra pestaña, el sistema a menudo **mata y recarga** la página (no es un bug de Vue: es el navegador recuperando memoria).

El código está hecho para eso: guarda en `sessionStorage` + IndexedDB y, si fue recarga, reaplica el snapshot y avisa “Borrador recuperado”.

Si igual ves el formulario vacío:

1. La pestaña se **cerró** (sessionStorage se fue) y el paso **no** se había mandado al API.
2. Cambió el origen (túnel Cloudflare con **otra URL**) — el storage es por origen.
3. Entraste otra vez por “Crear orden” (ruta nueva), no por editar el borrador del listado.

### Por qué en PC “de la nada” se recarga todo

Suele ser una de estas, no un timer interno del taller:

1. **Vite en `pnpm dev`**. Si un archivo no se puede parchar en caliente, hace *full reload* (en consola: `page reload src/...`). El túnel Cloudflare a veces corta el websocket de HMR y Vite recarga igual. En un build de producción no pasa.
2. **401 del API.** Solo si el JSON es del taller (sesión vencida, otro dispositivo, usuario desactivado). Un 401 HTML del túnel ya no recarga.
3. **Túnel.** Si recargas el proceso de Cloudflare, la URL del front o del API cambia: hay que actualizar `.env` y volver a entrar.
4. Recarga manual / F5 / “tirar para actualizar” en el celular.

En producción, con API y front fijos y sin Vite, el caso 1 desaparece.

## Permisos en UI

`utils/roles.js` + `usePermisosOrden.js`:

- Precios: ADMIN, SUPERVISOR.
- Taller: ADMIN, SUPERVISOR, TECNICO.
- Aceptar borrador: ADMIN, SUPERVISOR.
- Cancelar Terminado / factura: ADMIN.
- Recepcionista no entra a `/ordenes/taller/:id` (guard del router).

## Rutas

| Ruta | Nombre | Quién |
| --- | --- | --- |
| `/login` | login | público |
| `/home` | dashboard | autenticado |
| `/ordenes` | listado-ordenes | autenticado |
| `/ordenes/nueva` | nueva-orden | los 4 roles |
| `/ordenes/editar/:id` | editar-orden | los 4 roles (solo si sigue `EN_ESPERA`) |
| `/ordenes/taller/:id` | taller-orden | admin, supervisor, técnico |
| `/catalogos` | catalogos-maestros | admin, supervisor |
| `/registros` | registros-maestros | admin |
| `/usuarios` | usuarios-logs | admin |
