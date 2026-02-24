/*
  Warnings:

  - You are about to drop the column `montoBase` on the `CatalogoTercero` table. All the data in the column will be lost.
  - Added the required column `precioBase` to the `CatalogoTercero` table without a default value. This is not possible if the table is not empty.
  - Added the required column `servicioId` to the `OTServicio` table without a default value. This is not possible if the table is not empty.
  - Added the required column `terceroId` to the `OTTercero` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "CatalogoTercero" DROP COLUMN "montoBase",
ADD COLUMN     "precioBase" DECIMAL(10,2) NOT NULL;

-- AlterTable
ALTER TABLE "OTServicio" ADD COLUMN     "servicioId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "OTTercero" ADD COLUMN     "terceroId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "OTServicio" ADD CONSTRAINT "OTServicio_servicioId_fkey" FOREIGN KEY ("servicioId") REFERENCES "CatalogoServicio"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OTTercero" ADD CONSTRAINT "OTTercero_terceroId_fkey" FOREIGN KEY ("terceroId") REFERENCES "CatalogoTercero"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
