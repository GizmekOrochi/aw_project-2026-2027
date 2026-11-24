export function isAdmin(db, discordId) {
  return db.prepare('SELECT 1 FROM admins WHERE discord_id = ?').get(discordId) !== undefined;
}
