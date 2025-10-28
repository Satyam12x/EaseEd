import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import InputForm from './components/InputForm';
import Results from './components/Results';

import './index.css';


const App = () => {
  const [result, setResult] = useState('');

  const handleSubmit = (result) => {
    console.log('App received result:', result);
    setResult(result);
  };

  return (
    <Router>
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex flex-col items-center justify-center p-4">
        <h1 className="text-4xl font-bold mb-8 text-gray-900 dark:text-white">EaseEd</h1>
        <Routes>
          <Route
            path="/"
            element={<InputForm onSubmit={handleSubmit} />}
          />
          <Route
            path="/results"
            element={<Results result={result} />}
          />
        </Routes>
      </div>
    </Router>
  );
};

export default App;