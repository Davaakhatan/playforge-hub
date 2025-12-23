# Architectural Decision Records (ADR)

> Log of key architectural decisions for Playforge
> Each decision includes context, options considered, and rationale
> Last Updated: 2025-12-23

---

## ADR-001: Catalog-Driven Architecture

**Date:** 2025-12-22
**Status:** Accepted

### Context
We need to support many indie games (dozens to hundreds) without requiring code changes for each new game.

### Options Considered
1. **Page-per-game:** Create a Next.js page for each game
2. **Catalog-driven:** Single catalog data source, dynamic rendering

### Decision
Catalog-driven architecture.

### Rationale
- Adding games = editing data, not code
- No developer needed to add games
- Scales infinitely
- Consistent UI guaranteed
- Easier testing

### Consequences
- Need well-defined schema
- Catalog validation important
- Initial setup more complex

---

## ADR-002: Next.js App Router

**Date:** 2025-12-22
**Status:** Accepted

### Context
Need to choose a React framework for the launcher.

### Options Considered
1. **Create React App:** Simple but no SSR
2. **Next.js Pages Router:** Mature but older patterns
3. **Next.js App Router:** Modern, React Server Components
4. **Remix:** Good DX but smaller ecosystem
5. **Astro:** Great for static but less React-native

### Decision
Next.js 16 with App Router.

### Rationale
- Industry standard
- Built-in routing
- React Server Components for performance
- Great deployment options (Vercel, etc.)
- Large ecosystem

### Consequences
- Learning curve for App Router patterns
- Some complexity with RSC vs Client Components

---

## ADR-003: Static Catalog (v0)

**Date:** 2025-12-22
**Status:** Superseded by ADR-008

### Context
Need a data source for the game catalog.

### Options Considered
1. **Static JSON/TS:** Simple file in codebase
2. **API endpoint:** Internal Next.js API routes
3. **Headless CMS:** Contentful, Sanity, etc.
4. **Database:** PostgreSQL, MongoDB

### Decision
Start with static JSON, design for migration.

### Rationale
- Fastest to implement
- No external dependencies
- Easy to version control
- Clear migration path to API/CMS

### Consequences
- Manual catalog editing
- Rebuild needed for changes (can use ISR later)
- Need stable API shape for future migration

---

## ADR-004: Separate Game Hosting

**Date:** 2025-12-22
**Status:** Accepted

### Context
Where should game builds be hosted?

### Options Considered
1. **Bundled:** Include games in launcher build
2. **Same domain:** Games in /public folder
3. **Separate domain:** Games on subdomain or different domain

### Decision
Games hosted on separate domain/subdomain.

### Rationale
- Security isolation (same-origin policy)
- Independent scaling
- Different caching strategies
- Cleaner architecture
- Games can be updated without launcher redeploy

### Consequences
- More infrastructure to manage
- Need CORS configuration
- Need separate deployment pipeline for games

---

## ADR-005: localStorage for Library

**Date:** 2025-12-22
**Status:** Extended (now supports server sync)

### Context

How to store user's favorites and play history?

### Options Considered

1. **localStorage:** Browser storage, no backend
2. **IndexedDB:** More powerful browser storage
3. **Backend database:** Requires auth, more complex

### Decision

localStorage for anonymous users, database sync for logged-in users.

### Rationale

- No backend needed for anonymous users
- Instant implementation
- Works offline
- Server sync when authenticated

### Consequences

- Cross-device sync available for logged-in users
- Anonymous users still have local-only storage

---

## ADR-006: Tailwind CSS

**Date:** 2025-12-22
**Status:** Accepted

### Context
Need a styling solution.

### Options Considered
1. **CSS Modules:** Scoped CSS, vanilla
2. **Tailwind CSS:** Utility-first
3. **styled-components:** CSS-in-JS
4. **Shadcn/UI:** Component library + Tailwind

### Decision
Tailwind CSS (with potential Shadcn/UI components).

### Rationale
- Rapid development
- Consistent design system
- Small bundle (purges unused)
- Great DX with IDE plugins
- Easy responsive design

