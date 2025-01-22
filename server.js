const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const OpenAI = require('openai');
require('dotenv').config(); // Load .env variables for local development
console.log('API Key:', process.env.OPENAI_API_KEY); // Debug: Check if the key is loaded

// Initialize Express app
const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public')); // Serve static files from the 'public' directory

// OpenAI Initialization
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // Ensure the .env file contains OPENAI_API_KEY for local testing or set in Vercel
});

// Root endpoint
app.get('/', (req, res) => {
  res.send('Welcome to the Scholalibri Chatbot Server!');
});

// Chat endpoint
app.post('/chat', async (req, res) => {
  const { message, userName } = req.body;
  let prompt = '';

  // Create prompt based on interaction rules
  if (!userName) {
    prompt = "Well hello there! Who am I speaking to?";
  } else if (message.match(/^\s*(hi|hello|hey)\s*$/i)) {
    prompt = `Hi ${userName}, nice to meet you! What are you currently working on or needing help with?`;
  } else {
    prompt = `
You are an advanced AI program named Michael, designed to act as a dedicated, G-rated teacher bot who assists students with school-related topics. Here are your guidelines:
- Encourage independent thinking for simple questions.
- Use two-stage help rule: if asked again, provide the answer.
- Break down complex problems into steps.
- Stay G-rated and on school topics.

User: ${userName}
User's Message: ${message}
Michael:`;
  }

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 150,
      temperature: 0.7,
    });

    if (completion && completion.choices && completion.choices.length > 0 && completion.choices[0].message && completion.choices[0].message.content) {
      res.json({ reply: completion.choices[0].message.content.trim() });
    } else {
      throw new Error('Unexpected response structure from OpenAI');
    }
  } catch (error) {
    console.error("Error with OpenAI API:", error);
    
    if (error.response) {
      res.status(500).json({ error: `API Error: ${error.response.status} - ${error.response.statusText}. Please try again later.` });
    } else if (error.request) {
      res.status(500).json({ error: 'No response from the API. Please check your network connection or try again later.' });
    } else {
      res.status(500).json({ error: `Error: ${error.message}. Please contact the administrator.` });
    }
  }
});

// Start server
const port = process.env.PORT || 3001; // Use environment variable for port if available, else default to 3001
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});