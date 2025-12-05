
import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { ImageWorkspace } from './components/ImageWorkspace';
import { HistoryGallery } from './components/HistoryGallery';
import { HistoryItem } from './types';
import { SignedIn, SignedOut, SignInButton, UserButton, useUser } from '@clerk/clerk-react';

const App: React.FC = () => {
  const { user, isLoaded } = useUser();
  const [activeTab, setActiveTab] = useState<'create' | 'history'>('create');
  const [history, setHistory] = useState<HistoryItem[]>([]);

  // Load history from local storage on mount
  useEffect(() => {
    const savedHistory = localStorage.getItem('nanogen_history');
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error("Failed to parse history", e);
      }
    }
  }, []);

  // Save history to local storage whenever it changes
  useEffect(() => {
    localStorage.setItem('nanogen_history', JSON.stringify(history));
  }, [history]);

  const addToHistory = (item: HistoryItem) => {
    setHistory(prev => [item, ...prev]);
  };

  const clearHistory = () => {
    if (confirm("Are you sure you want to clear your gallery?")) {
      setHistory([]);
    }
  };

  if (!isLoaded) {
    return <div className="min-h-screen bg-darker flex items-center justify-center text-primary">Loading...</div>;
  }

  return (
    <>
      <SignedOut>
        <div className="min-h-screen bg-darker flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-primary mb-8">Welcome to NanoGen Studio</h1>
            <p className="text-slate-300 mb-8">Please sign in to continue</p>
            <SignInButton mode="modal">
              <button className="bg-primary hover:bg-primary-dark text-white font-semibold py-3 px-6 rounded-lg transition-colors">
                Sign In
              </button>
            </SignInButton>
          </div>
        </div>
      </SignedOut>

      <SignedIn>
        <div className="min-h-screen bg-darker flex flex-col font-sans text-slate-100">
          <Navbar
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            user={user ? { id: user.id, email: user.primaryEmailAddress?.emailAddress || '', name: user.fullName || user.username || 'User', avatar: user.imageUrl || '' } : null}
          />

          <main className="flex-grow container mx-auto px-4 py-6 max-w-6xl">
            {activeTab === 'create' ? (
              <ImageWorkspace onImageGenerated={addToHistory} />
            ) : (
              <HistoryGallery items={history} onClear={clearHistory} />
            )}
          </main>

          <footer className="py-6 text-center text-slate-600 text-sm">
            <p>Powered by Gemini 2.5 Flash Image (Nano Banana)</p>
          </footer>
        </div>
      </SignedIn>
    </>
  );
};

export default App;
