
import React from 'react';
import { UserButton } from '@clerk/nextjs';

interface NavbarProps {
  activeTab: 'create' | 'history';
  setActiveTab: (tab: 'create' | 'history') => void;
}

const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab }) => {
  return (
    <div className="sticky top-0 z-50 bg-darker/80 backdrop-blur-md border-b border-white/10">
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
          <div className="pl-3 border-l border-white/10">
            <UserButton
              appearance={{
                elements: {
                  avatarBox: "w-8 h-8",
                  userButtonTrigger: "focus:shadow-none"
                }
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Navbar;
