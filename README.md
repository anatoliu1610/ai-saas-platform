# AI SaaS Platform

A production-grade full-stack AI chat application built to Staff Engineer standards.

## Executive Summary

This is a production-ready AI chat SaaS platform demonstrating enterprise-level architecture decisions, type-safe APIs, security best practices, and modern DevOps workflows. Built with Next.js 15, tRPC, Prisma, PostgreSQL, and Docker.

## Tech Stack

| Layer | Technology | Justification |
|-------|------------|----------------|
| **Frontend** | React 18 + TypeScript | Industry standard, type-safe UI |
| **Framework** | Next.js 15 (App Router) | SSR, streaming, edge-ready |
| **API** | tRPC | End-to-end type safety, RPC > REST for internal APIs |
| **Database** | PostgreSQL | ACID compliance, relational integrity |
| **ORM** | Prisma | Type-safe database access, excellent DX |
| **Auth** | JWT (stateless) | Horizontal scalability, no session storage |
| **Cache** | Redis | Sessions, rate limiting, caching |
| **Styling** | Tailwind CSS | Utility-first, consistent design system |
| **Animation** | Framer Motion | Declarative animations, layout animations |
| **DevOps** | Docker + GitHub Actions | Standard CI/CD, reproducible builds |

## Why tRPC over REST?

1. **End-to-end type safety** — No more `any` types or runtime errors from mismatched API contracts
2. **No API documentation needed** — Auto-generated from TypeScript
3. **Smaller bundle size** — No OpenAPI spec overhead
4. **Simpler mental model** — Just function calls, not HTTP semantics

Tradeoffs:
- Less suitable for public APIs (no OpenAPI/Swagger)
- Requires TypeScript throughout

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Next.js Frontend                      │
│   (React + Tailwind + Framer Motion + tRPC Client)     │
└─────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│                   tRPC API Layer                         │
│        (Type-safe RPC, middleware, validation)         │
└─────────────────────────────────────────────────────────┘
              │                   │               │
              ▼                   ▼               ▼
        ┌──────────┐       ┌───────────┐    ┌──────────┐
        │ PostgreSQL│       │   Redis   │    │  Ollama │
        │ (Prisma)  │       │ (sessions)│    │(vectors)│
        └──────────┘       └───────────┘    └──────────┘
```

## Folder Structure

```
apps/web/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/               # API routes (tRPC)
│   │   ├── (auth)/           # Auth pages (login/register)
│   │   ├── (dashboard)/      # Protected dashboard
│   │   └── page.tsx          # Landing page
│   ├── components/
│   │   ├── ui/              # Base components (Button, Input, Card)
│   │   ├── forms/           # Form components
│   │   └── features/        # Feature-specific components
│   ├── lib/
│   │   ├── trpc/            # tRPC client, server, routers
│   │   ├── auth.ts          # JWT, password utilities
│   │   ├── db.ts            # Prisma client
│   │   └── utils.ts         # Shared utilities
│   └── styles/
│       └── globals.css      # Tailwind + CSS variables
├── prisma/
│   └── schema.prisma        # Database schema
├── public/                  # Static assets
├── Dockerfile
├── docker-compose.yml
└── tailwind.config.ts
```

## Database Schema

### Users & Auth
- `User` — id, email, passwordHash, role, name, image
- `Session` — JWT tokens for audit trail

### Conversations
- `Conversation` — id, userId, title, model, timestamps
- `Message` — id, conversationId, role, content, tokens, metadata

### API & Usage
- `ApiKey` — User API keys for external access
- `Usage` — Token usage tracking per user

## API Design

All APIs are exposed via tRPC routers:

### Auth Router
- `auth.register` — Create account
- `auth.login` — Authenticate
- `auth.logout` — Clear session
- `auth.me` — Get current user
- `auth.updateProfile` — Update profile

### Conversation Router
- `conversation.list` — List user's conversations
- `conversation.byId` — Get single conversation
- `conversation.create` — New conversation
- `conversation.update` — Update title/model
- `conversation.delete` — Delete conversation
- `conversation.archive` — Archive conversation

### Message Router
- `message.send` — Send message, get AI response
- `message.delete` — Delete message

## Setup Instructions

### Prerequisites
- Node.js 20+
- pnpm 8+
- Docker & Docker Compose

### Local Development

1. **Clone and install**
```bash
git clone https://github.com/yourusername/ai-saas-platform.git
cd ai-saas-platform
pnpm install
```

2. **Configure environment**
```bash
cp apps/web/.env.example apps/web/.env
# Edit .env with your values
```

3. **Start infrastructure**
```bash
cd apps/web
docker-compose up -d
```

4. **Setup database**
```bash
pnpm db:generate
pnpm db:push
```

5. **Run development server**
```bash
pnpm dev
```

Open http://localhost:3000

### Docker Production Build

```bash
cd apps/web
docker build -t ai-saas-web .
docker run -p 3000:3000 ai-saas-web
```

### Docker Compose (Full Stack)

```bash
cd apps/web
docker-compose up -d --build
```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `JWT_SECRET` | Secret for JWT signing | Yes |
| `REDIS_URL` | Redis connection string | Yes |
| `OLLAMA_URL` | Ollama API URL (for embeddings) | No |
| `OPENAI_API_KEY` | OpenAI API key (for AI responses) | No |

## Testing

```bash
# Unit tests
pnpm test

# Run with coverage
pnpm test --coverage
```

## CI/CD

GitHub Actions workflow (`.github/workflows/ci.yml`):
1. Install dependencies
2. Lint (ESLint)
3. Type check (TypeScript)
4. Build (Next.js)
5. Test (Jest)
6. Docker build

## Performance

- **Lighthouse Target**: ≥90
- **Code splitting**: Automatic via Next.js
- **Server components**: Used where appropriate
- **Streaming**: Token-by-token AI responses
- **Database indexing**: On foreign keys and frequently queried columns
- **Caching**: Redis for sessions and rate limits

## Security

- **Password hashing**: bcrypt (12 rounds)
- **JWT**: Short-lived access tokens (7d)
- **Input validation**: Zod schemas on all inputs
- **Rate limiting**: Redis-based, 100 req/min per user
- **CORS**: Configured for same-origin + API routes
- **XSS**: Content Security Policy headers
- **CSRF**: SameSite cookies

## Scalability

- **Horizontal**: Stateless JWT auth, Redis sessions
- **Database**: Connection pooling, proper indexing
- **Caching**: Redis for frequently accessed data
- **API**: tRPC batched queries

## Future Roadmap

- [ ] Real AI integration (OpenAI/Anthropic)
- [ ] Streaming responses with Server-Sent Events
- [ ] Multi-tenant (teams/organizations)
- [ ] WebSocket support for real-time
- [ ] File uploads (images, documents)
- [ ] Voice input/output

## License

MIT
