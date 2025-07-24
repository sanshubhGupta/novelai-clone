// novelai-clone/server/routes/storyRoutes.js
const express = require('express');
const { generateStory, getInferenceLogs } = require('../controllers/storyController');
const router = express.Router();

// Route for generating a story
router.post('/generate', generateStory);

// Optional: Route to get session logs (for debugging or future "history" feature)
router.get('/logs', getInferenceLogs);

module.exports = router;