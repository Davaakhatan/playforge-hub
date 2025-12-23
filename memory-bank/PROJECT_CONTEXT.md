# Game Hub - Project Context

> This file provides essential context for AI assistants and new contributors.
> Last Updated: 2025-12-22

---

## What is This Project?

**Game Hub** is a centralized launcher and discovery hub for indie games. Think of it as a lightweight "mini-Steam" for web-based and indie game builds.

### Core Philosophy

> *"The launcher is not the game. The launcher is a catalog, navigator, and launcher — nothing else."*

This means:
- The launcher never bundles games into its codebase
- Games are hosted separately and loaded dynamically
- Adding a new game = editing the catalog, not writing code
- The UI is a thin layer over the catalog data

---

## Key Architectural Decisions

### 1. Catalog-Driven Architecture
**Decision:** All games are defined in a catalog, not as individual pages.
**Why:** Enables scaling to hundreds of games without code changes.
**Trade-off:** Slightly more complex initial setup, but massive long-term maintainability gains.

### 2. Next.js App Router
**Decision:** Use Next.js 14+ with App Router.
**Why:** Modern React patterns, good DX, built-in routing, easy deployment.
**Trade-off:** Slightly larger bundle than pure React, but worth it for features.

### 3. Static Catalog First (v0)
**Decision:** Start with JSON/TS catalog, migrate to API/CMS later.
**Why:** Fastest path to working MVP; migration path is clear.
**Trade-off:** Manual catalog editing for now.

### 4. Separate Game Hosting
**Decision:** Games hosted on separate domain/subdomain.
**Why:** Security isolation, independent scaling, cleaner architecture.
**Trade-off:** More infrastructure to manage.

### 5. Local-First Library
**Decision:** Use localStorage for favorites/history, no accounts.
**Why:** Simpler MVP, no auth complexity, instant functionality.
**Trade-off:** No cross-device sync (acceptable for MVP).

---

## Tech Stack

| Layer | Choice | Rationale |
|-------|--------|-----------|
| Framework | Next.js 14+ | App Router, React Server Components |
| Language | TypeScript | Type safety, better DX |
| Styling | Tailwind CSS | Rapid development, consistent design |
| State | React Context | Simple, sufficient for MVP |
| Storage | localStorage | No backend needed for library |
| Catalog | Static JSON | v0 simplicity, clear migration path |

---

## Folder Structure Rationale

```
src/
├── app/           # Routes (Next.js convention)
├── components/    # Reusable UI components
│   ├── ui/        # Generic (Button, Card, Badge)
│   ├── game/      # Game-specific (GameCard, GamePlayer)
│   └── layout/    # Layout (Header, Footer)
├── features/      # Feature modules with logic
│   ├── catalog/   # Catalog data access
│   ├── library/   # Local library logic
│   └── search/    # Search & filter logic
├── lib/           # Utilities
└── types/         # TypeScript definitions
```

**Why this structure?**
- Colocation of related code
- Clear separation of concerns
- Easy to find things
- Scales well as project grows

---

## Game Types Explained

### Web-Embed
- HTML5 games loaded in sandboxed iframe
- Hosted on separate subdomain
- Example: Simple browser games, Phaser/PixiJS games

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
2. **CSP Headers:** Strict Content-Security-Policy on launcher
3. **Domain Isolation:** Games on separate origin from launcher
4. **Error Boundaries:** Broken games can't crash launcher

---

## What NOT to Do

- Don't bundle games into the launcher codebase
- Don't create individual page files for each game
- Don't add user accounts in MVP
- Don't over-engineer; keep it simple
- Don't forget mobile users

---

## Success Metrics (MVP)

1. Can add games by editing catalog only
2. Store loads fast with 50+ games
3. Web games load in safe iframes
4. No refactor needed to scale

---

## Quick Reference: Adding a New Game

1. Open `catalog/games.json`
2. Add new entry following schema
3. Host game assets separately
4. Done - no code changes needed

---

## Related Documents

- [PRD.md](../docs/PRD.md) - Full product requirements
- [TASKS.md](../docs/TASKS.md) - Implementation tasks
- [DECISIONS.md](./DECISIONS.md) - Architectural decisions log
- [PROGRESS.md](./PROGRESS.md) - Development progress
