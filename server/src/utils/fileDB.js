import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, '../../db.json');

const initDB = () => {
  if (!fs.existsSync(dbPath)) {
    fs.writeFileSync(dbPath, JSON.stringify({ users: [], chats: [], toolHistories: [] }, null, 2));
  } else {
    try {
      const data = fs.readFileSync(dbPath, 'utf8');
      const db = JSON.parse(data);
      if (!db.toolHistories) {
        db.toolHistories = [];
        fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
      }
    } catch (e) {
      console.error("Error initializing toolHistories in db.json:", e);
    }
  }
};

const readDB = () => {
  initDB();
  const data = fs.readFileSync(dbPath, 'utf8');
  return JSON.parse(data);
};

const writeDB = (data) => {
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
};

export { readDB, writeDB };
