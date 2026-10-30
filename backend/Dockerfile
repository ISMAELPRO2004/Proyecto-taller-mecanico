FROM node:22-bookworm-slim AS deps
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@10.18.3 --activate
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile --prod

FROM node:22-bookworm-slim
WORKDIR /app

ENV NODE_ENV=production \
    PYTHON=/opt/placas-venv/bin/python \
    YOLO_CONFIG_DIR=/tmp/Ultralytics \
    OMP_NUM_THREADS=2 \
    PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

RUN apt-get update \
    && apt-get install -y --no-install-recommends \
      python3 \
      python3-venv \
      python3-pip \
      libglib2.0-0 \
      libgomp1 \
      libgl1 \
      ca-certificates \
      openssl \
    && rm -rf /var/lib/apt/lists/* \
    && python3 -m venv /opt/placas-venv

COPY ml/placas/requirements.txt /tmp/requirements-placas.txt
RUN /opt/placas-venv/bin/pip install --no-cache-dir --upgrade pip \
    && /opt/placas-venv/bin/pip install --no-cache-dir \
      torch torchvision --index-url https://download.pytorch.org/whl/cpu \
    && /opt/placas-venv/bin/pip install --no-cache-dir -r /tmp/requirements-placas.txt \
    && rm /tmp/requirements-placas.txt

COPY --from=deps /app/node_modules ./node_modules
COPY package.json pnpm-lock.yaml ./
COPY prisma ./prisma
COPY prisma.config.ts ./
COPY src ./src
COPY ml ./ml
COPY scripts ./scripts
COPY uploads ./uploads
COPY docker-entrypoint.sh ./

ENV DATABASE_URL="postgresql://lyer:lyer@localhost:5432/lyer_motors?schema=public"
RUN node_modules/.bin/prisma generate \
    && chmod +x docker-entrypoint.sh \
    && mkdir -p /app/uploads/ordenes /app/uploads/auditoria /tmp/Ultralytics

EXPOSE 3000
VOLUME ["/app/uploads"]
ENTRYPOINT ["./docker-entrypoint.sh"]
