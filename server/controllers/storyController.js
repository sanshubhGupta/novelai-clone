// novelai-clone/server/controllers/storyController.js
const geminiService = require('../services/geminiService');

/**
 * Handles the story generation request.
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 */
const generateStory = async (req, res) => {
  // CORRECT: Destructure prompt, length, AND history from req.body
  const { prompt, length, history } = req.body; //

  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required.' });
  }

  try {
    // CORRECT: Pass prompt, history, and length to geminiService.generateContent
    // The history parameter needs to be explicitly passed for chat functionality.
    const generatedText = await geminiService.generateContent(prompt, history, length);

    // Store the generated text in res.locals for the logging middleware
    res.locals.generation = generatedText;

    res.json({ text: generatedText });
  } catch (error) {
    console.error('Error in storyController.generateStory:', error.message);
    // Use the error.message from the service if available for more specific errors
    res.status(500).json({ error: error.message || 'Story generation failed.' });
  }
};

// Example for fetching logs (for debugging/future UI)
const getInferenceLogs = (req, res) => {
    // In this in-memory version, logs are just in req.session
    res.json(req.session.inferenceLog || []);
};

module.exports = {
  generateStory,
  getInferenceLogs,
};