import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const Results = ({ result }) => {
  return (
    <motion.div
      className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-2xl"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Result</h2>
      {result.startsWith('Error:') ? (
        <p className="text-red-500">{result}</p>
      ) : (
        <pre className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{result}</pre>
      )}
      <Link
        to="/"
        className="mt-4 inline-block bg-teal-500 text-white p-2 rounded hover:bg-teal-600 transition"
      >
        Back to Input
      </Link>
    </motion.div>
  );
};

export default Results;