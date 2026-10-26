-- Campos de Usuario en español
ALTER TABLE "Usuario" RENAME COLUMN "username" TO "nombreUsuario";
ALTER TABLE "Usuario" RENAME COLUMN "password" TO "contrasena";
ALTER TABLE "Usuario" RENAME COLUMN "sesionVersion" TO "versionSesion";

-- Timestamps: At / updatedAt → En
ALTER TABLE "Cliente" RENAME COLUMN "actualizadoAt" TO "actualizadoEn";
ALTER TABLE "Vehiculo" RENAME COLUMN "actualizadoAt" TO "actualizadoEn";
ALTER TABLE "ContadorOrden" RENAME COLUMN "updatedAt" TO "actualizadoEn";
ALTER TABLE "CatalogoMaterial" RENAME COLUMN "actualizadoAt" TO "actualizadoEn";
ALTER TABLE "CatalogoServicio" RENAME COLUMN "actualizadoAt" TO "actualizadoEn";
ALTER TABLE "CatalogoTercero" RENAME COLUMN "actualizadoAt" TO "actualizadoEn";

-- Auditoría: se deja de guardar IP y user-agent
ALTER TABLE "LogActividad" DROP COLUMN IF EXISTS "ipCliente";
ALTER TABLE "LogActividad" DROP COLUMN IF EXISTS "userAgent";
