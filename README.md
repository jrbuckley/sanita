# Sanita - Health & Fitness Social Platform

A decentralized health and fitness social media platform built on the AT Protocol. Share and discover fitness plans, healthy recipes, supplement recommendations, and connect with health enthusiasts worldwide.

## Features

- AT Protocol Integration for decentralized social networking
- Health and fitness-focused content sharing
- Recipe sharing and discovery
- Fitness plan marketplace
- Supplement recommendations and reviews
- Integration with existing fitness businesses
- Custom storefront creation for content creators

## Tech Stack

### Frontend
- Next.js 14 with App Router
- TypeScript
- Tailwind CSS
- DaisyUI for UI components
- Zustand for state management
- React Hook Form for form handling

### Backend
- Node.js
- AT Protocol integration
- PostgreSQL for data storage
- Prisma as ORM
- Connection pooling for database optimization

### Infrastructure
- Environment-based configuration
- Type-safe database operations
- Automated database initialization
- Comprehensive error handling

## Database Setup

1. Install PostgreSQL:
   ```bash
   brew install postgresql@14
   brew services start postgresql@14
   ```

2. Set up environment variables:
   Create a `.env` file with the following:
   ```bash
   DATABASE_URL="postgresql://sanita_user:sanita_secure_pwd_123@localhost:5432/sanita"
   DB_USER=sanita_user
   DB_PASSWORD=sanita_secure_pwd_123
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=sanita
   ```

3. Initialize the database:
   ```bash
   ./scripts/init-db.sh
   ```

4. Run Prisma migrations:
   ```bash
   npx prisma migrate dev
   ```

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env.local` file with your AT Protocol credentials
4. Run the development server:
   ```bash
   npm run dev
   ```

## Contributing

Contributions are welcome! Please read our contributing guidelines before submitting pull requests.

## License

MIT License
