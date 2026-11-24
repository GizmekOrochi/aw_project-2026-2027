import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  envDir: fileURLToPath(new URL('../', import.meta.url)),
  // Seules les variables publiques VITE_ sont accessibles dans React.
  envPrefix: 'VITE_',
  server: { port: 5173 },
});
