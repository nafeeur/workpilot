import OpenAI from 'openai';
import cors from 'cors';
import express from 'express';

const app = express();
app.use(cors());
app.use(express.json());

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

app.post('/api/chat', async (req, res) => {
  const { message, context } = req.body;

  try {
    const systemPrompt = `You are a friendly productivity assistant.
Mood: ${context.mood || 'unknown'}
Sleep: ${context.sleep || 'unknown'}
Rested level: ${context.rested || 'unknown'}
Feeling: ${context.feeling || 'unknown'}
Meetings today: ${(context.calendar || []).length}
Tasks pending: ${(context.tasks || []).length}.
    
Assist the user appropriately.`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: message }
      ]
    });

    const reply = response.choices[0]?.message?.content?.trim() || "I'm not sure how to respond.";

    res.status(200).json({ reply });

  } catch (error) {
    console.error('OpenAI Error:', error.response?.data || error.message);
    res.status(500).json({ reply: "Sorry, I couldn't get a proper response right now." });
  }
});

// Important: Export the app as a Vercel handler
export default app;
