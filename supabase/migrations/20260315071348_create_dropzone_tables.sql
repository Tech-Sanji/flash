/*
  # DropZone Product Drop Database Schema

  1. New Tables
    - `inventory`
      - `id` (int, primary key) - always 1, single row for atomic updates
      - `available` (int) - current stock available
      - `initial_stock` (int) - starting inventory amount
      - `updated_at` (timestamptz) - last update timestamp
    
    - `orders`
      - `id` (int, primary key, auto-increment)
      - `product` (text) - product name
      - `price` (int) - price in rupees
      - `user_id` (text) - buyer identifier
      - `user_name` (text) - buyer display name
      - `created_at` (timestamptz) - order timestamp

  2. Security
    - Enable RLS on both tables
    - Allow authenticated users to read inventory
    - Allow authenticated users to read orders
    - Restrict writes to prevent tampering (API will use service role)

  3. Important Notes
    - Inventory uses SELECT FOR UPDATE to provide row-level locking
    - This prevents race conditions across multiple serverless instances
    - Single inventory row pattern ensures atomic operations
*/

-- Create inventory table with single row pattern
CREATE TABLE IF NOT EXISTS inventory (
  id int PRIMARY KEY DEFAULT 1,
  available int NOT NULL DEFAULT 10,
  initial_stock int NOT NULL DEFAULT 10,
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT single_row CHECK (id = 1)
);

-- Insert the single inventory row
INSERT INTO inventory (id, available, initial_stock)
VALUES (1, 10, 10)
ON CONFLICT (id) DO NOTHING;

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id serial PRIMARY KEY,
  product text NOT NULL,
  price int NOT NULL,
  user_id text NOT NULL,
  user_name text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Inventory policies (read-only for authenticated users)
CREATE POLICY "Anyone can read inventory"
  ON inventory
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Orders policies (read-only for authenticated users)
CREATE POLICY "Anyone can read orders"
  ON orders
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Create index for faster order queries
CREATE INDEX IF NOT EXISTS orders_created_at_idx ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS orders_user_id_idx ON orders(user_id);
