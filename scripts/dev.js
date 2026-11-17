
import { spawn, spawnSync } from 'node:child_process';

// Choisir la commande npm selon le système
const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';
// Initialiser la base SQLite
const init = spawnSync(process.execPath, ['server/scripts/init-db.js'], { stdio: 'inherit' });

// Arrêter si l'initialisation échoue
if (init.status !== 0) process.exit(init.status || 1);

// Demarrer le backend et le frontend
const children = [
  spawn(npm, ['run', 'dev', '--workspace=server'], { stdio: 'inherit' }),
  spawn(npm, ['run', 'dev', '--workspace=client'], { stdio: 'inherit' }),
];

let stopping = false;

// Arrete tout
function stop(exitCode = 0) {
  if (stopping) return;
  stopping = true;

  for (const child of children) {
    if (child.pid) child.kill('SIGTERM');
  }

  process.exitCode = exitCode;
}

// Surveiller les erreurs et les arrêts
for (const child of children) {
  child.on('error', error => { console.error(error); stop(1); });
  child.on('exit', code => { if (!stopping) stop(code || 0); });
}

process.on('SIGINT', () => stop(0));
process.on('SIGTERM', () => stop(0));