### Consequences
- HTML can get verbose
- Learning curve for utility classes
- Need design system discipline

---

## ADR-007: Sandboxed Iframes for Web Games

**Date:** 2025-12-22
**Status:** Accepted

### Context
How to safely embed third-party web games?

### Options Considered
1. **Direct embed:** Include game code directly
2. **Sandboxed iframe:** Isolated context
3. **Web Workers:** Run in background thread

### Decision
Sandboxed iframes with minimal permissions.

### Rationale
- Strong security isolation
- Game can't access launcher state
- Game crashes don't affect launcher
- Standard web security model
- Works with any HTML5 game

### Consequences
- Some limitations on game features
- Need to configure sandbox permissions carefully
- Performance overhead minimal

---

## ADR-008: PostgreSQL with Neon

**Date:** 2025-12-23
**Status:** Accepted (supersedes SQLite decision)

### Context

Need a production-ready database for Vercel deployment.

### Options Considered

1. **SQLite:** File-based, requires persistent volume
2. **PostgreSQL (Neon):** Cloud-hosted, serverless
3. **PlanetScale:** MySQL-compatible, serverless
4. **MongoDB Atlas:** NoSQL, cloud-hosted

### Decision

PostgreSQL with Neon cloud hosting.

### Rationale

- Works seamlessly with Vercel (serverless)
- Free tier available
- Full PostgreSQL compatibility
- Connection pooling built-in
- Easy migration from SQLite (via Prisma)

### Consequences

- External dependency (Neon)
- Need to manage connection string securely
- Slightly more latency than local SQLite

---

## ADR-009: Session-Based Authentication

**Date:** 2025-12-22
**Status:** Extended (now includes OAuth and 2FA)

### Context

Need authentication for user accounts and admin panel.

### Options Considered

1. **JWT tokens:** Stateless, stored client-side
2. **Session cookies:** Server-side sessions
3. **OAuth only:** Third-party providers

### Decision

Session-based authentication with HTTP-only cookies, plus OAuth and 2FA support.

### Rationale

- More secure than JWT for web apps
- Easy to invalidate sessions
- Works well with Next.js middleware
- bcrypt for password hashing
- OAuth for social login convenience
- 2FA for enhanced security

### Consequences

- Requires session storage (database)
- Need to handle session cleanup
- OAuth requires provider setup

---

## ADR-010: Admin Panel Architecture

**Date:** 2025-12-22
**Status:** Accepted

### Context

Need a way to manage games and users without database access.

### Options Considered

1. **Separate admin app:** Independent deployment
2. **Integrated admin routes:** Part of main app
3. **External CMS:** Contentful, Sanity, etc.

### Decision

Integrated admin routes under `/admin/*` path.

### Rationale

- Single deployment
- Shared authentication
- Middleware protection easy

### Consequences

- Need role-based access control

---

## ADR-011: Docker Containerization

**Date:** 2025-12-22
**Status:** Accepted (alternative to Vercel)

### Context

Need consistent deployment across environments.

### Options Considered

1. **Vercel:** Easy but requires cloud database
2. **Docker:** Portable, self-hosted option

### Decision

Support both Vercel (primary) and Docker (self-hosted).

### Rationale

- Vercel for production (seamless Next.js hosting)
- Docker for self-hosted scenarios
- Flexible deployment options

### Consequences

- Need to maintain both deployment methods
- Docker requires external PostgreSQL for production

---

## ADR-012: Class-Based Theme Switching

**Date:** 2025-12-23
**Status:** Accepted

### Context

Need to support dark and light themes with user preference.

### Options Considered

1. **CSS media queries only:** No user control
2. **CSS-in-JS theme:** More complex, potential flash
3. **Class-based with CSS variables:** Works with Tailwind

### Decision

Class-based theme switching with CSS variables and Tailwind's `dark:` prefix.

### Rationale

- Works natively with Tailwind CSS
- CSS variables allow global color changes
- suppressHydrationWarning prevents flash
- localStorage persists preference
- System theme supported via matchMedia

### Consequences

- Every component needs both light and dark styles
- Initial theme set before hydration important
- Logo needs special handling (invert filter)

---

