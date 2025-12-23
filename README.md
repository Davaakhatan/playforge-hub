# Playforge

A centralized launcher and discovery hub for indie games - a lightweight "mini-Steam" for web and indie builds.

## Features

- **Game Catalog**: Browse and search indie games with filtering
- **Multiple Game Types**: Web-embed, external links, and downloads
- **User Accounts**: Register, login, and sync library across devices
- **Personal Library**: Favorites and play history
- **Admin Panel**: Manage games and users
- **Dark/Light Theme**: Toggle between dark and light modes
- **Docker Support**: Easy deployment with persistent storage
- **Mobile Filters**: Slide-up drawer for filtering on mobile
- **Screenshot Gallery**: Full-screen lightbox with keyboard navigation
- **Sorting Options**: Sort by featured, newest, oldest, or alphabetically
- **Pagination**: Browse large catalogs with page navigation
- **SEO Optimized**: Open Graph and Twitter Card metadata
- **PWA Ready**: Installable as a progressive web app

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

### Default Admin Account

After seeding the database:
- Email: `admin@playforge.local`
- Password: `admin123`

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
├── features/     # Feature modules (auth, library, theme)
├── lib/          # Utilities
└── types/        # TypeScript definitions
```

## Theme Support

Playforge supports dark and light themes:
- **Dark Mode**: Default theme with dark backgrounds
- **Light Mode**: Bright backgrounds for daytime use
- **System**: Follows system preference

Toggle using the theme switcher in the header.

## Admin Access

1. Login with admin credentials at `/login`
2. Access admin panel at `/admin`
3. Manage games, users, and view stats

Or create a new admin:
1. Register a new account at `/register`
2. Access the database: `npx prisma studio`
3. Change user role to "ADMIN"

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
