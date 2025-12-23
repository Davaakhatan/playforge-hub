# Playforge

A centralized launcher and discovery hub for indie games - a lightweight "mini-Steam" for web and indie builds.

## Features

- **Game Catalog**: Browse and search indie games with filtering
- **Multiple Game Types**: Web-embed, external links, and downloads
- **User Accounts**: Register, login, and sync library across devices
- **Personal Library**: Favorites and play history
- **Admin Panel**: Manage games and users
- **Docker Support**: Easy deployment with persistent storage

## Quick Start

### Prerequisites

- Node.js 18+
- npm

### Development

```bash
# Install dependencies
npm install

# Setup database
npx prisma migrate dev
npx prisma db seed

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Docker Deployment

```bash
# Build and run
docker-compose up --build

# Run in background
docker-compose up -d
```

## Tech Stack

| Technology   | Purpose                |
| ------------ | ---------------------- |
| Next.js 15   | React framework        |
| TypeScript   | Type safety            |
| Tailwind CSS | Styling                |
| Prisma       | Database ORM           |
| SQLite       | Data persistence       |
| bcryptjs     | Password hashing       |
| Docker       | Containerization       |

## Project Structure

```text
src/
├── app/          # Next.js App Router pages
├── components/   # React components
├── features/     # Feature modules (auth, library)
├── lib/          # Utilities
└── types/        # TypeScript definitions
```

## Admin Access

1. Register a new account at `/register`
2. Access the database: `npx prisma studio`
3. Change user role to "ADMIN"
4. Access admin panel at `/admin`

## Environment Variables

Create a `.env` file:

```env
DATABASE_URL="file:./dev.db"
SESSION_SECRET="your-secret-key-change-in-production"
```

## Documentation

- [PRD](./docs/PRD.md) - Product Requirements Document
- [Tasks](./docs/TASKS.md) - Implementation Tasks
- [Memory Bank](./memory-bank/) - Project Context and Decisions

## Core Principle

> *"The launcher is not the game. The launcher is a catalog, navigator, and launcher - nothing else."*

## License

MIT
