'use client'

import { useState } from 'react'
import { useAuthStore } from '@/store/auth'

interface CreatePostProps {
  onPost?: () => void
}

export default function CreatePost({ onPost }: CreatePostProps) {
  const [content, setContent] = useState('')
  const [category, setCategory] = useState<'workout' | 'recipe' | 'supplement' | 'progress' | 'other'>('other')
  const [isLoading, setIsLoading] = useState(false)
  const { agent } = useAuthStore()

  const handlePost = async () => {
    if (!agent || !content.trim()) return

    setIsLoading(true)
    try {
      const record = {
        text: content,
        createdAt: new Date().toISOString(),
        tags: ['sanita', category],
        category,
      }

      await agent.post(record)
      setContent('')
      onPost?.()
    } catch (error) {
      console.error('Failed to create post:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="bg-base-100 rounded-lg shadow-sm border p-4">
      <div className="flex space-x-4">
        <div className="flex-shrink-0">
          <div className="w-10 h-10 rounded-full bg-primary-100"></div>
        </div>
        <div className="flex-grow">
          <textarea
            className="textarea textarea-bordered w-full"
            placeholder="Share your fitness journey..."
            rows={3}
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mt-4">
            <select
              className="select select-bordered w-full sm:w-auto"
              value={category}
              onChange={(e) => setCategory(e.target.value as any)}
            >
              <option value="workout">Workout</option>
              <option value="recipe">Recipe</option>
              <option value="supplement">Supplement</option>
              <option value="progress">Progress</option>
              <option value="other">Other</option>
            </select>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button className="btn btn-circle btn-ghost">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-6 h-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
                  />
                </svg>
              </button>
              <button
                className={`btn btn-primary flex-grow sm:flex-grow-0 ${
                  isLoading ? 'loading' : ''
                }`}
                onClick={handlePost}
                disabled={isLoading || !content.trim()}
              >
                Post
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 