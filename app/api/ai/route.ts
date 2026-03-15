import { NextRequest, NextResponse } from "next/server";
import { getStats } from "@/lib/store";

export async function POST(req: NextRequest) {
  const { messages, page } = await req.json();
  const stats = await getStats();

  const systemPrompt = `You are ARIA — the AI assistant for DropZone, a flash sale platform built for the ACM MPSTME hackathon.
Current system state:
- Inventory remaining: ${stats.inventory} units
- Units sold: ${stats.totalOrders}
- Initial stock: ${stats.initialStock}
- Recent orders: ${stats.orders.slice(-3).map(o => `#${o.id} by ${o.userName} at ${o.time}`).join(", ") || "none"}
- Current page: ${page}

You help users understand:
- How to buy during the flash sale
- The queue and inventory system (uses Supabase database with row-level locking to prevent overselling)
- Order status and history
- System architecture (Next.js, Supabase PostgreSQL, atomic database transactions, REST APIs)
- Concurrency handling with PostgreSQL SELECT FOR UPDATE row locking

Be concise, friendly, and technically accurate. Keep responses under 3 sentences unless the user asks for technical details.`;

  try {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) throw new Error("No API key");

    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 500,
        system: systemPrompt,
        messages,
      }),
    });
    const data = await res.json();
    const text = data.content?.[0]?.text || "I'm having trouble responding. Please try again.";
    return NextResponse.json({ reply: text });
  } catch {
    // Fallback smart responses based on keywords
    const lastMsg = (messages[messages.length - 1]?.content || "").toLowerCase();
    let reply = "I'm ARIA, your flash sale AI assistant. Ask me about inventory, orders, or how the system works!";
    if (lastMsg.includes("stock") || lastMsg.includes("inventory")) reply = `Currently ${stats.inventory} units remain out of ${stats.initialStock}. ${stats.totalOrders} units have been sold. The system uses PostgreSQL row locking to prevent overselling.`;
    else if (lastMsg.includes("buy") || lastMsg.includes("purchase")) reply = "Click 'Buy Now' on the flash sale page. The system uses database-level atomic transactions with SELECT FOR UPDATE to ensure only available stock is sold.";
    else if (lastMsg.includes("order")) reply = `${stats.totalOrders} orders have been recorded. Each order has a unique ID, buyer name, and precise timestamp. Check the Orders page for the full list.`;
    else if (lastMsg.includes("concurren") || lastMsg.includes("atomic")) reply = "The system uses PostgreSQL row-level locking with SELECT FOR UPDATE. This ensures true atomicity across distributed serverless functions, preventing any race conditions.";
    else if (lastMsg.includes("reset")) reply = "Admins can reset inventory from the Admin page. This clears all orders and restores the stock count for a fresh drop.";
    return NextResponse.json({ reply });
  }
}