## ADR-013: UI/UX Enhancements

**Date:** 2025-12-23
**Status:** Accepted

### Context

Need to improve user experience with mobile-friendly filters, better image viewing, game sorting, and pagination.

### Decision

Custom components with Tailwind CSS animations.

### Components Built
- Drawer (mobile slide-up panel)
- Lightbox (full-screen image viewer)
- Pagination (URL-based navigation)
- Skeleton (loading states)
- Select (styled dropdown)

### Consequences

- More code to maintain
- Tested across modern browsers
- Keyboard navigation included

---

## ADR-014: SEO and PWA Support

**Date:** 2025-12-23
**Status:** Accepted

### Context

Need to improve discoverability and allow installation as app.

### Decision

Full metadata with Open Graph, Twitter Cards, and PWA manifest.

### Rationale

- Better social sharing previews
- Search engine optimization
- Users can install as home screen app
- Professional appearance

### Consequences

- Need to create OG images
- metadataBase required for absolute URLs
- manifest.json icons needed

---

## ADR-015: OAuth Authentication

**Date:** 2025-12-23
**Status:** Accepted

### Context

Users want convenient social login options.

### Options Considered

1. **Auth0/Clerk:** Managed auth service
2. **NextAuth.js:** Popular auth library
3. **Custom OAuth:** Built from scratch

### Decision

Custom OAuth implementation for Google, GitHub, and Discord.

### Rationale

- Full control over user flow
- No additional dependencies
- Direct integration with existing session system
- Learn OAuth internals

### Consequences

- More code to maintain
- Need to handle OAuth edge cases
- Provider setup required for each service

---

## ADR-016: Two-Factor Authentication

**Date:** 2025-12-23
**Status:** Accepted

### Context

Need enhanced security for user accounts.

### Options Considered

1. **SMS-based:** Phone number required
2. **Email-based:** Easy but less secure
3. **TOTP-based:** Authenticator app

### Decision

TOTP-based 2FA with backup codes.

### Rationale

- Industry standard (Google Authenticator, Authy, etc.)
- No SMS costs
- Backup codes for recovery
- Works offline

### Consequences

- Users need authenticator app
- Need to securely store 2FA secrets
- Backup codes must be shown only once

---

## ADR-017: Social Features (Comments, Reviews, Achievements)

**Date:** 2025-12-23
**Status:** Accepted

### Context

Need community engagement and gamification features.

### Decision

Implement threaded comments, reviews with ratings, achievements, and leaderboards.

### Features
- **Comments:** Threaded with likes and replies
- **Reviews:** 1-5 star ratings with text
- **Achievements:** 14 predefined badges with XP rewards
- **Leaderboards:** XP, level, games played, achievements
- **Notifications:** Real-time notification system

### Rationale

- Increases user engagement
- Gamification encourages return visits
- Community features add value
- Leaderboards create competition

### Consequences

- More database tables and queries
- Need content moderation
- Potential for spam/abuse (mitigated with reports)

---

## ADR-018: Neon PostgreSQL for Production

**Date:** 2025-12-23
**Status:** Accepted

### Context

Need a production database that works with Vercel's serverless environment.

### Options Considered

1. **Supabase:** PostgreSQL with extra features
2. **PlanetScale:** MySQL-compatible
3. **Neon:** Serverless PostgreSQL
4. **Railway:** PostgreSQL hosting

### Decision

Neon PostgreSQL.

### Rationale

- Native PostgreSQL (same as development)
- Serverless scaling
- Free tier generous
- Vercel integration available
- Connection pooling handles serverless cold starts

### Consequences

- External service dependency
- Need to manage connection string
- Free tier has limits (storage, compute)

---

## Template for Future Decisions

```markdown
## ADR-XXX: [Title]

**Date:** YYYY-MM-DD
**Status:** Proposed | Accepted | Deprecated | Superseded

### Context

[What is the issue that we're seeing that is motivating this decision?]

### Options Considered

1. **Option A:** Description
2. **Option B:** Description

### Decision

[What is the decision that was made?]

### Rationale

[Why was this decision made?]

### Consequences

[What are the positive and negative consequences?]
```
