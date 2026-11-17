import { openDatabase, initializeDatabase, databasePath } from '../src/db/database.js';

const db = openDatabase();
try {
  initializeDatabase(db);
  console.log(`SQLite prête : ${databasePath}`);
} finally {
  db.close();
}
