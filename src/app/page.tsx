'use client'

import { useState, useEffect } from 'react'
import { SignedIn, SignedOut, RedirectToSignIn } from '@clerk/nextjs'
import ImageWorkspace from '@/components/ImageWorkspace'
import HistoryGallery from '@/components/HistoryGallery'
import Navbar from '@/components/Navbar'
import { HistoryItem } from '@/types'

export default function Home() {
  const [activeTab, setActiveTab] = useState<'create' | 'history'>('create')
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [isLoading, setIsLoading] = useState(false)

  // 加载历史记录
  const loadHistory = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/history')
      if (response.ok) {
        const data = await response.json()
        setHistory(data)
      }
    } catch (error) {
      console.error('Failed to load history:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // 切换到历史记录标签页时加载
  useEffect(() => {
    if (activeTab === 'history') {
      loadHistory()
    }
  }, [activeTab])

  const handleImageGenerated = async (item: HistoryItem) => {
    const newHistory = [item, ...history]
    setHistory(newHistory)

    // 保存到数据库
    try {
      await fetch('/api/history', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(item)
      })
    } catch (error) {
      console.error('Failed to save history:', error)
    }
  }

  const handleClearHistory = async () => {
    setHistory([])

    // 从数据库删除
    try {
      await fetch('/api/history', { 
        method: 'DELETE'
      })
    } catch (error) {
      console.error('Failed to clear history:', error)
    }
  }

  const handleDeleteItem = async (itemId: string) => {
    const newHistory = history.filter(item => item.id !== itemId)
    setHistory(newHistory)

    // 从数据库删除
    try {
      await fetch(`/api/history/${itemId}`, { 
        method: 'DELETE'
      })
    } catch (error) {
      console.error('Failed to delete history item:', error)
    }
  }

  if (isLoading) {
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
            <HistoryGallery items={history} onClear={handleClearHistory} onDelete={handleDeleteItem} />
          )}
        </main>
      </SignedIn>

      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </div>
  )
}