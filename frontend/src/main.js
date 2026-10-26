import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import router from './router/index.js';
import { aplicarTema, temaGuardado } from './utils/tema.js';
import './style.css';

aplicarTema(temaGuardado());

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);
app.use(router);

router.isReady().then(() => {
  app.mount('#app');
});