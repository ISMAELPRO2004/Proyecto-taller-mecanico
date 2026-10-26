import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [tailwindcss(), vue()],
  server: {
    allowedHosts: true,
    // Si el WS de HMR se cae (túnel Cloudflare), Vite recarga toda la página.
    // En el celular se siente como un F5. overlay: true deja el error de Vue, no el reload.
    hmr: {
      overlay: true,
    },
  },
})
