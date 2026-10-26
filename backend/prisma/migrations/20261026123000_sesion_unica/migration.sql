-- Una sesión activa por usuario: el JWT lleva sesionVersion.
ALTER TABLE "Usuario" ADD COLUMN "sesionVersion" INTEGER NOT NULL DEFAULT 0;
