/** @type {import('tailwindcss').Config} */
export default {
  // Asegúrate de que el contenido incluya la carpeta 'modules'
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "lyer-green": "#064e3b",
        "lyer-accent": "#10b981",
      },
    },
  },
  plugins: [],
  // Eliminamos DaisyUI del config y lo manejamos por CSS
}