# Tech Stack Reference

> Quick reference for technologies used in Playforge
> Last Updated: 2025-12-23

---

## Core Stack

| Category        | Technology      | Version | Purpose                    |
| --------------- | --------------- | ------- | -------------------------- |
| Framework       | Next.js         | 15+     | App Router, SSR/SSG        |
| Language        | TypeScript      | 5+      | Type safety                |
| Styling         | Tailwind CSS    | 3+      | Utility-first CSS          |
| Database        | SQLite          | 3+      | Data persistence           |
| ORM             | Prisma          | 5+      | Database access            |
| Authentication  | bcryptjs        | 2+      | Password hashing           |
| Runtime         | Node.js         | 18+     | Server runtime             |
| Package Manager | npm             | Latest  | Dependencies               |

---

## Key Dependencies

### Required

```json
{
  "next": "^15.0.0",
  "react": "^19.0.0",
  "react-dom": "^19.0.0",
  "typescript": "^5.0.0",
  "@prisma/client": "^5.0.0",
  "bcryptjs": "^2.4.0"
}
```

### Dev Dependencies

```json
{
  "prisma": "^5.0.0",
  "@types/bcryptjs": "^2.4.0",
  "tailwindcss": "^3.0.0",
  "postcss": "^8.0.0",
  "autoprefixer": "^10.0.0",
  "@types/react": "^19.0.0",
  "@types/node": "^20.0.0",
  "eslint": "^9.0.0",
  "eslint-config-next": "^15.0.0"
}
```

### Utility Libraries

```json
{
  "clsx": "^2.0.0",
  "tailwind-merge": "^2.0.0"
}
```

---

## Database Schema

```prisma
model User {
  id           String   @id @default(cuid())
  username     String   @unique
  email        String   @unique
  passwordHash String
  role         String   @default("USER")  // USER or ADMIN
  createdAt    DateTime @default(now())
  sessions     Session[]
  favorites    Favorite[]
  playHistory  PlayHistory[]
}

model Session {
  id        String   @id @default(cuid())
  userId    String
  expiresAt DateTime
  user      User     @relation(fields: [userId], references: [id])
}

model Game {
  id               String   @id @default(cuid())
  slug             String   @unique
  title            String
  shortDescription String
  longDescription  String
  thumbnail        String
  screenshots      String   // JSON array
  tags             String   // JSON array
  size             String   // mini, medium, big
  type             String   // web-embed, external, download
  releaseStatus    String   // prototype, early-access, released
  url              String
  platforms        String   // JSON array
  developer        String?
  releaseDate      DateTime?
  version          String?
  featured         Boolean  @default(false)
  hidden           Boolean  @default(false)
  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt
}
```

---

## Folder Structure

```text
src/
├── app/                    # Next.js App Router
│   ├── admin/              # Admin panel
│   ├── api/                # API routes
│   │   ├── auth/           # Auth endpoints
│   │   ├── games/          # Game CRUD
│   │   └── library/        # Library sync
│   ├── games/[slug]/       # Game detail
│   ├── library/            # User library
│   ├── login/              # Login page
│   ├── play/[slug]/        # Game player
│   └── register/           # Register page
├── components/
│   ├── admin/              # Admin components
│   ├── auth/               # Auth components
│   ├── filter/             # Filter sidebar
│   ├── game/               # Game components
│   ├── layout/             # Layout components
│   ├── search/             # Search bar
│   └── ui/                 # Generic UI
├── features/
│   ├── auth/               # Auth context
│   ├── library/            # Library context
│   └── theme/              # Theme context and toggle
├── lib/
│   ├── auth.ts             # Auth utilities
│   ├── prisma.ts           # Prisma client
│   └── utils.ts            # Helpers
└── types/                  # TypeScript types
```

---

## Environment Variables

Create `.env` file:

```env
# Database
DATABASE_URL="file:./dev.db"

# Session
SESSION_SECRET="your-secret-key-change-in-production"
```

---

## Project Scripts

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "postinstall": "prisma generate",
    "db:migrate": "prisma migrate dev",
    "db:seed": "prisma db seed",
    "db:studio": "prisma studio"
  }
}
```

---

## Docker Configuration

### Dockerfile

- Multi-stage build for smaller image
- Standalone output mode
- Non-root user for security

### docker-compose.yml

- Persistent volume for SQLite database
- Health check configured
- Environment variables support

---

## API Routes

| Route                          | Method | Description           |
| ------------------------------ | ------ | --------------------- |
| `/api/auth/register`           | POST   | Create new user       |
| `/api/auth/login`              | POST   | Login user            |
| `/api/auth/logout`             | POST   | Logout user           |
| `/api/auth/me`                 | GET    | Get current user      |
| `/api/games`                   | GET    | List games            |
| `/api/games`                   | POST   | Create game (admin)   |
| `/api/games/[id]`              | GET    | Get game              |
| `/api/games/[id]`              | PUT    | Update game (admin)   |
| `/api/games/[id]`              | DELETE | Delete game (admin)   |
| `/api/library/favorites`       | GET    | Get favorites         |
| `/api/library/favorites`       | POST   | Add favorite          |
| `/api/library/favorites/[id]`  | DELETE | Remove favorite       |
| `/api/library/history`         | GET    | Get play history      |
| `/api/library/history`         | POST   | Record play           |

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

### Tailwind Configuration

```js
// tailwind.config.ts
module.exports = {
  darkMode: 'class',
  // ...
}
```

### Component Pattern

```tsx
// Light mode first, dark: prefix for dark mode
<div className="bg-white text-zinc-900 dark:bg-zinc-900 dark:text-white">
```

---

## Deployment Options

| Platform | Command                      | Notes                     |
| -------- | ---------------------------- | ------------------------- |
| Docker   | `docker-compose up -d`       | Recommended for self-host |
| Vercel   | `vercel`                     | Need external database    |
| Node.js  | `npm run build && npm start` | Direct deployment         |

---

## Browser Support

- Chrome 90+
- Firefox 90+
- Safari 14+
- Edge 90+

---

## Color Scheme

### Dark Mode (Default)
- Background: Zinc (#09090b)
- Card: Zinc (#18181b)
- Border: Zinc (#27272a)
- Text: White/Zinc shades

### Light Mode
- Background: White (#ffffff)
- Card: Zinc (#f4f4f5)
- Border: Zinc (#e4e4e7)
- Text: Black/Zinc shades

### Accent
Primary gradient: `from-blue-500 to-cyan-500`

- Primary: Blue (#3B82F6)
- Secondary: Cyan (#06B6D4)
