#!/bin/sh
set -eu

mkdir -p /app/uploads/ordenes /app/uploads/auditoria /tmp/Ultralytics

if [ ! -f /app/ml/placas/modelos/best.pt ] && [ ! -f /opt/placas-modelo/best.pt ]; then
  echo "AVISO: no hay best.pt. Copia el peso a backend/ml/placas/modelos/ y reinicia el backend."
fi

echo "Aplicando migraciones..."
i=0
until node_modules/.bin/prisma migrate deploy; do
  i=$((i + 1))
  if [ "$i" -ge 20 ]; then
    echo "No se pudo migrar la base de datos."
    exit 1
  fi
  echo "Esperando PostgreSQL... ($i)"
  sleep 2
done

RUN_SEED="${RUN_SEED:-if-empty}"
if [ "$RUN_SEED" = "true" ]; then
  echo "Ejecutando seed..."
  node prisma/seed.js
elif [ "$RUN_SEED" = "false" ]; then
  echo "Seed desactivado."
else
  node scripts/seed-si-vacio.js
fi

echo "Arrancando API..."
exec node src/server.js
