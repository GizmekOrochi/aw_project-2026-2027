
import { DatabaseSync } from 'node:sqlite';
import { mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

// Définir le chemin de la base de données
const serverRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
export const databasePath = resolve(serverRoot, 'data/app.sqlite');

// Ouvrir la base SQLite
export function openDatabase() {
  // Crer le dossier data s'il n'existe pas
  mkdirSync(dirname(databasePath), { recursive: true });

  const db = new DatabaseSync(databasePath);
  db.exec('PRAGMA foreign_keys = ON;');

  return db;
}

export function initializeDatabase(db) {
  db.exec(`
    BEGIN;
    DROP TABLE IF EXISTS sessions;
    CREATE TABLE IF NOT EXISTS admins (
      discord_id TEXT NOT NULL PRIMARY KEY
    ) WITHOUT ROWID;
    COMMIT;
  `);
}
