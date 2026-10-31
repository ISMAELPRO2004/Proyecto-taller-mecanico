import { createApp } from './app.js';
import { env } from './config/env.js';
import { rutaModeloPlaca } from './services/placa/reconocerConYolo.js';
import { log } from './utils/logger.js';

const app = createApp();

const servidor = app.listen(env.port, '0.0.0.0', () => {
  const modelo = rutaModeloPlaca();
  log.info(`Servidor listo en el puerto ${env.port}`);
  if (modelo) log.info('Modelo de placas: listo', { modelo });
  else log.warn('Modelo de placas: sin peso (best.pt). El escaneo no leerá dígitos.');
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
