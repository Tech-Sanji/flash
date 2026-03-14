// lib/store.ts
// In-memory store simulating a DB with atomic operations

export interface Order {
  id: number;
  product: string;
  price: number;
  userId: string;
  userName: string;
  time: string;
  timestamp: number;
}

interface Store {
  inventory: number;
  orders: Order[];
  orderCounter: number;
  initialStock: number;
}

// Global store (persists across hot reloads in dev via globalThis)
const globalStore = globalThis as typeof globalThis & { __dropzone_store__?: Store };

if (!globalStore.__dropzone_store__) {
  globalStore.__dropzone_store__ = {
    inventory: 10,
    orders: [],
    orderCounter: 0,
    initialStock: 10,
  };
}

export const store = globalStore.__dropzone_store__!;

// Atomic purchase — returns order or null if out of stock
export function attemptPurchase(userId: string, userName: string): Order | null {
  // Atomic check-and-decrement
  if (store.inventory <= 0) return null;
  store.inventory--;
  store.orderCounter++;
  const order: Order = {
    id: store.orderCounter,
    product: "Gaming Console — Midnight Edition",
    price: 29999,
    userId,
    userName,
    time: new Date().toLocaleTimeString("en-IN", { hour12: false }),
    timestamp: Date.now(),
  };
  store.orders.push(order);
  return order;
}

export function resetStock(amount = 10) {
  store.inventory = amount;
  store.initialStock = amount;
  store.orders = [];
  store.orderCounter = 0;
}

export function getStats() {
  return {
    inventory: store.inventory,
    orders: store.orders,
    totalOrders: store.orders.length,
    initialStock: store.initialStock,
  };
}
