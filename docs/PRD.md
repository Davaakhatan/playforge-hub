# Playforge MVP - Product Requirements Document

> Version: 2.0.0
> Status: Implemented
> Last Updated: 2025-12-22

---

## 1. Product Overview

**Product Name:** Playforge

**Purpose:**
A centralized launcher and discovery hub for indie games, similar to a lightweight "mini-Steam" for web and indie builds.

**Core Principle:**
> *"The launcher is not the game. The launcher is a catalog, navigator, and launcher — nothing else."*

The hub is **catalog-driven, not page-driven**. Every game—web, download, or external—is defined in a catalog and rendered dynamically by the launcher UI.

---

## 2. Goals & Non-Goals

### Goals (MVP)
- Support many indie games (dozens → hundreds)
- Handle small HTML5 games and large external/download games equally
- Keep the launcher fast, minimal, and scalable
- No rewrite required as the catalog grows
- Add new games by editing catalog only (zero code changes)

### Non-Goals (MVP)
- No multiplayer/social features
- No payments, DRM, or licensing
- ~~No user accounts or cloud sync~~ ✅ **Implemented in v2**
- No in-launcher native game execution
- No developer submission portal
- No analytics or tracking

---

## 3. Target Users

### Primary Users
- Players who want quick access to many indie games
- Casual players (short sessions) and hardcore players (bigger games)

### Secondary Users (Post-MVP)
- Indie developers publishing games to the hub

---

## 4. Core UX Flows

### 4.1 Store / Discovery
1. User opens the hub
2. Sees a grid of games (thumbnail + title + short description)
3. Can filter by:
   - Size (mini / medium / big)
   - Type (web / download / external)
   - Tags (genre, mood)
4. Can search by name or tag

### 4.2 Game Detail Page
1. User clicks a game
2. Sees:
   - Title, description, screenshots
   - Tags, size, type
   - Release status (prototype / early access / released)
3. Clear primary action button:
   - **Play** (web embed)
   - **Open External** (new tab)
   - **Download** (direct link)

### 4.3 Play / Launch
| Type | Behavior |
|------|----------|
| Web-Embed | Opens embedded in sandboxed iframe |
| External | Opens in new browser tab |
| Download | Direct download link to hosted build |

### 4.4 My Library
- Favorite games
- Recently played games
- Stored locally (localStorage)
- No login required

---

## 5. Functional Requirements

### 5.1 Catalog System (Critical)

All games defined in a single catalog source. No hardcoded pages per game.

#### Game Entry Schema

```typescript
interface GameEntry {
  // Identity
  id: string;                    // Unique identifier (UUID or slug)
  slug: string;                  // URL-safe identifier
  title: string;                 // Display name

  // Content
  shortDescription: string;      // Max 120 chars, for cards
  longDescription: string;       // Full description, supports markdown
  thumbnail: string;             // Card image URL (16:9 recommended)
  screenshots?: string[];        // Gallery images

  // Classification
  tags: string[];                // e.g., ["puzzle", "casual", "relaxing"]
  size: 'mini' | 'medium' | 'big';
  type: 'web-embed' | 'external' | 'download';
  releaseStatus: 'prototype' | 'early-access' | 'released';

  // Launch
  url: string;                   // Game URL, download link, or embed path
  platforms?: ('web' | 'windows' | 'mac' | 'linux')[];

  // Metadata
  developer?: string;
  releaseDate?: string;          // ISO date
  version?: string;

  // Feature Flags
  featured?: boolean;            // Show in featured section
  hidden?: boolean;              // Hide from public catalog
}
```

### 5.2 Game Types

| Type | Description | Implementation |
|------|-------------|----------------|
| Web-Embed | HTML5 games | Sandboxed iframe, separate domain |
| External | Steam, itch.io links | New tab navigation |
| Download | Installer/ZIP files | Direct download link |

### 5.3 Library (Local Storage)

```typescript
interface LocalLibrary {
  favorites: string[];           // Array of game IDs
  recentlyPlayed: {
    gameId: string;
    lastPlayed: string;          // ISO timestamp
  }[];
}
```

### 5.4 Search & Filter

- **Text search:** Title, tags, description
- **Filters:** Size, type, release status, tags
- **Sort:** Alphabetical, recently added, featured first

---

## 6. Technical Architecture

### 6.1 Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 14+ (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| State | React Context + localStorage |
| Catalog | Static JSON/TS (v0) → API (v1) → CMS (v2) |

### 6.2 Folder Structure

```
game-hub/
├── docs/                    # Documentation & PRD
├── memory-bank/             # Project context & decisions
├── src/
│   ├── app/                 # Next.js App Router pages
│   │   ├── page.tsx         # Store/home
│   │   ├── games/
│   │   │   └── [slug]/
│   │   │       └── page.tsx # Game detail
│   │   ├── play/
│   │   │   └── [slug]/
│   │   │       └── page.tsx # Game player (iframe)
│   │   └── library/
│   │       └── page.tsx     # User library
│   ├── components/
│   │   ├── ui/              # Generic UI components
│   │   ├── game/            # Game-specific components
│   │   └── layout/          # Layout components
│   ├── features/
│   │   ├── catalog/         # Catalog data & hooks
│   │   ├── library/         # Local library logic
│   │   └── search/          # Search & filter logic
│   ├── lib/                 # Utilities & helpers
│   └── types/               # TypeScript types
├── public/
│   └── images/              # Static assets
├── catalog/
│   └── games.json           # Game catalog (v0)
└── package.json
```

