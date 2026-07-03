import Chat from '../models/Chat.js';
import Groq from 'groq-sdk';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const pdfParse = require('pdf-parse');
import dotenv from 'dotenv';
dotenv.config();

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export const getChats = async (req, res) => {
  try {
    const chats = await Chat.find({ user: req.user._id }).sort({ updatedAt: -1 });
    res.json(chats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getChatById = async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.id);
    if (chat && chat.user.toString() === req.user._id.toString()) {
      res.json(chat);
    } else {
      res.status(404).json({ message: 'Chat not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createChat = async (req, res) => {
  try {
    const userChats = await Chat.find({ user: req.user._id }).sort();
    const newChatTitles = userChats
      .map(c => c.title)
      .filter(t => t === 'New Chat' || /^New Chat \d+$/.test(t));

    let title = 'New Chat';
    if (newChatTitles.includes('New Chat')) {
      let index = 2;
      while (newChatTitles.includes(`New Chat ${index}`)) {
        index++;
      }
      title = `New Chat ${index}`;
    }

    const chat = await Chat.create({
      user: req.user._id,
      title,
      messages: []
    });
    res.status(201).json(chat);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.id);
    if (!chat || chat.user.toString() !== req.user._id.toString()) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    const { content } = req.body;
    let fileContentText = '';
    let fileName = '';

    if (req.file) {
      fileName = req.file.originalname;
      const fileBuffer = req.file.buffer;
      if (req.file.mimetype === 'application/pdf') {
        try {
          const parsedPdf = await pdfParse(fileBuffer);
          fileContentText = parsedPdf.text;
        } catch (pdfErr) {
          console.error('PDF parsing error in chat:', pdfErr);
          return res.status(400).json({ message: 'Failed to parse PDF file' });
        }
      } else {
        fileContentText = fileBuffer.toString('utf-8');
      }
    }
    
    // Add user message to array (including attachment marker if exists)
    const userMessageContent = (content || '') + (req.file ? `\n\n📎 Attachment: ${fileName}` : '');
    chat.messages.push({ role: 'user', content: userMessageContent });
    
    // Automatically update chat title based on first message (first 4-5 words)
    if (chat.messages.length === 1 && /^New Chat( \d+)?$/.test(chat.title)) {
      const words = (content || '').trim().split(/\s+/);
      const titleWords = words.slice(0, 5).join(' ');
      chat.title = titleWords + (words.length > 5 ? '...' : '');
    }

    // Prepare messages for AI
    const apiMessages = [
      { role: 'system', content: 'You are a helpful, smart, and concise AI assistant.' },
      ...chat.messages.map(msg => ({ role: msg.role, content: msg.content }))
    ];

    // Append raw parsed text to the last user message in AI payload so AI has context
    if (req.file && apiMessages.length > 0) {
      apiMessages[apiMessages.length - 1].content += `\n\n[Attached File Content: ${fileName}]\n${fileContentText}`;
    }

    try {
      const completion = await groq.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages: apiMessages,
      });

      const aiResponse = completion.choices[0].message.content;
      chat.messages.push({ role: 'assistant', content: aiResponse });
      
      await chat.save();
      res.json(chat);
    } catch (apiError) {
      console.error(apiError);
      res.status(500).json({ message: 'AI API Error: ' + apiError.message });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const renameChat = async (req, res) => {
  try {
    const { title } = req.body;
    if (!title || title.trim() === '') {
      return res.status(400).json({ message: 'Title is required' });
    }

    const chat = await Chat.updateById(req.params.id, req.user._id, { title: title.trim() });
    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }
    res.json(chat);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteChat = async (req, res) => {
  try {
    const success = await Chat.deleteById(req.params.id, req.user._id);
    if (!success) {
      return res.status(404).json({ message: 'Chat not found' });
    }
    res.json({ success: true, message: 'Chat deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
