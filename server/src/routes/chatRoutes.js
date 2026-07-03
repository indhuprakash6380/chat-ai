import express from 'express';
import multer from 'multer';
import { getChats, getChatById, createChat, sendMessage, renameChat, deleteChat } from '../controllers/chatController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

router.route('/')
  .get(protect, getChats)
  .post(protect, createChat);

router.route('/:id')
  .get(protect, getChatById)
  .put(protect, renameChat)
  .delete(protect, deleteChat);

router.route('/:id/messages')
  .post(protect, upload.single('file'), sendMessage);

export default router;
