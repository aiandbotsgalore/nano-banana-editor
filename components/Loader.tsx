
import React, { useState, useEffect } from 'react';

const messages = [
  "Summoning creative spirits...",
  "Teaching pixels new tricks...",
  "Warming up the AI's imagination...",
  "Painting with pure thought...",
  "This might take a moment, great art needs patience!",
  "Unleashing digital magic...",
  "Consulting the banana for inspiration..."
];

export const Loader: React.FC = () => {
    const [message, setMessage] = useState(messages[0]);

    useEffect(() => {
        const intervalId = setInterval(() => {
            setMessage(prevMessage => {
                const currentIndex = messages.indexOf(prevMessage);
                const nextIndex = (currentIndex + 1) % messages.length;
                return messages[nextIndex];
            });
        }, 3000);

        return () => clearInterval(intervalId);
    }, []);

    return (
        <div className="flex flex-col items-center justify-center text-center p-8">
            <div className="relative flex justify-center items-center">
                <div className="absolute w-24 h-24 rounded-full animate-spin border-4 border-dashed border-banana-dark"></div>
                <div className="text-5xl">🍌</div>
            </div>
            <h2 className="text-xl font-bold text-banana-dark mt-6">Generating your masterpiece...</h2>
            <p className="text-gray-600 mt-2 transition-opacity duration-500">{message}</p>
        </div>
    );
};
