
import React from 'react';

const BananaIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-banana -rotate-45" viewBox="0 0 20 20" fill="currentColor">
        <path d="M10 2a1 1 0 00-1 1v1a1 1 0 002 0V3a1 1 0 00-1-1z" />
        <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
    </svg>
);


export const Header: React.FC = () => {
  return (
    <header className="w-full text-center mb-8">
      <h1 className="font-display text-4xl md:text-5xl text-banana-dark flex items-center justify-center gap-2">
        <span className="transform -scale-x-100">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 inline-block text-amber-500" viewBox="0 0 24 24" fill="currentColor">
                <path d="M21.986 8.122c-.18-1.951-1.298-3.69-2.922-4.81a7.485 7.485 0 00-5.59-1.936c-1.954.08-3.832.9-5.263 2.257-2.072 1.965-2.955 4.83-2.203 7.583.52 1.912 1.767 3.6 3.46 4.673 1.928 1.22 4.253 1.63 6.447 1.01a7.505 7.505 0 005.51-4.298c1.15-2.29.99-5.01-.437-7.182l.001-.001z"/>
            </svg>
        </span>
        Nano Banana AI
      </h1>
      <p className="text-gray-500 mt-2">Your friendly AI image editing assistant!</p>
    </header>
  );
};
