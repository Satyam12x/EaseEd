import React from 'react';
import { FaUpload, FaQuestionCircle, FaPlayCircle } from 'react-icons/fa';
import { motion } from 'framer-motion';

const GoalSelector = ({ goal, setGoal }) => {
  return (
    <div className="mt-6">
      <label className="block text-lg font-medium mb-2 dark:text-white">What do you want to do?</label>
      <div className="flex space-x-4">
        {[
          { id: 'learn', label: 'Learn', icon: FaUpload },
          { id: 'quiz', label: 'Quiz', icon: FaQuestionCircle },
          { id: 'notes', label: 'Notes', icon: FaPlayCircle },
        ].map(({ id, label, icon: Icon }) => (
          <motion.button
            key={id}
            type="button"
            onClick={() => setGoal(id)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`flex items-center px-4 py-2 rounded-md transition ${
              goal === id ? 'bg-teal-500 text-white' : 'bg-gray-200 dark:bg-gray-700 dark:text-white'
            }`}
          >
            <Icon className="mr-2" /> {label}
          </motion.button>
        ))}
      </div>
    </div>
  );
};

export default GoalSelector;