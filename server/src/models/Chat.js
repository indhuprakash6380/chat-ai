import { readDB, writeDB } from '../utils/fileDB.js';

export default {
  find: (query) => {
    const db = readDB();
    const userId = query.user;
    return {
      sort: () => {
        return db.chats.filter(c => c.user === userId).sort((a,b) => b.updatedAt - a.updatedAt);
      }
    };
  },
  findById: async (id) => {
    const db = readDB();
    const chatIndex = db.chats.findIndex(c => c._id === id);
    if (chatIndex === -1) return null;
    
    const chat = db.chats[chatIndex];
    chat.save = async () => {
      const newDb = readDB();
      const idx = newDb.chats.findIndex(c => c._id === id);
      newDb.chats[idx] = chat;
      newDb.chats[idx].updatedAt = Date.now();
      writeDB(newDb);
    };
    return chat;
  },
  create: async (data) => {
    const db = readDB();
    const newChat = {
       _id: Date.now().toString(),
       user: data.user,
       title: data.title || 'New Chat',
       messages: data.messages || [],
       updatedAt: Date.now()
    };
    db.chats.push(newChat);
    writeDB(db);
    return newChat;
  },
  updateById: async (id, userId, updates) => {
    const db = readDB();
    const chatIndex = db.chats.findIndex(c => c._id === id && c.user === userId);
    if (chatIndex === -1) return null;

    db.chats[chatIndex] = {
      ...db.chats[chatIndex],
      ...updates,
      updatedAt: Date.now()
    };
    writeDB(db);
    return db.chats[chatIndex];
  },
  deleteById: async (id, userId) => {
    const db = readDB();
    const chatIndex = db.chats.findIndex(c => c._id === id && c.user === userId);
    if (chatIndex === -1) return false;

    db.chats.splice(chatIndex, 1);
    writeDB(db);
    return true;
  }
};
