import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import OpenAI from 'openai';

const app = express();
const PORT = 3001;

app.use(cors());
app.use(bodyParser.json());

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

app.post('/chat', async (req, res) => {
  const { message, context } = req.body;

  console.log('Received message:', message);
  console.log('With context:', context);

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
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: message }
      ]
    });

    const reply = response.choices[0]?.message?.content?.trim() || "I'm not sure how to respond.";

    res.json({ reply });

  } catch (error) {
    console.error('OpenAI Error:', error);
    res.status(500).json({ reply: "Sorry, I couldn't get a proper response right now." });
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
