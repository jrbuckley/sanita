'use client'

import { useEffect, useState } from 'react'
import { useAuthStore } from '@/store/auth'
import { FitnessPost } from '@/types/atproto'
import LoginForm from '@/components/auth/LoginForm'
import CreatePost from '@/components/post/CreatePost'
import PostCard from '@/components/post/PostCard'

export default function Home() {
  const [posts, setPosts] = useState<FitnessPost[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { session, agent } = useAuthStore()

  const fetchPosts = async () => {
    if (!agent) return

    setIsLoading(true)
    try {
      const response = await agent.getTimeline()
      const fitnessRelatedPosts = response.data.feed
        .filter((post: any) => {
          const record = post.post.record
          return (
            record.tags?.includes('sanita') ||
            record.tags?.includes('fitness') ||
            record.tags?.includes('health') ||
            record.category
          )
        })
        .map((item: any) => ({
          ...item.post,
          record: {
            ...item.post.record,
            category: item.post.record.category || 'other',
          },
        }))

      setPosts(fitnessRelatedPosts)
    } catch (error) {
      console.error('Failed to fetch posts:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (session && agent) {
      fetchPosts()
    }
  }, [session, agent])

  if (!session) {
    return <LoginForm />
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
      {/* Sidebar */}
      <aside className="hidden md:block md:col-span-3">
        <div className="bg-base-200 rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-4">Categories</h2>
          <ul className="space-y-2">
            <li>
              <a href="#" className="flex items-center space-x-2 text-primary-600 hover:text-primary-700">
                <span className="w-2 h-2 bg-primary-500 rounded-full"></span>
                <span>Workouts</span>
              </a>
            </li>
            <li>
              <a href="#" className="flex items-center space-x-2 text-primary-600 hover:text-primary-700">
                <span className="w-2 h-2 bg-primary-500 rounded-full"></span>
                <span>Recipes</span>
              </a>
            </li>
            <li>
              <a href="#" className="flex items-center space-x-2 text-primary-600 hover:text-primary-700">
                <span className="w-2 h-2 bg-primary-500 rounded-full"></span>
                <span>Supplements</span>
              </a>
            </li>
            <li>
              <a href="#" className="flex items-center space-x-2 text-primary-600 hover:text-primary-700">
                <span className="w-2 h-2 bg-primary-500 rounded-full"></span>
                <span>Progress</span>
              </a>
            </li>
          </ul>
        </div>
      </aside>

      {/* Main Content */}
      <main className="md:col-span-6">
        <CreatePost onPost={fetchPosts} />

        {/* Feed */}
        <div className="space-y-6 mt-6">
          {isLoading ? (
            <div className="flex justify-center">
              <div className="loading loading-spinner loading-lg"></div>
            </div>
          ) : posts.length > 0 ? (
            posts.map((post) => (
              <PostCard
                key={post.uri}
                post={post}
                onInteraction={fetchPosts}
              />
            ))
          ) : (
            <div className="text-center py-8">
              <h3 className="font-semibold text-lg">No posts yet</h3>
              <p className="text-gray-500">
                Be the first to share your fitness journey!
              </p>
            </div>
          )}
        </div>
      </main>

      {/* Right Sidebar */}
      <aside className="hidden md:block md:col-span-3">
        <div className="bg-base-200 rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-4">Trending Topics</h2>
          <div className="space-y-4">
            <div>
              <span className="text-sm text-gray-500">#MealPrep</span>
              <p className="font-medium">1.2k posts</p>
            </div>
            <div>
              <span className="text-sm text-gray-500">#HIIT</span>
              <p className="font-medium">856 posts</p>
            </div>
            <div>
              <span className="text-sm text-gray-500">#ProteinRecipes</span>
              <p className="font-medium">654 posts</p>
            </div>
          </div>
        </div>
      </aside>
    </div>
  )
}
