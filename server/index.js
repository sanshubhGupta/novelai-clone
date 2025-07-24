// novelai-clone/server/index.js
require('dotenv').config();
const express = require('express');
const session = require('express-session');
const cors = require('cors'); // Import cors

const { GoogleGenerativeAI } = require('@google/generative-ai'); // Import Gemini SDK

const app = express();

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const geminiModel = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });


// CORS Middleware
app.use(cors({
  origin: 'http://localhost:3000', // Allow your React app to connect
  credentials: true, // Allow cookies to be sent
}));

// Body parser middleware
app.use(express.json());

// Session Middleware (in-memory store for simplicity)
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: {
    maxAge: 1000 * 60 * 60 * 24, // 1 day
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
    sameSite: 'lax',
  }
}));

// In-memory logging middleware
app.use((req, res, next) => {
  if (!req.session.inferenceLog) {
    req.session.inferenceLog = [];
  }

  res.on('finish', () => {
    // Log only if it was a generation request and successful
    if (req.path === '/api/generate' && res.locals.generation) {
      const { prompt, length } = req.body;
      const output = res.locals.generation;

      const logEntry = {
        prompt,
        output,
        length: length || 'N/A', // length might not be sent
        timestamp: new Date().toISOString(),
        sessionId: req.sessionID,
      };

      req.session.inferenceLog.push(logEntry);
      // Optional: limit the size of the in-memory log
      if (req.session.inferenceLog.length > 100) {
        req.session.inferenceLog.shift(); // Remove oldest entry
      }
      console.log('Inference logged (in-memory):', logEntry.prompt.substring(0, 50) + '...');
    }
  });
  next();
});


// GENERATE ROUTE
app.post('/api/generate', async (req, res) => {
  const { prompt, length } = req.body;
  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required.' });
  }

  try {
    const generationConfig = {
      temperature: 0.9,
      topP: 1,
      topK: 1,
      maxOutputTokens: length || 2048,
    };

    const safetySettings = [
      { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
      { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
      { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
      { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
    ];

    const result = await geminiModel.generateContent({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig,
      safetySettings,
    });

    const response = result.response;
    let generatedText = '';

    if (response && response.candidates && response.candidates.length > 0) {
      const candidate = response.candidates[0];
      if (candidate.content && candidate.content.parts && candidate.content.parts.length > 0) {
        generatedText = candidate.content.parts[0].text;
      }
    } else {
      console.warn('Gemini API response did not contain expected content:', JSON.stringify(response, null, 2));
      return res.status(500).json({ error: 'Failed to generate content: Unexpected API response structure.' });
    }

    // Store the generated text in res.locals for the logging middleware
    res.locals.generation = generatedText;
    res.json({ text: generatedText });

  } catch (err) {
    console.error('Gemini API Error:', err.message);
    if (err.response && err.response.data) { // Axios error for some reason (not @google/generative-ai)
      console.error('Gemini API Error Details:', err.response.data);
      res.status(err.response.status || 500).json({
        error: 'Failed to generate content from Gemini API.',
        details: err.response.data.error || err.message
      });
    } else if (err.cause && err.cause.response && err.cause.response.data) { // More specific for @google/generative-ai SDK errors
        console.error('Gemini API Error Details (SDK):', err.cause.response.data);
         res.status(err.cause.response.status || 500).json({
            error: 'Failed to generate content from Gemini API.',
            details: err.cause.response.data.error || err.message
        });
    }
    else {
      res.status(500).json({ error: 'Generation failed', details: err.message });
    }
  }
});

// Basic route for checking server status
app.get('/', (req, res) => {
  res.send('Novel.AI Clone Backend is running!');
});

// Example route to view current session logs (for debugging)
app.get('/api/logs', (req, res) => {
    res.json(req.session.inferenceLog || []);
});


// Error handling middleware (catch-all for unhandled errors)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send({ error: 'Something broke on the server!', details: err.message });
});

const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`Server running on port ${port}`));