# Tech Stack Reference

> Quick reference for technologies used in Game Hub
> Last Updated: 2025-12-22

---

## Core Stack

| Category | Technology | Version | Purpose |
|----------|------------|---------|---------|
| Framework | Next.js | 14+ | App Router, SSR/SSG |
| Language | TypeScript | 5+ | Type safety |
| Styling | Tailwind CSS | 3+ | Utility-first CSS |
| Runtime | Node.js | 18+ | Server runtime |
| Package Manager | npm/pnpm | Latest | Dependencies |

---

## Key Dependencies

### Required
```json
{
  "next": "^14.0.0",
  "react": "^18.0.0",
  "react-dom": "^18.0.0",
  "typescript": "^5.0.0"
}
```

### Dev Dependencies
```json
{
  "tailwindcss": "^3.0.0",
  "postcss": "^8.0.0",
  "autoprefixer": "^10.0.0",
  "@types/react": "^18.0.0",
  "@types/node": "^20.0.0",
  "eslint": "^8.0.0",
  "eslint-config-next": "^14.0.0"
}
```

### Optional (Recommended)
```json
{
  "clsx": "^2.0.0",
  "tailwind-merge": "^2.0.0"
}
```

---

## Folder Aliases

Configure in `tsconfig.json`:

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

Usage:
```typescript
import { GameCard } from '@/components/game/GameCard';
import { getAllGames } from '@/features/catalog';
import type { GameEntry } from '@/types';
```

---

## TypeScript Configuration

Key settings for `tsconfig.json`:

```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  }
}
```

---

## Tailwind Configuration

Key additions for `tailwind.config.ts`:

```typescript
import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      // Custom colors, spacing, etc.
    },
  },
  plugins: [],
}

export default config
```

---

## ESLint Configuration

Extend `.eslintrc.json`:

```json
{
  "extends": ["next/core-web-vitals"],
  "rules": {
    "@typescript-eslint/no-unused-vars": "error",
    "@typescript-eslint/no-explicit-any": "warn"
  }
}
```

---

## Environment Variables

Create `.env.local` (not committed):

```env
# Game hosting URL
NEXT_PUBLIC_GAMES_URL=https://games.yourdomain.com

# Feature flags
NEXT_PUBLIC_ENABLE_SEARCH=true
```

---

## Project Scripts

Add to `package.json`:

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "type-check": "tsc --noEmit"
  }
}
```

---

## Useful Utility Functions

### cn() - Tailwind class merger

```typescript
// src/lib/utils.ts
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

Usage:
```typescript
<div className={cn(
  "base-class",
  isActive && "active-class",
  className
)} />
```

---

## Common Patterns

### Server Component (default in App Router)
```typescript
// src/app/page.tsx
import { getAllGames } from '@/features/catalog';

export default async function HomePage() {
  const games = await getAllGames();
  return <GameGrid games={games} />;
}
```

### Client Component
```typescript
// src/components/game/FavoriteButton.tsx
'use client';

import { useState } from 'react';

export function FavoriteButton({ gameId }: { gameId: string }) {
  const [isFavorite, setIsFavorite] = useState(false);
  // ...
}
```

### Dynamic Route
```typescript
// src/app/games/[slug]/page.tsx
interface Props {
  params: { slug: string };
}

export default async function GamePage({ params }: Props) {
  const game = await getGameBySlug(params.slug);
  // ...
}
```

---

## Deployment Targets

| Platform | Command | Notes |
|----------|---------|-------|
| Vercel | `vercel` | Recommended, zero config |
| Netlify | `netlify deploy` | Good alternative |
| Docker | `docker build` | Self-hosted option |

---

## Browser Support

Target modern browsers:
- Chrome 90+
- Firefox 90+
- Safari 14+
- Edge 90+

No IE11 support needed.

---

## Performance Targets

| Metric | Target |
|--------|--------|
| LCP | < 2.5s |
| FID | < 100ms |
| CLS | < 0.1 |
| Lighthouse | 90+ |
