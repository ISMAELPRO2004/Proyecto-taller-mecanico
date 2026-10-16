-- Al borrar la orden se van también sus materiales, servicios y terceros.
ALTER TABLE "OTMaterial" DROP CONSTRAINT "OTMaterial_ordenId_fkey";
ALTER TABLE "OTMaterial" ADD CONSTRAINT "OTMaterial_ordenId_fkey" FOREIGN KEY ("ordenId") REFERENCES "OrdenTrabajo"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "OTServicio" DROP CONSTRAINT "OTServicio_ordenId_fkey";
ALTER TABLE "OTServicio" ADD CONSTRAINT "OTServicio_ordenId_fkey" FOREIGN KEY ("ordenId") REFERENCES "OrdenTrabajo"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "OTTercero" DROP CONSTRAINT "OTTercero_ordenId_fkey";
ALTER TABLE "OTTercero" ADD CONSTRAINT "OTTercero_ordenId_fkey" FOREIGN KEY ("ordenId") REFERENCES "OrdenTrabajo"("id") ON DELETE CASCADE ON UPDATE CASCADE;
