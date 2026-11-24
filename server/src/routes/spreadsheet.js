import express from 'express';
import challengeService from '../services/challengeService.js';
import resolutionService from '../services/resolutionService.js';

const router = express.Router();

const asyncRoute = (method, path, handler) => {
  router[method](path, (req, res, next) => {
    Promise.resolve().then(() => handler(req, res, next)).catch(next);
  });
};

const isNonEmptyString = (...values) =>
  values.every((val) => typeof val === 'string' && val.trim().length > 0);

const isValidDate = (dateStr) => {
  if (typeof dateStr !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return false;
  }
  const timestamp = Date.parse(dateStr);
  return !Number.isNaN(timestamp) && new Date(timestamp).toISOString().slice(0, 10) === dateStr;
};

const sendBadRequest = (res) => res.status(400).json({ error: 'Paramètres invalides' });
const sendNotFound = (res) => res.status(404).json({ error: 'Introuvable' });

asyncRoute('post', '/addDefi', async (req, res) => {
  const { name, content, date } = req.body || {};
  
  if (!isNonEmptyString(name, content) || !isValidDate(date)) {
    return sendBadRequest(res);
  }

  const defiId = await challengeService.addDefi(name, content, date);
  res.json({ DefiID: defiId });
});

asyncRoute('get', '/getDefis', async (req, res) => {
  const defis = await challengeService.getDefis();
  res.json(defis);
});

asyncRoute('get', '/getDefi/:date', async (req, res) => {
  if (!isValidDate(req.params.date)) {
    return sendBadRequest(res);
  }

  const defi = await challengeService.getByDate(req.params.date);

  return defi ? res.json({ DefiID: defi.DefiID }) : sendNotFound(res);
});

const defiFieldRoutes = [
  ['getName', 'Nom'],
  ['getContent', 'Contenu'],
  ['getDefiDate', 'date'],
];

for (const [path, key] of defiFieldRoutes) {
  asyncRoute('get', `/${path}/:id`, async (req, res) => {
    const defi = await challengeService.getById(req.params.id);

    return defi ? res.json({ [key]: defi[key] }) : sendNotFound(res);
  });
}

asyncRoute('post', '/addSolution', async (req, res) => {
  const body = req.body || {};
  const userId = body.UserID ?? body.userId;
  const defiId = body.IDDefi ?? body.DefiID ?? body.defiId;
  const content = body.Content ?? body.Contenu ?? body.content;
  const date = body.date;

  const isDiscordId = /^\d{17,20}$/.test(userId);
  const isParsableDate = Number.isFinite(Date.parse(date));

  if (!isNonEmptyString(userId, defiId, content, date) || !isDiscordId || !isParsableDate) {
    return sendBadRequest(res);
  }

  const solutionId = await resolutionService.addSolution(userId, defiId, content, date);
  return solutionId ? res.json({ IDSolution: solutionId }) : sendNotFound(res);
});

asyncRoute('delete', '/removeSolution/:id', async (req, res) => {
  const isRemoved = await resolutionService.removeSolution(req.params.id);
  return isRemoved ? res.json({ removed: true }) : sendNotFound(res);
});

asyncRoute('get', '/getSolutions', async (req, res) => {
  const { UserID, DefiID } = req.query;
  const filteredSolutions = await resolutionService.getSolutions({ UserID, DefiID });

  res.json(filteredSolutions);
});

asyncRoute('get', '/getSolutionId/:userId/:defiId', async (req, res) => {
  const { userId, defiId } = req.params;
  const solution = await resolutionService.getByUserAndDefi(userId, defiId);

  return solution ? res.json({ IDSolution: solution.IDSolution }) : sendNotFound(res);
});

const solutionFieldRoutes = [
  ['getSolution', null],
  ['getSolutionUserID', 'UserID'],
  ['getSolutionDefiID', 'DefiID'],
  ['getSolutionContent', 'Contenu'],
  ['getSolutionDate', 'LastUpdatedate'],
];

for (const [path, key] of solutionFieldRoutes) {
  asyncRoute('get', `/${path}/:id`, async (req, res) => {
    const solution = await resolutionService.getById(req.params.id);

    if (!solution) {
      return sendNotFound(res);
    }

    return res.json(key ? { [key]: solution[key] } : solution);
  });
}

asyncRoute('post', '/addDefaultResponse', async (req, res) => {
  const body = req.body || {};
  const defiId = body.DefiID ?? body.IDDefi ?? body.defiId;
  const content = body.Content ?? body.Contenu ?? body.content;
  if (!isNonEmptyString(defiId, content)) return sendBadRequest(res);
  const success = await challengeService.addDefaultResponse(defiId, content);
  return success ? res.json({ success: true, DefiID: defiId }) : sendNotFound(res);
});

asyncRoute('get', '/getDefaultResponse/:id', async (req, res) => {
  const content = await challengeService.getDefaultResponse(req.params.id);
  return content !== null ? res.json({ DefiID: req.params.id, ReponseDefault: content }) : sendNotFound(res);
});

asyncRoute('delete', '/removeDefaultResponse/:id', async (req, res) => {
  const removed = await challengeService.removeDefaultResponse(req.params.id);
  return removed ? res.json({ removed: true }) : sendNotFound(res);
});

export default router;
