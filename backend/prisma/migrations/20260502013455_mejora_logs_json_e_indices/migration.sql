/*
  Warnings:

  - The `detalles` column on the `LogActividad` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "LogActividad" ADD COLUMN     "ipCliente" TEXT,
ADD COLUMN     "userAgent" TEXT,
DROP COLUMN "detalles",
ADD COLUMN     "detalles" JSONB;

-- CreateIndex
CREATE INDEX "LogActividad_usuarioId_idx" ON "LogActividad"("usuarioId");

-- CreateIndex
CREATE INDEX "LogActividad_ordenId_idx" ON "LogActividad"("ordenId");

-- CreateIndex
CREATE INDEX "LogActividad_fecha_idx" ON "LogActividad"("fecha");