### 6.3 Catalog Access Pattern

```typescript
// Stable API shape (stays same across versions)
interface CatalogAPI {
  getAllGames(): Promise<GameEntry[]>;
  getGameBySlug(slug: string): Promise<GameEntry | null>;
  searchGames(query: string): Promise<GameEntry[]>;
  filterGames(filters: FilterOptions): Promise<GameEntry[]>;
  getFeaturedGames(): Promise<GameEntry[]>;
}
```

**Migration Path:**
- **v0:** Static JSON import
- **v1:** Internal API routes (`/api/catalog`)
- **v2:** External CMS/database

### 6.4 Game Hosting (Separate from Launcher)

| Concern | Approach |
|---------|----------|
| Web games | Hosted on separate subdomain (e.g., `games.yourdomain.com`) |
| Large builds | External hosting (itch.io, S3, etc.) |
| CDN | Recommended for assets |

### 6.5 Security & Isolation

| Measure | Implementation |
|---------|----------------|
| Iframe sandbox | `sandbox="allow-scripts allow-same-origin"` |
| CSP | Strict Content-Security-Policy headers |
| Domain isolation | Games on separate origin |
| Error boundaries | Broken games don't crash launcher |

---

## 7. Non-Functional Requirements

### Performance
- Store page loads metadata only (no game canvases)
- Images lazy-loaded
- Target: < 2s initial load, < 100ms filter response
- Support 100+ games without degradation

### Scalability
- Catalog changes require zero UI code changes
- Horizontal scaling via static generation

### Maintainability
- Feature-based folder structure
- Clear separation: UI / Catalog / Runtime
- TypeScript strict mode

### Reliability
- Broken game builds don't crash launcher
- Graceful error states for missing games
- Offline-capable library (localStorage)

### Accessibility
- Keyboard navigation
- Screen reader support
- Color contrast compliance

### Responsiveness
- Mobile-first design
- Breakpoints: mobile (< 768px), tablet (768-1024px), desktop (> 1024px)

---

## 8. Error States & Edge Cases

| Scenario | Handling |
|----------|----------|
| Game not found | 404 page with return to store |
| Iframe load failure | Error message + retry button |
| Catalog fetch failure | Cached fallback + retry |
| Empty search results | Helpful message + suggestions |
| Invalid game URL | Error state in player |

---

## 9. MVP Milestones

### Phase 1: Foundation ✅ COMPLETE

- [x] Project setup (Next.js 15, TypeScript, Tailwind)
- [x] Folder structure
- [x] Type definitions
- [x] SQLite database with Prisma ORM (upgraded from static catalog)

### Phase 2: Core UI ✅ COMPLETE

- [x] Store page (game grid with search/filters)
- [x] Game detail page
- [x] Game player (iframe embed)
- [x] Basic navigation (Header, Footer)

### Phase 3: Features ✅ COMPLETE

- [x] Search functionality (debounced, URL-based)
- [x] Filter system (size, type, status, tags)
- [x] Local library (favorites, recent)
- [x] User authentication (session-based)
- [x] Admin panel (games CRUD, user management)

### Phase 4: Polish ✅ COMPLETE

- [x] Error handling
- [x] Loading states
- [x] Responsive design
- [x] Docker containerization

---

## 10. Success Criteria

The MVP is successful if:

| Criteria | Metric |
|----------|--------|
| Catalog-driven | New games added via catalog only (0 code changes) |
| Performance | Store loads < 2s with 50+ games |
| Safety | Web games load in isolated iframes |
| Stability | Broken games don't crash launcher |
| Scalability | No refactor needed to grow catalog |

---

## 11. Future Expansion (Post-MVP)

- User accounts + cloud library sync
- Developer submission portal
- Search indexing (Meilisearch / Algolia)
- Playtime analytics
- Collections & curated lists
- Ratings & reviews
- Native launcher (Electron/Tauri)
- Achievement system
- Social features

---

## 12. Open Questions

- [ ] Domain strategy for game hosting?
- [ ] CDN provider selection?
- [ ] Catalog data source for v1?

---

## Appendix: Sample Catalog Entry

```json
{
  "id": "flappy-bird-clone",
  "slug": "flappy-bird",
  "title": "Flappy Bird Clone",
  "shortDescription": "A simple clone of the classic Flappy Bird game.",
  "longDescription": "Navigate through pipes by tapping to flap your wings...",
  "thumbnail": "/images/games/flappy-bird/thumb.png",
  "screenshots": [
    "/images/games/flappy-bird/screen1.png",
    "/images/games/flappy-bird/screen2.png"
  ],
  "tags": ["arcade", "casual", "quick-play"],
  "size": "mini",
  "type": "web-embed",
  "releaseStatus": "released",
  "url": "https://games.yourdomain.com/flappy-bird/",
  "platforms": ["web"],
  "developer": "Indie Dev",
  "releaseDate": "2025-01-15",
  "version": "1.0.0",
  "featured": true
}
```
