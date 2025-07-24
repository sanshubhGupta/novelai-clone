// novelai-clone/client/src/pages/ContinuousStoryPage.js
import React, { useState, useRef, useEffect } from 'react';
import { generateStory } from '../api'; // This API call will be updated for chat history

export default function ContinuousStoryPage() {
  const [prompt, setPrompt] = useState(''); // User's current input for continuation
  // storyParts will store objects like { type: 'user' | 'ai', content: 'text' } for display
  const [storyParts, setStoryParts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Ref for auto-scrolling the story display
  const storyDisplayRef = useRef(null);

  // Auto-scroll when storyParts changes
  useEffect(() => {
    if (storyDisplayRef.current) {
      storyDisplayRef.current.scrollTop = storyDisplayRef.current.scrollHeight;
    }
  }, [storyParts]);

  const handleGenerate = async () => {
    setError(null);
    setIsLoading(true);

    // Prepare the chat history for the backend
    // The history needs to be in Gemini's expected format: [{ role: 'user', parts: [...] }, { role: 'model', parts: [...] }]
    // Filter out empty parts and map to the correct structure
    const chatHistory = storyParts
      .filter(part => part.content.trim() !== '') // Ensure no empty parts
      .map(part => ({
        role: part.type === 'user' ? 'user' : 'model', // 'ai' maps to 'model' for Gemini
        parts: [{ text: part.content }]
      }));

    try {
      // **IMPORTANT**: Add the current user prompt to the local state *before* sending to API
      // This immediately updates the UI with the user's input.
      const userPart = { type: 'user', content: prompt };
      setStoryParts(prev => [...prev, userPart]);

      // Send the chat history AND the current prompt to the backend
      const generatedText = await generateStory({
        prompt: prompt, // This is the user's *new* turn
        history: chatHistory, // This is the *context*
        length: 150 // Shorter length for continuation (e.g., 1-2 lines), adjust as needed
      });

      // Append the AI's generation to the story parts
      setStoryParts(prev => [...prev, { type: 'ai', content: generatedText }]);
      setPrompt(''); // Clear the input prompt for the next continuation

    } catch (err) {
      console.error("Frontend caught error:", err);
      setError(err);
      // If an error occurs, we might want to remove the user's last input
      // or at least indicate that the AI response failed for that input.
      // For now, let's keep it simple: just log error. User can retry or reset.
      setStoryParts(prev => prev.slice(0, prev.length - 1)); // Remove the user part added above
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setPrompt('');
    setStoryParts([]); // Clear all story parts
    setError(null);
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-2xl">
        <h1 className="text-3xl font-extrabold text-center text-blue-700 mb-6">
          Collaborative Story Writing
        </h1>

        {/* Display the full, evolving story with scroll */}
        <div
          ref={storyDisplayRef}
          className="mb-6 p-6 bg-blue-50 rounded-lg border border-blue-200 shadow-inner max-h-96 overflow-y-auto text-base leading-relaxed"
        >
          {storyParts.length > 0 ? (
            storyParts.map((part, index) => (
              <p
                key={index}
                // Apply a margin-bottom to separate paragraphs slightly, if desired
                className={`${part.type === 'user' ? 'user-input-highlight text-blue-900 font-semibold' : 'ai-output text-gray-800'} my-1.5`}
                style={{ lineHeight: '1.5' }} // Ensure good line spacing
              >
                {part.content}
              </p>
            ))
          ) : (
            <p className="text-gray-600 italic">Start your story by typing in the box below.</p>
          )}
        </div>

        <div className="mb-6">
          <label htmlFor="prompt" className="block text-gray-700 text-sm font-bold mb-2">
            {storyParts.length > 0 ? "Continue the story or add your next input:" : "Start your story here with an initial prompt:"}
          </label>
          <textarea
            id="prompt"
            rows={storyParts.length > 0 ? 4 : 6} // Adjust rows dynamically
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 resize-y"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder={storyParts.length > 0 ? "e.g., The wolf snarled, preparing to pounce..." : "e.g., A wizard stood at the edge of the whispering woods..."}
            disabled={isLoading}
          />
        </div>

        <div className="flex space-x-4 mb-6">
          <button
            onClick={handleGenerate}
            className={`flex-1 py-3 px-6 rounded-lg text-white font-semibold transition-all duration-300
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
              'Continue Story'
            )}
          </button>
          <button
            onClick={handleReset}
            className={`flex-none py-3 px-6 rounded-lg text-blue-600 border border-blue-600 font-semibold transition-all duration-300
              ${isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'}`}
            disabled={isLoading}
          >
            Start New Story
          </button>
        </div>

        {error && (
          <div className="mt-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            <p className="font-bold">Error:</p>
            <p>{error}</p>
          </div>
        )}
      </div>
    </div>
  );
}