# 🛠️ Sistema de Gestión - Mecánica LYER

Este documento centraliza la lógica de negocio, arquitectura y requerimientos técnicos del sistema de gestión para el taller mecánico de vehículos pesados **Mecánica LYER**.

## 📝 Descripción del Proyecto

El sistema tiene como objetivo digitalizar el proceso de creación y seguimiento de **Órdenes de Trabajo (OT)**, permitiendo un control estricto sobre el inventario de materiales con precios volátiles, la mano de obra y los servicios de terceros, manteniendo siempre una trazabilidad completa de las acciones de los usuarios.

## 🚀 Stack Tecnológico

* **Frontend:** Vue.js 3 (Vite) + Pinia (Gestión de estado) + Tailwind CSS.
* **Backend:** Node.js (Express/NestJS).
* **Base de Datos:** PostgreSQL (Relacional).
* **Gestor de Paquetes:** `pnpm`.
* **Arquitectura:** API REST con Backend y Frontend separados.

## 💼 Lógica de Negocio

### 1. Entidades Principales

* **Orden de Trabajo (OT):** Documento central. Contiene número único, datos del cliente (nombre, celular), trabajos solicitados y estados.
* **Vehículo:** Vinculado a la OT. Campos críticos: Placa (ID único), Marca, Modelo, Horómetro y Kilometraje.
* **Catálogo de Materiales:** Lista de insumos (repuestos, aceites, etc.). Los precios son configurables por el Admin debido a fluctuaciones del mercado (ej. precio del dólar).
* **Auditoría (Logs):** Registro histórico de "quién hizo qué y cuándo". Es vital para el control interno.

### 2. Flujo de Estados de la Orden

Una orden debe transitar obligatoriamente por los siguientes estados:

1. **En reparación** (Estado inicial).
2. **Cambio de aceite**.
3. **Esperando repuesto**.
4. **Terminado**.
5. **Cancelado**.

### 3. Gestión de Costos

El total de la orden se calcula mediante la suma de tres sub-secciones:

* **Materiales:** `Cantidad * Precio del día` (El precio se congela al momento de agregar el material a la OT).
* **Mano de Obra / Servicios:** Descripción y monto fijo por trabajo realizado en el taller.
* **Trabajos Terceros:** Servicios externos (ej. soldadura fuera del taller) con su respectivo monto.

## 🔐 Roles y Permisos

| Rol | Capacidades |
| --- | --- |
| **Administrador** | Acceso total. Gestión de usuarios. **Único** capaz de modificar precios base en el catálogo. |
| **Responsable** | Registro de OTs. Cambio de estados. Edición de montos por error humano. Cierre de órdenes. |
| **Usuario General** | Registro de datos básicos. Sin permisos para cambiar estados o precios sensibles. |

> **Regla de Oro:** Una vez que una orden se marca como **"Cerrada"**, no se permite ninguna edición adicional para garantizar la integridad de los datos financieros.

## 📊 Estructura de Datos (Esquema SQL)

El sistema se basa en una estructura relacional que prioriza la integridad:

* `usuarios`: Manejo interno por `username` (sin obligatoriedad de email).
* `ordenes_trabajo`: Cabecera de la orden y datos del vehículo.
* `ot_materiales` / `ot_servicios` / `ot_terceros`: Tablas de detalle vinculadas a la OT.
* `logs_actividad`: Tabla de auditoría para trazabilidad.

---

## 🛠️ Instrucciones de Inicialización

### Backend

1. Entrar a `/backend`.
2. Ejecutar `pnpm install`.
3. Configurar `.env` con las credenciales de PostgreSQL.
4. `pnpm dev`.

### Frontend

1. Entrar a `/frontend`.
2. Ejecutar `pnpm install`.
3. `pnpm dev`.
