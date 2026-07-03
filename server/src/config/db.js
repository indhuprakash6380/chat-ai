import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

const connectDB = async () => {
  try {
    // Try primary connection
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.warn('⚠️  Local MongoDB unavailable, starting in-memory database...');
    try {
      const mongod = await MongoMemoryServer.create();
      const uri = mongod.getUri();
      await mongoose.connect(uri);
      console.log('✅ In-Memory MongoDB started automatically (Chat will not persist)');
    } catch (memErr) {
      console.error('❌ Could not start in-memory MongoDB:', memErr.message);
      process.exit(1);
    }
  }
};

export default connectDB;
