import { BskyAgent, AtpSessionData, AppBskyFeedPost, AppBskyActorProfile } from '@atproto/api'
import { ApiResponse, FitnessPost, UserProfile, FeedViewType, FeedFilters } from '../models/types'
import { securityUtils } from '../utils/security'

export class AtProtoService {
  private agent: BskyAgent
  private static instance: AtProtoService
  private static readonly SESSION_KEY = 'auth_session'
  private static readonly RATE_LIMIT_KEY = 'api_requests'

  private constructor() {
    this.agent = new BskyAgent({
      service: 'https://bsky.social',
      persistSession: (evt, did) => {
        if (typeof evt === 'object' && evt !== null) {
          securityUtils.secureStore.set(AtProtoService.SESSION_KEY, evt)
        }
      },
    })

    // Try to restore session
    const savedSession = securityUtils.secureStore.get<AtpSessionData>(AtProtoService.SESSION_KEY)
    if (savedSession && securityUtils.validateSession(savedSession)) {
      this.agent.resumeSession(savedSession)
    }
  }

  static getInstance(): AtProtoService {
    if (!AtProtoService.instance) {
      AtProtoService.instance = new AtProtoService()
    }
    return AtProtoService.instance
  }

  private checkRateLimit(): boolean {
    return securityUtils.rateLimit.checkLimit(AtProtoService.RATE_LIMIT_KEY)
  }

  async login(identifier: string, password: string): Promise<ApiResponse<AtpSessionData>> {
    try {
      if (!this.checkRateLimit()) {
        throw new Error('Rate limit exceeded. Please try again later.')
      }

      // Sanitize inputs
      const sanitizedIdentifier = securityUtils.sanitizeInput(identifier)
      const sanitizedPassword = securityUtils.sanitizeInput(password)

      const response = await this.agent.login({
        identifier: sanitizedIdentifier,
        password: sanitizedPassword,
      })

      if (!response.success) throw new Error('Login failed')
      
      return {
        success: true,
        data: {
          refreshJwt: response.data.refreshJwt,
          accessJwt: response.data.accessJwt,
          handle: response.data.handle,
          did: response.data.did,
          email: response.data.email,
          emailConfirmed: response.data.emailConfirmed,
          active: true,
        },
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to login',
      }
    }
  }

  async logout(): Promise<ApiResponse<void>> {
    try {
      if (!this.checkRateLimit()) {
        throw new Error('Rate limit exceeded. Please try again later.')
      }

      await this.agent.logout()
      securityUtils.secureStore.remove(AtProtoService.SESSION_KEY)
      
      return {
        success: true,
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to logout',
      }
    }
  }

  async getProfile(handle: string): Promise<ApiResponse<UserProfile>> {
    try {
      if (!this.checkRateLimit()) {
        throw new Error('Rate limit exceeded. Please try again later.')
      }

      const sanitizedHandle = securityUtils.sanitizeInput(handle)
      const response = await this.agent.getProfile({ actor: sanitizedHandle })
      
      if (!response.success) throw new Error('Failed to fetch profile')
      
      const profile = response.data

      const userProfile: UserProfile = {
        did: profile.did,
        handle: profile.handle,
        displayName: profile.displayName,
        description: profile.description,
        avatar: profile.avatar,
        indexedAt: profile.indexedAt,
        followersCount: profile.followersCount || 0,
        followsCount: profile.followsCount || 0,
        postsCount: profile.postsCount || 0,
        labels: profile.labels,
        viewer: profile.viewer ? {
          following: profile.viewer.following || null,
          followedBy: profile.viewer.followedBy || null,
          muted: profile.viewer.muted || false,
          blockedBy: profile.viewer.blockedBy || false,
          blocking: profile.viewer.blocking || undefined,
          blockingByList: Array.isArray(profile.viewer.blockingByList) 
            ? profile.viewer.blockingByList 
            : [],
        } : undefined,
      }

      return {
        success: true,
        data: userProfile,
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch profile',
      }
    }
  }

  async createPost(text: string, category: string): Promise<ApiResponse<FitnessPost>> {
    try {
      if (!this.checkRateLimit()) {
        throw new Error('Rate limit exceeded. Please try again later.')
      }

      const sanitizedText = securityUtils.sanitizeInput(text)
      const sanitizedCategory = securityUtils.sanitizeInput(category)

      const record: AppBskyFeedPost.Record = {
        $type: 'app.bsky.feed.post',
        text: sanitizedText,
        createdAt: new Date().toISOString(),
        langs: ['en'],
      }

      const response = await this.agent.post(record)
      const threadResponse = await this.agent.getPostThread({ uri: response.uri })
      
      if (!threadResponse.success || !('post' in threadResponse.data.thread)) {
        throw new Error('Failed to fetch created post')
      }

      const postView = threadResponse.data.thread.post
      const fitnessPost: FitnessPost = {
        uri: postView.uri,
        cid: postView.cid,
        author: {
          did: postView.author.did,
          handle: postView.author.handle,
          displayName: postView.author.displayName,
          avatar: postView.author.avatar,
        },
        record: {
          text: String(postView.record.text),
          createdAt: String(postView.record.createdAt),
          category: sanitizedCategory as FitnessPost['record']['category'],
        },
        indexedAt: postView.indexedAt,
        replyCount: postView.replyCount ?? 0,
        repostCount: postView.repostCount ?? 0,
        likeCount: postView.likeCount ?? 0,
        viewer: postView.viewer,
      }

      return {
        success: true,
        data: fitnessPost,
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create post',
      }
    }
  }

