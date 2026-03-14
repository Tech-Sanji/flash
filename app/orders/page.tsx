"use client";
import { useEffect, useState } from "react";
import AIChat from "@/components/AIChat";

interface Order { id: number; product: string; price: number; userId: string; userName: string; time: string; timestamp: number; }

const AVATAR_GRADIENTS = [
  "linear-gradient(135deg,#6366f1,#8b5cf6)",
  "linear-gradient(135deg,#0891b2,#0e7490)",
  "linear-gradient(135deg,#7c3aed,#6d28d9)",
  "linear-gradient(135deg,#be185d,#9d174d)",
  "linear-gradient(135deg,#059669,#047857)",
  "linear-gradient(135deg,#d97706,#b45309)",
];

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchOrders = async () => {
    const res = await fetch("/api/stats");
    const data = await res.json();
    setOrders(data.orders.slice().reverse());
    setLoading(false);
  };

  useEffect(() => { fetchOrders(); const iv = setInterval(fetchOrders, 3000); return () => clearInterval(iv); }, []);

  const filtered = orders.filter(o =>
    o.userName.toLowerCase().includes(search.toLowerCase()) || String(o.id).includes(search)
  );
  const totalRevenue = orders.reduce((a, o) => a + o.price, 0);

  return (
    <div style={{ padding: "2rem", maxWidth: 1100, margin: "0 auto" }}>
      <div className="anim-fade" style={{ marginBottom: "1.5rem" }}>
        <h1 style={{ fontFamily: "'Orbitron', monospace", fontSize: 26, fontWeight: 700, marginBottom: 5 }}>
          Order{" "}
          <span style={{ background: "linear-gradient(135deg,#818cf8,#06b6d4)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>History</span>
        </h1>
        <p style={{ color: "var(--muted2)", fontSize: 13 }}>Successful purchases — proof the system records correctly</p>
      </div>

      <div className="anim-fade anim-delay-1" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "1rem", marginBottom: "1.5rem" }}>
        {[
          { val: orders.length, lbl: "Total Orders", color: "#818cf8" },
          { val: `₹${totalRevenue.toLocaleString("en-IN")}`, lbl: "Total Revenue", color: "#34d399" },
          { val: orders.length > 0 ? orders[orders.length - 1]?.time : "—", lbl: "Last Order", color: "#fbbf24" },
        ].map(s => (
          <div key={s.lbl} className="stat-card">
            <div className="stat-val" style={{ color: s.color, fontSize: 20 }}>{s.val}</div>
            <div className="stat-lbl">{s.lbl}</div>
          </div>
        ))}
      </div>

      <div className="card-glow anim-fade anim-delay-2" style={{ padding: 0, overflow: "hidden" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 18px", borderBottom: "1px solid var(--border)" }}>
          <div style={{ fontWeight: 600, fontSize: 14, color: "var(--text)" }}>All Orders</div>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <input className="input" placeholder="Search by name or ID..." value={search} onChange={e => setSearch(e.target.value)} style={{ width: 220, fontSize: 12, padding: "7px 12px" }} />
            <button onClick={fetchOrders} className="btn btn-ghost" style={{ padding: "7px 14px", fontSize: 12 }}>↻ Refresh</button>
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: "3rem", color: "var(--muted2)" }}>Loading orders...</div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "3rem" }}>
            <div style={{ fontSize: 38, marginBottom: 12 }}>📦</div>
            <div style={{ color: "var(--muted2)", fontSize: 14 }}>{orders.length === 0 ? "No orders yet. Run the drop!" : "No orders match."}</div>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Order ID</th><th>Buyer</th><th>Product</th><th>Price</th><th>Time</th><th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((o, i) => (
                  <tr key={o.id} style={{ animation: `fadeInUp 0.3s ${i * 0.03}s both` }}>
                    <td><span style={{ fontFamily: "monospace", fontSize: 13, color: "#818cf8" }}>#{String(o.id).padStart(4, "0")}</span></td>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                        <div style={{ width: 30, height: 30, borderRadius: "50%", background: AVATAR_GRADIENTS[i % AVATAR_GRADIENTS.length], display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, color: "#fff", flexShrink: 0 }}>
                          {o.userName.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 500, color: "var(--text)" }}>{o.userName}</div>
                          <div style={{ fontSize: 11, color: "var(--muted2)" }}>{o.userId}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ fontSize: 13 }}>{o.product.split("—")[0].trim()}</td>
                    <td style={{ fontFamily: "monospace", color: "#34d399", fontSize: 13 }}>₹{o.price.toLocaleString("en-IN")}</td>
                    <td><span style={{ fontFamily: "monospace", fontSize: 12, color: "var(--muted2)" }}>{o.time}</span></td>
                    <td><span className="badge badge-success">✓ Confirmed</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <AIChat page="orders" />
    </div>
  );
}
