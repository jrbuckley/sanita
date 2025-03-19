import { create } from 'zustand'
import { FeedState, FeedActions, FeedViewType, FeedFilters, FitnessPost } from '../models/types'
import { AtProtoService } from '../api/atproto'
import { CacheManager } from '../utils/cacheManager'

const atProto = AtProtoService.getInstance()
const cache = CacheManager.getInstance()

const POSTS_PER_PAGE = 20
const FEED_CACHE_TTL = 1000 * 60 * 2 // 2 minutes

interface FeedStore extends FeedState, FeedActions {}

interface CachedFeedData {
  posts: FitnessPost[]
  cursor?: string
}

export const useFeedStore = create<FeedStore>((set, get) => ({
  posts: [],
  viewType: 'following',
  filters: {},
  isLoading: false,
  error: null,
  hasMore: true,
  cursor: undefined,
  isInitialized: false,

  setViewType: (viewType: FeedViewType) => {
    set({ viewType, posts: [], cursor: undefined, hasMore: true })
    get().refresh()
  },

  setFilters: (filters: Partial<FeedFilters>) => {
    set(state => ({
      filters: { ...state.filters, ...filters },
      posts: [],
      cursor: undefined,
      hasMore: true,
    }))
    get().refresh()
  },

  loadMore: async () => {
    const state = get()
    if (state.isLoading || !state.hasMore) return

    set({ isLoading: true, error: null })
    try {
      // Check cache first
      const cacheKey = cache.getCachedFeedKey(state.viewType, {
        ...state.filters,
        cursor: state.cursor,
      })
      
      const cachedData = cache.get<CachedFeedData>(cacheKey)
      
      if (cachedData) {
        set(state => ({
          posts: [...state.posts, ...cachedData.posts],
          cursor: cachedData.cursor,
          hasMore: cachedData.posts.length === POSTS_PER_PAGE && !!cachedData.cursor,
          isLoading: false,
          isInitialized: true,
        }))
        return
      }

      // If not in cache, fetch from API
      const response = await atProto.getFeed(
        state.viewType,
        state.filters,
        state.cursor
      )

      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to fetch feed')
      }

      const feedData = response.data
      const posts = feedData.posts || []
      const cursor = feedData.cursor

      // Cache the results
      cache.set<CachedFeedData>(cacheKey, { posts, cursor }, FEED_CACHE_TTL)

      set(state => ({
        posts: [...state.posts, ...posts],
        cursor,
        hasMore: posts.length === POSTS_PER_PAGE && !!cursor,
        isInitialized: true,
      }))
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to load more posts',
        hasMore: false,
      })
    } finally {
      set({ isLoading: false })
    }
  },

  refresh: async () => {
    const state = get()
    set({ isLoading: true, error: null })

    try {
      // Clear cache for the current view and filters
      const cacheKey = cache.getCachedFeedKey(state.viewType, state.filters)
      cache.remove(cacheKey)

      const response = await atProto.getFeed(state.viewType, state.filters)

      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to fetch feed')
      }

      const feedData = response.data
      const posts = feedData.posts || []
      const cursor = feedData.cursor

      // Cache the fresh results
      cache.set<CachedFeedData>(cacheKey, { posts, cursor }, FEED_CACHE_TTL)

      set({
        posts,
        cursor,
        hasMore: posts.length === POSTS_PER_PAGE && !!cursor,
        isInitialized: true,
      })
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to refresh feed',
        hasMore: false,
      })
    } finally {
      set({ isLoading: false })
    }
  },

  initialize: async () => {
    const state = get()
    if (!state.isInitialized && !state.isLoading) {
      await get().refresh()
    }
  },
})) 