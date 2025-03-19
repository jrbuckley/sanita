import { AtpSessionData, BskyAgent } from '@atproto/api'

// Base Types
export interface BaseModel {
  id?: string
  createdAt?: string
  updatedAt?: string
}

// Auth Types
export interface AuthState {
  session: AtpSessionData | null
  agent: BskyAgent | null
  isLoading: boolean
  error?: string | null
}

export interface AuthActions {
  login: (identifier: string, password: string) => Promise<void>
  logout: () => void
  refreshSession: () => Promise<void>
}

// User Types
export interface UserProfile {
  did: string
  handle: string
  displayName?: string
  description?: string
  avatar?: string
  indexedAt?: string
  followersCount: number
  followsCount: number
  postsCount: number
  labels?: Array<{
    src: string
    uri: string
    val: string
    cts: string
  }>
  viewer?: {
    following?: string | null
    followedBy?: string | null
    muted?: boolean
    blockedBy?: boolean
    blocking?: string
    blockingByList?: string[]
  }
  preferences?: UserPreferences
}

export interface UserPreferences {
  notifications: {
    email: boolean
    push: boolean
    workoutReminders: boolean
    mealReminders: boolean
  }
  privacy: {
    profileVisibility: 'public' | 'followers' | 'private'
    showProgress: boolean
    showWorkouts: boolean
    showRecipes: boolean
  }
}

// Post Types
export interface BasePost extends BaseModel {
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
      images?: PostImage[]
      links?: PostLink[]
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

export interface PostImage {
  alt: string
  image: {
    ref: { $link: string }
    mimeType: string
  }
}

export interface PostLink {
  url: string
  title?: string
  description?: string
  thumb?: string
}

export interface FitnessPost extends BasePost {
  record: BasePost['record'] & {
    tags?: string[]
    category: FitnessCategory
    metadata?: FitnessMetadata
  }
}

// Fitness Specific Types
export type FitnessCategory = 'workout' | 'recipe' | 'supplement' | 'progress' | 'other'

export interface FitnessMetadata {
  difficulty?: 'beginner' | 'intermediate' | 'advanced'
  duration?: number
  calories?: number
  equipment?: string[]
  ingredients?: string[]
  instructions?: string[]
  metrics?: {
    weight?: number
    sets?: number
    reps?: number
    distance?: number
    time?: number
  }
  nutrition?: {
    protein?: number
    carbs?: number
    fat?: number
    fiber?: number
  }
}

// Feed Types
export type FeedViewType = 'following' | 'discover'

export interface FeedFilters {
  category?: FitnessCategory
  tags?: string[]
  sortBy?: 'recent' | 'popular'
  timeRange?: 'day' | 'week' | 'month' | 'all'
}

export interface FeedState {
  posts: FitnessPost[]
  viewType: FeedViewType
  filters: FeedFilters
  isLoading: boolean
  error?: string | null
  hasMore: boolean
  cursor?: string
  isInitialized: boolean
}

export interface FeedActions {
  setViewType: (viewType: FeedViewType) => void
  setFilters: (filters: Partial<FeedFilters>) => void
  loadMore: () => Promise<void>
  refresh: () => Promise<void>
  initialize: () => Promise<void>
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
} 