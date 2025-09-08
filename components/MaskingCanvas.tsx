
import React, { useRef, useEffect, useState, useImperativeHandle, forwardRef } from 'react';
import type { ImageFile } from '../types';

interface MaskingCanvasProps {
  image: ImageFile;
}

export interface MaskingCanvasRef {
  getMaskAsImage: () => Promise<ImageFile | null>;
}

const BrushIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" /><path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" /></svg>
);

const EraserIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" /></svg>
);

export const MaskingCanvas = forwardRef<MaskingCanvasRef, MaskingCanvasProps>(({ image }, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const maskCanvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [brushSize, setBrushSize] = useState(20);
  const [isErasing, setIsErasing] = useState(false);
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    const maskCanvas = maskCanvasRef.current;
    const ctx = canvas?.getContext('2d');
    const maskCtx = maskCanvas?.getContext('2d');

    if (canvas && maskCanvas && ctx && maskCtx) {
      const img = new Image();
      img.src = image.base64;
      img.onload = () => {
        const parentWidth = canvas.parentElement?.clientWidth || 800;
        const scale = Math.min(1, parentWidth / img.width);
        const width = img.width * scale;
        const height = img.height * scale;
        
        setCanvasSize({ width, height });

        canvas.width = width;
        canvas.height = height;
        maskCanvas.width = width;
        maskCanvas.height = height;

        ctx.drawImage(img, 0, 0, width, height);
        maskCtx.fillStyle = 'rgba(251, 191, 36, 0.5)';
      };
    }
  }, [image]);

  const getCoords = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = maskCanvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    if ('touches' in e) {
        return { x: e.touches[0].clientX - rect.left, y: e.touches[0].clientY - rect.top };
    }
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    setIsDrawing(true);
    draw(e);
  };

  const stopDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    setIsDrawing(false);
    const ctx = maskCanvasRef.current?.getContext('2d');
    ctx?.beginPath();
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    if (!isDrawing) return;
    const ctx = maskCanvasRef.current?.getContext('2d');
    const coords = getCoords(e);
    if (!ctx || !coords) return;

    ctx.lineWidth = brushSize;
    ctx.lineCap = 'round';
    
    if (isErasing) {
      ctx.globalCompositeOperation = 'destination-out';
    } else {
      ctx.globalCompositeOperation = 'source-over';
    }

    ctx.lineTo(coords.x, coords.y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(coords.x, coords.y);
  };

  const clearMask = () => {
    const canvas = maskCanvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (canvas && ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  useImperativeHandle(ref, () => ({
    getMaskAsImage: async (): Promise<ImageFile | null> => {
      const maskCanvas = maskCanvasRef.current;
      if (!maskCanvas) return null;
      
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = maskCanvas.width;
      tempCanvas.height = maskCanvas.height;
      const tempCtx = tempCanvas.getContext('2d');

      if (!tempCtx) return null;
      
      // Draw a black background
      tempCtx.fillStyle = '#000000';
      tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
      
      // Composite the mask in white over the black background
      tempCtx.globalCompositeOperation = 'source-over';
      const originalMaskCtx = maskCanvas.getContext('2d');
      if(originalMaskCtx) {
          // Temporarily change fillStyle to white to draw the mask
          const oldFillStyle = originalMaskCtx.fillStyle;
          originalMaskCtx.fillStyle = '#FFFFFF';
          tempCtx.drawImage(maskCanvas, 0, 0);
          originalMaskCtx.fillStyle = oldFillStyle; // Restore it
      }
      
      return new Promise((resolve) => {
        tempCanvas.toBlob((blob) => {
            if(!blob) return resolve(null);
            const reader = new FileReader();
            reader.onloadend = () => {
                resolve({
                    name: 'mask.png',
                    base64: reader.result as string,
                    mimeType: 'image/png'
                });
            };
            reader.readAsDataURL(blob);
        }, 'image/png');
      });
    },
  }));

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative" style={{width: canvasSize.width, height: canvasSize.height}}>
        <canvas ref={canvasRef} className="absolute top-0 left-0 rounded-lg shadow-lg" />
        <canvas
          ref={maskCanvasRef}
          className="absolute top-0 left-0 cursor-crosshair"
          onMouseDown={startDrawing}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onMouseMove={draw}
          onTouchStart={startDrawing}
          onTouchEnd={stopDrawing}
          onTouchMove={draw}
        />
      </div>
      <div className="w-full bg-white rounded-lg p-4 shadow-md flex flex-col sm:flex-row items-center justify-between gap-4 mt-2">
         <div className="flex items-center gap-4">
            <button onClick={() => setIsErasing(false)} className={`p-2 rounded-full transition-colors ${!isErasing ? 'bg-banana text-white' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'}`} title="Brush"><BrushIcon /></button>
            <button onClick={() => setIsErasing(true)} className={`p-2 rounded-full transition-colors ${isErasing ? 'bg-banana text-white' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'}`} title="Eraser"><EraserIcon /></button>
            <div className="flex items-center gap-2">
                <label htmlFor="brushSize" className="text-sm font-medium text-gray-600">Brush Size</label>
                <input
                    id="brushSize"
                    type="range"
                    min="5"
                    max="100"
                    value={brushSize}
                    onChange={(e) => setBrushSize(Number(e.target.value))}
                    className="w-32 accent-banana"
                />
            </div>
         </div>
         <button onClick={clearMask} className="px-4 py-2 bg-red-500 text-white text-sm font-semibold rounded-full hover:bg-red-600 transition-colors">Clear Mask</button>
      </div>
    </div>
  );
});
