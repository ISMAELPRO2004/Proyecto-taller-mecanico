-- CreateTable
CREATE TABLE "ContadorOrden" (
    "id" SERIAL NOT NULL,
    "anio" INTEGER NOT NULL,
    "contador" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ContadorOrden_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ContadorOrden_anio_key" ON "ContadorOrden"("anio");
