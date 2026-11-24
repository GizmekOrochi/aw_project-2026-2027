import express from 'express';
import { isAdmin, addAdmin, removeAdmin, getAdmins, isValidDiscordId } from '../services/adminService.js';
import requireAdminToken from '../middleware/requireAdminToken.js';

const router = express.Router();

router.get('/isAdmin/:discordId', (req, res) => {
  const { discordId } = req.params;
  if (!isValidDiscordId(discordId)) {
    return res.status(400).json({ error: 'ID Discord invalide' });
  }
  res.json({ isAdmin: isAdmin(req.app.locals.db, discordId) });
});

router.post('/addAdmin', requireAdminToken, (req, res) => {
  const { discordId } = req.body || {};
  if (!isValidDiscordId(discordId)) {
    return res.status(400).json({ error: 'ID Discord invalide' });
  }
  const added = addAdmin(req.app.locals.db, discordId);
  return res.status(added ? 201 : 200).json({ discordId, added, isAdmin: true });
});

router.delete('/removeAdmin/:discordId', requireAdminToken, (req, res) => {
  const { discordId } = req.params;
  if (!isValidDiscordId(discordId)) return res.status(400).json({ error: 'ID Discord invalide' });
  const removed = removeAdmin(req.app.locals.db, discordId);
  return removed ? res.json({ discordId, removed: true, isAdmin: false }) : res.status(404).json({ error: 'Administrateur introuvable' });
});

router.get('/getAdmins', requireAdminToken, (req, res) => res.json(getAdmins(req.app.locals.db)));

export default router;
