// client/src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import GenerateStoryPage from './pages/GenerateStoryPage';
import ContinuousStoryPage from './pages/ContinuousStoryPage';

export default function App() {
  return (
    <Router>
      <Navbar />
      <main className="container mx-auto p-4">
        <Routes>
          <Route path="/" element={<GenerateStoryPage />} />
          <Route path="/continuous" element={<ContinuousStoryPage />} />
          {/* Add more routes here as your app grows */}
        </Routes>
      </main>
    </Router>
  );
}