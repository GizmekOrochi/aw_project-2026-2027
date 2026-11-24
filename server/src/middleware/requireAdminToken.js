import { timingSafeEqual } from 'node:crypto';

// Protection minimale des routes sensibles, en attendant Discord OAuth.
// Le token reste côté serveur, jamais dans le frontend.
export default function requireAdminToken(req, res, next) {
  const expected = process.env.ADMIN_API_TOKEN;
  if (!expected) return res.status(503).json({ error: 'ADMIN_API_TOKEN non configuré' });
  const supplied = req.get('Authorization') || '';
  const a = Buffer.from(supplied);
  const b = Buffer.from(`Bearer ${expected}`);
  if (a.length !== b.length || !timingSafeEqual(a, b)) {
    return res.status(401).json({ error: 'Non autorisé' });
  }
  next();
}

