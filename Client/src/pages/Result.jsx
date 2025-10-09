import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const Result = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { result, inputType, goal } = state || {};

  if (!result) {
    return (
      <div className="max-w-3xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md mt-6">
        <p className="text-red-500 text-center">No result found. Please try again.</p>
        <button
          onClick={() => navigate('/')}
          className="mt-4 w-full bg-teal-500 text-white px-4 py-2 rounded-md hover:bg-teal-600 transition"
        >
          Back to Home
        </button>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="max-w-3xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md mt-6"
    >
      <h2 className="text-2xl font-semibold mb-4 dark:text-white">
        {goal.charAt(0).toUpperCase() + goal.slice(1)} Result for {inputType}
      </h2>
      <pre className="whitespace-pre-wrap bg-gray-50 dark:bg-gray-700 p-4 rounded-md dark:text-white">
        {result}
      </pre>
      <button
        onClick={() => navigate('/')}
        className="mt-4 w-full bg-teal-500 text-white px-4 py-2 rounded-md hover:bg-teal-600 transition"
      >
        Try Another
      </button>
    </motion.div>
  );
};

export default Result;