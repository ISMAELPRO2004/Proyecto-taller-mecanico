/** Logs de consola del API. No imprimir secretos (JWT, tokens, contraseñas). */

const marcaTiempo = () => new Date().toISOString();

const textoExtra = (datos) => {
  if (datos == null) return '';
  if (datos instanceof Error) {
    return ` ${datos.message}${datos.code ? ` [${datos.code}]` : ''}`;
  }
  try {
    return ` ${JSON.stringify(datos)}`;
  } catch {
    return '';
  }
};

export const log = {
  info: (mensaje, datos) => {
    console.log(`[INFO ${marcaTiempo()}] ${mensaje}${textoExtra(datos)}`);
  },
  warn: (mensaje, datos) => {
    console.warn(`[WARN ${marcaTiempo()}] ${mensaje}${textoExtra(datos)}`);
  },
  error: (mensaje, error, datos) => {
    const extra = error instanceof Error
      ? { mensaje: error.message, codigo: error.code, ...(datos || {}) }
      : datos;
    console.error(`[ERROR ${marcaTiempo()}] ${mensaje}${textoExtra(extra)}`);
    if (error instanceof Error && error.stack) {
      console.error(error.stack);
    }
  },
};
