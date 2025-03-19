'use client'

import { useState } from 'react'
import { FitnessPost } from '@/types/atproto'
import { useAuthStore } from '@/store/auth'

interface PostCardProps {
  post: FitnessPost
  onInteraction?: () => void
}

export default function PostCard({ post, onInteraction }: PostCardProps) {
  const [isLiking, setIsLiking] = useState(false)
  const [isReposting, setIsReposting] = useState(false)
  const { agent } = useAuthStore()

  const handleLike = async () => {
    if (!agent || isLiking) return
    setIsLiking(true)

    try {
      if (post.viewer?.like) {
        await agent.deleteLike(post.viewer.like)
      } else {
        await agent.like(post.uri, post.cid)
      }
      onInteraction?.()
    } catch (error) {
      console.error('Failed to like/unlike:', error)
    } finally {
      setIsLiking(false)
    }
  }

  const handleRepost = async () => {
    if (!agent || isReposting) return
    setIsReposting(true)

    try {
      if (post.viewer?.repost) {
        await agent.deleteRepost(post.viewer.repost)
      } else {
        await agent.repost(post.uri, post.cid)
      }
      onInteraction?.()
    } catch (error) {
      console.error('Failed to repost/unrepost:', error)
    } finally {
      setIsReposting(false)
    }
  }

  return (
    <article className="bg-base-100 rounded-lg shadow-sm border p-4">
      <div className="flex space-x-4">
        <div className="flex-shrink-0">
          <div className="w-10 h-10 rounded-full bg-primary-100">
            {post.author.avatar && (
              <img
                src={post.author.avatar}
                alt={`${post.author.displayName || post.author.handle}'s avatar`}
                className="w-full h-full rounded-full object-cover"
              />
            )}
          </div>
        </div>
        <div className="flex-grow">
          <div className="flex items-center space-x-2">
            <h3 className="font-semibold">
              {post.author.displayName || post.author.handle}
            </h3>
            <span className="text-sm text-gray-500">@{post.author.handle}</span>
          </div>

          {/* Post Category Badge */}
          {post.record.category && (
            <span className="inline-block px-2 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-800 mt-2">
              {post.record.category.charAt(0).toUpperCase() + post.record.category.slice(1)}
            </span>
          )}

          {/* Post Content */}
          <p className="mt-2 whitespace-pre-wrap">{post.record.text}</p>

          {/* Metadata Display */}
          {post.record.metadata && (
            <div className="mt-4 bg-base-200 rounded-lg p-4">
              {post.record.metadata.difficulty && (
                <p className="text-sm">
                  <span className="font-medium">Difficulty:</span>{' '}
                  {post.record.metadata.difficulty}
                </p>
              )}
              {post.record.metadata.duration && (
                <p className="text-sm">
                  <span className="font-medium">Duration:</span>{' '}
                  {post.record.metadata.duration} minutes
                </p>
              )}
              {post.record.metadata.calories && (
                <p className="text-sm">
                  <span className="font-medium">Calories:</span>{' '}
                  {post.record.metadata.calories} kcal
                </p>
              )}
              {post.record.metadata.equipment && post.record.metadata.equipment.length > 0 && (
                <p className="text-sm">
                  <span className="font-medium">Equipment:</span>{' '}
                  {post.record.metadata.equipment.join(', ')}
                </p>
              )}
            </div>
          )}

          {/* Images */}
          {post.record.embed?.images && post.record.embed.images.length > 0 && (
            <div className="mt-4 grid grid-cols-2 gap-2">
              {post.record.embed.images.map((img, index) => (
                <div key={index} className="relative pt-[100%]">
                  <img
                    src={img.image.ref.$link}
                    alt={img.alt}
                    className="absolute inset-0 w-full h-full object-cover rounded-lg"
                  />
                </div>
              ))}
            </div>
          )}

          {/* Interaction Buttons */}
          <div className="flex items-center space-x-4 mt-4">
            <button
              className={`btn btn-ghost btn-sm ${post.viewer?.like ? 'text-red-500' : ''}`}
              onClick={handleLike}
              disabled={isLiking}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill={post.viewer?.like ? 'currentColor' : 'none'}
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-5 h-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
                />
              </svg>
              <span>{post.likeCount}</span>
            </button>
            <button
              className={`btn btn-ghost btn-sm ${post.viewer?.repost ? 'text-green-500' : ''}`}
              onClick={handleRepost}
              disabled={isReposting}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-5 h-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5"
                />
              </svg>
              <span>{post.repostCount}</span>
            </button>
            <button className="btn btn-ghost btn-sm">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-5 h-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 01-.923 1.785A5.969 5.969 0 006 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337z"
                />
              </svg>
              <span>{post.replyCount}</span>
            </button>
          </div>
        </div>
      </div>
    </article>
  )
} 