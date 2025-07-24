// novelai-clone/client/src/api.js
import axios from 'axios';

const API_BASE_URL = 'http://localhost:4000/api'; // Your backend URL

export const generateStory = async ({ prompt, length, history = [] }) => { // history has a default empty array
  try {
    const response = await axios.post(`${API_BASE_URL}/generate`, {
      prompt,
      length,
      history, // This needs to be correctly included in the POST body
    });
    return response.data.text;
  } catch (error) {
    console.error('API Error:', error.response ? error.response.data : error.message);
    throw error.response ? error.response.data.error : 'An unexpected error occurred.';
  }
};