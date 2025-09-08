
import React, { useState } from 'react';
import type { ImageFile } from '../types';
import { generateVideoPromptFromImage } from '../services/geminiService';

interface ResultsDisplayProps {
  original: ImageFile;
  editedImages: ImageFile[];
  onRefine: (image: ImageFile) => void;
}

const EditIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
        <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
        <path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" />
    </svg>
);

const DownloadIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
    </svg>
);

const VideoIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
);

const CopyIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
);

const CheckIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
);


export const ImageComparator: React.FC<ResultsDisplayProps> = ({ original, editedImages, onRefine }) => {
  const [selectedImage, setSelectedImage] = useState<ImageFile>(editedImages[0]);
  const [videoPrompt, setVideoPrompt] = useState<string | null>(null);
  const [isGeneratingPrompt, setIsGeneratingPrompt] = useState(false);
  const [promptError, setPromptError] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);

  const handleSelectImage = (image: ImageFile) => {
    setSelectedImage(image);
    setVideoPrompt(null);
    setPromptError(null);
    setIsGeneratingPrompt(false);
    setCopySuccess(false);
  };

  const handleGeneratePrompt = async () => {
      if (!selectedImage) return;
      setIsGeneratingPrompt(true);
      setPromptError(null);
      setVideoPrompt(null);
      setCopySuccess(false);

      try {
          const prompt = await generateVideoPromptFromImage(selectedImage);
          setVideoPrompt(prompt);
      } catch (e) {
          setPromptError(e instanceof Error ? e.message : "An unknown error occurred.");
      } finally {
          setIsGeneratingPrompt(false);
      }
  };

  const handleCopyToClipboard = () => {
    if (!videoPrompt) return;
    navigator.clipboard.writeText(videoPrompt).then(() => {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }, (err) => {
      console.error('Could not copy text: ', err);
      alert('Failed to copy prompt.');
    });
  };

  const handleDownload = () => {
    if (!selectedImage) return;
    const link = document.createElement('a');
    link.href = selectedImage.base64;
    const nameWithoutExtension = original.name.split('.').slice(0, -1).join('.');
    const finalName = `nano-banana-edit-${nameWithoutExtension}.png`;
    link.download = finalName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col items-center gap-4">
        <h2 className="text-2xl font-bold text-banana-dark">Your Creations Are Ready!</h2>
        <p className="text-gray-600">Select your favorite result below to download or generate a video prompt.</p>
        
        <div className="w-full relative">
          <div className="aspect-w-16 aspect-h-9 w-full overflow-hidden rounded-xl shadow-2xl bg-gray-100">
             {selectedImage && <img src={selectedImage.base64} alt="Selected edited" className="w-full h-full object-contain" />}
          </div>
          <div className="absolute top-4 right-4 flex items-center gap-2">
            <button
                onClick={() => onRefine(selectedImage)}
                className="bg-white text-gray-800 font-semibold py-2 px-4 rounded-full shadow-lg hover:scale-105 transition-transform flex items-center border border-gray-200 hover:bg-gray-50"
                title="Use this image as a base for further edits"
              >
              <EditIcon />
              Refine
            </button>
            <button 
              onClick={handleDownload}
              className="bg-banana-dark text-white font-semibold py-2 px-4 rounded-full shadow-lg hover:scale-105 transition-transform flex items-center"
            >
              <DownloadIcon />
              Download
            </button>
          </div>
        </div>

        <div className="w-full mt-4">
            <h3 className="text-center text-lg font-semibold text-gray-700 mb-3">Variations</h3>
            <div className="flex justify-center items-center gap-4 flex-wrap">
                {editedImages.map((image, index) => (
                    <div 
                        key={index}
                        onClick={() => handleSelectImage(image)}
                        className={`w-24 h-24 sm:w-32 sm:h-32 rounded-lg overflow-hidden cursor-pointer transition-all transform hover:scale-105 ${selectedImage.name === image.name ? 'ring-4 ring-banana-dark shadow-xl' : 'ring-2 ring-transparent hover:ring-banana'}`}
                    >
                        <img src={image.base64} alt={`Edited variation ${index + 1}`} className="w-full h-full object-cover"/>
                    </div>
                ))}
            </div>
        </div>

        <div className="w-full mt-8 bg-white p-6 rounded-lg shadow-lg border border-gray-200">
            <div className="flex items-center gap-3">
                 <div className="bg-banana text-white rounded-full p-2">
                     <VideoIcon />
                 </div>
                 <div>
                    <h3 className="text-xl font-bold text-gray-800">Bring it to life!</h3>
                    <p className="text-sm text-gray-500">Generate a prompt for Google Veo to turn your image into a video.</p>
                 </div>
            </div>
           
            <div className="mt-4 text-center">
                {!videoPrompt && (
                    <button 
                        onClick={handleGeneratePrompt}
                        disabled={isGeneratingPrompt}
                        className="px-6 py-3 bg-gray-700 font-bold text-white rounded-full hover:bg-black transition-colors shadow-md disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2 mx-auto"
                    >
                        {isGeneratingPrompt ? 'Analyzing Image...' : '🎬 Generate Video Prompt'}
                    </button>
                )}

                {isGeneratingPrompt && (
                    <div className="text-gray-600 animate-pulse">Generating your cinematic prompt...</div>
                )}
                
                {promptError && (
                    <div className="mt-4 text-red-500 bg-red-100 p-3 rounded-lg">{promptError}</div>
                )}
                
                {videoPrompt && (
                    <div className="mt-4 text-left animate-fade-in-up">
                        <div className="relative p-4 bg-gray-100 border border-gray-300 rounded-md">
                            <p className="text-gray-800 font-mono text-sm leading-relaxed">{videoPrompt}</p>
                            <button
                                onClick={handleCopyToClipboard}
                                className="absolute top-2 right-2 p-2 rounded-md bg-gray-200 hover:bg-gray-300 transition-colors"
                                title="Copy to clipboard"
                            >
                                {copySuccess ? <CheckIcon /> : <CopyIcon />}
                            </button>
                        </div>
                         <button 
                            onClick={handleGeneratePrompt}
                            disabled={isGeneratingPrompt}
                            className="text-sm text-gray-500 hover:text-gray-800 mt-2"
                        >
                            Regenerate
                        </button>
                    </div>
                )}
            </div>
        </div>
    </div>
  );
};
