// novelai-clone/server/middleware/sessionLogger.js
// This middleware logs inference requests to the session (in-memory)
// and can be extended later for database persistence.

const sessionLogger = (req, res, next) => {
  // Ensure session.inferenceLog exists
  if (!req.session.inferenceLog) {
    req.session.inferenceLog = [];
  }

  // When the response finishes, log the successful generation
  res.on('finish', () => {
    // Only log if it was a successful generation request (handled by storyController)
    if (req.path === '/api/generate' && res.locals.generation) {
      const { prompt, length } = req.body; // Prompt and length from request body
      const output = res.locals.generation; // Output stored by the controller

      const logEntry = {
        prompt,
        output,
        length: length || 'N/A',
        timestamp: new Date().toISOString(),
        sessionId: req.sessionID,
      };

      req.session.inferenceLog.push(logEntry);

      // Keep the in-memory log from growing indefinitely
      if (req.session.inferenceLog.length > 100) {
        req.session.inferenceLog.shift(); // Remove the oldest entry
      }
      console.log('Inference logged (in-memory):', logEntry.prompt.substring(0, 50) + '...');
    }
  });
  next();
};

module.exports = sessionLogger;