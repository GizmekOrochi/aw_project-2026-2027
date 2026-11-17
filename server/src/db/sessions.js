// Gestion des sessions dans SQLite

// Creer une nouvelle session
export function createSession(db, { discordId, tokenHash, expiresAt }) {
  // Vérifier les informations
  if (!discordId || !tokenHash || !expiresAt || Number.isNaN(Date.parse(expiresAt))) {
    throw new Error('discordId, tokenHash and a valid expiresAt are required');
  }

  // Ajouter la session dans la base
  const result = db.prepare(`
    INSERT INTO sessions (discord_id, token_hash, expires_at)
    VALUES (?, ?, ?)
  `).run(discordId, tokenHash, expiresAt);

  // Retourner l'ID créé
  return Number(result.lastInsertRowid);
}

// Chercher une session encore valide
export function findValidSession(db, tokenHash) {
  return db.prepare(`
    SELECT id, discord_id AS discordId, expires_at AS expiresAt, created_at AS createdAt
    FROM sessions
    WHERE token_hash = ? AND revoked_at IS NULL AND expires_at > ?
  `).get(tokenHash, new Date().toISOString()) ?? null;
}

// Deconnecter une session
export function revokeSession(db, tokenHash) {
  return db.prepare(`
    UPDATE sessions SET revoked_at = ?
    WHERE token_hash = ? AND revoked_at IS NULL
  `).run(new Date().toISOString(), tokenHash).changes;
}

// Deconnecter toutes les sessions d'un utilisateur
export function revokeUserSessions(db, discordId) {
  return db.prepare(`
    UPDATE sessions SET revoked_at = ?
    WHERE discord_id = ? AND revoked_at IS NULL
  `).run(new Date().toISOString(), discordId).changes;
}

// Supprimer les sessions expirées
export function deleteExpiredSessions(db) {
  return db.prepare('DELETE FROM sessions WHERE expires_at <= ?')
    .run(new Date().toISOString()).changes;
}
