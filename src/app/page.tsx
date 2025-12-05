'use client'

import { useState, useEffect } from 'react'
import { SignedIn, SignedOut, RedirectToSignIn } from '@clerk/nextjs'
import ImageWorkspace from '../../components/ImageWorkspace'
import HistoryGallery from '../../components/HistoryGallery'
import Navbar from '../../components/Navbar'
import { HistoryItem } from '@/types'

export default function Home() {
  const [activeTab, setActiveTab] = useState<'create' | 'history'>('create')
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
    const savedHistory = localStorage.getItem('imageHistory')
    if (savedHistory) {
      setHistory(JSON.parse(savedHistory))
    }
  }, [])

  const handleImageGenerated = (item: HistoryItem) => {
    const newHistory = [item, ...history]
    setHistory(newHistory)
    localStorage.setItem('imageHistory', JSON.stringify(newHistory))
  }

  const handleClearHistory = () => {
    setHistory([])
    localStorage.removeItem('imageHistory')
  }

  if (!isClient) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <SignedIn>
        <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

        <main className="container mx-auto px-4 py-8">
          {activeTab === 'create' ? (
            <ImageWorkspace onImageGenerated={handleImageGenerated} />
          ) : (
            <HistoryGallery items={history} onClear={handleClearHistory} />
          )}
        </main>
      </SignedIn>

      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </div>
  )
}