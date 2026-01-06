# Valley Hub

[cloudflarebutton]

A production-ready full-stack application template powered by Cloudflare Workers, featuring a reactive frontend with React, Vite, Shadcn UI, and Tailwind CSS, paired with a robust Hono-based API backend utilizing Durable Objects for persistent state management.

## Features

- **Full-Stack Architecture**: React SPA frontend served via Cloudflare Pages with Workers handling API routes.
- **Stateful Backend**: Cloudflare Durable Objects for counters, demo items CRUD, and global state persistence.
- **Modern UI**: Shadcn UI components, Tailwind CSS with custom design system, dark mode support, and smooth animations.
- **API-First**: Hono routing with CORS, logging, error handling, and health checks.
- **Data Fetching**: TanStack Query for optimistic updates, caching, and background sync.
- **Developer Experience**: Hot reload, TypeScript end-to-end, Bun scripts, Vite bundling.
- **Production Ready**: Error boundaries, client error reporting, observability, and SPA fallback routing.
- **Demo Endpoints**: Counter operations, demo items management (GET/POST/PUT/DELETE).

## Tech Stack

### Frontend
- React 18 + Vite
- TypeScript
- Tailwind CSS + Shadcn UI
- TanStack Query
- Lucide Icons
- Framer Motion
- React Router
- Sonner (Toasts)
- Zustand (State)

### Backend
- Cloudflare Workers
- Hono (Routing)
- Durable Objects (SQLite storage)
- CORS + Logger Middleware

### Tools
- Bun (Package Manager)
- Wrangler (CLI)
- ESLint + TypeScript

## Quick Start

### Prerequisites
- [Bun](https://bun.sh/) installed (`curl -fsSL https://bun.sh/install | bash`)
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/install/) (`bunx wrangler@latest`)
- Cloudflare account with API token for deployment

### Installation
```bash
git clone <repository-url>
cd valley-hub-e6acgmckqqgaqjwii1lry
bun install
```

### Development
```bash
# Start dev server (frontend + worker proxy)
bun run dev

# Generate Worker types
bun run cf-typegen
```

Access at `http://localhost:3000`. API routes available at `/api/*`.

### Build
```bash
bun run build
```

Outputs static assets to `dist/` and Worker bundle.

### Local Preview
```bash
bun run preview
```

## Deployment

Deploy to Cloudflare Pages + Workers in one command:

```bash
bun run deploy
```

Or manually:

1. Login: `wrangler login`
2. Deploy: `wrangler deploy`
3. Pages: `wrangler pages deploy dist --project-name=<pages-project>`

[cloudflarebutton]

Configure `wrangler.jsonc` with your account ID and secrets as needed.

## API Endpoints

All endpoints return `{ success: boolean, data?: T, error?: string }`.

- `GET /api/health` - Health check
- `GET /api/test` - Simple test
- `GET /api/counter` - Get counter value
- `POST /api/counter/increment` - Increment counter
- `GET /api/demo` - List demo items
- `POST /api/demo` - Add demo item `{ name: string, value: number }`
- `PUT /api/demo/:id` - Update demo item
- `DELETE /api/demo/:id` - Delete demo item
- `POST /api/client-errors` - Client error reporting

Uses Durable Object storage at `global` ID.

## Customization

- **Frontend**: Edit `src/pages/HomePage.tsx` and components in `src/components/`.
- **Backend**: Add routes in `worker/userRoutes.ts`. Core files (`index.ts`, `core-utils.ts`) are protected.
- **UI**: Extend Tailwind in `tailwind.config.js` or add Shadcn components: `bunx shadcn-ui@latest add <component>`.
- **Theme**: Toggle via `ThemeToggle`. Custom CSS in `src/index.css`.
- **Sidebar**: Customize `src/components/app-sidebar.tsx` or remove from layout.
- **Types**: Shared via `@shared/*` (`shared/types.ts`).

## Scripts

| Script | Description |
|--------|-------------|
| `bun run dev` | Development server |
| `bun run build` | Production build |
| `bun run preview` | Local preview server |
| `bun run lint` | Lint codebase |
| `bun run deploy` | Deploy to Cloudflare |
| `bun run cf-typegen` | Generate Worker types |

## Project Structure

```
├── src/              # React frontend
├── worker/           # Cloudflare Worker backend
├── shared/           # Shared types
├── dist/             # Build output
├── wrangler.jsonc    # Worker config
└── package.json      # Dependencies
```

## Contributing

1. Fork the repo
2. Create feature branch (`bun run dev`)
3. Commit changes (`git commit -m 'feat: ...'`)
4. Push and PR

## License

MIT License. See [LICENSE](LICENSE) for details.