import express from 'express';
import spreadsheetRoutes from './routes/spreadsheet.js';
import adminRoutes from './routes/admin.js';
import requireAdminToken from './middleware/requireAdminToken.js';

const app = express();
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, database: 'sqlite' });
});

app.use('/api', adminRoutes);

app.use('/api/addDefi', requireAdminToken);
app.use('/api/addDefaultResponse', requireAdminToken);
app.use('/api/getDefaultResponse', requireAdminToken);
app.use('/api/removeDefaultResponse', requireAdminToken);
app.use('/api', spreadsheetRoutes);
app.use((err, _req, res, _next) => {
  console.error(err.message);
  res.status(err.status || 503).json({error: 'Erreur serveur ou Google Sheets indisponible'});
});

export default app;
