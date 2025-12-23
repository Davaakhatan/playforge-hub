# Tech Stack Reference

> Quick reference for technologies used in Playforge
> Last Updated: 2025-12-23

---

## Core Stack

| Category        | Technology      | Version | Purpose                    |
| --------------- | --------------- | ------- | -------------------------- |
| Framework       | Next.js         | 16+     | App Router, SSR/SSG        |
| Language        | TypeScript      | 5+      | Type safety                |
| Styling         | Tailwind CSS    | 3+      | Utility-first CSS          |
| Database        | PostgreSQL      | 15+     | Cloud database (Neon)      |
| ORM             | Prisma          | 5+      | Database access            |
| Authentication  | bcryptjs        | 2+      | Password hashing           |
| 2FA             | otpauth         | 9+      | TOTP generation            |
| Runtime         | Node.js         | 18+     | Server runtime             |
| Package Manager | npm             | Latest  | Dependencies               |
| Deployment      | Vercel          | Latest  | Hosting platform           |

---

## Key Dependencies

### Required

```json
{
  "next": "^16.0.0",
  "react": "^19.0.0",
  "react-dom": "^19.0.0",
  "typescript": "^5.0.0",
  "@prisma/client": "^6.0.0",
  "bcryptjs": "^2.4.0",
  "otpauth": "^9.0.0"
}
```

### Dev Dependencies

```json
{
  "prisma": "^6.0.0",
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

## Database Schema (PostgreSQL)

```prisma
model User {
  id              String    @id @default(cuid())
  username        String    @unique
  email           String    @unique
  passwordHash    String?
  avatar          String?
  role            String    @default("USER")
  emailVerified   Boolean   @default(false)
  twoFactorEnabled Boolean  @default(false)
  twoFactorSecret String?
  backupCodes     String?
  xp              Int       @default(0)
  level           Int       @default(1)
  createdAt       DateTime  @default(now())

  // Relations
  sessions        Session[]
  oauthAccounts   OAuthAccount[]
  favorites       Favorite[]
  playHistory     PlayHistory[]
  comments        Comment[]
  reviews         Review[]
  achievements    UserAchievement[]
  notifications   Notification[]
}

model OAuthAccount {
  id           String   @id @default(cuid())
  userId       String
  provider     String   // google, github, discord
  providerId   String
  accessToken  String?
  refreshToken String?
  expiresAt    DateTime?
}

model Game {
  id               String   @id @default(cuid())
  slug             String   @unique
  title            String
  shortDescription String
  longDescription  String   @db.Text
  thumbnail        String
  screenshots      String   @db.Text
  tags             String
  size             String
  type             String
  releaseStatus    String
  url              String
  platforms        String
  developer        String?
  releaseDate      DateTime?
  version          String?
  featured         Boolean  @default(false)
  hidden           Boolean  @default(false)
  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt
}

model Comment {
  id        String   @id @default(cuid())
  content   String   @db.Text
  userId    String
  gameId    String
  parentId  String?
  likes     Int      @default(0)
  createdAt DateTime @default(now())
}

