export function isAdmin(db, discordId) {
  return db.prepare('SELECT 1 FROM admins WHERE discord_id = ?').get(discordId) !== undefined;
}

export function addAdmin(db, discordId) {
  return db.prepare('INSERT OR IGNORE INTO admins (discord_id) VALUES (?)').run(discordId).changes > 0;
}

export function removeAdmin(db, discordId) {
  return db.prepare('DELETE FROM admins WHERE discord_id = ?').run(discordId).changes > 0;
}

export function getAdmins(db) {
  return db.prepare('SELECT discord_id FROM admins ORDER BY discord_id').all().map(row => row.discord_id);
}
