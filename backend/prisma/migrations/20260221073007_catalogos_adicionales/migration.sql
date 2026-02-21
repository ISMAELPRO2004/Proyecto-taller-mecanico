-- CreateTable
CREATE TABLE "CatalogoServicio" (
    "id" SERIAL NOT NULL,
    "descripcion" TEXT NOT NULL,
    "precioBase" DECIMAL(10,2) NOT NULL,
    "actualizadoAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CatalogoServicio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CatalogoTercero" (
    "id" SERIAL NOT NULL,
    "descripcion" TEXT NOT NULL,
    "montoBase" DECIMAL(10,2) NOT NULL,
    "actualizadoAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CatalogoTercero_pkey" PRIMARY KEY ("id")
);
