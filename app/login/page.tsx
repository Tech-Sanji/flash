"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

const DEMO_USERS = [
  { email: "demo@dropzone.io", password: "drop2024", name: "Demo User" },
  { email: "admin@dropzone.io", password: "admin2024", name: "Admin" },
  { email: "judge@hackathon.io", password: "judge2024", name: "Judge" },
];

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const login = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    await new Promise(r => setTimeout(r, 700));
    const user = DEMO_USERS.find(u => u.email === email && u.password === password);
    if (user) {
      localStorage.setItem("dz_user", JSON.stringify({ name: user.name, email: user.email }));
      router.push("/");
    } else {
      setError("Invalid credentials. Use a quick login below.");
    }
    setLoading(false);
  };

  const quickLogin = (u: typeof DEMO_USERS[0]) => { setEmail(u.email); setPassword(u.password); };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem", position: "relative", zIndex: 1 }}>
      <div style={{ width: "100%", maxWidth: 420 }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: "2.5rem", animation: "fadeInUp 0.5s ease both" }}>
          <div style={{ fontFamily: "'Orbitron', monospace", fontSize: 34, fontWeight: 900, background: "linear-gradient(135deg, #818cf8, #06b6d4)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", marginBottom: 6, letterSpacing: "0.06em" }}>
            DROPZONE
          </div>
          <div style={{ color: "var(--muted2)", fontSize: 13 }}>ACM MPSTME · Midnight Product Drop Platform</div>
        </div>

        {/* Card */}
        <div className="card-glow" style={{ padding: "2rem", animation: "fadeInUp 0.5s 0.1s ease both" }}>
          <div style={{ marginBottom: "1.5rem" }}>
            <div style={{ fontSize: 19, fontWeight: 600, marginBottom: 3, color: "var(--text)" }}>Welcome back</div>
            <div style={{ color: "var(--muted2)", fontSize: 13 }}>Sign in to access the drop</div>
          </div>

          <form onSubmit={login} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div>
              <label style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--muted2)", display: "block", marginBottom: 6 }}>Email</label>
              <input className="input" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required />
            </div>
            <div>
              <label style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--muted2)", display: "block", marginBottom: 6 }}>Password</label>
              <input className="input" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required />
            </div>

            {error && (
              <div style={{ background: "rgba(239,68,68,0.09)", border: "1px solid rgba(239,68,68,0.25)", borderRadius: 8, padding: "10px 14px", fontSize: 13, color: "#f87171" }}>
                {error}
              </div>
            )}

            <button type="submit" className="btn btn-primary" style={{ marginTop: 4, padding: "13px", fontSize: 14, width: "100%", borderRadius: 9 }} disabled={loading}>
              {loading ? (
                <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ width: 15, height: 15, border: "2px solid rgba(255,255,255,0.25)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.8s linear infinite", display: "inline-block" }} />
                  Authenticating...
                </span>
              ) : "Sign In →"}
            </button>
          </form>

          {/* Divider */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "1.25rem 0" }}>
            <div style={{ flex: 1, height: 1, background: "linear-gradient(90deg, transparent, rgba(99,102,241,0.2))" }} />
            <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--muted)" }}>Quick login</span>
            <div style={{ flex: 1, height: 1, background: "linear-gradient(270deg, transparent, rgba(99,102,241,0.2))" }} />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {DEMO_USERS.map(u => (
              <button key={u.email} onClick={() => quickLogin(u)} className="btn btn-ghost" style={{ justifyContent: "space-between", padding: "9px 14px", fontSize: 12, cursor: "pointer", width: "100%" }}>
                <span style={{ fontWeight: 600, color: "var(--text)" }}>{u.name}</span>
                <span style={{ color: "var(--muted2)", fontFamily: "monospace", fontSize: 11 }}>{u.email}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
      <style>{`@keyframes fadeInUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} } @keyframes spin { to{transform:rotate(360deg)} }`}</style>
    </div>
  );
}