  async getFeed(
    viewType: FeedViewType,
    filters: FeedFilters = {},
    cursor?: string
  ): Promise<ApiResponse<{ posts: FitnessPost[]; cursor?: string }>> {
    try {
      if (!this.checkRateLimit()) {
        throw new Error('Rate limit exceeded. Please try again later.')
      }

      let response;
      if (viewType === 'following') {
        response = await this.agent.getTimeline({ cursor, limit: 50 })
      } else {
        // For discover view, we use getFeed with custom filtering
        response = await this.agent.getAuthorFeed({ actor: this.agent.session?.did || '', cursor, limit: 50 })
      }

      if (!response.success) {
        throw new Error('Failed to fetch feed')
      }

      // Filter and transform posts
      const fitnessRelatedPosts = response.data.feed
        .filter((item: any) => {
          const record = item.post.record
          
          // Check category filter
          if (filters.category && record.category !== filters.category) {
            return false
          }

          // Check tags filter
          if (filters.tags && filters.tags.length > 0) {
            const postTags = record.tags || []
            if (!filters.tags.some(tag => postTags.includes(tag))) {
              return false
            }
          }

          // Basic fitness content check
          return (
            record.tags?.includes('sanita') ||
            record.tags?.includes('fitness') ||
            record.tags?.includes('health') ||
            record.category
          )
        })
        .map((item: any) => this.transformToFitnessPost(item.post))

      // Apply sorting if specified
      if (filters.sortBy === 'popular') {
        fitnessRelatedPosts.sort((a: FitnessPost, b: FitnessPost) => 
          (b.likeCount + b.repostCount) - (a.likeCount + a.repostCount)
        )
      }

      // Apply time range filter if specified
      if (filters.timeRange && filters.timeRange !== 'all') {
        const cutoffDate = new Date()
        switch (filters.timeRange) {
          case 'day':
            cutoffDate.setDate(cutoffDate.getDate() - 1)
            break
          case 'week':
            cutoffDate.setDate(cutoffDate.getDate() - 7)
            break
          case 'month':
            cutoffDate.setMonth(cutoffDate.getMonth() - 1)
            break
        }

        fitnessRelatedPosts.filter((post: FitnessPost) => 
          new Date(post.record.createdAt) >= cutoffDate
        )
      }

      return {
        success: true,
        data: {
          posts: fitnessRelatedPosts,
          cursor: response.data.cursor,
        },
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch feed',
      }
    }
  }

  private transformToFitnessPost(post: any): FitnessPost {
    return {
      uri: post.uri,
      cid: post.cid,
      author: {
        did: post.author.did,
        handle: post.author.handle,
        displayName: post.author.displayName,
        avatar: post.author.avatar,
      },
      record: {
        text: String(post.record.text),
        createdAt: String(post.record.createdAt),
        category: (post.record.category || 'other') as FitnessPost['record']['category'],
        tags: post.record.tags || [],
        metadata: post.record.metadata,
      },
      indexedAt: post.indexedAt,
      replyCount: post.replyCount ?? 0,
      repostCount: post.repostCount ?? 0,
      likeCount: post.likeCount ?? 0,
      viewer: post.viewer,
    }
  }

  // Interaction Methods
  async likePost(uri: string, cid: string): Promise<ApiResponse<any>> {
    try {
      const response = await this.agent.like(uri, cid)
      return {
        success: true,
        data: response,
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to like post',
      }
    }
  }

  async unlikePost(likeUri: string): Promise<ApiResponse<any>> {
    try {
      const response = await this.agent.deleteLike(likeUri)
      return {
        success: true,
        data: response,
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to unlike post',
      }
    }
  }

  async repost(uri: string, cid: string): Promise<ApiResponse<any>> {
    try {
      const response = await this.agent.repost(uri, cid)
      return {
        success: true,
        data: response,
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to repost',
      }
    }
  }

  async unrepost(repostUri: string): Promise<ApiResponse<any>> {
    try {
      const response = await this.agent.deleteRepost(repostUri)
      return {
        success: true,
        data: response,
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to unrepost',
      }
    }
  }

  // Helper Methods
  getAgent(): BskyAgent {
    return this.agent
  }

  async refreshSession(refreshJwt: string): Promise<ApiResponse<AtpSessionData>> {
    try {
      if (!this.checkRateLimit()) {
        throw new Error('Rate limit exceeded. Please try again later.')
      }

      const currentSession = this.agent.session
      if (!currentSession?.did) {
        throw new Error('No active session')
      }

      await this.agent.resumeSession({
        accessJwt: currentSession.accessJwt,
        refreshJwt,
        did: currentSession.did,
        handle: currentSession.handle,
        email: currentSession.email || '',
        emailConfirmed: currentSession.emailConfirmed || false,
        active: true,
      })

      const newSession = this.agent.session
      if (!newSession) {
        throw new Error('Failed to refresh session')
      }

      return {
        success: true,
        data: {
          refreshJwt: newSession.refreshJwt,
          accessJwt: newSession.accessJwt,
          handle: newSession.handle,
          did: newSession.did,
          email: newSession.email || '',
          emailConfirmed: newSession.emailConfirmed || false,
          active: true,
        },
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to refresh session',
      }
    }
  }
}

export default AtProtoService.getInstance() 