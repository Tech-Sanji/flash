"use client";
import { useState, useEffect, useCallback } from "react";
import AIChat from "@/components/AIChat";

interface Stats { inventory: number; totalOrders: number; initialStock: number; }

export default function HomePage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [buying, setBuying] = useState(false);
  const [result, setResult] = useState<{ type: "success" | "error"; message: string; orderId?: number } | null>(null);
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const [countdown, setCountdown] = useState(10);
  const [dropLive, setDropLive] = useState(false);
  const [pulseStock, setPulseStock] = useState(false);
  const [watcherCount, setWatcherCount] = useState(0);

  useEffect(() => {
    const stored = localStorage.getItem("dz_user");
    if (stored) setUser(JSON.parse(stored));
    setWatcherCount(Math.floor(Math.random() * 2000) + 3800);
    let t = 10;
    setCountdown(t);
    const interval = setInterval(() => {
      t--;
      setCountdown(t);
      if (t <= 0) { clearInterval(interval); setDropLive(true); }
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const fetchStats = useCallback(async () => {
    const res = await fetch("/api/stats");
    const data = await res.json();
    setStats(data);
  }, []);

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 2000);
    return () => clearInterval(interval);
  }, [fetchStats]);

  const buy = async () => {
    if (!user || buying || !stats || stats.inventory <= 0) return;
    setBuying(true);
    setResult(null);
    try {
      const res = await fetch("/api/purchase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.email, userName: user.name }),
      });
      const data = await res.json();
      if (data.success) {
        setResult({ type: "success", message: `🎉 Order #${data.order.id} confirmed!`, orderId: data.order.id });
        setPulseStock(true);
        setTimeout(() => setPulseStock(false), 1000);
        fetchStats();
      } else {
        setResult({ type: "error", message: data.message });
      }
    } catch {
      setResult({ type: "error", message: "Network error. Try again." });
    }
    setBuying(false);
  };

  const stockPct = stats && stats.initialStock > 0 ? (stats.inventory / stats.initialStock) * 100 : 0;
  const stockColor = stockPct > 50 ? "#34d399" : stockPct > 20 ? "#fbbf24" : "#f87171";
  const soldOut = stats ? stats.inventory <= 0 : false;

  return (
    <div style={{ padding: "2rem", maxWidth: 1100, margin: "0 auto" }}>
      {/* Header */}
      <div className="anim-fade" style={{ marginBottom: "1.75rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
          <span className="badge badge-live"><span className="pulse-dot" />Live</span>
          <span style={{ fontSize: 13, color: "var(--muted2)" }}>{watcherCount.toLocaleString()} watching</span>
          {!dropLive
            ? <span style={{ fontSize: 13, color: "var(--warn2)", fontWeight: 600, fontFamily: "'Orbitron', monospace" }}>DROP IN {countdown}s</span>
            : <span style={{ fontSize: 13, color: "var(--success2)", fontWeight: 500 }}>✓ Drop is live</span>}
        </div>
        <h1 style={{ fontFamily: "'Orbitron', monospace", fontSize: "clamp(26px,5vw,48px)", fontWeight: 900, lineHeight: 1.1, marginBottom: 8 }}>
          <span style={{ color: "#94a3b8" }}>Midnight</span>
          <br />
          <span style={{ background: "linear-gradient(135deg, #818cf8, #06b6d4)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Product Drop</span>
        </h1>
        <p style={{ color: "var(--muted2)", fontSize: 15, maxWidth: 460 }}>Thousands arrive. Only a few leave with the prize. The gate opens once.</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: "1.5rem", alignItems: "start" }}>
        {/* Product card */}
        <div className="card-glow anim-fade anim-delay-1" style={{ padding: 0, overflow: "hidden" }}>
          {/* Product hero */}
          <div style={{
            height: 240, position: "relative", overflow: "hidden",
            background: "radial-gradient(ellipse 120% 100% at 50% 60%, rgba(99,102,241,0.13) 0%, rgba(6,182,212,0.06) 45%, transparent 75%), linear-gradient(180deg, #0d0d2e 0%, #08081a 100%)",
            borderRadius: "16px 16px 0 0",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            {/* Ring halos */}
            {[180, 130, 88].map((size, i) => (
              <div key={i} style={{
                position: "absolute",
                width: size, height: size,
                borderRadius: "50%",
                border: `1px solid rgba(99,102,241,${0.18 - i * 0.04})`,
                animation: `pulseDot ${2.2 + i * 0.5}s ease infinite`,
              }} />
            ))}
            <div style={{ fontSize: 72, position: "relative", zIndex: 2, filter: "drop-shadow(0 0 24px rgba(99,102,241,0.75)) drop-shadow(0 0 60px rgba(6,182,212,0.3))", animation: "float 3s ease infinite" }}>🎮</div>
            <div style={{ position: "absolute", top: 12, left: 12 }} className="badge badge-live">LIMITED DROP</div>
            <div style={{ position: "absolute", top: 12, right: 12 }} className="badge badge-info">FULL STACK</div>
          </div>

          <div style={{ padding: "22px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
              <div>
                <h2 style={{ fontFamily: "'Orbitron', monospace", fontSize: 20, fontWeight: 700, color: "var(--text)", marginBottom: 3 }}>Gaming Console</h2>
                <div style={{ color: "var(--muted2)", fontSize: 13 }}>Midnight Edition — ACM MPSTME Exclusive</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontFamily: "'Orbitron', monospace", fontSize: 24, fontWeight: 900, background: "linear-gradient(135deg, #e2e8f0, #94a3b8)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>₹29,999</div>
                <div style={{ fontSize: 12, color: "var(--muted)", textDecoration: "line-through" }}>₹49,999</div>
              </div>
            </div>

            {/* Stock bar */}
            <div style={{ marginBottom: 18 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 7 }}>
                <span style={{ fontSize: 13, color: "var(--muted2)" }}>Stock remaining</span>
                <span style={{
                  fontFamily: "'Orbitron', monospace", fontSize: 17, fontWeight: 700, color: stockColor,
                  animation: pulseStock ? "glow 0.5s ease" : "none", transition: "color 0.4s",
                }}>{stats?.inventory ?? "-"}</span>
              </div>
              <div className="stock-bar">
                <div className="stock-fill" style={{ width: `${stockPct}%`, background: `linear-gradient(90deg, ${stockColor}, ${stockColor}99)` }} />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 5 }}>
                <span style={{ fontSize: 11, color: "var(--muted)" }}>{stats?.totalOrders ?? "-"} sold</span>
                <span style={{ fontSize: 11, color: "var(--muted)" }}>{stats?.initialStock ?? "-"} total</span>
              </div>
            </div>

            <button className="btn-buy" onClick={buy} disabled={buying || soldOut || !dropLive}>
              {!dropLive ? `DROP IN ${countdown}s` : soldOut ? "SOLD OUT" : buying ? "PROCESSING..." : "BUY NOW — ₹29,999"}
            </button>

            {result && (
              <div style={{
                marginTop: 12, padding: "12px 16px", borderRadius: 10,
                background: result.type === "success" ? "rgba(16,185,129,0.09)" : "rgba(239,68,68,0.09)",
                border: `1px solid ${result.type === "success" ? "rgba(16,185,129,0.25)" : "rgba(239,68,68,0.25)"}`,
                color: result.type === "success" ? "#34d399" : "#f87171",
                fontSize: 14, fontWeight: 500, animation: "scaleIn 0.3s ease",
                display: "flex", alignItems: "center", gap: 10,
              }}>
                {result.type === "success" ? (
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="8" fill="#10b981" opacity=".15"/><path d="M5 8l2.5 2.5L11 5" stroke="#34d399" strokeWidth="1.5" strokeLinecap="round"/></svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="8" fill="#ef4444" opacity=".15"/><path d="M5.5 5.5l5 5M10.5 5.5l-5 5" stroke="#f87171" strokeWidth="1.5" strokeLinecap="round"/></svg>
                )}
                {result.message}
              </div>
            )}
          </div>
        </div>

        {/* Right column */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div className="anim-fade anim-delay-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
            {[
              { val: stats?.inventory ?? "-", lbl: "In Stock", color: stockColor },
              { val: stats?.totalOrders ?? "-", lbl: "Orders", color: "#818cf8" },
              { val: stats?.initialStock ?? "-", lbl: "Total Units", color: "var(--muted3)" },
              { val: stats ? `${Math.round((1 - stats.inventory / stats.initialStock) * 100)}%` : "-", lbl: "Sold Out", color: "#fbbf24" },
            ].map(s => (
              <div key={s.lbl} className="stat-card">
                <div className="stat-val" style={{ color: s.color as string, fontSize: 22 }}>{s.val}</div>
                <div className="stat-lbl">{s.lbl}</div>
              </div>
            ))}
          </div>

          {/* System status */}
          <div className="card anim-fade anim-delay-3">
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--muted2)", marginBottom: 12 }}>System Status</div>
            {[
              { label: "Inventory Lock", status: "Atomic ✓", color: "var(--success2)" },
              { label: "Concurrency", status: "Protected ✓", color: "var(--success2)" },
              { label: "API Latency", status: "~80ms", color: "#22d3ee" },
              { label: "ARIA Assistant", status: "Online ✓", color: "var(--success2)" },
            ].map(item => (
              <div key={item.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "7px 0", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                <span style={{ fontSize: 13, color: "var(--muted2)", display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ color: item.color, fontSize: 9 }}>●</span>{item.label}
                </span>
                <span style={{ fontSize: 11, color: item.color, fontWeight: 600 }}>{item.status}</span>
              </div>
            ))}
          </div>

          {/* How it works */}
          <div className="card anim-fade anim-delay-4">
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--muted2)", marginBottom: 12 }}>How It Works</div>
            {["Wait for the countdown", "Click Buy Now instantly", "Atomic lock prevents oversell", "First 10 win the unit"].map((step, i) => (
              <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 9 }}>
                <div style={{ width: 20, height: 20, borderRadius: "50%", background: "rgba(99,102,241,0.2)", border: "1px solid rgba(99,102,241,0.4)", color: "#818cf8", fontSize: 11, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>{i + 1}</div>
                <span style={{ fontSize: 13, color: "var(--muted2)", lineHeight: 1.5 }}>{step}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <AIChat page="home" />
      <style>{`@keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-7px)} }`}</style>
    </div>
  );
}
