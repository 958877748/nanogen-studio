import React, { useState, useRef, useCallback } from 'react';
import { generateOrEditImage } from '../services/geminiService';
import { HistoryItem, GenerationStatus } from '../types';
import { Spinner } from './Spinner';

interface ImageWorkspaceProps {
  onImageGenerated: (item: HistoryItem) => void;
}

export const ImageWorkspace: React.FC<ImageWorkspaceProps> = ({ onImageGenerated }) => {
  const [prompt, setPrompt] = useState('');
  const [inputImage, setInputImage] = useState<string | null>(null);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [status, setStatus] = useState<GenerationStatus>('idle');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setInputImage(reader.result as string);
        setResultImage(null); // Clear previous result when input changes
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    setStatus('loading');
    setErrorMsg(null);
    setResultImage(null);

    try {
      const response = await generateOrEditImage(prompt, inputImage || undefined);
      
      if (response.image) {
        setResultImage(response.image);
        setStatus('success');
        
        // Save to history
        const newItem: HistoryItem = {
          id: Date.now().toString(),
          timestamp: Date.now(),
          prompt,
          resultImage: response.image,
          originalImage: inputImage || undefined,
          type: inputImage ? 'edit' : 'generation'
        };
        onImageGenerated(newItem);
      } else {
        setStatus('error');
        setErrorMsg("The model generated text instead of an image. Try refining your prompt.");
        console.warn("Text response:", response.text);
      }
    } catch (error) {
      console.error(error);
      setStatus('error');
      setErrorMsg("Failed to generate image. Please try again.");
    }
  };

  const clearInputImage = () => {
    setInputImage(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header Area */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-white">
          {inputImage ? "Image Editor" : "Image Generator"}
        </h1>
        <p className="text-slate-400">
          {inputImage 
            ? "Describe how you want to modify the image below." 
            : "Describe the image you want to create."}
        </p>
      </div>

      {/* Main Workspace Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 bg-card rounded-3xl p-6 border border-white/5 shadow-2xl">
        
        {/* Left Column: Input */}
        <div className="space-y-6 flex flex-col">
          {/* File Upload Area */}
          <div className="relative group">
            {inputImage ? (
              <div className="relative rounded-2xl overflow-hidden border-2 border-slate-700 bg-black/50 aspect-square flex items-center justify-center">
                <img 
                  src={inputImage} 
                  alt="Input" 
                  className="max-h-full max-w-full object-contain"
                />
                <button 
                  onClick={clearInputImage}
                  className="absolute top-2 right-2 p-2 bg-red-500/80 hover:bg-red-500 text-white rounded-full transition-colors backdrop-blur-sm"
                  title="Remove image"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
                <div className="absolute bottom-2 left-2 px-3 py-1 bg-black/60 rounded-full text-xs text-white backdrop-blur-sm">
                  Original
                </div>
              </div>
            ) : (
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="aspect-square rounded-2xl border-2 border-dashed border-slate-700 hover:border-primary/50 hover:bg-slate-800/50 transition-all cursor-pointer flex flex-col items-center justify-center text-slate-500 gap-4 group-hover:text-primary"
              >
                <div className="p-4 rounded-full bg-slate-800 group-hover:bg-slate-700 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
                </div>
                <div className="text-center px-4">
                  <p className="font-medium">Click to upload an image to edit</p>
                  <p className="text-xs mt-1 text-slate-600">or start typing to generate from scratch</p>
                </div>
              </div>
            )}
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              accept="image/*" 
              className="hidden" 
            />
          </div>

          {/* Prompt Input */}
          <div className="flex-grow flex flex-col justify-end space-y-4">
             <label className="text-sm font-medium text-slate-300 ml-1">
               {inputImage ? "Instructions for Nano Banana" : "Prompt"}
             </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={inputImage 
                ? "e.g., Add a retro filter, remove the background, make it look like a sketch..." 
                : "e.g., A futuristic city with flying cars, neon lights, cybernetic cats..."}
              className="w-full bg-darker rounded-xl border border-slate-700 p-4 text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary min-h-[120px] resize-none"
            />
            
            <button
              onClick={handleGenerate}
              disabled={status === 'loading' || !prompt.trim()}
              className={`w-full py-4 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-2 ${
                status === 'loading' || !prompt.trim()
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-primary to-secondary text-white shadow-lg hover:shadow-primary/25 hover:scale-[1.02] active:scale-[0.98]'
              }`}
            >
              {status === 'loading' ? (
                <>
                  <Spinner size="sm" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a5 5 0 0 1 5 5c0 .54-.1 1.05-.28 1.53l5.36 5.36a3 3 0 0 1-4.24 4.24l-5.36-5.36A5 5 0 1 1 12 2z"></path><path d="M12 12a5 5 0 1 0 5 5"></path></svg>
                  <span>{inputImage ? "Edit Image" : "Generate Image"}</span>
                </>
              )}
            </button>
            {errorMsg && (
              <div className="p-3 rounded-lg bg-red-900/20 border border-red-500/20 text-red-400 text-sm text-center">
                {errorMsg}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Result */}
        <div className="relative min-h-[400px] flex flex-col h-full">
           <div className="flex-grow bg-darker rounded-2xl border border-slate-800 flex items-center justify-center overflow-hidden relative">
             {status === 'loading' && (
               <div className="absolute inset-0 z-10 bg-darker/80 backdrop-blur-sm flex flex-col items-center justify-center gap-4">
                 <Spinner size="lg" />
                 <p className="text-primary animate-pulse">Consulting Nano Banana...</p>
               </div>
             )}
             
             {resultImage ? (
               <div className="relative w-full h-full flex items-center justify-center bg-checkered p-4">
                 <img 
                   src={resultImage} 
                   alt="Result" 
                   className="max-h-full max-w-full object-contain rounded-lg shadow-2xl"
                 />
                 <div className="absolute top-4 right-4 flex gap-2">
                   <a 
                     href={resultImage} 
                     download={`nano-gen-${Date.now()}.png`}
                     className="p-2 bg-slate-900/80 text-white rounded-lg hover:bg-slate-800 border border-slate-700 transition-colors backdrop-blur-md"
                     title="Download"
                   >
                     <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                   </a>
                 </div>
               </div>
             ) : (
               <div className="text-slate-600 flex flex-col items-center gap-3">
                 <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
                 <p>Your creation will appear here</p>
               </div>
             )}
           </div>
        </div>
      </div>
    </div>
  );
};