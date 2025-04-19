// server.js
const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const cors = require('cors');

const app = express();
const port = 3001;

app.use(cors());
app.use(bodyParser.json());

const OPENAI_API_KEY = ''; // NEVER expose this in front-end

app.post('/chat', async (req, res) => {
    const { message, context } = req.body;
  
    const systemPrompt = `
  You are WorkPilot — an intelligent workplace assistant. 
  Your job is to help users plan and execute their workday efficiently, while being mindful of their mood, energy, and schedule.
  Use the following context to guide your response.
  
  Current Mood: ${context.mood || 'Unknown'}
  Sleep Hours: ${context.sleep || 'Unknown'}
  Rested Level: ${context.rested || 'Unknown'}
  Heart Rate: ${context.heartRate || 'Unknown'}
  Meetings Today: ${context.calendar?.length || 0}
  Tasks Today: ${context.tasks?.length || 0}
  
  User's Tasks: ${context.tasks?.map(t => `- ${t.text}`).join('\n') || 'No tasks'}
  User's Calendar: ${context.calendar?.map(c => `- ${c.time}: ${c.title}`).join('\n') || 'No meetings'}
  
  Now respond to the user's query and guide them like a productivity expert copilot.
  Be friendly but efficient.
  `;
  
    try {
      const response = await axios.post('https://api.openai.com/v1/chat/completions', {
        model: 'gpt-4o', // Or gpt-4-turbo
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message }
        ],
      }, {
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        }
      });
  
      const reply = response.data.choices[0].message.content;
      res.json({ reply });
  
    } catch (error) {
      console.error(error.response?.data || error.message);
      res.status(500).json({ error: 'Failed to get response from OpenAI' });
    }
  });
  

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
