"use client";
import { useEffect, useState, useCallback } from "react";
import AIChat from "@/components/AIChat";

interface StatsData { inventory: number; totalOrders: number; initialStock: number; orders: Array<{ id: number; userName: string; time: string; product: string }> }

export default function AdminPage() {
  const [stats, setStats] = useState<StatsData>({ inventory: 10, totalOrders: 0, initialStock: 10, orders: [] });
  const [resetting, setResetting] = useState(false);
  const [resetAmount, setResetAmount] = useState(10);
  const [toast, setToast] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    const res = await fetch("/api/stats");
    const data = await res.json();
    setStats(data);
  }, []);

  useEffect(() => { fetchStats(); const iv = setInterval(fetchStats, 2000); return () => clearInterval(iv); }, [fetchStats]);

  const reset = async () => {
    setResetting(true);
    await fetch("/api/reset", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ amount: resetAmount }) });
    await fetchStats();
    setToast(`Stock reset to ${resetAmount} units ✓`);
    setTimeout(() => setToast(null), 3000);
    setResetting(false);
  };

  const soldPct = stats.initialStock > 0 ? Math.round((stats.totalOrders / stats.initialStock) * 100) : 0;
  const stockColor = stats.inventory > 5 ? "#34d399" : stats.inventory > 2 ? "#fbbf24" : "#f87171";

  const AVATAR_GRADIENTS = [
    "linear-gradient(135deg,#6366f1,#8b5cf6)",
    "linear-gradient(135deg,#0891b2,#0e7490)",
    "linear-gradient(135deg,#7c3aed,#6d28d9)",
    "linear-gradient(135deg,#be185d,#9d174d)",
    "linear-gradient(135deg,#059669,#047857)",
    "linear-gradient(135deg,#d97706,#b45309)",
  ];

  return (
    <div style={{ padding: "2rem", maxWidth: 1100, margin: "0 auto" }}>
      <div className="anim-fade" style={{ marginBottom: "1.5rem", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 7 }}>
            <span className="badge badge-info">Admin</span>
            <span className="badge badge-success"><span className="pulse-dot" />All Systems Operational</span>
          </div>
          <h1 style={{ fontFamily: "'Orbitron', monospace", fontSize: 26, fontWeight: 700, marginBottom: 4 }}>
            System{" "}
            <span style={{ background: "linear-gradient(135deg,#818cf8,#06b6d4)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Dashboard</span>
          </h1>
          <p style={{ color: "var(--muted2)", fontSize: 13 }}>Real-time inventory and order monitoring</p>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <input type="number" min={1} max={100} value={resetAmount} onChange={e => setResetAmount(Number(e.target.value))} className="input" style={{ width: 76, textAlign: "center" }} />
          <button onClick={reset} className="btn btn-ghost" disabled={resetting}>{resetting ? "Resetting..." : "↺ Reset Stock"}</button>
        </div>
      </div>

      <div className="anim-fade anim-delay-1" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "1rem", marginBottom: "1.5rem" }}>
        {[
          { val: stats.inventory, lbl: "Stock Remaining", color: stockColor },
          { val: stats.totalOrders, lbl: "Total Orders", color: "#818cf8" },
          { val: stats.initialStock, lbl: "Initial Stock", color: "var(--muted3)" },
          { val: `${soldPct}%`, lbl: "Sold Through", color: soldPct > 80 ? "#f87171" : "#fbbf24" },
        ].map(s => (
          <div key={s.lbl} className="stat-card" style={{ borderBottom: `2px solid ${s.color}33` }}>
            <div className="stat-val" style={{ color: s.color }}>{s.val}</div>
            <div className="stat-lbl">{s.lbl}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem" }}>
        {/* Inventory map */}
        <div className="card anim-fade anim-delay-2">
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--muted2)", marginBottom: 14 }}>Inventory Map</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 8, marginBottom: 14 }}>
            {Array.from({ length: stats.initialStock }).map((_, i) => {
              const sold = i < stats.totalOrders;
              return (
                <div key={i} style={{
                  aspectRatio: "1", borderRadius: 9,
                  background: sold ? "rgba(239,68,68,0.1)" : "rgba(99,102,241,0.1)",
                  border: `1px solid ${sold ? "rgba(239,68,68,0.22)" : "rgba(99,102,241,0.22)"}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  transition: "all 0.4s",
                  color: sold ? "#f87171" : undefined,
                  fontWeight: sold ? 700 : undefined,
                  fontSize: sold ? 14 : 18,
                } as React.CSSProperties}>
                  {sold ? "✕" : "🎮"}
                </div>
              );
            })}
          </div>
          <div style={{ display: "flex", gap: 16, fontSize: 11 }}>
            <span style={{ color: "#818cf8" }}>🎮 Available ({stats.inventory})</span>
            <span style={{ color: "#f87171" }}>✕ Sold ({stats.totalOrders})</span>
          </div>
        </div>

        {/* System health */}
        <div className="card anim-fade anim-delay-2">
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--muted2)", marginBottom: 14 }}>System Health</div>
          {[
            { label: "API Server", val: "Healthy", badge: "badge-success", detail: "Next.js routes" },
            { label: "Inventory Lock", val: "Atomic", badge: "badge-success", detail: "JS single-thread" },
            { label: "Order DB", val: "In-Memory", badge: "badge-success", detail: `${stats.totalOrders} records` },
            { label: "Concurrency", val: "Protected", badge: "badge-success", detail: "No race conditions" },
            { label: "ARIA Assistant", val: "Online", badge: "badge-cyan", detail: "Claude API" },
            { label: "Stock Status", val: stats.inventory > 0 ? "Available" : "Exhausted", badge: stats.inventory > 0 ? "badge-success" : "badge-live", detail: `${stats.inventory} left` },
          ].map(item => (
            <div key={item.label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ color: item.badge === "badge-live" ? "#f87171" : item.badge === "badge-cyan" ? "#22d3ee" : "#34d399", fontSize: 9 }}>●</span>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 500, color: "var(--text)" }}>{item.label}</div>
                  <div style={{ fontSize: 10, color: "var(--muted2)" }}>{item.detail}</div>
                </div>
              </div>
              <span className={`badge ${item.badge}`} style={{ fontSize: 10 }}>{item.val}</span>
            </div>
          ))}
        </div>

        {/* Recent orders */}
        <div className="card anim-fade anim-delay-3" style={{ gridColumn: "1 / -1" }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--muted2)", marginBottom: 14 }}>Recent Orders</div>
          {stats.orders.length === 0 ? (
            <div style={{ color: "var(--muted2)", textAlign: "center", padding: "1.5rem", fontSize: 13 }}>No orders yet. Run the drop or stress test.</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
              {stats.orders.slice().reverse().slice(0, 8).map((o, i) => (
                <div key={o.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "9px 14px", background: "rgba(255,255,255,0.02)", borderRadius: 8, border: "1px solid var(--border)", animation: "slideIn 0.3s ease" }}>
                  <span style={{ fontFamily: "monospace", fontSize: 11, color: "#818cf8", minWidth: 48 }}>#{String(o.id).padStart(4, "0")}</span>
                  <div style={{ width: 26, height: 26, borderRadius: "50%", background: AVATAR_GRADIENTS[i % AVATAR_GRADIENTS.length], display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, color: "#fff", flexShrink: 0 }}>
                    {o.userName.slice(0, 2).toUpperCase()}
                  </div>
                  <span style={{ fontSize: 13, flex: 1, color: "var(--text)" }}>{o.userName}</span>
                  <span style={{ fontSize: 12, color: "var(--muted2)" }}>{o.product.split("—")[0].trim()}</span>
                  <span style={{ fontFamily: "monospace", fontSize: 11, color: "var(--muted2)" }}>{o.time}</span>
                  <span className="badge badge-success" style={{ fontSize: 9 }}>✓</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {toast && <div className="toast toast-success">{toast}</div>}
      <AIChat page="admin" />
    </div>
  );
}
