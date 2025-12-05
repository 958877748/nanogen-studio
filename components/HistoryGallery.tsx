import React from 'react';
import { HistoryItem } from '../types';

interface HistoryGalleryProps {
  items: HistoryItem[];
  onClear: () => void;
}

export const HistoryGallery: React.FC<HistoryGalleryProps> = ({ items, onClear }) => {
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-slate-500">
        <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="mb-4 opacity-50"><path d="M12 20v-6M6 20V10M18 20V4"></path></svg>
        <p className="text-xl font-medium">No history yet</p>
        <p className="text-sm mt-2">Start creating in the Studio!</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Your Gallery</h2>
        <button 
          onClick={onClear}
          className="px-4 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded-lg transition-colors border border-transparent hover:border-red-900/30"
        >
          Clear History
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((item) => (
          <div key={item.id} className="bg-card rounded-xl overflow-hidden border border-slate-800 hover:border-slate-600 transition-all shadow-lg group">
            <div className="relative aspect-square bg-darker overflow-hidden">
               {/* Display result */}
               <img 
                 src={item.resultImage} 
                 alt={item.prompt} 
                 className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
               />
               
               {/* Overlay for actions */}
               <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                 <a 
                   href={item.resultImage} 
                   download={`nano-gen-${item.timestamp}.png`}
                   className="p-3 bg-white/10 hover:bg-white/20 rounded-full text-white backdrop-blur-md transition-colors"
                   title="Download"
                 >
                   <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                 </a>
               </div>

               {/* Badge type */}
               <div className="absolute top-2 left-2 px-2 py-1 text-xs font-bold rounded-md bg-black/60 text-white backdrop-blur-md uppercase tracking-wide">
                 {item.type}
               </div>
            </div>

            <div className="p-4 space-y-3">
              <p className="text-sm text-slate-300 line-clamp-2" title={item.prompt}>
                "{item.prompt}"
              </p>
              
              <div className="flex items-center justify-between text-xs text-slate-500 border-t border-slate-800 pt-3">
                <span>{new Date(item.timestamp).toLocaleDateString()}</span>
                {item.type === 'edit' && item.originalImage && (
                  <span className="flex items-center gap-1 text-primary">
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 19l7-7 3 3-7 7-3-3z"></path><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"></path><path d="M2 2l7.586 7.586"></path><circle cx="11" cy="11" r="2"></circle></svg>
                    Edited
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};