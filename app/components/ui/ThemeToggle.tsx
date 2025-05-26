'use client';

import React from 'react';
import { useTheme } from '@/app/contexts/ThemeContext';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="relative inline-flex h-8 w-16 items-center justify-center rounded-full bg-gradient-to-r from-orange-400 to-pink-500 p-1 transition-all duration-300 hover:shadow-lg hover:scale-105 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      {/* Toggle Track */}
      <div className="relative h-6 w-14 rounded-full bg-white/20 backdrop-blur-sm">
        {/* Background Scene */}
        <div className="absolute inset-0 overflow-hidden rounded-full">
          {/* Light Mode Scene */}
          <div
            className={`absolute inset-0 transition-opacity duration-500 ${
              theme === 'light' ? 'opacity-100' : 'opacity-0'
            }`}
          >
            {/* Sky */}
            <div className="h-full w-full bg-gradient-to-b from-blue-200 to-green-200 rounded-full" />
            {/* Sun */}
            <div className="absolute top-1 right-2 h-2 w-2 rounded-full bg-yellow-300" />
            {/* Clouds */}
            <div className="absolute top-1.5 left-1 h-1 w-2 rounded-full bg-white/60" />
            {/* Tree */}
            <div className="absolute bottom-0.5 right-3 h-2 w-0.5 bg-amber-600 rounded-t" />
            <div className="absolute bottom-1.5 right-2.5 h-1 w-1.5 rounded-full bg-green-400" />
          </div>

          {/* Dark Mode Scene */}
          <div
            className={`absolute inset-0 transition-opacity duration-500 ${
              theme === 'dark' ? 'opacity-100' : 'opacity-0'
            }`}
          >
            {/* Night Sky */}
            <div className="h-full w-full bg-gradient-to-b from-indigo-900 to-purple-900 rounded-full" />
            {/* Moon */}
            <div className="absolute top-1 left-2 h-2 w-2 rounded-full bg-gray-100" />
            {/* Stars */}
            <div className="absolute top-1 right-2 h-0.5 w-0.5 rounded-full bg-white" />
            <div className="absolute top-2 right-4 h-0.5 w-0.5 rounded-full bg-white" />
            <div className="absolute top-3 right-1 h-0.5 w-0.5 rounded-full bg-white" />
            {/* Tree Silhouette */}
            <div className="absolute bottom-0.5 right-3 h-2 w-0.5 bg-gray-800 rounded-t" />
            <div className="absolute bottom-1.5 right-2.5 h-1 w-1.5 rounded-full bg-gray-700" />
          </div>
        </div>

        {/* Toggle Circle */}
        <div
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-lg transition-all duration-300 ease-in-out ${
            theme === 'dark' ? 'translate-x-8' : 'translate-x-0.5'
          }`}
        >
          {/* Sun Icon */}
          <div
            className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 ${
              theme === 'light' ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <svg className="h-3 w-3 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
                clipRule="evenodd"
              />
            </svg>
          </div>

          {/* Moon Icon */}
          <div
            className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 ${
              theme === 'dark' ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <svg className="h-3 w-3 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
              <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
            </svg>
          </div>
        </div>
      </div>
    </button>
  );
}
