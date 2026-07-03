import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import toolsRoutes from './routes/toolsRoutes.js';

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/tools', toolsRoutes);

// Main Root
app.get('/', (req, res) => {
  res.send('AI Chat Application API is running');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, async () => {
  console.log(`\n🚀 AI Chat Server running at http://localhost:${PORT}`);
  console.log(`🔗 API: http://localhost:${PORT}/api\n`);
  await connectDB();
});
