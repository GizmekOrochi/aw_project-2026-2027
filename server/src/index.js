import '../../config/env.mjs';
import app from './app.js';
import { openDatabase, initializeDatabase } from './db/database.js';

const db = openDatabase();
initializeDatabase(db);
app.locals.db = db;

const port = process.env.PORT || 3001;
const server = app.listen(port, () => {
  console.log(`API prête : http://localhost:${port}`);
});

function shutdown() {
  server.close(() => {
    db.close();
    process.exit(0);
  });
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
