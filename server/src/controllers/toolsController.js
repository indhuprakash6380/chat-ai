import Groq from 'groq-sdk';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const pdfParse = require('pdf-parse');
import ToolHistory from '../models/ToolHistory.js';
import dotenv from 'dotenv';
dotenv.config();

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const MODEL_NAME = 'llama-3.3-70b-versatile';

export const generateResume = async (req, res) => {
  try {
    const { personalDetails, skills, education, experience } = req.body;
    
    if (!personalDetails) {
      return res.status(400).json({ message: 'Personal details are required.' });
    }

    const prompt = `
You are an expert professional resume writer. Build a highly polished, professional, and well-structured resume based on these details:

--- PERSONAL DETAILS ---
Name: ${personalDetails.name || ''}
Email: ${personalDetails.email || ''}
Phone: ${personalDetails.phone || ''}
LinkedIn/Website: ${personalDetails.website || ''}

--- SKILLS ---
${skills || 'Not specified'}

--- EDUCATION ---
${education ? JSON.stringify(education) : 'Not specified'}

--- WORK EXPERIENCE ---
${experience ? JSON.stringify(experience) : 'Not specified'}

--- INSTRUCTIONS ---
Format the response using beautiful and clean GitHub Flavored Markdown. Avoid any conversational chatter at the start or end; output only the markdown resume itself. Include a professional summary statement at the top.
`;

    const completion = await groq.chat.completions.create({
      model: MODEL_NAME,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.5,
    });

    const result = completion.choices[0].message.content.trim();

    // Save to history
    await ToolHistory.create({
      user: req.user._id,
      toolType: 'resume',
      input: { personalDetails, skills, education, experience },
      output: result,
    });

    res.json({ result });
  } catch (error) {
    console.error('Resume Generation Error:', error);
    res.status(500).json({ message: 'AI Generation Error: ' + error.message });
  }
};

export const codeAssistant = async (req, res) => {
  try {
    const { code, language, action } = req.body;

    if (!code || !language || !action) {
      return res.status(400).json({ message: 'Code, language, and action are required.' });
    }

    let prompt = '';
    if (action === 'explain') {
      prompt = `You are a Senior Software Engineer. Explain the following ${language} code step-by-step. Focus on logic, time/space complexity, and general code flow:\n\n\`\`\`${language}\n${code}\n\`\`\``;
    } else if (action === 'fix') {
      prompt = `You are a Senior Software Engineer. Find syntax, logic, or runtime errors in the following ${language} code. Provide a summary of the issues and then output the complete corrected code in a code block:\n\n\`\`\`${language}\n${code}\n\`\`\``;
    } else if (action === 'optimize') {
      prompt = `You are a Senior Software Engineer. Suggest optimizations for complexity, efficiency, and styling in the following ${language} code. Provide explanations of the improvements and then output the optimized code in a code block:\n\n\`\`\`${language}\n${code}\n\`\`\``;
    } else {
      return res.status(400).json({ message: 'Invalid action.' });
    }

    const completion = await groq.chat.completions.create({
      model: MODEL_NAME,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
    });

    const result = completion.choices[0].message.content.trim();

    // Save to history
    await ToolHistory.create({
      user: req.user._id,
      toolType: 'code',
      input: { code, language, action },
      output: result,
    });

    res.json({ result });
  } catch (error) {
    console.error('Code Assistant Error:', error);
    res.status(500).json({ message: 'AI Processing Error: ' + error.message });
  }
};

export const writeEmail = async (req, res) => {
  try {
    const { emailType, context, description } = req.body;

    if (!emailType || !context) {
      return res.status(400).json({ message: 'Email type and context are required.' });
    }

    const prompt = `
You are an expert copywriter. Draft a highly compelling and professional ${emailType.replace('_', ' ')} email based on the following:

Context/Recipient: ${context}
Details/Points to include: ${description || 'Not specified'}

Instructions:
Provide a clear Subject line at the very top. Make the email body polished, natural, and persuasive. Format with clear spacing. Only output the subject line and email body. Do not include introductory/outro chatter.
`;

    const completion = await groq.chat.completions.create({
      model: MODEL_NAME,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.6,
    });

    const result = completion.choices[0].message.content.trim();

    // Save to history
    await ToolHistory.create({
      user: req.user._id,
      toolType: 'email',
      input: { emailType, context, description },
      output: result,
    });

    res.json({ result });
  } catch (error) {
    console.error('Email Writer Error:', error);
    res.status(500).json({ message: 'AI Writing Error: ' + error.message });
  }
};

export const summarizeNotes = async (req, res) => {
  try {
    let text = req.body.text || '';

    // If file was uploaded
    if (req.file) {
      const fileBuffer = req.file.buffer;
      if (req.file.mimetype === 'application/pdf') {
        const parsedPdf = await pdfParse(fileBuffer);
        text = parsedPdf.text;
      } else {
        // Assume text file
        text = fileBuffer.toString('utf-8');
      }
    }

    if (!text || text.trim().length === 0) {
      return res.status(400).json({ message: 'Please provide some text or upload a valid file.' });
    }

    const prompt = `
You are an executive assistant. Summarize the following text into clear, concise, short bullet points. Also, extract a list of the 5-10 most important keywords or key concepts highlighted in the text.

Text:
"""
${text}
"""

Instructions:
Format the output EXACTLY like this (use the tags SUMMARY: and KEYWORDS: as boundaries):

SUMMARY:
- [Short point 1]
- [Short point 2]
...

KEYWORDS:
[keyword1], [keyword2], [keyword3], ...
`;

    const completion = await groq.chat.completions.create({
      model: MODEL_NAME,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
    });

    const result = completion.choices[0].message.content.trim();

    // Parse summary and keywords
    let summary = '';
    let keywords = [];

    const summaryIndex = result.indexOf('SUMMARY:');
    const keywordsIndex = result.indexOf('KEYWORDS:');

    if (summaryIndex !== -1 && keywordsIndex !== -1) {
      summary = result.substring(summaryIndex + 8, keywordsIndex).trim();
      const kwStr = result.substring(keywordsIndex + 9).trim();
      keywords = kwStr.split(',').map(k => k.trim()).filter(Boolean);
    } else {
      summary = result;
      keywords = [];
    }

    // Save to history
    await ToolHistory.create({
      user: req.user._id,
      toolType: 'summary',
      input: { length: text.length, fileName: req.file ? req.file.originalname : 'Pasted Text' },
      output: { summary, keywords },
    });

    res.json({ result, summary, keywords });
  } catch (error) {
    console.error('Notes Summarizer Error:', error);
    res.status(500).json({ message: 'AI Summarization Error: ' + error.message });
  }
};

export const getHistory = async (req, res) => {
  try {
    const history = await ToolHistory.find({ user: req.user._id });
    res.json(history);
  } catch (error) {
    console.error('Get History Error:', error);
    res.status(500).json({ message: error.message });
  }
};

export const deleteHistory = async (req, res) => {
  try {
    const success = await ToolHistory.deleteById(req.params.id, req.user._id);
    if (success) {
      res.json({ success: true, message: 'History item deleted successfully' });
    } else {
      res.status(404).json({ message: 'History item not found' });
    }
  } catch (error) {
    console.error('Delete History Error:', error);
    res.status(500).json({ message: error.message });
  }
};
