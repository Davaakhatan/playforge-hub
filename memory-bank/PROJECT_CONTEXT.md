# Playforge - Project Context

> This file provides essential context for AI assistants and new contributors.
> Status: Production Ready with Extended Features
> Last Updated: 2025-12-23

---

## What is This Project?

**Playforge** is a centralized launcher and discovery hub for indie games. Think of it as a lightweight "mini-Steam" for web-based and indie game builds.

**Live Demo:** [playforge-hub-jcot.vercel.app](https://playforge-hub-jcot.vercel.app)

### Core Philosophy

> *"The launcher is not the game. The launcher is a catalog, navigator, and launcher - nothing else."*

This means:

- The launcher never bundles games into its codebase
- Games are hosted separately and loaded dynamically
- Adding a new game = using admin panel or editing database
- The UI is a thin layer over the catalog data

---

## Current Implementation Status

### Completed Features

#### Core
- Store page with search and filters
- Game detail pages with metadata
- Game player with sandboxed iframe
- User authentication (session-based)
- Admin panel for game/user management
- Local library with favorites and history
- Server sync for logged-in users
- Docker containerization
- Dark/Light theme toggle

#### Authentication & Security
- Session-based auth with HTTP-only cookies
- OAuth login (Google, GitHub, Discord)
- Two-Factor Authentication (TOTP-based 2FA)
- Backup codes for 2FA recovery
- Email verification system
- Password hashing with bcrypt

#### Social Features
- Threaded comments with likes and replies
- Game reviews with ratings
- Achievements and XP system (14 achievements)
- Leaderboards (XP, level, games played, achievements)
- Real-time notifications
- Content moderation and reporting

#### UX Enhancements
- Mobile responsive with drawer filters
- Screenshot gallery with lightbox
- Sorting options (featured, newest, oldest, A-Z, Z-A)
- Pagination (12 games per page)
- Loading skeletons for smooth UX
- SEO metadata (Open Graph, Twitter Cards)
- PWA manifest for app installation

### Tech Stack

| Layer     | Choice           | Rationale                              |
| --------- | ---------------- | -------------------------------------- |
| Framework | Next.js 16       | App Router, React Server Components    |
| Language  | TypeScript       | Type safety, better DX                 |
| Styling   | Tailwind CSS     | Rapid development, consistent design   |
| Database  | PostgreSQL/Neon  | Cloud-hosted, scalable, production-ready |
| ORM       | Prisma           | Type-safe database access              |
| Auth      | Session + OAuth  | Secure cookies, bcrypt, social login   |
| State     | React Context    | Simple, sufficient for needs           |
| Theme     | CSS Variables    | Class-based dark/light switching       |
| Deploy    | Vercel           | Seamless Next.js hosting               |

---

## Key Architectural Decisions

### 1. Catalog-Driven Architecture

**Decision:** All games are defined in database, not as individual pages.
**Why:** Enables scaling to hundreds of games without code changes.

### 2. PostgreSQL with Neon

**Decision:** Use Neon cloud PostgreSQL for data persistence.
**Why:** Production-ready, scalable, works with Vercel deployment.

### 3. Session-Based Authentication + OAuth

**Decision:** Cookie-based sessions with OAuth providers.
**Why:** More secure, supports social login, easy to invalidate.

### 4. Separate Game Hosting

**Decision:** Games hosted on separate domain/subdomain.
**Why:** Security isolation, independent scaling.

### 5. Two-Factor Authentication

**Decision:** TOTP-based 2FA with backup codes.
**Why:** Enhanced security for user accounts.

### 6. Social Features

**Decision:** Comments, reviews, achievements, leaderboards.
**Why:** Community engagement and gamification.

---

## Folder Structure

```text
src/
├── app/              # Routes (Next.js App Router)
│   ├── admin/        # Admin panel pages
│   ├── api/          # API routes
│   │   ├── auth/     # Auth endpoints (login, OAuth, 2FA)
│   │   ├── games/    # Game CRUD + comments
│   │   ├── library/  # Favorites and history
│   │   ├── achievements/ # Achievement system
│   │   ├── leaderboard/  # Leaderboards
│   │   ├── notifications/ # Notification system
│   │   └── reports/  # Moderation
│   ├── games/        # Game detail pages
│   ├── library/      # User library
│   ├── login/        # Auth pages
│   ├── play/         # Game player
│   ├── settings/     # User settings (2FA)
│   └── register/
├── components/       # Reusable UI components
│   ├── achievements/ # Achievement badges
│   ├── admin/        # Admin-specific components
│   ├── auth/         # Auth components (UserMenu)
│   ├── comments/     # Comment system
│   ├── filter/       # Filter sidebar
│   ├── game/         # Game components
│   ├── layout/       # Layout (Header, Footer)
│   ├── notifications/# Notification dropdown
│   ├── search/       # Search bar
│   └── ui/           # Generic UI (Button, Input, Badge)
├── features/         # Feature modules
│   ├── auth/         # Auth context
│   ├── library/      # Library context
│   └── theme/        # Theme context and toggle
├── lib/              # Utilities
│   ├── auth.ts       # Session management
│   ├── oauth.ts      # OAuth utilities
│   ├── totp.ts       # 2FA utilities
│   ├── achievements.ts # Achievement system
│   ├── prisma.ts     # Database client
│   └── utils.ts      # General utilities
└── types/            # TypeScript definitions
```

---

## Game Types

### Web-Embed

- HTML5 games loaded in sandboxed iframe
- Hosted on separate subdomain
- Example: Browser games, Phaser/PixiJS games

### External

- Links to external platforms (Steam, itch.io)
- Opens in new tab
- Launcher just redirects

### Download

- Direct download links
- Installer or ZIP files
- Hosted on CDN or external storage

---

## Security Model

1. **Iframe Sandbox:** Web games run with restricted permissions
2. **Session Auth:** Secure HTTP-only cookies
3. **Password Hashing:** bcrypt with salt rounds
4. **Two-Factor Auth:** TOTP with backup codes
5. **OAuth:** Google, GitHub, Discord integration
6. **Admin Protection:** Middleware-protected routes
7. **Email Verification:** Verify user emails
8. **Content Moderation:** Report and review system

---

## Theme System

### CSS Variables (globals.css)

```css
:root, .dark {
  --background: #09090b;
  --foreground: #fafafa;
  --card: #18181b;
  --border: #27272a;
}

.light {
  --background: #ffffff;
  --foreground: #09090b;
  --card: #f4f4f5;
  --border: #e4e4e7;
}
```

### Tailwind Pattern

```tsx
// Light mode first, dark: prefix for dark mode
className="bg-white text-zinc-900 dark:bg-zinc-900 dark:text-white"
```

### Theme Toggle

- Located in Header
- Three options: Light, Dark, System
- Persisted in localStorage

---

## Quick Reference

### Adding a New Game

1. Login as admin at `/login`
2. Go to `/admin/games`
3. Click "Add Game"
4. Fill in game details
5. Save - game appears immediately

### Default Admin Account

- Email: `admin@playforge.local`
- Password: `admin123`

### Running Locally

```bash
npm install
cp .env.example .env
# Add your DATABASE_URL from Neon
npx prisma db push
npx prisma db seed
npm run dev
```

### Environment Variables

```env
DATABASE_URL="postgresql://..."  # Neon PostgreSQL
SESSION_SECRET="your-secret-key"
NEXT_PUBLIC_APP_URL="https://your-domain.com"

# OAuth (optional)
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
GITHUB_CLIENT_ID=""
GITHUB_CLIENT_SECRET=""
DISCORD_CLIENT_ID=""
DISCORD_CLIENT_SECRET=""
```

---

## Related Documents

- [PRD.md](../docs/PRD.md) - Full product requirements
- [TASKS.md](../docs/TASKS.md) - Implementation tasks
- [DECISIONS.md](./DECISIONS.md) - Architectural decisions log
- [TECH_STACK.md](./TECH_STACK.md) - Technology reference
