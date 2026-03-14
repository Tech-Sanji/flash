import { NextRequest, NextResponse } from "next/server";
import { attemptPurchase } from "@/lib/store";

export async function POST(req: NextRequest) {
  const { userId, userName } = await req.json();
  if (!userId || !userName) {
    return NextResponse.json({ success: false, message: "Missing user info" }, { status: 400 });
  }
  // Simulate small latency
  await new Promise(r => setTimeout(r, Math.random() * 100 + 50));
  const order = attemptPurchase(userId, userName);
  if (order) {
    return NextResponse.json({ success: true, order });
  }
  return NextResponse.json({ success: false, message: "Out of stock — better luck next time!" }, { status: 409 });
}
