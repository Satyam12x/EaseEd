import React, { useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const InputForm = ({ onSubmit }) => {
  const [inputData, setInputData] = useState('');
  const [inputType, setInputType] = useState('text');
  const [goal, setGoal] = useState('learn');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Basic validation
      if (inputType === 'text' && !inputData.trim()) {
        throw new Error('Please provide input text');
      }
      if (inputType === 'youtube' && !inputData.trim()) {
        throw new Error('Please provide a YouTube URL');
      }
      if ((inputType === 'pdf' || inputType === 'image') && !inputData) {
        throw new Error('Please select a file');
      }
      if (!goal) {
        throw new Error('Please select a goal');
      }

      let endpoint = '';
      const formData = new FormData();
      if (inputType === 'text') {
        formData.append('text', inputData);
        endpoint = `/api/${goal}/text`;
      } else if (inputType === 'pdf' || inputType === 'image') {
        formData.append('file', inputData);
        endpoint = `/api/${goal}/${inputType}`;
      } else if (inputType === 'youtube') {
        formData.append('url', inputData);
        endpoint = `/api/${goal}/youtube`;
      }

      console.log('Sending request:', {
        inputType,
        inputData: inputType === 'text' || inputType === 'youtube' ? inputData : inputData?.name,
        goal,
        endpoint,
        headers: inputType === 'text' ? 'application/x-www-form-urlencoded' : 'multipart/form-data',
      });

      const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}${endpoint}`, formData, {
        headers: {
          'Content-Type': inputType === 'text' ? 'application/x-www-form-urlencoded' : 'multipart/form-data',
        },
      });

      console.log('Response received:', response.data);
      onSubmit(response.data.result);
      navigate('/results'); // Navigate to results page
    } catch (err) {
      console.error('API Error:', {
        status: err.response?.status,
        data: err.response?.data,
        message: err.message,
      });
      onSubmit(`Error: ${err.response?.data?.detail || err.message || 'Something went wrong.'}`);
    }
  };

  return (
    <motion.form
      onSubmit={handleSubmit}
      className="space-y-4 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Input Type</label>
        <select
          value={inputType}
          onChange={(e) => {
            setInputType(e.target.value);
            setInputData(''); // Reset input when type changes
          }}
          className="mt-1 block w-full p-2 border rounded dark:bg-gray-700 dark:text-white"
        >
          <option value="text">Text/Topic</option>
          <option value="pdf">PDF</option>
          <option value="image">Image</option>
          <option value="youtube">YouTube</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Input</label>
        {inputType === 'text' || inputType === 'youtube' ? (
          <input
            type="text"
            value={inputData}
            onChange={(e) => setInputData(e.target.value)}
            className="mt-1 block w-full p-2 border rounded dark:bg-gray-700 dark:text-white"
            placeholder={inputType === 'text' ? 'Enter topic or text' : 'Enter YouTube URL'}
          />
        ) : (
          <input
            type="file"
            onChange={(e) => setInputData(e.target.files[0])}
            className="mt-1 block w-full p-2 border rounded dark:bg-gray-700 dark:text-white"
            accept={inputType === 'pdf' ? '.pdf' : 'image/*'}
          />
        )}
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Goal</label>
        <select
          value={goal}
          onChange={(e) => setGoal(e.target.value)}
          className="mt-1 block w-full p-2 border rounded dark:bg-gray-700 dark:text-white"
        >
          <option value="learn">Learn/Explain</option>
          <option value="quiz">Generate Quiz</option>
          <option value="notes">Generate Notes</option>
        </select>
      </div>
      <button
        type="submit"
        className="w-full bg-teal-500 text-white p-2 rounded hover:bg-teal-600 transition"
      >
        Submit
      </button>
    </motion.form>
  );
};

export default InputForm;