model Achievement {
  id          String  @id @default(cuid())
  code        String  @unique
  name        String
  description String
  icon        String
  xpReward    Int     @default(0)
  rarity      String  @default("common")
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
│   │   │   ├── login/      # Email/password login
│   │   │   ├── register/   # Registration
│   │   │   ├── oauth/      # OAuth providers
│   │   │   │   ├── google/
│   │   │   │   ├── github/
│   │   │   │   └── discord/
│   │   │   ├── 2fa/        # Two-factor auth
│   │   │   └── verify-email/
│   │   ├── games/          # Game CRUD + comments
│   │   ├── library/        # Library sync
│   │   ├── achievements/   # Achievement system
│   │   ├── leaderboard/    # Leaderboards
│   │   ├── notifications/  # Notifications
│   │   └── reports/        # Moderation
│   ├── games/[slug]/       # Game detail
│   ├── library/            # User library
│   ├── login/              # Login page
│   ├── play/[slug]/        # Game player
│   ├── settings/           # User settings
│   └── register/           # Register page
├── components/
│   ├── achievements/       # Achievement badges
│   ├── admin/              # Admin components
│   ├── auth/               # Auth components
│   ├── comments/           # Comment system
│   ├── filter/             # Filter sidebar
│   ├── game/               # Game components
│   ├── layout/             # Layout components
│   ├── notifications/      # Notification dropdown
│   ├── search/             # Search bar
│   └── ui/                 # Generic UI
├── features/
│   ├── auth/               # Auth context
│   ├── library/            # Library context
│   └── theme/              # Theme context
├── lib/
│   ├── auth.ts             # Session utilities
│   ├── oauth.ts            # OAuth utilities
│   ├── totp.ts             # 2FA utilities
│   ├── achievements.ts     # Achievement logic
│   ├── prisma.ts           # Prisma client
│   └── utils.ts            # Helpers
└── types/                  # TypeScript types
```

---

## Environment Variables

Create `.env` file:

```env
# Database (Neon PostgreSQL)
DATABASE_URL="postgresql://user:pass@host/db?sslmode=require"

# Session
SESSION_SECRET="your-secret-key-change-in-production"

# App URL (for OAuth callbacks)
NEXT_PUBLIC_APP_URL="https://your-domain.com"

# OAuth Providers (optional)
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
GITHUB_CLIENT_ID=""
GITHUB_CLIENT_SECRET=""
DISCORD_CLIENT_ID=""
DISCORD_CLIENT_SECRET=""
```

---

## Project Scripts

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "prisma generate && next build",
    "start": "next start",
    "lint": "next lint",
    "postinstall": "prisma generate",
    "db:push": "prisma db push",
    "db:seed": "prisma db seed",
    "db:studio": "prisma studio"
  }
}
```

---

## API Routes

### Authentication
| Route                          | Method | Description           |
| ------------------------------ | ------ | --------------------- |
| `/api/auth/register`           | POST   | Create new user       |
| `/api/auth/login`              | POST   | Login user            |
| `/api/auth/logout`             | POST   | Logout user           |
| `/api/auth/me`                 | GET    | Get current user      |
| `/api/auth/oauth/[provider]`   | GET    | OAuth initiate        |
| `/api/auth/oauth/[provider]/callback` | GET | OAuth callback  |
| `/api/auth/2fa/enable`         | POST   | Enable 2FA            |
| `/api/auth/2fa/verify`         | POST   | Verify 2FA code       |
| `/api/auth/2fa/disable`        | POST   | Disable 2FA           |
| `/api/auth/verify-email`       | POST   | Verify email          |

### Games
| Route                          | Method | Description           |
| ------------------------------ | ------ | --------------------- |
| `/api/games`                   | GET    | List games            |
| `/api/games`                   | POST   | Create game (admin)   |
| `/api/games/[id]`              | GET    | Get game              |
| `/api/games/[id]`              | PUT    | Update game (admin)   |
| `/api/games/[id]`              | DELETE | Delete game (admin)   |
| `/api/games/[id]/comments`     | GET    | Get comments          |
| `/api/games/[id]/comments`     | POST   | Add comment           |

### Library
| Route                          | Method | Description           |
| ------------------------------ | ------ | --------------------- |
| `/api/library/favorites`       | GET    | Get favorites         |
| `/api/library/favorites`       | POST   | Add favorite          |
| `/api/library/favorites/[id]`  | DELETE | Remove favorite       |
| `/api/library/history`         | GET    | Get play history      |
| `/api/library/history`         | POST   | Record play           |

### Social
| Route                          | Method | Description           |
| ------------------------------ | ------ | --------------------- |
| `/api/leaderboard`             | GET    | Get leaderboards      |
| `/api/achievements`            | GET    | Get user achievements |
| `/api/notifications`           | GET    | Get notifications     |
| `/api/notifications/[id]/read` | POST   | Mark as read          |
| `/api/reports`                 | GET    | Get reports (admin)   |
| `/api/reports`                 | POST   | Create report         |
| `/api/reports/[id]`            | PATCH  | Update report (admin) |

---

## OAuth Setup

### Google
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create OAuth 2.0 credentials
3. Add authorized redirect URI: `{APP_URL}/api/auth/oauth/google/callback`
4. Copy Client ID and Secret to `.env`

### GitHub
1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Create new OAuth App
3. Set callback URL: `{APP_URL}/api/auth/oauth/github/callback`
4. Copy Client ID and Secret to `.env`

### Discord
1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Create new application
3. Add OAuth2 redirect: `{APP_URL}/api/auth/oauth/discord/callback`
4. Copy Client ID and Secret to `.env`

---

## Deployment (Vercel)

1. Push to GitHub
2. Import to Vercel
3. Add environment variables:
   - `DATABASE_URL` (from Neon)
   - `SESSION_SECRET`
   - `NEXT_PUBLIC_APP_URL`
   - OAuth credentials (optional)
4. Deploy

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
