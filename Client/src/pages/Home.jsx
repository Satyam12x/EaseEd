import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import InputForm from '../components/InputForm';
import GoalSelector from '../components/GoalSelector';
import { motion } from 'framer-motion';

const Home = () => {
  const [inputType, setInputType] = useState('text');
  const [inputData, setInputData] = useState(null);
  const [goal, setGoal] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (result) => {
    if (!inputData || !goal) {
      setError('Please provide input and select a goal.');
      return;
    }
    navigate('/result', { state: { result, inputType, goal } });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-3xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md mt-6"
    >
      <h2 className="text-2xl font-semibold mb-6 text-center dark:text-white">
        Upload Your Learning Material
      </h2>
      <InputForm
        inputType={inputType}
        setInputType={setInputType}
        setInputData={setInputData}
        onSubmit={handleSubmit}
      />
      <GoalSelector goal={goal} setGoal={setGoal} />
      {error && <p className="text-red-500 mt-4 text-center">{error}</p>}
    </motion.div>
  );
};

export default Home;