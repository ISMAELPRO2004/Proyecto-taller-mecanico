import { createApp } from './app.js';
import { env } from './config/env.js';

const app = createApp();

app.listen(env.port, '0.0.0.0', () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${env.port}`);
});
