import { readDB, writeDB } from '../utils/fileDB.js';
import bcrypt from 'bcryptjs';

export default {
  findOne: async (query) => {
    const db = readDB();
    const user = db.users.find(u => u.email === query.email);
    if (user) {
      user.matchPassword = async (entered) => await bcrypt.compare(entered, user.password);
    }
    return user;
  },
  findById: (id) => {
    const db = readDB();
    const user = db.users.find(u => u._id === id);
    return {
      select: (fields) => {
        if (!user) return null;
        const { password, ...rest } = user;
        return rest;
      }
    };
  },
  create: async (data) => {
    const db = readDB();
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(data.password, salt);
    
    const newUser = {
      _id: Date.now().toString(),
      name: data.name,
      email: data.email,
      password: hashedPassword,
    };
    
    db.users.push(newUser);
    writeDB(db);
    return newUser;
  }
};
