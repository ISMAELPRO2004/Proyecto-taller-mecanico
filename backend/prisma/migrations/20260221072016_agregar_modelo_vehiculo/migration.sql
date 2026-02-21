-- CreateTable
CREATE TABLE "Vehiculo" (
    "placa" TEXT NOT NULL,
    "marca" TEXT NOT NULL,
    "modelo" TEXT NOT NULL,
    "horometro" DOUBLE PRECISION DEFAULT 0,
    "kilometraje" DOUBLE PRECISION DEFAULT 0,
    "actualizadoAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Vehiculo_pkey" PRIMARY KEY ("placa")
);

-- AddForeignKey
ALTER TABLE "OrdenTrabajo" ADD CONSTRAINT "OrdenTrabajo_placa_fkey" FOREIGN KEY ("placa") REFERENCES "Vehiculo"("placa") ON DELETE RESTRICT ON UPDATE CASCADE;
