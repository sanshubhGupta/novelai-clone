// novelai-clone/server/services/geminiService.js
const { GoogleGenerativeAI } = require('@google/generative-ai');
const config = require('../config');

// Initialize Gemini AI with API key from config
const genAI = new GoogleGenerativeAI(config.geminiApiKey);

let model; // Declare model outside to be initialized once

(async () => {
  try {
    // Ensure config is loaded before trying to use geminiModelName
    if (!config.geminiModelName || !config.geminiApiKey) {
      console.error("Gemini model name or API key not configured.");
      // Potentially throw an error or handle gracefully
      return;
    }
    model = genAI.getGenerativeModel({ model: config.geminiModelName });
    console.log(`Gemini model ${config.geminiModelName} initialized.`);
  } catch (e) {
    console.error("Failed to initialize Gemini model:", e);
    // Handle initialization error, maybe exit process or disable AI features
  }
})();


/**
 * Generates creative content using the Gemini API for continuous story.
 * @param {string} currentPrompt The user's latest input for continuation.
 * @param {Array<Object>} history The array of previous chat messages ({ role: 'user'|'model', parts: [{ text: '...' }] }).
 * @param {number} [length=200] The maximum number of output tokens for the continuation.
 * @returns {Promise<string>} The generated text.
 */
const generateContent = async (currentPrompt, history = [], length = 200) => {
  if (!model) {
    throw new Error('Gemini model not initialized. Check API key and configuration.');
  }
  if (!currentPrompt && history.length === 0) {
    throw new Error('Prompt is required to start or continue content generation.');
  }

  const generationConfig = {
    temperature: 0.9, // Can be exposed to frontend later
    topP: 1,          // Can be exposed to frontend later
    topK: 1,          // Can be exposed to frontend later
    maxOutputTokens: length,
  };

  const safetySettings = [
    { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
    { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
    { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
    { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
  ];

  try {
    // Create a new chat session with the provided history
    // The 'model' variable is initialized once globally.
    const chat = model.startChat({
      history: history, // Pass the chat history here
    });

    // Send the current prompt as the next message in the chat
    // This tells Gemini: "Given this history, *this* is the user's new input. Respond accordingly."
    const result = await chat.sendMessage(currentPrompt);

    const response = result.response;
    let generatedText = '';

    if (response && response.candidates && response.candidates.length > 0) {
      const candidate = response.candidates[0];
      if (candidate.content && candidate.content.parts && candidate.content.parts.length > 0) {
        generatedText = candidate.content.parts[0].text;
      }
    } else {
      console.warn('Gemini API response did not contain expected content or was blocked:', JSON.stringify(response, null, 2));
      // Check for prompt feedback, e.g., if safety blocked it
      if (response && response.promptFeedback && response.promptFeedback.blockReason) {
          throw new Error(`Content generation blocked due to: ${response.promptFeedback.blockReason}`);
      }
      throw new Error('Unexpected API response structure from Gemini or content was blocked.');
    }

    return generatedText;

  } catch (error) {
    console.error('Error in geminiService.generateContent:', error.message);
    if (error.cause && error.cause.response && error.cause.response.data) {
      console.error('Gemini SDK Error Details:', error.cause.response.data);
      throw new Error(error.cause.response.data.error || 'Failed to generate content from Gemini API.');
    } else if (error.response && error.response.data) {
      // Fallback for axios-like errors if SDK doesn't wrap it fully
      console.error('API Call Error Details:', error.response.data);
      throw new Error(error.response.data.error || 'Failed to generate content from external API.');
    } else {
      throw new Error(`Generation failed: ${error.message}`);
    }
  }
};

module.exports = {
  generateContent,
};