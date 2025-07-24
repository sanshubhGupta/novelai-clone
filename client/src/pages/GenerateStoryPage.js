// client/src/pages/GenerateStoryPage.js
import React, { useState } from 'react';
import { generateStory } from '../api'; // Your existing API call

export default function GenerateStoryPage() {
  const [prompt, setPrompt] = useState('');
  const [output, setOutput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleGenerate = async () => {
    setError(null);
    setOutput('');
    setIsLoading(true);
    try {
      const text = await generateStory({ prompt, length: 1000 }); // One-shot generation
      setOutput(text);
    } catch (err) {
      console.error("Frontend caught error:", err);
      setError(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-2xl">
        <h1 className="text-3xl font-extrabold text-center text-blue-700 mb-6">
          Generate A New Story
        </h1>

        <div className="mb-6">
          <label htmlFor="prompt" className="block text-gray-700 text-sm font-bold mb-2">
            Enter your initial story prompt:
          </label>
          <textarea
            id="prompt"
            rows={8}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 resize-y"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g., A lone knight ventures into a haunted forest to find a lost artifact. What happens next?"
            disabled={isLoading}
          />
        </div>

        <button
          onClick={handleGenerate}
          className={`w-full py-3 px-6 rounded-lg text-white font-semibold transition-all duration-300
            ${isLoading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'}`}
          disabled={isLoading || !prompt.trim()}
        >
          {isLoading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Generating...
            </span>
          ) : (
            'Generate Full Story'
          )}
        </button>

        {error && (
          <div className="mt-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            <p className="font-bold">Error:</p>
            <p>{error}</p>
          </div>
        )}

        {output && (
          <div className="mt-6 p-6 bg-gray-50 rounded-lg border border-gray-200 shadow-inner">
            <h2 className="text-xl font-bold text-gray-800 mb-3">Generated Story:</h2>
            <pre className="whitespace-pre-wrap font-sans text-gray-700 leading-relaxed text-base">
              {output}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}