
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './', // Asegura rutas relativas para despliegues estáticos simples
  server: {
    port: 3000
  }
});
