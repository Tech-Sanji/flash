import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder-key';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';

export const supabaseServer = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { persistSession: false }
});

export const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);

export interface Order {
  id: number;
  product: string;
  price: number;
  user_id: string;
  user_name: string;
  created_at: string;
}

export interface Inventory {
  id: number;
  available: number;
  initial_stock: number;
  updated_at: string;
}
