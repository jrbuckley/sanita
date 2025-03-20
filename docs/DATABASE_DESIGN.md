# Database Design Documentation

## Overview
The database design for Sanita focuses on supporting health and fitness-focused social features while maintaining compatibility with the AT Protocol.

## Schema Design

### Users
```prisma
model User {
  id          String      @id @default(cuid())
  did         String      @unique // AT Protocol DID
  handle      String      @unique
  displayName String?
  description String?
  avatar      String?
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt

  // Profile Stats
  followersCount Int      @default(0)
  followsCount   Int      @default(0)
  postsCount     Int      @default(0)

  // Relationships
  posts         Post[]
  followers     Follow[]    @relation("following")
  following     Follow[]    @relation("followers")
  likes         Like[]
  reposts       Repost[]
  preferences   UserPreferences?

  // Indexes
  @@index([handle])
  @@index([did])
}

model UserPreferences {
  id        String    @id @default(cuid())
  userId    String    @unique
  user      User      @relation(fields: [userId], references: [id])

  // Notification Settings
  emailNotifications    Boolean @default(true)
  pushNotifications     Boolean @default(true)
  workoutReminders      Boolean @default(false)
  mealReminders         Boolean @default(false)

  // Privacy Settings
  profileVisibility     String  @default("public") // public, followers, private
  showProgress         Boolean @default(true)
  showWorkouts         Boolean @default(true)
  showRecipes         Boolean @default(true)

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

### Posts and Content
```prisma
model Post {
  id          String    @id @default(cuid())
  uri         String    @unique // AT Protocol URI
  cid         String    @unique // AT Protocol CID
  text        String
  category    String    // workout, recipe, supplement, progress, other
  tags        String[]
  metadata    Json?     // Flexible metadata storage
  
  // Relations
  authorId    String
  author      User      @relation(fields: [authorId], references: [id])
  likes       Like[]
  reposts     Repost[]
  replies     Reply[]

  // Metrics
  likeCount   Int       @default(0)
  repostCount Int       @default(0)
  replyCount  Int       @default(0)

  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  // Indexes
  @@index([authorId])
  @@index([category])
  @@index([createdAt])
}

model Like {
  id        String    @id @default(cuid())
  postId    String
  userId    String
  post      Post      @relation(fields: [postId], references: [id])
  user      User      @relation(fields: [userId], references: [id])
  createdAt DateTime  @default(now())

  @@unique([postId, userId])
  @@index([userId])
}

model Repost {
  id        String    @id @default(cuid())
  postId    String
  userId    String
  post      Post      @relation(fields: [postId], references: [id])
  user      User      @relation(fields: [userId], references: [id])
  createdAt DateTime  @default(now())

  @@unique([postId, userId])
  @@index([userId])
}

model Reply {
  id        String    @id @default(cuid())
  text      String
  postId    String
  userId    String
  post      Post      @relation(fields: [postId], references: [id])
  user      User      @relation(fields: [userId], references: [id])
  createdAt DateTime  @default(now())

  @@index([postId])
  @@index([userId])
}

model Follow {
  id          String    @id @default(cuid())
  followerId  String
  followingId String
  follower    User      @relation("following", fields: [followerId], references: [id])
  following   User      @relation("followers", fields: [followingId], references: [id])
  createdAt   DateTime  @default(now())

  @@unique([followerId, followingId])
  @@index([followerId])
  @@index([followingId])
}
```

## Design Considerations

### Indexing Strategy
- Primary indexes on unique identifiers (did, handle, uri, cid)
- Secondary indexes for efficient querying (category, createdAt)
- Relationship indexes for social graph traversal

### Performance Considerations
- Denormalized counters for quick stats access
- Efficient social graph querying through indexes
- Flexible metadata storage for extensibility

### Security Design
- Row-level access control
- Privacy settings at user level
- Audit trail capabilities

### Data Integrity
- Referential integrity through foreign keys
- Unique constraints on social interactions
- Timestamp tracking for all records

## Indexing Strategy

### Primary Indexes
- User: `did`, `handle` for quick lookups
- Post: `uri`, `cid` for AT Protocol compatibility
- Like/Repost: Composite unique indexes on `[postId, userId]`

### Secondary Indexes
- Posts: `category`, `createdAt` for feed filtering
- Follow: `followerId`, `followingId` for relationship queries
- All foreign keys for efficient joins

## Caching Strategy

1. **Session Cache** (In-Memory, 15min TTL)
   - User sessions
   - Authentication tokens

2. **Content Cache** (Redis, 2min TTL)
   - Feed results
   - Post content
   - User profiles

3. **Query Cache** (PostgreSQL)
   - Materialized views for trending content
   - Aggregated statistics

## Migration Strategy

Migrations will be handled through Prisma's migration system:
1. Development: `prisma migrate dev`
2. Production: `prisma migrate deploy`
3. Versioned migrations in `prisma/migrations/`

## Performance Considerations

1. **Pagination**
   - Cursor-based pagination for feeds
   - Limit of 20 posts per page
   - Cached results for common queries

2. **Denormalization**
   - Counter caches for followers, posts, etc.
   - Materialized views for complex aggregations

3. **Partitioning**
   - Posts partitioned by month
   - Separate tables for historical data

## Security Measures

1. **Data Access**
   - Row-level security policies
   - Encrypted sensitive data
   - Audit logging for critical operations

2. **Validation**
   - Schema-level constraints
   - Application-level validation
   - Input sanitization

## Backup Strategy

1. **Continuous Backup**
   - Point-in-time recovery
   - Daily full backups
   - Transaction log shipping

2. **Retention Policy**
   - 30 days of point-in-time recovery
   - 90 days of daily backups
   - 1 year of monthly backups 