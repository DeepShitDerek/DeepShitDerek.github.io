# Personal Portfolio & Headless CMS ("Personal OS")

![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js)
![Supabase](https://img.shields.io/badge/Supabase-Backend-green?style=flat-square&logo=supabase)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)
![Redux Toolkit](https://img.shields.io/badge/Redux-State-purple?style=flat-square&logo=redux)
![License](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)

A high-performance portfolio website with an integrated **"Personal OS" Admin Panel**. This project supports two deployment modes:

1. **Static Portfolio** - Zero-config, works immediately with fallback data
2. **Headless CMS Portfolio** - Full-stack dashboard connected to Supabase

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Quick Start](#quick-start)
- [Option A: Static Portfolio](#option-a-static-portfolio-zero-config)
- [Option B: Headless CMS Portfolio](#option-b-headless-cms-portfolio-full-features)
- [First-Time Admin Setup](#first-time-admin-setup)
- [Customization Guide](#customization-guide)
- [Deployment](#deployment)
- [Project Structure](#project-structure)
- [Troubleshooting](#troubleshooting)
- [License](#license)

---

## Features

### Public Portfolio
- **Universal Template** - Works immediately without any configuration
- **Kinetic Design** - Bold aesthetic with smooth Framer Motion animations
- **Dynamic Content Engine** - Pages rendered based on CMS data
- **Markdown Blog** - Syntax highlighting, Table of Contents, read-time estimation
- **50+ Theme Presets** - Curated themes optimized for contrast and accessibility

### Admin Panel (Personal OS)
- **Secure Auth** - Supabase Auth with mandatory MFA/TOTP
- **Task Manager** - Kanban board and tree view with subtasks
- **Finance Tracker** - Income/expense tracking, recurring subscriptions, forecasting
- **Habit Tracker** - GitHub-style contribution heatmaps
- **Inventory** - Asset tracking with depreciation
- **Learning Hub** - Curriculum builder with Pomodoro focus timer
- **CMS** - Drag-and-drop page builder with Markdown editor

---

## Tech Stack

| Category | Technology |
|----------|------------|
| Frontend | Next.js 14 (Pages Router), React 18 |
| Language | TypeScript (strict mode) |
| Styling | Tailwind CSS, Shadcn UI, Framer Motion |
| Backend | Supabase (PostgreSQL, Auth, Storage) |
| State | Redux Toolkit with RTK Query |
| Validation | Zod schemas |
| Charts | Recharts, FullCalendar |

---

## Quick Start

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/YOUR_REPO.git
cd YOUR_REPO

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:8889`

---

## Option A: Static Portfolio (Zero-Config)

Best for: Simple hosting, no database needed, quick deployment.

### Step 1: Run Without Configuration

Simply start the development server:

```bash
npm run dev
```

The app automatically detects missing Supabase credentials and uses fallback data from `src/lib/fallback-data.ts`.

### Step 2: Customize Your Content

Edit the fallback data file to personalize your portfolio:

```typescript
// src/lib/fallback-data.ts
export const fallbackSiteIdentity = {
  profile_data: {
    name: "Your Name",
    title: "Your Title",
    description: "Your hero description...",
    bio: ["Your bio paragraph 1", "Your bio paragraph 2"],
    logo: { main: "YOUR", highlight: "NAME" },
    // ... more options
  },
  social_links: [
    { id: "github", label: "GitHub", url: "https://github.com/yourusername", is_visible: true },
    { id: "linkedin", label: "LinkedIn", url: "https://linkedin.com/in/yourusername", is_visible: true },
  ],
  footer_data: {
    copyright_text: "Your Name"
  }
};
```

### Step 3: Build and Deploy

```bash
npm run build
```

The `out/` folder contains your static site ready for deployment to:
- GitHub Pages
- Vercel
- Netlify
- Any static hosting

---

## Option B: Headless CMS Portfolio (Full Features)

Best for: Dynamic content management, admin dashboard, productivity tools.

### Prerequisites

- Node.js 18+
- npm or yarn
- Free [Supabase](https://supabase.com) account

### Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Wait for the project to initialize (takes ~2 minutes)
3. Go to **Project Settings > API**
4. Copy the following values:
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **anon / public** API Key

### Step 2: Configure Environment Variables

Create a `.env.local` file in your project root:

```env
# Required for Admin Mode
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
NEXT_PUBLIC_BUCKET_NAME=assets
NEXT_PUBLIC_SITE_URL=http://localhost:8889
```

### Step 3: Set Up Database Schema

1. Open `db/schema.sql` in this repository
2. Copy the entire contents
3. In Supabase Dashboard, go to **SQL Editor**
4. Paste the SQL and click **Run**

This creates:
- 21+ tables with proper relationships
- Row Level Security (RLS) policies
- Triggers for automatic timestamps
- Helper functions for analytics

### Step 4: Set Up Storage Bucket

1. In Supabase Dashboard, go to **Storage**
2. Click **New bucket**
3. Name it `assets` (or match your `NEXT_PUBLIC_BUCKET_NAME`)
4. Toggle **Public bucket** to **ON**
5. Click **Create bucket**

### Step 5: Start Development Server

```bash
npm run dev
```

Navigate to `http://localhost:8889` - you should see the portfolio.

---

## First-Time Admin Setup

The admin panel requires account creation and MFA setup.

### Step 1: Create Admin Account

1. Navigate to `http://localhost:8889/admin/signup`
   > Note: This page only works when no admin user exists in the database
2. Enter your email and password
3. Check your email for the confirmation link
4. Click the link to verify your account

### Step 2: Login and Setup MFA

1. Go to `http://localhost:8889/admin/login`
2. Enter your credentials
3. You'll be prompted to set up Two-Factor Authentication (required)
4. Scan the QR code with an authenticator app (Google Authenticator, Authy, etc.)
5. Enter the 6-digit code to complete setup

### Step 3: Access Admin Dashboard

After MFA setup, you'll have access to:

| Route | Feature |
|-------|---------|
| `/admin` | Dashboard overview |
| `/admin/blog` | Blog post management |
| `/admin/content` | Portfolio content CMS |
| `/admin/tasks` | Task manager (Kanban/Tree) |
| `/admin/finance` | Finance tracker |
| `/admin/habits` | Habit tracking |
| `/admin/learning` | Learning curriculum |
| `/admin/calendar` | Calendar view |
| `/admin/notes` | Quick notes |
| `/admin/settings` | Site settings & themes |

---

## Customization Guide

### Changing Themes

The project includes 20 curated themes. To change the default theme:

1. Go to `/admin/settings` in the admin panel
2. Select a theme from the dropdown
3. Or edit `src/lib/fallback-data.ts`:

```typescript
profile_data: {
  default_theme: "theme-nord", // Options: theme-dracula, theme-tokyo-night, etc.
}
```

Available themes:
- Dark: `theme-dracula`, `theme-nord`, `theme-tokyo-night`, `theme-catppuccin-mocha`, `theme-github-dark`, `theme-onedark-pro`, `theme-rose-pine`, `theme-monokai`, `theme-ayu-dark`
- Light: `theme-solarized-light`, `theme-catppuccin-latte`, `theme-github-light`, `theme-arctic`, `theme-paper`
- Special: `theme-cyberpunk`, `theme-ocean`, `theme-matrix`
- High Contrast: `theme-hc-dark`, `theme-hc-light`

### Customizing Colors

Each theme uses CSS variables. To create a custom theme, add to `src/styles/globals.css`:

```css
.theme-custom {
  --background: 222.2 84% 4.9%;
  --foreground: 210 40% 98%;
  --primary: 210 40% 50%;
  /* ... other variables */
}
```

### Adding New Pages

1. Create a new page in `src/pages/`:

```typescript
// src/pages/services.tsx
import { PublicLayout } from "@/components/layout";

export default function ServicesPage() {
  return (
    <PublicLayout>
      <h1>Services</h1>
    </PublicLayout>
  );
}
```

2. Add navigation link in admin panel or fallback data.

---

## Deployment

### GitHub Pages (Recommended)

#### Step 1: Configure GitHub Secrets

Go to your GitHub repo **Settings > Secrets and variables > Actions** and add:

| Secret Name | Value |
|-------------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase Anon Key |
| `NEXT_PUBLIC_BUCKET_NAME` | `assets` |
| `NEXT_PUBLIC_SITE_URL` | `https://yourusername.github.io` |

#### Step 2: Enable GitHub Pages

1. Go to **Settings > Pages**
2. Set **Source** to **GitHub Actions**
3. Push to `main` branch

The included workflow `.github/workflows/next-deploy.yml` handles the build and deployment.

### Vercel

1. Import your repository on [vercel.com](https://vercel.com)
2. Add environment variables in project settings
3. Deploy

### Static Export

```bash
npm run build
```

Upload the `out/` folder to any static hosting.

---

## Project Structure

```
├── src/
│   ├── components/
│   │   ├── admin/           # Dashboard components
│   │   │   ├── finance/     # Finance module
│   │   │   ├── tasks/       # Task manager
│   │   │   ├── learning/    # Learning hub
│   │   │   └── ...
│   │   ├── ui/              # Shadcn UI primitives
│   │   └── ...              # Public components
│   ├── hooks/               # Custom React hooks
│   ├── lib/
│   │   ├── constants.ts     # App constants and enums
│   │   ├── schemas.ts       # Zod validation schemas
│   │   ├── fallback-data.ts # Static mode fallback
│   │   └── utils.ts         # Utility functions
│   ├── pages/
│   │   ├── admin/           # Admin routes (18 pages)
│   │   └── ...              # Public routes
│   ├── store/
│   │   └── api/
│   │       ├── publicApi.ts # Public content queries
│   │       └── adminApi.ts  # Admin CRUD operations
│   ├── styles/
│   │   └── globals.css      # Tailwind + theme definitions
│   └── types/
│       └── index.ts         # TypeScript interfaces
├── db/
│   └── schema.sql           # Supabase schema
├── public/                  # Static assets
└── ...config files
```

---

## Troubleshooting

### "No DB" Error

**Cause:** Supabase credentials not configured or incorrect.

**Solution:**
- Verify `.env.local` contains correct `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Restart the development server after adding environment variables

### Admin Signup Page Shows "Admin Exists"

**Cause:** An admin account already exists in the database.

**Solution:**
- Use `/admin/login` instead
- Or clear the `auth.users` table in Supabase if starting fresh

### MFA Setup Not Working

**Cause:** Time sync issue between server and authenticator app.

**Solution:**
- Ensure your device time is synchronized
- Try a different authenticator app
- Clear browser cache and try again

### Images Not Loading

**Cause:** Storage bucket not configured correctly.

**Solution:**
1. Verify bucket name matches `NEXT_PUBLIC_BUCKET_NAME`
2. Ensure bucket is set to **Public**
3. Check RLS policies allow public read access

### Build Fails on GitHub Actions

**Cause:** Missing environment variables in GitHub Secrets.

**Solution:**
- Verify all required secrets are added in GitHub repo settings
- Check secret names match exactly (case-sensitive)

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server (port 8889) |
| `npm run build` | Production build (static export) |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run format` | Format code with Prettier |

---

## Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## License

This project is licensed under the [MIT License](LICENSE).

---

## Acknowledgments

- [Shadcn UI](https://ui.shadcn.com/) for the component library
- [Supabase](https://supabase.com/) for the backend infrastructure
- [Vercel](https://vercel.com/) for Next.js
