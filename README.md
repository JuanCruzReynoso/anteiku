# Anteiku

E-commerce premium de merchandise geek y café de especialidad. Next.js 16, Drizzle ORM, Supabase, Tailwind CSS.

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript 5 |
| Database | PostgreSQL (Supabase) |
| ORM | Drizzle ORM |
| Auth | NextAuth v5 (beta) |
| Styling | Tailwind CSS v4 |
| State | Zustand |
| Animations | Framer Motion 12 |
| Testing | Vitest + Testing Library |
| CI/CD | GitHub Actions |

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm
- Supabase project (or local PostgreSQL)

### Installation

```bash
pnpm install
```

### Environment Variables

Copy `.env.example` to `.env.local` and configure:

```env
# Database
DATABASE_URL=postgresql://...

# Auth
NEXTAUTH_SECRET=your-secret
NEXTAUTH_URL=http://localhost:3000

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Optional — admin dashboard low stock threshold (default: 5)
LOW_STOCK_THRESHOLD=5
```

### Development

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

### Database

```bash
# Generate migration
pnpm db:generate

# Run migration
pnpm db:migrate

# Push schema directly
pnpm db:push

# Seed database
pnpm db:seed

# Open Drizzle Studio
pnpm db:studio
```

## Scripts

| Script | Description |
|--------|-------------|
| `pnpm dev` | Start development server |
| `pnpm build` | Production build |
| `pnpm start` | Start production server |
| `pnpm lint` | Run ESLint |
| `pnpm test` | Run tests (vitest) |
| `pnpm test:watch` | Run tests in watch mode |
| `pnpm db:generate` | Generate Drizzle migration |
| `pnpm db:migrate` | Run migrations |
| `pnpm db:push` | Push schema to database |
| `pnpm db:seed` | Seed database with sample data |
| `pnpm db:studio` | Open Drizzle Studio |

## Project Structure

```
anteiku/
├── app/                    # Next.js App Router pages
│   ├── admin/              # Admin dashboard
│   ├── checkout/           # Checkout flow
│   ├── product/[slug]/     # Product detail pages
│   ├── shop/               # Product listing
│   ├── sitemap.ts          # Dynamic sitemap
│   └── robots.ts           # Robots.txt rules
├── components/             # Shared UI components
│   ├── motion.tsx          # Framer Motion variants & hooks
│   └── ui/                 # shadcn/ui components
├── db/                     # Drizzle schema, migrations, queries
├── features/               # Domain modules
│   ├── admin/              # Admin actions & forms
│   ├── auth/               # Authentication
│   ├── cart/               # Cart store & UI
│   ├── checkout/           # Checkout flow & actions
│   ├── home/               # Homepage
│   ├── layout/             # Navbar, footer
│   ├── product/            # Product card, queries
│   └── shop/               # Shop search
├── hooks/                  # Shared React hooks
├── lib/                    # Utilities, config
├── services/               # External service integrations
├── tests/                  # Test setup
└── types/                  # Shared TypeScript types
```

## Deployment

Deploy to Vercel:

1. Push to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Configure environment variables
4. Deploy

The CI pipeline runs lint, type-check, test, and build on every push and PR to `main`.

## License

Private — Anteiku 2026
