// novelai-clone/server/index.js
require('dotenv').config(); // Load environment variables
const express = require('express');
const session = require('express-session');
const cors = require('cors');

const config = require('./config'); // Centralized configuration
const sessionLogger = require('./middleware/sessionLogger'); // Our custom logging middleware
const storyRoutes = require('./routes/storyRoutes'); // Our story generation routes

const app = express();

// CORS Middleware - allow frontend to connect
app.use(cors({
  origin: 'http://localhost:3000', // React app URL
  credentials: true, // Allow cookies for session management
}));

// Body parser middleware - to parse JSON requests
app.use(express.json());

// Session Middleware - using in-memory store (for now)
app.use(session({
  secret: config.sessionSecret,
  resave: false,
  saveUninitialized: true,
  cookie: {
    maxAge: 1000 * 60 * 60 * 24, // 1 day
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
    sameSite: 'lax',
  }
}));

// Custom session logging middleware
app.use(sessionLogger);

// Main API Routes
app.use('/api', storyRoutes); // All story-related routes prefixed with /api

// Basic route for checking server status
app.get('/', (req, res) => {
  res.send('Novel.AI Clone Backend is running! (Modular Version)');
});

// Centralized Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send({ error: 'Something broke on the server!', details: err.message });
});

app.listen(config.port, () => console.log(`Server running on port ${config.port}`));