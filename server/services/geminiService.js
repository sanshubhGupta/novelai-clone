// novelai-clone/server/services/geminiService.js
const { GoogleGenerativeAI } = require('@google/generative-ai');
const config = require('../config');

// Initialize Gemini AI with API key from config
const genAI = new GoogleGenerativeAI(config.geminiApiKey);
const model = genAI.getGenerativeModel({ model: config.geminiModelName });

/**
 * Generates creative content using the Gemini API.
 * @param {string} prompt The text prompt for generation.
 * @param {number} [length=2048] The maximum number of output tokens.
 * @returns {Promise<string>} The generated text.
 */
const generateContent = async (prompt, length = 2048) => {
  if (!prompt) {
    throw new Error('Prompt is required for content generation.');
  }

  const generationConfig = {
    temperature: 0.9,
    topP: 1,
    topK: 1,
    maxOutputTokens: length,
  };

  const safetySettings = [
    { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
    { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
    { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
    { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
  ];

  try {
    const result = await model.generateContent({
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
      throw new Error('Unexpected API response structure from Gemini.');
    }

    return generatedText;

  } catch (error) {
    console.error('Error in geminiService.generateContent:', error.message);
    if (error.cause && error.cause.response && error.cause.response.data) {
      // More specific error details from the GoogleGenerativeAI SDK
      console.error('Gemini SDK Error Details:', error.cause.response.data);
      throw new Error(error.cause.response.data.error || 'Failed to generate content from Gemini API.');
    } else if (error.response && error.response.data) {
       // Axios-like error for direct http calls (less likely with SDK)
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