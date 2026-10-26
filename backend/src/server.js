import { createApp } from './app.js';
import { env } from './config/env.js';
import { log } from './utils/logger.js';

const app = createApp();

const servidor = app.listen(env.port, '0.0.0.0', () => {
  log.info(`Servidor listo en el puerto ${env.port}`);
});

servidor.on('error', (error) => {
  log.error('El servidor HTTP no pudo arrancar', error);
  process.exit(1);
});

process.on('unhandledRejection', (motivo) => {
  const error = motivo instanceof Error ? motivo : new Error(String(motivo));
  log.error('Promesa rechazada sin capturar', error);
});

process.on('uncaughtException', (error) => {
  log.error('Excepción no capturada', error);
  process.exit(1);
});
