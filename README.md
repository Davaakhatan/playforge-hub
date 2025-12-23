# Playforge

A centralized launcher and discovery hub for indie games - a lightweight "mini-Steam" for web and indie builds.

**Live Demo:** [playforge-hub-jcot.vercel.app](https://playforge-hub-jcot.vercel.app)

## Features

### Core
- **Game Catalog**: Browse and search indie games with advanced filtering
- **Multiple Game Types**: Web-embed, external links, and downloads
- **User Accounts**: Register, login, OAuth (Google, GitHub, Discord)
- **Personal Library**: Favorites and play history synced across devices

### Social
- **Comments**: Threaded comments with likes and replies
- **Reviews**: Rate and review games
- **Leaderboards**: XP, level, games played, achievements rankings
- **Achievements**: Unlock badges and earn XP
- **Notifications**: Real-time notification system

### Admin
- **Dashboard**: Analytics with charts and stats
- **Game Management**: CRUD operations for games
- **User Management**: Manage users and roles
- **Moderation**: Handle reports and moderate content

### Security
- **Two-Factor Auth**: TOTP-based 2FA with backup codes
- **OAuth Login**: Google, GitHub, Discord integration
- **Email Verification**: Verify user emails
- **Session-based Auth**: Secure HTTP-only cookies

### UX
- **Dark/Light Theme**: Toggle between themes
- **Mobile Responsive**: Full mobile support with drawer filters
- **Screenshot Gallery**: Lightbox with keyboard navigation
- **PWA Ready**: Installable as progressive web app

## Tech Stack

| Technology   | Purpose                |
| ------------ | ---------------------- |
| Next.js 16   | React framework        |
| TypeScript   | Type safety            |
| Tailwind CSS | Styling                |
| Prisma       | Database ORM           |
| PostgreSQL   | Neon cloud database    |
| bcryptjs     | Password hashing       |
| Vercel       | Deployment             |

## Quick Start

### Prerequisites

- Node.js 18+
- npm
- Neon account (for PostgreSQL)

### Development

```bash
# Install dependencies
npm install

# Setup environment
cp .env.example .env
# Add your DATABASE_URL from Neon

# Setup database
npx prisma db push
npx prisma db seed

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Default Admin Account

- Email: `admin@playforge.local`
- Password: `admin123`

## Environment Variables

```env
# Database (Neon PostgreSQL)
DATABASE_URL="postgresql://user:pass@host/db?sslmode=require"

# Session
SESSION_SECRET="your-secret-key"

# App URL (for OAuth callbacks)
NEXT_PUBLIC_APP_URL="https://your-domain.com"

# OAuth (optional)
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
GITHUB_CLIENT_ID=""
GITHUB_CLIENT_SECRET=""
DISCORD_CLIENT_ID=""
DISCORD_CLIENT_SECRET=""
```

## Project Structure

```text
src/
├── app/              # Next.js App Router pages
│   ├── admin/        # Admin panel
│   ├── api/          # API routes
│   ├── games/        # Game pages
│   └── ...
├── components/       # React components
│   ├── achievements/ # Achievement badges
│   ├── admin/        # Admin components
│   ├── auth/         # Auth components
│   ├── comments/     # Comment system
│   ├── notifications/# Notification dropdown
│   └── ui/           # Generic UI
├── features/         # Feature modules
│   ├── auth/         # Auth context
│   ├── library/      # Library context
│   └── theme/        # Theme context
├── lib/              # Utilities
│   ├── auth.ts       # Session management
│   ├── oauth.ts      # OAuth utilities
│   ├── totp.ts       # 2FA utilities
│   ├── achievements.ts # Achievement system
│   └── prisma.ts     # Database client
└── types/            # TypeScript definitions
```

## API Routes

### Authentication
| Route | Method | Description |
|-------|--------|-------------|
| `/api/auth/register` | POST | Create account |
| `/api/auth/login` | POST | Login |
| `/api/auth/logout` | POST | Logout |
| `/api/auth/me` | GET | Current user |
| `/api/auth/oauth/[provider]` | GET | OAuth initiate |
| `/api/auth/2fa/enable` | POST | Enable 2FA |

### Games
| Route | Method | Description |
|-------|--------|-------------|
| `/api/games` | GET | List games |
| `/api/games/[id]` | GET/PUT/DELETE | Game CRUD |
| `/api/games/[id]/comments` | GET/POST | Comments |

### Social
| Route | Method | Description |
|-------|--------|-------------|
| `/api/leaderboard` | GET | Leaderboards |
| `/api/achievements` | GET | User achievements |
| `/api/notifications` | GET/POST | Notifications |
| `/api/reports` | GET/POST/PATCH | Moderation |

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import to Vercel
3. Add environment variables
4. Deploy

### Docker

```bash
docker-compose up --build
```

Note: For Docker, use an external PostgreSQL database.

## Documentation

- [PRD](./docs/PRD.md) - Product Requirements
- [Tasks](./docs/TASKS.md) - Implementation Tasks
- [Memory Bank](./memory-bank/) - Project Context

## Core Principle

> *"The launcher is not the game. The launcher is a catalog, navigator, and launcher - nothing else."*

## License

MIT
