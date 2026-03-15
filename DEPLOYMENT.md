# Deployment Guide

## What Changed

The app now uses **Supabase PostgreSQL** instead of in-memory storage to handle concurrency correctly in serverless/distributed environments like Netlify.

### The Problem
In-memory state doesn't persist across serverless function invocations. Each request on Netlify may hit a different Lambda instance, causing inventory to reset and allowing overselling.

### The Solution
Database-backed inventory with PostgreSQL row-level locking:
- `SELECT FOR UPDATE` locks the inventory row
- Only one transaction can modify it at a time
- Other requests queue and wait for the lock
- Guarantees zero overselling even with 1000+ concurrent requests

## Database Schema

### Tables Created
1. **inventory** - Single row storing available stock
   - `id` (always 1)
   - `available` (current stock)
   - `initial_stock` (starting amount)
   - `updated_at` (timestamp)

2. **orders** - All successful purchases
   - `id` (auto-increment)
   - `product`, `price`
   - `user_id`, `user_name`
   - `created_at`

### Database Function
`purchase_item()` - Atomic purchase function
- Locks inventory row with `FOR UPDATE`
- Checks stock availability
- Decrements inventory and creates order in single transaction
- Returns order or empty result

## Environment Variables Required

Add these to your Netlify environment variables:

```
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
ANTHROPIC_API_KEY=your_anthropic_key
```

## Files Modified

1. **lib/supabase.ts** (new) - Supabase client setup
2. **lib/store.ts** - Replaced in-memory with database calls
3. **app/api/purchase/route.ts** - Now async, calls DB
4. **app/api/stats/route.ts** - Reads from DB
5. **app/api/reset/route.ts** - Resets DB tables
6. **app/api/ai/route.ts** - Updated to reference new architecture
7. **package.json** - Added @supabase/supabase-js
8. **README.md** - Updated architecture section

## Testing Stress Test

1. Deploy to Netlify
2. Go to `/test` page
3. Fire 50-200 concurrent requests
4. Verify only 10 succeed (or whatever your stock is)
5. Check `/orders` - should see exactly 10 orders
6. No overselling possible

## How It Works in Production

```
User clicks Buy
  ↓
API Route: /api/purchase
  ↓
Supabase RPC: purchase_item()
  ↓
PostgreSQL Transaction:
  - SELECT ... FOR UPDATE (locks row)
  - Check inventory > 0
  - UPDATE inventory SET available = available - 1
  - INSERT INTO orders
  - COMMIT (releases lock)
  ↓
Return order or null
```

Each serverless instance connects to the same Supabase database. The database handles concurrency, not the application code.
