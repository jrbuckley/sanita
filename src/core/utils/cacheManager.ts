interface CacheItem<T> {
  data: T
  timestamp: number
  ttl: number
}

export class CacheManager {
  private static instance: CacheManager
  private cache: Map<string, CacheItem<any>>
  private static readonly DEFAULT_TTL = 1000 * 60 * 5 // 5 minutes

  private constructor() {
    this.cache = new Map()
    this.startCleanupInterval()
  }

  static getInstance(): CacheManager {
    if (!CacheManager.instance) {
      CacheManager.instance = new CacheManager()
    }
    return CacheManager.instance
  }

  set<T>(key: string, data: T, ttl: number = CacheManager.DEFAULT_TTL): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    })
  }

  get<T>(key: string): T | null {
    const item = this.cache.get(key)
    
    if (!item) {
      return null
    }

    if (this.isExpired(item)) {
      this.cache.delete(key)
      return null
    }

    return item.data as T
  }

  remove(key: string): void {
    this.cache.delete(key)
  }

  clear(): void {
    this.cache.clear()
  }

  private isExpired(item: CacheItem<any>): boolean {
    return Date.now() - item.timestamp > item.ttl
  }

  private startCleanupInterval(): void {
    setInterval(() => {
      for (const [key, item] of this.cache.entries()) {
        if (this.isExpired(item)) {
          this.cache.delete(key)
        }
      }
    }, 1000 * 60) // Clean up every minute
  }

  // Helper methods for feed-specific caching
  getCachedFeedKey(viewType: string, filters: Record<string, any>): string {
    return `feed:${viewType}:${JSON.stringify(filters)}`
  }

  getCachedProfileKey(handle: string): string {
    return `profile:${handle}`
  }
}

export default CacheManager.getInstance() 