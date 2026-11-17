
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

// Créer les tables de la base
export function initializeDatabase(db) {
  db.exec(`
    -- Créer la table des sessions
    CREATE TABLE IF NOT EXISTS sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      discord_id TEXT NOT NULL,
      token_hash TEXT NOT NULL UNIQUE,
      expires_at TEXT NOT NULL,
      revoked_at TEXT,
      created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
    );

    -- Accélérer la recherche par utilisateur
    CREATE INDEX IF NOT EXISTS idx_sessions_discord_id ON sessions(discord_id);

    -- Accélérer la recherche par date d'expiration
    CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON sessions(expires_at);
  `);
}
