
import React, { useState, useEffect } from 'react';

const ONBOARDING_KEY = 'nano-banana-onboarding-complete';

export const OnboardingModal: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const hasSeenOnboarding = localStorage.getItem(ONBOARDING_KEY);
    if (!hasSeenOnboarding) {
      setIsOpen(true);
    }
  }, []);

  const handleClose = () => {
    localStorage.setItem(ONBOARDING_KEY, 'true');
    setIsOpen(false);
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl transform transition-all animate-fade-in-up">
        <h2 className="text-2xl font-bold text-banana-dark mb-4">Welcome to Nano Banana AI!</h2>
        <p className="text-gray-600 mb-6">Ready to create some magic? Here’s how it works:</p>
        
        <ul className="space-y-4 text-left">
          <li className="flex items-start gap-4">
            <div className="bg-banana text-white rounded-full h-8 w-8 flex-shrink-0 flex items-center justify-center font-bold">1</div>
            <div>
              <h3 className="font-semibold">Upload Your Image</h3>
              <p className="text-gray-500 text-sm">Drag & drop or browse for an image to start.</p>
            </div>
          </li>
          <li className="flex items-start gap-4">
            <div className="bg-banana text-white rounded-full h-8 w-8 flex-shrink-0 flex items-center justify-center font-bold">2</div>
            <div>
              <h3 className="font-semibold">Mask the Area</h3>
              <p className="text-gray-500 text-sm">Use the brush to paint over the part of the image you want to change.</p>
            </div>
          </li>
          <li className="flex items-start gap-4">
            <div className="bg-banana text-white rounded-full h-8 w-8 flex-shrink-0 flex items-center justify-center font-bold">3</div>
            <div>
              <h3 className="font-semibold">Describe Your Edit</h3>
              <p className="text-gray-500 text-sm">Tell the AI what you want to do in the text box. Be creative!</p>
            </div>
          </li>
        </ul>

        <button 
          onClick={handleClose}
          className="mt-8 w-full bg-banana-dark text-white font-bold py-3 rounded-lg hover:bg-opacity-90 transition-colors"
        >
          Let's Go!
        </button>
      </div>
    </div>
  );
};
