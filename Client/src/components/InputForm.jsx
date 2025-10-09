import React from 'react';
import axios from 'axios';
import { FaUpload, FaPlayCircle } from 'react-icons/fa';

const InputForm = ({ inputType, setInputType, setInputData, onSubmit }) => {
  const handleInputChange = (e) => {
    if (inputType === 'text' || inputType === 'youtube') {
      setInputData(e.target.value);
    } else {
      setInputData(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let formData = new FormData();
      let endpoint = '';
      if (inputType === 'text') {
        formData.append('text', inputData);
        endpoint = `/api/learn/text`; // Default to learn for simplicity
      } else if (inputType === 'youtube') {
        formData.append('url', inputData);
        endpoint = `/api/notes/youtube`;
      } else {
        formData.append('file', inputData);
        endpoint = `/api/learn/${inputType}`;
      }

      const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}${endpoint}`, formData, {
        headers: { 'Content-Type': inputType === 'text' || inputType === 'youtube' ? 'application/json' : 'multipart/form-data' },
      });
      onSubmit(response.data.result);
    } catch (err) {
      onSubmit(`Error: ${err.response?.data?.detail || 'Something went wrong.'}`);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-lg font-medium mb-2 dark:text-white">Input Type</label>
        <select
          value={inputType}
          onChange={(e) => setInputType(e.target.value)}
          className="w-full p-2 border rounded-md dark:bg-gray-700 dark:text-white"
        >
          <option value="text">Text/Topic</option>
          <option value="pdf">PDF</option>
          <option value="image">Image</option>
          <option value="youtube">YouTube Link</option>
        </select>
      </div>
      <div>
        <label className="block text-lg font-medium mb-2 dark:text-white">Upload Input</label>
        {inputType === 'text' || inputType === 'youtube' ? (
          <input
            type="text"
            placeholder={inputType === 'text' ? 'Enter topic or paragraph' : 'Enter YouTube URL'}
            onChange={handleInputChange}
            className="w-full p-2 border rounded-md dark:bg-gray-700 dark:text-white"
          />
        ) : (
          <div className="flex items-center justify-center w-full">
            <label className="flex flex-col items-center w-full p-4 border-2 border-dashed rounded-md cursor-pointer hover:border-teal-500 dark:border-gray-600 dark:hover:border-teal-400">
              <FaUpload className="text-2xl text-teal-500" />
              <span className="mt-2 text-sm dark:text-white">
                {inputType === 'pdf' ? 'Upload PDF' : 'Upload Image'}
              </span>
              <input
                type="file"
                accept={inputType === 'pdf' ? '.pdf' : 'image/*'}
                onChange={handleInputChange}
                className="hidden"
              />
            </label>
          </div>
        )}
      </div>
      <button
        type="submit"
        className="w-full bg-teal-500 text-white px-4 py-2 rounded-md hover:bg-teal-600 transition"
      >
        Submit
      </button>
    </form>
  );
};

export default InputForm;