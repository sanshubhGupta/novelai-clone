// novelai-clone/server/config/index.js
module.exports = {
  port: process.env.PORT || 4000,
  sessionSecret: process.env.SESSION_SECRET || 'aVeryStrongAndRandomSecretStringForYourSessions',
  geminiApiKey: process.env.GEMINI_API_KEY,
  geminiModelName: "gemini-2.0-flash", // Your working model!
};