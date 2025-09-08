
import React, { useState, useCallback, useRef } from 'react';
import { Header } from './components/Header';
import { ImageUploader } from './components/ImageUploader';
import { MaskingCanvas, MaskingCanvasRef } from './components/MaskingCanvas';
import { PromptControls } from './components/PromptControls';
import { ImageComparator } from './components/ImageComparator';
import { Loader } from './components/Loader';
import { OnboardingModal } from './components/OnboardingModal';
import { Feedback } from './components/Feedback';
import { editImage } from './services/geminiService';
// Fix: Import AppState as a value since it is an enum used for state management,
// while ImageFile remains a type-only import.
import { AppState, type ImageFile } from './types';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.START);
  const [originalImage, setOriginalImage] = useState<ImageFile | null>(null);
  const [editedImages, setEditedImages] = useState<ImageFile[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('');
  const [numberOfImages, setNumberOfImages] = useState<number>(1);

  const maskingCanvasRef = useRef<MaskingCanvasRef>(null);

  const handleImageUpload = (imageFile: ImageFile) => {
    setOriginalImage(imageFile);
    setEditedImages(null);
    setError(null);
    setPrompt('');
    setAppState(AppState.MASKING);
  };

  const handleGeneration = useCallback(async () => {
    if (!originalImage || !prompt || !maskingCanvasRef.current) {
      setError("Please upload an image, provide a prompt, and mask an area.");
      return;
    }

    const maskImage = await maskingCanvasRef.current.getMaskAsImage();
    if (!maskImage) {
        setError("Could not generate mask. Please try again.");
        return;
    }

    setAppState(AppState.GENERATING);
    setError(null);

    try {
      const results = await editImage(originalImage, maskImage, prompt, numberOfImages);
      if (results && results.length > 0) {
        setEditedImages(results);
        setAppState(AppState.COMPARING);
      } else {
        throw new Error("The AI did not return any images. It might be a safety policy violation or an issue with the prompt.");
      }
    } catch (e) {
      console.error(e);
      setError(e instanceof Error ? e.message : "An unknown error occurred.");
      setAppState(AppState.MASKING);
    }
  }, [originalImage, prompt, numberOfImages]);
  
  const handleReset = () => {
    setOriginalImage(null);
    setEditedImages(null);
    setError(null);
    setPrompt('');
    setAppState(AppState.START);
  };

  const handleRefineImage = (imageToRefine: ImageFile) => {
    setOriginalImage(imageToRefine);
    setEditedImages(null);
    setError(null);
    setPrompt('');
    setAppState(AppState.MASKING);
  };

  const renderContent = () => {
    switch (appState) {
      case AppState.START:
        return <ImageUploader onImageUpload={handleImageUpload} />;
      // Fix: Combine MASKING and GENERATING states to resolve the type error.
      // By using a fallthrough, TypeScript doesn't narrow `appState` to a single case,
      // which allows the `appState === AppState.GENERATING` comparison to be valid.
      // This also improves the UI by showing the loader inline, preserving context.
      case AppState.MASKING:
      case AppState.GENERATING:
        return (
          <div className="w-full max-w-5xl mx-auto flex flex-col gap-8 items-center">
            <div className="w-full flex-shrink-0">
              {appState === AppState.GENERATING ? (
                <Loader />
              ) : (
                originalImage && <MaskingCanvas ref={maskingCanvasRef} image={originalImage} />
              )}
            </div>
            <div className="w-full max-w-2xl">
              <PromptControls 
                prompt={prompt} 
                setPrompt={setPrompt} 
                onGenerate={handleGeneration} 
                isLoading={appState === AppState.GENERATING} 
                onReset={handleReset}
                numberOfImages={numberOfImages}
                setNumberOfImages={setNumberOfImages}
              />
               {error && <div className="mt-4 text-red-500 bg-red-100 p-3 rounded-lg">{error}</div>}
            </div>
          </div>
        );
      case AppState.COMPARING:
          return (
            <div className="w-full max-w-5xl mx-auto flex flex-col gap-8 items-center">
                {originalImage && editedImages && <ImageComparator original={originalImage} editedImages={editedImages} onRefine={handleRefineImage} />}
                <button
                    onClick={handleReset}
                    className="mt-4 px-6 py-2 bg-amber-500 text-white font-semibold rounded-full hover:bg-amber-600 transition-colors shadow-md"
                >
                    Start Over
                </button>
            </div>
          );
    }
  };

  return (
    <div className="min-h-screen bg-banana-light text-gray-800 flex flex-col p-4 md:p-8">
      <Header />
      <main className="flex-grow flex flex-col items-center justify-center container mx-auto px-4">
        {renderContent()}
      </main>
      <OnboardingModal />
      <Feedback />
    </div>
  );
};

export default App;
