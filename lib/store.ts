import { supabaseServer } from './supabase';

export interface Order {
  id: number;
  product: string;
  price: number;
  userId: string;
  userName: string;
  time: string;
  timestamp: number;
}

export async function attemptPurchase(userId: string, userName: string): Promise<Order | null> {
  try {
    const result = await supabaseServer.rpc('purchase_item', {
      p_user_id: userId,
      p_user_name: userName,
      p_product: "Gaming Console — Midnight Edition",
      p_price: 29999
    });

    if (result.error) {
      console.error('Purchase error:', result.error);
      return null;
    }

    if (!result.data || result.data.length === 0) {
      return null;
    }

    const order = result.data[0];
    return {
      id: order.id,
      product: order.product,
      price: order.price,
      userId: order.user_id,
      userName: order.user_name,
      time: new Date(order.created_at).toLocaleTimeString("en-IN", { hour12: false }),
      timestamp: new Date(order.created_at).getTime(),
    };
  } catch (error) {
    console.error('Purchase exception:', error);
    return null;
  }
}

export async function resetStock(amount = 10) {
  await supabaseServer.from('orders').delete().neq('id', 0);

  await supabaseServer
    .from('inventory')
    .update({
      available: amount,
      initial_stock: amount,
      updated_at: new Date().toISOString()
    })
    .eq('id', 1);
}

export async function getStats() {
  const [inventoryRes, ordersRes] = await Promise.all([
    supabaseServer.from('inventory').select('*').eq('id', 1).maybeSingle(),
    supabaseServer.from('orders').select('*').order('created_at', { ascending: false })
  ]);

  const inventory = inventoryRes.data?.available || 0;
  const initialStock = inventoryRes.data?.initial_stock || 10;
  const dbOrders = ordersRes.data || [];

  const orders = dbOrders.map(o => ({
    id: o.id,
    product: o.product,
    price: o.price,
    userId: o.user_id,
    userName: o.user_name,
    time: new Date(o.created_at).toLocaleTimeString("en-IN", { hour12: false }),
    timestamp: new Date(o.created_at).getTime(),
  }));

  return {
    inventory,
    orders,
    totalOrders: orders.length,
    initialStock,
  };
}
