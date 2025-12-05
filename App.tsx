
import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { ImageWorkspace } from './components/ImageWorkspace';
import { HistoryGallery } from './components/HistoryGallery';
import { LoginPage } from './components/LoginPage';
import { HistoryItem, User } from './types';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'create' | 'history'>('create');
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);

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

    // Check for saved user session
    const savedUser = localStorage.getItem('nanogen_user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        console.error("Failed to parse user session", e);
      }
    }
    setIsLoadingUser(false);
  }, []);

  // Save history to local storage whenever it changes
  useEffect(() => {
    localStorage.setItem('nanogen_history', JSON.stringify(history));
  }, [history]);

  // Save user session
  const handleLogin = (newUser: User) => {
    setUser(newUser);
    localStorage.setItem('nanogen_user', JSON.stringify(newUser));
  };

  const handleSignOut = () => {
    setUser(null);
    localStorage.removeItem('nanogen_user');
    setActiveTab('create');
  };

  const addToHistory = (item: HistoryItem) => {
    setHistory(prev => [item, ...prev]);
  };

  const clearHistory = () => {
    if (confirm("Are you sure you want to clear your gallery?")) {
      setHistory([]);
    }
  };

  if (isLoadingUser) {
    return <div className="min-h-screen bg-darker flex items-center justify-center text-primary">Loading...</div>;
  }

  if (!user) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-darker flex flex-col font-sans text-slate-100">
      <Navbar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        user={user}
        onSignOut={handleSignOut}
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
  );
};

export default App;
