import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Result from './pages/Result';
import './index.css';

const App = () => {
  const [theme, setTheme] = useState('light');

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
    document.documentElement.classList.toggle('dark');
  };

  return (
    <div className={`min-h-screen ${theme === 'light' ? 'bg-gray-100' : 'bg-gray-900 text-white'}`}>
      <Router>
        <header className="p-4 bg-teal-600 text-white flex justify-between items-center">
          <h1 className="text-2xl font-bold">EaseEd</h1>
          <button
            onClick={toggleTheme}
            className="px-4 py-2 bg-teal-700 rounded-md hover:bg-teal-800 transition"
          >
            {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
          </button>
        </header>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/result" element={<Result />} />
        </Routes>
      </Router>
    </div>
  );
};

export default App;