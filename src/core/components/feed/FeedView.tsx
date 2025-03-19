import React, { useEffect, useCallback } from 'react'
import { useFeedStore } from '../../store/feedStore'
import { FeedViewType, FeedFilters, FitnessCategory } from '../../models/types'
import { AccessibleComponent } from '../base/AccessibleComponent'
import { WCAG_COLORS, TOUCH_TARGET_SIZE } from '../../utils/accessibility'

const viewOptions: Array<{ value: FeedViewType; label: string }> = [
  { value: 'following', label: 'Following' },
  { value: 'discover', label: 'Discover' },
]

const categoryOptions: Array<{ value: FitnessCategory; label: string }> = [
  { value: 'workout', label: 'Workouts' },
  { value: 'recipe', label: 'Recipes' },
  { value: 'supplement', label: 'Supplements' },
  { value: 'progress', label: 'Progress' },
  { value: 'other', label: 'Other' },
]

export const FeedView: React.FC = () => {
  const {
    posts,
    viewType,
    filters,
    isLoading,
    error,
    hasMore,
    setViewType,
    setFilters,
    loadMore,
    refresh,
  } = useFeedStore()

  useEffect(() => {
    refresh()
  }, [refresh])

  const handleViewTypeChange = useCallback((type: FeedViewType) => {
    setViewType(type)
  }, [setViewType])

  const handleCategoryChange = useCallback((category: FitnessCategory | undefined) => {
    setFilters({ category })
  }, [setFilters])

  const handleTagsChange = useCallback((tags: string[]) => {
    setFilters({ tags })
  }, [setFilters])

  const handleSortChange = useCallback((sortBy: FeedFilters['sortBy']) => {
    setFilters({ sortBy })
  }, [setFilters])

  const handleTimeRangeChange = useCallback((timeRange: FeedFilters['timeRange']) => {
    setFilters({ timeRange })
  }, [setFilters])

  return (
    <div className="feed-container">
      {/* View Type Selector */}
      <AccessibleComponent
        role="tablist"
        ariaLabel="Feed view options"
        className="view-type-selector"
      >
        {viewOptions.map(option => (
          <AccessibleComponent
            key={option.value}
            role="tab"
            ariaSelected={viewType === option.value}
            onClick={() => handleViewTypeChange(option.value)}
            className={`view-type-option ${viewType === option.value ? 'active' : ''}`}
          >
            {option.label}
          </AccessibleComponent>
        ))}
      </AccessibleComponent>

      {/* Filters Section */}
      <AccessibleComponent
        role="region"
        ariaLabel="Feed filters"
        className="feed-filters"
      >
        {/* Category Filter */}
        <div className="filter-group">
          <label htmlFor="category-filter">Category</label>
          <select
            id="category-filter"
            value={filters.category || ''}
            onChange={(e) => handleCategoryChange(e.target.value as FitnessCategory || undefined)}
          >
            <option value="">All Categories</option>
            {categoryOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Sort Options */}
        <div className="filter-group">
          <label htmlFor="sort-filter">Sort By</label>
          <select
            id="sort-filter"
            value={filters.sortBy || 'recent'}
            onChange={(e) => handleSortChange(e.target.value as FeedFilters['sortBy'])}
          >
            <option value="recent">Most Recent</option>
            <option value="popular">Most Popular</option>
          </select>
        </div>

        {/* Time Range Filter */}
        <div className="filter-group">
          <label htmlFor="time-filter">Time Range</label>
          <select
            id="time-filter"
            value={filters.timeRange || 'all'}
            onChange={(e) => handleTimeRangeChange(e.target.value as FeedFilters['timeRange'])}
          >
            <option value="all">All Time</option>
            <option value="day">Last 24 Hours</option>
            <option value="week">Last Week</option>
            <option value="month">Last Month</option>
          </select>
        </div>
      </AccessibleComponent>

      {/* Posts List */}
      <AccessibleComponent
        role="feed"
        ariaLabel="Posts feed"
        className="posts-list"
      >
        {error && (
          <div className="error-message" role="alert">
            {error}
          </div>
        )}
        
        {posts.map(post => (
          <AccessibleComponent
            key={post.uri}
            role="article"
            className="post-item"
          >
            {/* Post content rendering will be handled by a separate PostCard component */}
            {/* <PostCard post={post} /> */}
            {/* Temporary placeholder */}
            <div className="post-content">
              <h3>{post.author.displayName || post.author.handle}</h3>
              <p>{post.record.text}</p>
            </div>
          </AccessibleComponent>
        ))}

        {isLoading && (
          <div className="loading-indicator" role="status">
            Loading more posts...
          </div>
        )}

        {!isLoading && hasMore && (
          <AccessibleComponent
            role="button"
            onClick={loadMore}
            className="load-more-button"
          >
            Load More
          </AccessibleComponent>
        )}
      </AccessibleComponent>

      <style jsx>{`
        .feed-container {
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
        }

        .view-type-selector {
          display: flex;
          gap: 16px;
          margin-bottom: 24px;
        }

        .view-type-option {
          padding: 8px 16px;
          border-radius: 8px;
          cursor: pointer;
          min-width: ${TOUCH_TARGET_SIZE.recommended}px;
          text-align: center;
          background: ${WCAG_COLORS.primary.light};
          color: ${WCAG_COLORS.primary.contrast};
        }

        .view-type-option.active {
          background: ${WCAG_COLORS.primary.main};
        }

        .feed-filters {
          display: flex;
          gap: 16px;
          margin-bottom: 24px;
          flex-wrap: wrap;
        }

        .filter-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .filter-group label {
          color: ${WCAG_COLORS.text.secondary};
          font-size: 14px;
        }

        .filter-group select {
          min-width: ${TOUCH_TARGET_SIZE.recommended}px;
          padding: 8px;
          border-radius: 4px;
          border: 1px solid ${WCAG_COLORS.text.disabled};
        }

        .posts-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .post-item {
          padding: 16px;
          border-radius: 8px;
          border: 1px solid ${WCAG_COLORS.text.disabled};
          background: white;
        }

        .error-message {
          padding: 16px;
          border-radius: 8px;
          background: ${WCAG_COLORS.error.light};
          color: ${WCAG_COLORS.error.contrast};
        }

        .loading-indicator {
          text-align: center;
          padding: 16px;
          color: ${WCAG_COLORS.text.secondary};
        }

        .load-more-button {
          padding: 12px 24px;
          background: ${WCAG_COLORS.primary.main};
          color: ${WCAG_COLORS.primary.contrast};
          border-radius: 8px;
          text-align: center;
          cursor: pointer;
        }
      `}</style>
    </div>
  )
} 