// novelai-clone/client/src/api.js
import axios from 'axios';

const API = axios.create({ baseURL: 'http://localhost:4000/api', withCredentials: true });

export const generateStory = async ({ prompt, length }) => {
  try {
    const response = await API.post('/generate', { prompt, length });
    return response.data.text;
  } catch (error) {
    console.error('Error generating story:', error.response?.data || error.message);
    throw error.response?.data?.details || error.response?.data?.error || 'An unexpected error occurred.';
  }
};