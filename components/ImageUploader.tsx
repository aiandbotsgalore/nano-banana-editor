
import React, { useState, useCallback } from 'react';
import type { ImageFile } from '../types';

interface ImageUploaderProps {
  onImageUpload: (imageFile: ImageFile) => void;
}

const fileToBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });

export const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageUpload }) => {
  const [isDragging, setIsDragging] = useState(false);

  const processFile = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/')) {
        alert("Please upload an image file.");
        return;
    }
    const base64 = await fileToBase64(file);
    onImageUpload({
        name: file.name,
        base64: base64,
        mimeType: file.type,
    });
  }, [onImageUpload]);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      await processFile(event.target.files[0]);
    }
  };

  const handleDrop = useCallback(async (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
    if (event.dataTransfer.files && event.dataTransfer.files[0]) {
      await processFile(event.dataTransfer.files[0]);
    }
  }, [processFile]);

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
  };
  
  const handleDragEnter = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(true);
  };
  
  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
  };

  return (
    <div className="w-full max-w-lg mx-auto text-center">
        <div 
            className={`relative border-4 border-dashed rounded-2xl p-10 transition-all duration-300 ${isDragging ? 'border-banana-dark bg-banana-light' : 'border-gray-300 bg-white hover:border-banana'}`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
        >
            <input
                type="file"
                id="file-upload"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                accept="image/png, image/jpeg, image/webp"
                onChange={handleFileChange}
            />
            <label htmlFor="file-upload" className="flex flex-col items-center justify-center space-y-4 cursor-pointer">
                <div className="bg-banana text-white rounded-full p-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                </div>
                <p className="text-gray-700 font-semibold">Drag & Drop your image here</p>
                <p className="text-gray-500">or <span className="text-banana-dark font-bold">click to browse</span></p>
            </label>
        </div>
    </div>
  );
};
