// novelai-clone/server/models/InferenceLog.js
// This file is a placeholder/definition for future database integration.
// It describes the expected structure of an inference log entry.

// This file is not actively used in the current in-memory logging setup,
// as the sessionLogger.js just pushes plain JS objects matching this structure.
// If you integrate MongoDB later, you would uncomment/add mongoose schema definitions here.

/*
// Example Mongoose Schema if you re-introduce MongoDB:
const mongoose = require('mongoose');

const InferenceLogSchema = new mongoose.Schema({
  sessionId: { type: String, required: true, index: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true }, // Example for user association
  prompt: { type: String, required: true },
  output: { type: String, required: true },
  model: { type: String, default: 'gemini-2.0-flash' },
  timestamp: { type: Date, default: Date.now },
  length: { type: Number }
});

module.exports = mongoose.model('InferenceLog', InferenceLogSchema);
*/

// For the current in-memory setup, this file serves as documentation of the data shape.
// No 'module.exports' is strictly needed for functionality here if not using Mongoose.