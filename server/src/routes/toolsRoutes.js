import express from 'express';
import multer from 'multer';
import { 
  generateResume, 
  codeAssistant, 
  writeEmail, 
  summarizeNotes, 
  getHistory,
  deleteHistory
} from '../controllers/toolsController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Multer memory storage configuration for single file upload
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

router.use(protect);

router.post('/resume', generateResume);
router.post('/code', codeAssistant);
router.post('/email', writeEmail);
router.post('/summarize', upload.single('file'), summarizeNotes);
router.get('/history', getHistory);
router.delete('/history/:id', deleteHistory);

export default router;
