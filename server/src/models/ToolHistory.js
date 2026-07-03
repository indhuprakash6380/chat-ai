import { readDB, writeDB } from '../utils/fileDB.js';

export default {
  find: (query) => {
    const db = readDB();
    const userId = query.user;
    const histories = db.toolHistories || [];
    return histories.filter(h => h.user === userId).sort((a, b) => b.createdAt - a.createdAt);
  },
  
  create: async (data) => {
    const db = readDB();
    if (!db.toolHistories) {
      db.toolHistories = [];
    }
    
    const newHistory = {
      _id: Date.now().toString(),
      user: data.user,
      toolType: data.toolType, // 'resume' | 'code' | 'email' | 'summary'
      input: data.input,
      output: data.output,
      createdAt: Date.now()
    };
    
    db.toolHistories.push(newHistory);
    writeDB(db);
    return newHistory;
  },

  deleteById: async (id, userId) => {
    const db = readDB();
    if (!db.toolHistories) return false;
    
    const initialLength = db.toolHistories.length;
    db.toolHistories = db.toolHistories.filter(h => !(h._id === id && h.user === userId));
    
    if (db.toolHistories.length !== initialLength) {
      writeDB(db);
      return true;
    }
    return false;
  }
};
