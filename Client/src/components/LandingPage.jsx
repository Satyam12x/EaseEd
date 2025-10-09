import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-500 to-purple-500 relative overflow-hidden">
      {/* Irregular Shapes */}
      <motion.div
        className="absolute top-0 left-0 w-64 h-64 bg-teal-300 opacity-30 rounded-full"
        style={{ clipPath: "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)" }}
        animate={{ x: [0, 50, 0], y: [0, 30, 0], scale: [1, 1.1, 1] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-0 right-0 w-96 h-96 bg-purple-300 opacity-30"
        style={{ clipPath: "polygon(20% 0%, 80% 20%, 100% 80%, 40% 100%)" }}
        animate={{ x: [0, -40, 0], y: [0, -20, 0], scale: [1, 1.2, 1] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute top-1/2 left-1/4 w-48 h-48 bg-teal-200 opacity-20 rounded-full"
        style={{ clipPath: "polygon(30% 0%, 70% 30%, 90% 90%, 20% 80%)" }}
        animate={{ x: [0, 20, 0], y: [0, 40, 0], scale: [1, 1.15, 1] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Navigation */}
      <nav className="sticky top-0 z-10 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              EaseEd
            </h1>
            <div className="space-x-4">
              <Link
                to="/"
                className="text-gray-700 dark:text-gray-300 hover:text-teal-500"
              >
                Home
              </Link>
              <Link
                to="/about"
                className="text-gray-700 dark:text-gray-300 hover:text-teal-500"
              >
                About
              </Link>
              <Link
                to="/features"
                className="text-gray-700 dark:text-gray-300 hover:text-teal-500"
              >
                Features
              </Link>
              <Link
                to="/contact"
                className="text-gray-700 dark:text-gray-300 hover:text-teal-500"
              >
                Contact
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <motion.section
        className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">
          Learn Smarter with EaseEd
        </h1>
        <p className="text-lg md:text-xl text-white/80 mb-8 max-w-2xl">
          Generate notes, quizzes, and explanations from text, PDFs, images, or
          YouTube videos using AI.
        </p>
        <Link
          to="/home"
          className="bg-teal-500 text-white px-6 py-3 rounded-lg text-lg font-semibold hover:bg-teal-600 transition transform hover:scale-105"
        >
          Get Started
        </Link>
      </motion.section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p>&copy; 2025 EaseEd. All rights reserved.</p>
          <div className="mt-2 space-x-4">
            <Link to="/about" className="text-gray-300 hover:text-teal-500">
              About
            </Link>
            <Link to="/contact" className="text-gray-300 hover:text-teal-500">
              Contact
            </Link>
            <a
              href="https://github.com"
              className="text-gray-300 hover:text-teal-500"
            >
              GitHub
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
