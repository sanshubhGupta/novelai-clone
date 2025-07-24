// client/src/components/Navbar.js
import React from 'react';
import { Link, useLocation } from 'react-router-dom';

export default function Navbar() {
  const location = useLocation();

  const getLinkClasses = (path) =>
    `px-4 py-2 rounded-md transition-colors duration-200 ${
      location.pathname === path
        ? 'bg-blue-700 text-white'
        : 'text-blue-200 hover:bg-blue-600 hover:text-white'
    }`;

  return (
    <nav className="bg-blue-800 p-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-white text-2xl font-bold">
          Novel.AI Clone
        </Link>
        <div className="space-x-4">
          <Link to="/" className={getLinkClasses('/')}>
            Generate New Story
          </Link>
          <Link to="/continuous" className={getLinkClasses('/continuous')}>
            Continuous Story
          </Link>
        </div>
      </div>
    </nav>
  );
}