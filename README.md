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
- **Supabase PostgreSQL** — database with row-level locking for true concurrency control
- **REST APIs** — `/api/purchase`, `/api/stats`, `/api/reset`, `/api/ai`
- **ARIA AI Assistant** — Claude API, context-aware, on every page
- **Atomic transactions** — PostgreSQL `SELECT FOR UPDATE` prevents race conditions

## Concurrency Solution

Uses **PostgreSQL row-level locking** for true atomicity across distributed serverless functions:

```sql
-- Lock inventory row exclusively
SELECT available FROM inventory WHERE id = 1 FOR UPDATE;

-- Check stock
IF available <= 0 THEN RETURN empty

-- Atomic decrement and order creation
UPDATE inventory SET available = available - 1
INSERT INTO orders (...)
```

The `FOR UPDATE` clause ensures only one transaction can modify inventory at a time, even across multiple Netlify/Vercel instances. Other requests wait in queue until the lock releases. This guarantees zero overselling even with 1000+ concurrent requests.

## AI Features

- **ARIA Chat** — floating assistant on every page, knows live inventory/orders
- **Demand forecast** — predicts sell-through rate on home page
- **Context-aware** — different system prompt per page
