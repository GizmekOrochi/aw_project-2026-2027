import { loadEnvFile } from 'node:process';
import { fileURLToPath } from 'node:url';

// Chemin absolu : fonctionne depuis la racine, server/ et bot/.
const envPath = fileURLToPath(new URL('../.env', import.meta.url));
try {
  loadEnvFile(envPath);
} catch (error) {
  if (error.code !== 'ENOENT') throw error;
  // En production, les variables peuvent être injectées par l'hébergeur.
}
