import { NextRequest, NextResponse } from "next/server";
import { resetStock } from "@/lib/store";

export async function POST(req: NextRequest) {
  const { amount } = await req.json().catch(() => ({ amount: 10 }));
  await resetStock(amount || 10);
  return NextResponse.json({ success: true, inventory: amount || 10 });
}
