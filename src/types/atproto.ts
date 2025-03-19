import { AtpSessionData, BskyAgent } from '@atproto/api'

export interface Post {
  uri: string
  cid: string
  author: {
    did: string
    handle: string
    displayName?: string
    avatar?: string
  }
  record: {
    text: string
    createdAt: string
    embed?: {
      images?: {
        alt: string
        image: {
          ref: { $link: string }
          mimeType: string
        }
      }[]
    }
  }
  indexedAt: string
  replyCount: number
  repostCount: number
  likeCount: number
  viewer?: {
    like?: string
    repost?: string
  }
}

export interface UserProfile {
  did: string
  handle: string
  displayName?: string
  description?: string
  avatar?: string
  followersCount: number
  followsCount: number
  postsCount: number
  viewer?: {
    following?: string
    followedBy?: string
  }
}

export interface AuthState {
  session: AtpSessionData | null
  agent: BskyAgent | null
  isLoading: boolean
  login: (identifier: string, password: string) => Promise<void>
  logout: () => void
}

export interface FitnessPost extends Post {
  record: Post['record'] & {
    tags?: string[]
    category: 'workout' | 'recipe' | 'supplement' | 'progress' | 'other'
    metadata?: {
      difficulty?: 'beginner' | 'intermediate' | 'advanced'
      duration?: number
      calories?: number
      equipment?: string[]
      ingredients?: string[]
      instructions?: string[]
    }
  }
} 