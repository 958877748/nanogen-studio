
import React from 'react';
import { User } from '../types';

interface NavbarProps {
  activeTab: 'create' | 'history';
  setActiveTab: (tab: 'create' | 'history') => void;
  user: User | null;
  onSignOut: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab, user, onSignOut }) => {
  return (
    <nav className="sticky top-0 z-50 bg-darker/80 backdrop-blur-md border-b border-white/10">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold shadow-lg shadow-primary/25">
            N
          </div>
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary hidden sm:inline-block">
            NanoGen
          </span>
        </div>

        <div className="flex bg-card p-1 rounded-full border border-white/5 absolute left-1/2 transform -translate-x-1/2">
          <button
            onClick={() => setActiveTab('create')}
            className={`px-4 sm:px-6 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
              activeTab === 'create'
                ? 'bg-slate-700 text-white shadow-lg'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Studio
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-4 sm:px-6 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
              activeTab === 'history'
                ? 'bg-slate-700 text-white shadow-lg'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Gallery
          </button>
        </div>

        <div className="flex items-center gap-3">
          {user && (
            <>
              <div className="flex items-center gap-3 pl-3 border-l border-white/10">
                <img 
                  src={user.avatar} 
                  alt={user.name} 
                  className="w-8 h-8 rounded-full border border-white/20"
                />
                <button 
                  onClick={onSignOut}
                  className="p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-full transition-colors"
                  title="Sign out"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};
