# Playforge - Project Context

> This file provides essential context for AI assistants and new contributors.
> Status: MVP Complete + Extended Features
> Last Updated: 2025-12-23

---

## What is This Project?

**Playforge** is a centralized launcher and discovery hub for indie games. Think of it as a lightweight "mini-Steam" for web-based and indie game builds.

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

- Store page with search and filters
- Game detail pages with metadata
- Game player with sandboxed iframe
- User authentication (session-based)
- Admin panel for game/user management
- Local library with favorites and history
- Server sync for logged-in users
- Docker containerization
- Dark/Light theme toggle
- Protected library (requires login)

### Tech Stack

| Layer     | Choice         | Rationale                              |
| --------- | -------------- | -------------------------------------- |
| Framework | Next.js 15     | App Router, React Server Components    |
| Language  | TypeScript     | Type safety, better DX                 |
| Styling   | Tailwind CSS   | Rapid development, consistent design   |
| Database  | SQLite/Prisma  | Simple, portable, no external services |
| Auth      | Session-based  | Secure cookies, bcrypt hashing         |
| State     | React Context  | Simple, sufficient for needs           |
| Theme     | CSS Variables  | Class-based dark/light switching       |

---

## Key Architectural Decisions

### 1. Catalog-Driven Architecture

**Decision:** All games are defined in database, not as individual pages.
**Why:** Enables scaling to hundreds of games without code changes.

### 2. SQLite with Prisma

**Decision:** Use SQLite for data persistence with Prisma ORM.
**Why:** Simple deployment, no external database services needed.

### 3. Session-Based Authentication

**Decision:** Cookie-based sessions instead of JWT.
**Why:** More secure for web apps, easier to invalidate.

### 4. Separate Game Hosting

**Decision:** Games hosted on separate domain/subdomain.
**Why:** Security isolation, independent scaling.

### 5. Docker Support

**Decision:** Multi-stage Docker build with persistent volumes.
**Why:** Easy deployment, consistent environments.

### 6. Class-Based Theme Switching

**Decision:** Use `dark` and `light` classes with CSS variables.
**Why:** Works with Tailwind's dark mode, no flash on load.

---

## Folder Structure

```text
src/
├── app/           # Routes (Next.js App Router)
│   ├── admin/     # Admin panel pages
│   ├── api/       # API routes
│   ├── games/     # Game detail pages
│   ├── library/   # User library
│   ├── login/     # Auth pages
│   ├── play/      # Game player
│   └── register/
├── components/    # Reusable UI components
│   ├── admin/     # Admin-specific components
│   ├── auth/      # Auth components (UserMenu)
│   ├── filter/    # Filter sidebar
│   ├── game/      # Game components
│   ├── layout/    # Layout (Header, Footer)
│   ├── search/    # Search bar
│   └── ui/        # Generic UI (Button, Input, Badge)
├── features/      # Feature modules
│   ├── auth/      # Auth context
│   ├── library/   # Library context
│   └── theme/     # Theme context and toggle
├── lib/           # Utilities
│   ├── auth.ts    # Auth utilities
│   ├── prisma.ts  # Prisma client
│   └── utils.ts   # General utilities
└── types/         # TypeScript definitions
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
4. **Admin Protection:** Middleware-protected routes
5. **CSRF Protection:** Built into session handling

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
npx prisma migrate dev
npx prisma db seed
npm run dev
```

### Running with Docker

```bash
docker-compose up --build
```

---

## Related Documents

- [PRD.md](../docs/PRD.md) - Full product requirements
- [TASKS.md](../docs/TASKS.md) - Implementation tasks
- [DECISIONS.md](./DECISIONS.md) - Architectural decisions log
- [TECH_STACK.md](./TECH_STACK.md) - Technology reference
