import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// Cible des appels /api. Dans le dev container, l'API tourne dans le même
// conteneur ; avec docker compose up, elle a son propre service (http://api:3000).
const apiTarget = process.env.API_PROXY_TARGET ?? 'http://localhost:3000';

export default defineConfig({
  plugins: [react()],
  // Sous docker compose, le cache va dans le volume de node_modules : il n'est
  // pas partagé avec le Vite du dev container (voir compose.yaml)
  cacheDir: process.env.VITE_CACHE_DIR,
  server: {
    // Toutes les interfaces, comme --host : par défaut, Vite n'écoute que sur
    // localhost, et le port n'est pas joignable hors du conteneur
    host: true,
    proxy: { '/api': apiTarget },
  },
});
