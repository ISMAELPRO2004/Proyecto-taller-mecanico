-- CreateEnum
CREATE TYPE "Rol" AS ENUM ('ADMIN', 'RESPONSABLE', 'USUARIO_GENERAL');

-- CreateEnum
CREATE TYPE "EstadoOrden" AS ENUM ('EN_REPARACION', 'CAMBIO_ACEITE', 'ESPERANDO_REPUESTO', 'TERMINADO', 'CANCELADO');

-- CreateTable
CREATE TABLE "Usuario" (
    "id" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "nombreCompleto" TEXT,
    "rol" "Rol" NOT NULL DEFAULT 'USUARIO_GENERAL',
    "activo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CatalogoMaterial" (
    "id" SERIAL NOT NULL,
    "descripcion" TEXT NOT NULL,
    "precioBase" DECIMAL(10,2) NOT NULL,
    "actualizadoAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CatalogoMaterial_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrdenTrabajo" (
    "id" SERIAL NOT NULL,
    "numeroOrden" TEXT NOT NULL,
    "fechaCreacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "clienteNombre" TEXT NOT NULL,
    "clienteCelular" TEXT,
    "trabajoSolicitado" TEXT,
    "placa" TEXT NOT NULL,
    "marca" TEXT NOT NULL,
    "modelo" TEXT NOT NULL,
    "horometro" DOUBLE PRECISION,
    "kilometraje" DOUBLE PRECISION,
    "estado" "EstadoOrden" NOT NULL DEFAULT 'EN_REPARACION',
    "estaCerrada" BOOLEAN NOT NULL DEFAULT false,
    "creadorId" INTEGER NOT NULL,
    "responsableId" INTEGER NOT NULL,
    "totalFinal" DECIMAL(10,2) NOT NULL DEFAULT 0,

    CONSTRAINT "OrdenTrabajo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OTMaterial" (
    "id" SERIAL NOT NULL,
    "ordenId" INTEGER NOT NULL,
    "materialId" INTEGER NOT NULL,
    "cantidad" DECIMAL(10,2) NOT NULL,
    "precioAplicado" DECIMAL(10,2) NOT NULL,

    CONSTRAINT "OTMaterial_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OTServicio" (
    "id" SERIAL NOT NULL,
    "ordenId" INTEGER NOT NULL,
    "descripcion" TEXT NOT NULL,
    "monto" DECIMAL(10,2) NOT NULL,

    CONSTRAINT "OTServicio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OTTercero" (
    "id" SERIAL NOT NULL,
    "ordenId" INTEGER NOT NULL,
    "descripcion" TEXT NOT NULL,
    "monto" DECIMAL(10,2) NOT NULL,

    CONSTRAINT "OTTercero_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LogActividad" (
    "id" SERIAL NOT NULL,
    "usuarioId" INTEGER NOT NULL,
    "ordenId" INTEGER,
    "accion" TEXT NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LogActividad_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_username_key" ON "Usuario"("username");

-- CreateIndex
CREATE UNIQUE INDEX "OrdenTrabajo_numeroOrden_key" ON "OrdenTrabajo"("numeroOrden");

-- AddForeignKey
ALTER TABLE "OrdenTrabajo" ADD CONSTRAINT "OrdenTrabajo_creadorId_fkey" FOREIGN KEY ("creadorId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrdenTrabajo" ADD CONSTRAINT "OrdenTrabajo_responsableId_fkey" FOREIGN KEY ("responsableId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OTMaterial" ADD CONSTRAINT "OTMaterial_ordenId_fkey" FOREIGN KEY ("ordenId") REFERENCES "OrdenTrabajo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OTMaterial" ADD CONSTRAINT "OTMaterial_materialId_fkey" FOREIGN KEY ("materialId") REFERENCES "CatalogoMaterial"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OTServicio" ADD CONSTRAINT "OTServicio_ordenId_fkey" FOREIGN KEY ("ordenId") REFERENCES "OrdenTrabajo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OTTercero" ADD CONSTRAINT "OTTercero_ordenId_fkey" FOREIGN KEY ("ordenId") REFERENCES "OrdenTrabajo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LogActividad" ADD CONSTRAINT "LogActividad_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LogActividad" ADD CONSTRAINT "LogActividad_ordenId_fkey" FOREIGN KEY ("ordenId") REFERENCES "OrdenTrabajo"("id") ON DELETE SET NULL ON UPDATE CASCADE;
