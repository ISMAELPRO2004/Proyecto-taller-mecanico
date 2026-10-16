-- El DNI/RUC puede omitirse en recepción. Varios NULL conviven con el índice único.
ALTER TABLE "Cliente" ALTER COLUMN "numeroDocumento" DROP NOT NULL;
