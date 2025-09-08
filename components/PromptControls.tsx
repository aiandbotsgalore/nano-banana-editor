import React, { useState } from 'react';
import { enhancePrompt } from '../services/geminiService';

interface PromptControlsProps {
  prompt: string;
  setPrompt: (prompt: string) => void;
  onGenerate: () => void;
  isLoading: boolean;
  onReset: () => void;
  numberOfImages: number;
  setNumberOfImages: (num: number) => void;
}

const MagicWandIcon: React.FC<{ isEnhancing: boolean }> = ({ isEnhancing }) => {
    if (isEnhancing) {
        return (
            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
        );
    }
    return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path d="M11.956 2.46a.75.75 0 01.637.963l-.43 1.718a1.75 1.75 0 003.342 0l-.43-1.718a.75.75 0 01.963-.637l1.718.43a1.75 1.75 0 000-3.342l-1.718-.43a.75.75 0 01-.637-.963l.43-1.718a1.75 1.75 0 00-3.342 0l.43 1.718a.75.75 0 01-.963.637l-1.718-.43a1.75 1.75 0 000 3.342l1.718.43zM3.478 3.478a.75.75 0 011.06 0l1.22 1.22a.75.75 0 01-1.06 1.06L3.478 4.54a.75.75 0 010-1.06zM4.54 16.522a.75.75 0 01-1.06 0L2.26 15.3a.75.75 0 111.06-1.06l1.22 1.22a.75.75 0 010 1.06zM16.522 4.54a.75.75 0 011.06 0l1.22 1.22a.75.75 0 11-1.06 1.06L16.522 4.54zM2.875 9.25a.75.75 0 000 1.5h.5a.75.75 0 000-1.5h-.5zM16 9.25a.75.75 0 000 1.5h.5a.75.75 0 000-1.5h-.5zM9.25 2.875a.75.75 0 001.5 0v-.5a.75.75 0 00-1.5 0v.5zM9.25 16a.75.75 0 001.5 0v-.5a.75.75 0 00-1.5 0v.5zM3.5 11.25a.75.75 0 000 1.5h13a.75.75 0 000-1.5h-13z" />
        </svg>
    );
};


export const PromptControls: React.FC<PromptControlsProps> = ({ prompt, setPrompt, onGenerate, isLoading, onReset, numberOfImages, setNumberOfImages }) => {
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [enhanceError, setEnhanceError] = useState<string | null>(null);

  const handleEnhancePrompt = async () => {
    if (!prompt.trim()) return;
    setIsEnhancing(true);
    setEnhanceError(null);
    try {
      const enhanced = await enhancePrompt(prompt);
      setPrompt(enhanced);
    } catch (error) {
      console.error("Failed to enhance prompt:", error);
      setEnhanceError(error instanceof Error ? error.message : "Failed to enhance prompt.");
    } finally {
      setIsEnhancing(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg w-full sticky top-8">
      <h3 className="text-lg font-bold text-gray-800 mb-2">Step 2: Describe your edit</h3>
      <p className="text-sm text-gray-500 mb-4">Be specific! What should happen in the masked area?</p>
      
      <div className="relative">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="e.g., 'Add a cute cat wearing a party hat' or 'Change the sky to a beautiful sunset'"
          className="w-full h-32 p-3 pr-12 border rounded-md focus:ring-2 transition-shadow bg-gray-700 text-white placeholder-gray-400 border-gray-600 focus:ring-banana focus:border-banana"
          disabled={isLoading || isEnhancing}
        />
        <button
          title="Enhance prompt with AI"
          onClick={handleEnhancePrompt}
          disabled={isLoading || isEnhancing || !prompt.trim()}
          className="absolute top-3 right-3 p-2 rounded-full bg-banana hover:bg-banana-dark disabled:bg-gray-500 disabled:cursor-not-allowed transition-colors"
        >
          <MagicWandIcon isEnhancing={isEnhancing} />
        </button>
      </div>
      {enhanceError && <p className="text-sm text-red-500 mt-2">{enhanceError}</p>}


      <h3 className="text-lg font-bold text-gray-800 mb-2 mt-6">Step 3: Choose variations</h3>
      <p className="text-sm text-gray-500 mb-4">How many versions would you like the AI to create?</p>
      <div className="flex justify-center gap-2 sm:gap-4">
        {[1, 2, 3, 4].map((num) => (
          <button
            key={num}
            onClick={() => setNumberOfImages(num)}
            disabled={isLoading}
            className={`w-12 h-12 rounded-full font-bold text-lg transition-all transform hover:scale-110 disabled:opacity-50 ${
              numberOfImages === num
                ? 'bg-banana-dark text-white ring-4 ring-banana'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {num}
          </button>
        ))}
      </div>

      <div className="mt-6 flex flex-col gap-2">
        <button
          onClick={onGenerate}
          disabled={isLoading || !prompt.trim()}
          className="w-full px-6 py-3 bg-banana font-bold text-white rounded-full hover:bg-banana-dark transition-colors shadow-md disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isLoading ? 'Generating...' : '✨ Generate Magic'}
        </button>
        <button
          onClick={onReset}
          disabled={isLoading}
          className="w-full text-sm text-gray-500 hover:text-gray-800"
        >
          Start Over
        </button>
      </div>
    </div>
  );
};