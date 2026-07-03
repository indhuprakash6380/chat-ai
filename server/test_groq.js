import Groq from 'groq-sdk';
import dotenv from 'dotenv';
dotenv.config();

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

async function main() {
  try {
    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: 'What is Java?' }],
    });
    console.log("SUCCESS:", completion.choices[0].message.content);
  } catch (e) {
    console.error("GROQ ERROR IS:", e.message);
  }
}
main();
