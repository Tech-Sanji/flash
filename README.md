# DropZone — Midnight Product Drop

> ACM MPSTME Hackathon — Full Stack Problem 2

## Setup

```bash
npm install
cp .env.example .env.local
# Add your ANTHROPIC_API_KEY to .env.local
npm run dev
```

Open http://localhost:3000

## Demo Credentials

| Email | Password | Role |
|-------|----------|------|
| demo@dropzone.io | drop2024 | User |
| admin@dropzone.io | admin2024 | Admin |
| judge@hackathon.io | judge2024 | Judge |

## Pages

| Route | Description |
|-------|-------------|
| `/login` | Authentication page |
| `/` | Flash sale — live countdown + buy button |
| `/orders` | All successful orders with search |
| `/admin` | System dashboard + stock reset |
| `/test` | Stress test — fire 5–200 concurrent buyers |

## Architecture

- **Next.js 14** App Router + TypeScript
- **Atomic inventory** — JS single-thread guarantees no race conditions
- **REST APIs** — `/api/purchase`, `/api/stats`, `/api/reset`, `/api/ai`
- **ARIA AI Assistant** — Claude API, context-aware, on every page
- **In-memory store** — simulates DB with atomic check-and-decrement

## Concurrency Solution

Node.js is single-threaded. The `attemptPurchase()` function does:
```
if (inventory <= 0) return null   // atomic check
inventory--                        // atomic decrement
create order                       // record
```
No two requests can interleave — the event loop serializes them.

## AI Features

- **ARIA Chat** — floating assistant on every page, knows live inventory/orders
- **Demand forecast** — predicts sell-through rate on home page
- **Context-aware** — different system prompt per page
