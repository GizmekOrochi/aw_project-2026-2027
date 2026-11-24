import express from 'express';
import { isAdmin } from './db/admins.js';

const app = express();
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, database: 'sqlite' });
});

app.get('/api/isAdmin/:discordId', (req, res) => {
  const { discordId } = req.params;
  if (!/^\d{17,20}$/.test(discordId)) {
    return res.status(400).json({ error: 'ID Discord invalide' });
  }
  res.json({ isAdmin: isAdmin(req.app.locals.db, discordId) });
});

export default app;
