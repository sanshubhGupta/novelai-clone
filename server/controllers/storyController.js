// novelai-clone/server/controllers/storyController.js
const geminiService = require('../services/geminiService');

/**
 * Handles the story generation request.
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 */
const generateStory = async (req, res) => {
  const { prompt, length } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required.' });
  }

  try {
    const generatedText = await geminiService.generateContent(prompt, length);

    // Store the generated text in res.locals for the logging middleware
    res.locals.generation = generatedText;

    res.json({ text: generatedText });
  } catch (error) {
    console.error('Error in storyController.generateStory:', error.message);
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