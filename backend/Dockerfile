FROM node:22-alpine AS base
WORKDIR /app

# Instalar pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copiar manifiestos e instalar dependencias
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile --prod

# Copiar fuentes
COPY . .

# Generar cliente Prisma
RUN npx prisma generate

EXPOSE 3000

# Migraciones + seed opcional + arrancar
# SEED=true solo si quieres poblar la DB en este despliegue
CMD ["sh", "-c", "pnpm exec prisma migrate deploy && \
  if [ \"$RUN_SEED\" = 'true' ]; then node prisma/seed.js; fi && \
  node src/server.js"]