-- Esquema actual de LYER (baseline). Las migraciones anteriores se unieron aquí.
-- En una base ya existente NO se vuelve a ejecutar: queda marcada como aplicada.

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "Rol" AS ENUM ('ADMIN', 'SUPERVISOR', 'TECNICO', 'RECEPCIONISTA');

-- CreateEnum
CREATE TYPE "TipoCliente" AS ENUM ('PERSONA', 'EMPRESA');

-- CreateEnum
CREATE TYPE "TipoDocumento" AS ENUM ('DNI', 'RUC');

-- CreateEnum
CREATE TYPE "EstadoIngreso" AS ENUM ('ACEPTADO', 'OBSERVADO');

-- CreateEnum
CREATE TYPE "EstadoOrden" AS ENUM ('EN_ESPERA', 'ACEPTADO', 'EN_REPARACION', 'CAMBIO_ACEITE', 'ESPERANDO_REPUESTO', 'TERMINADO', 'CANCELADO');

-- CreateTable
CREATE TABLE "Usuario" (
    "id" SERIAL NOT NULL,
    "nombreUsuario" TEXT NOT NULL,
    "contrasena" TEXT NOT NULL,
    "nombreCompleto" TEXT,
    "rol" "Rol" NOT NULL DEFAULT 'RECEPCIONISTA',
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "versionSesion" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Cliente" (
    "id" SERIAL NOT NULL,
    "tipoCliente" "TipoCliente" NOT NULL,
    "tipoDocumento" "TipoDocumento" NOT NULL,
    "numeroDocumento" TEXT,
    "nombreRazonSocial" TEXT NOT NULL,
    "representante" TEXT,
    "celular" TEXT,
    "correo" TEXT,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Cliente_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MarcaVehiculo" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,

    CONSTRAINT "MarcaVehiculo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Vehiculo" (
    "placa" TEXT NOT NULL,
    "marcaId" INTEGER NOT NULL,
    "modelo" TEXT NOT NULL,
    "horometro" DOUBLE PRECISION DEFAULT 0,
    "kilometraje" DOUBLE PRECISION DEFAULT 0,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Vehiculo_pkey" PRIMARY KEY ("placa")
);

-- CreateTable
CREATE TABLE "OrdenTrabajo" (
    "id" SERIAL NOT NULL,
    "numeroOrden" TEXT NOT NULL,
    "fechaCreacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "clienteId" INTEGER,
    "placa" TEXT NOT NULL,
    "descripcionInformal" TEXT,
    "trabajoSolicitado" TEXT,
    "estadoIngreso" "EstadoIngreso" NOT NULL DEFAULT 'ACEPTADO',
    "observacionIngreso" TEXT,
    "fotoRegistro" TEXT,
    "fotoDesarrollo" TEXT,
    "estado" "EstadoOrden" NOT NULL DEFAULT 'EN_ESPERA',
    "estaCerrada" BOOLEAN NOT NULL DEFAULT false,
    "pasoRecepcion" INTEGER,
    "vehiculoEditableEnBorrador" BOOLEAN NOT NULL DEFAULT false,
    "clienteEditableEnBorrador" BOOLEAN NOT NULL DEFAULT false,
    "requiereFactura" BOOLEAN NOT NULL DEFAULT false,
    "numeroFactura" TEXT,
    "montoFactura" DECIMAL(10,2),
    "creadorId" INTEGER NOT NULL,
    "responsableId" INTEGER,
    "totalFinal" DECIMAL(10,2) NOT NULL DEFAULT 0,

    CONSTRAINT "OrdenTrabajo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContadorOrden" (
    "id" SERIAL NOT NULL,
    "anio" INTEGER NOT NULL,
    "contador" INTEGER NOT NULL DEFAULT 0,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ContadorOrden_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CatalogoMaterial" (
    "id" SERIAL NOT NULL,
    "descripcion" TEXT NOT NULL,
    "precioBase" DECIMAL(10,2),
    "actualizadoEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CatalogoMaterial_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CatalogoServicio" (
    "id" SERIAL NOT NULL,
    "descripcion" TEXT NOT NULL,
    "precioBase" DECIMAL(10,2),
    "actualizadoEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CatalogoServicio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CatalogoTercero" (
    "id" SERIAL NOT NULL,
    "descripcion" TEXT NOT NULL,
    "responsable" TEXT,
    "precioBase" DECIMAL(10,2),
    "actualizadoEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CatalogoTercero_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OTMaterial" (
    "id" SERIAL NOT NULL,
    "ordenId" INTEGER NOT NULL,
    "materialId" INTEGER NOT NULL,
    "cantidad" DECIMAL(10,2) NOT NULL,
    "precioAplicado" DECIMAL(10,2),

    CONSTRAINT "OTMaterial_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OTServicio" (
    "id" SERIAL NOT NULL,
    "ordenId" INTEGER NOT NULL,
    "servicioId" INTEGER NOT NULL,
    "descripcion" TEXT NOT NULL,
    "monto" DECIMAL(10,2),

    CONSTRAINT "OTServicio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OTTercero" (
    "id" SERIAL NOT NULL,
    "ordenId" INTEGER NOT NULL,
    "terceroId" INTEGER NOT NULL,
    "descripcion" TEXT NOT NULL,
    "monto" DECIMAL(10,2),

    CONSTRAINT "OTTercero_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LogActividad" (
    "id" SERIAL NOT NULL,
    "usuarioId" INTEGER NOT NULL,
    "ordenId" INTEGER,
    "accion" TEXT NOT NULL,
    "detalles" JSONB,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LogActividad_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_nombreUsuario_key" ON "Usuario"("nombreUsuario");

-- CreateIndex
CREATE UNIQUE INDEX "Cliente_numeroDocumento_key" ON "Cliente"("numeroDocumento");

-- CreateIndex
CREATE UNIQUE INDEX "MarcaVehiculo_nombre_key" ON "MarcaVehiculo"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "OrdenTrabajo_numeroOrden_key" ON "OrdenTrabajo"("numeroOrden");

-- CreateIndex
CREATE UNIQUE INDEX "ContadorOrden_anio_key" ON "ContadorOrden"("anio");

-- CreateIndex
CREATE INDEX "LogActividad_usuarioId_idx" ON "LogActividad"("usuarioId");

-- CreateIndex
CREATE INDEX "LogActividad_ordenId_idx" ON "LogActividad"("ordenId");

-- CreateIndex
CREATE INDEX "LogActividad_fecha_idx" ON "LogActividad"("fecha");

-- AddForeignKey
ALTER TABLE "Vehiculo" ADD CONSTRAINT "Vehiculo_marcaId_fkey" FOREIGN KEY ("marcaId") REFERENCES "MarcaVehiculo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrdenTrabajo" ADD CONSTRAINT "OrdenTrabajo_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrdenTrabajo" ADD CONSTRAINT "OrdenTrabajo_placa_fkey" FOREIGN KEY ("placa") REFERENCES "Vehiculo"("placa") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrdenTrabajo" ADD CONSTRAINT "OrdenTrabajo_creadorId_fkey" FOREIGN KEY ("creadorId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrdenTrabajo" ADD CONSTRAINT "OrdenTrabajo_responsableId_fkey" FOREIGN KEY ("responsableId") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OTMaterial" ADD CONSTRAINT "OTMaterial_ordenId_fkey" FOREIGN KEY ("ordenId") REFERENCES "OrdenTrabajo"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OTMaterial" ADD CONSTRAINT "OTMaterial_materialId_fkey" FOREIGN KEY ("materialId") REFERENCES "CatalogoMaterial"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OTServicio" ADD CONSTRAINT "OTServicio_ordenId_fkey" FOREIGN KEY ("ordenId") REFERENCES "OrdenTrabajo"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OTServicio" ADD CONSTRAINT "OTServicio_servicioId_fkey" FOREIGN KEY ("servicioId") REFERENCES "CatalogoServicio"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OTTercero" ADD CONSTRAINT "OTTercero_ordenId_fkey" FOREIGN KEY ("ordenId") REFERENCES "OrdenTrabajo"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OTTercero" ADD CONSTRAINT "OTTercero_terceroId_fkey" FOREIGN KEY ("terceroId") REFERENCES "CatalogoTercero"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LogActividad" ADD CONSTRAINT "LogActividad_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LogActividad" ADD CONSTRAINT "LogActividad_ordenId_fkey" FOREIGN KEY ("ordenId") REFERENCES "OrdenTrabajo"("id") ON DELETE SET NULL ON UPDATE CASCADE;
