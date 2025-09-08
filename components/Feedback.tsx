
import React from 'react';

export const Feedback: React.FC = () => {
    const mailtoLink = "mailto:feedback@nanobanana.app?subject=Feedback%20for%20Nano%20Banana%20AI%20Editor";

    return (
        <a 
            href={mailtoLink}
            target="_blank" 
            rel="noopener noreferrer"
            className="fixed bottom-5 right-5 bg-white p-3 rounded-full shadow-lg hover:bg-gray-100 transition-colors group"
            title="Send Feedback"
        >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600 group-hover:text-banana-dark" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
        </a>
    );
};
