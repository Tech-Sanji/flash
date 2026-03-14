"use client";
import { useState, useRef, useEffect } from "react";

interface Message { role: "user" | "assistant"; content: string; }

export default function AIChat({ page }: { page: string }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Hi! I'm ARIA, your AI assistant for DropZone. Ask me about the sale, inventory, queue system, or architecture! ✦" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const send = async () => {
    const q = input.trim();
    if (!q || loading) return;
    setInput("");
    const updated = [...messages, { role: "user" as const, content: q }];
    setMessages(updated);
    setLoading(true);
    try {
      const res = await fetch("/api/ai", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: updated.map(m => ({ role: m.role, content: m.content })), page }),
      });
      const data = await res.json();
      setMessages([...updated, { role: "assistant", content: data.reply }]);
    } catch {
      setMessages([...updated, { role: "assistant", content: "Connection error. Please try again." }]);
    }
    setLoading(false);
  };

  const suggestions = ["How does buying work?", "How many units left?", "Explain atomic lock", "Show order stats"];

  return (
    <>
      {/* Floating button */}
      <button onClick={() => setOpen(!open)} style={{
        position: "fixed", bottom: 24, right: 24, zIndex: 1000,
        width: 52, height: 52, borderRadius: "50%",
        background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
        border: "1px solid rgba(99,102,241,0.5)",
        cursor: "pointer", fontSize: 20,
        boxShadow: "0 0 28px rgba(99,102,241,0.45)",
        transition: "transform 0.2s, box-shadow 0.2s",
        display: "flex", alignItems: "center", justifyContent: "center", color: "#fff",
      }}
        onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.transform = "scale(1.12)"; (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 0 42px rgba(99,102,241,0.65)"; }}
        onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)"; (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 0 28px rgba(99,102,241,0.45)"; }}
      >
        {open ? "✕" : "✦"}
      </button>

      {/* Panel */}
      {open && (
        <div style={{
          position: "fixed", bottom: 88, right: 24, zIndex: 999,
          width: 360, background: "rgba(8,8,26,0.97)", border: "1px solid rgba(99,102,241,0.25)",
          borderRadius: 16, display: "flex", flexDirection: "column", height: 480,
          boxShadow: "0 24px 60px rgba(0,0,0,0.6), 0 0 40px rgba(99,102,241,0.08)",
          animation: "fadeInUp 0.2s ease", overflow: "hidden",
        }}>
          {/* Glow top */}
          <div style={{ height: 2, background: "linear-gradient(90deg, transparent, rgba(99,102,241,0.65), rgba(6,182,212,0.85), rgba(139,92,246,0.5), transparent)", flexShrink: 0 }} />

          {/* Header */}
          <div style={{ padding: "12px 16px", borderBottom: "1px solid rgba(99,102,241,0.12)", display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
            <div style={{ width: 32, height: 32, borderRadius: "50%", background: "linear-gradient(135deg, #6366f1, #06b6d4)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, border: "1px solid rgba(99,102,241,0.4)" }}>✦</div>
            <div>
              <div style={{ fontWeight: 600, fontSize: 14, color: "var(--text)" }}>ARIA</div>
              <div style={{ fontSize: 10, color: "#34d399", display: "flex", alignItems: "center", gap: 4 }}>
                <span className="pulse-dot" style={{ width: 5, height: 5, color: "#34d399" }} />
                AI Assistant · Online
              </div>
            </div>
            <span className="badge badge-info" style={{ marginLeft: "auto", fontSize: 9 }}>Claude API</span>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: "auto", padding: "12px 14px", display: "flex", flexDirection: "column" }}>
            {messages.map((m, i) => (
              <div key={i} className={m.role === "assistant" ? "ai-msg-bot" : "ai-msg-user"}>
                {m.content}
              </div>
            ))}
            {loading && (
              <div className="ai-msg-bot" style={{ display: "flex", gap: 5, alignItems: "center" }}>
                {[0,1,2].map(i => <span key={i} style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--muted2)", animation: `pulseDot 1.2s ${i*0.2}s infinite`, display: "inline-block" }} />)}
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Suggestions */}
          <div style={{ padding: "6px 12px 8px", display: "flex", gap: 5, overflowX: "auto", flexShrink: 0 }}>
            {suggestions.map(s => (
              <button key={s} onClick={() => setInput(s)} style={{
                background: "rgba(255,255,255,0.03)", border: "1px solid var(--border)", color: "var(--muted2)",
                borderRadius: 20, padding: "3px 10px", fontSize: 10, cursor: "pointer", whiteSpace: "nowrap",
                fontFamily: "'DM Sans', sans-serif", transition: "border-color 0.2s",
              }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = "rgba(99,102,241,0.4)")}
                onMouseLeave={e => (e.currentTarget.style.borderColor = "rgba(99,102,241,0.12)")}
              >{s}</button>
            ))}
          </div>

          {/* Input */}
          <div style={{ padding: "8px 12px 12px", borderTop: "1px solid rgba(99,102,241,0.1)", display: "flex", gap: 8, flexShrink: 0 }}>
            <input className="input" value={input} onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && send()}
              placeholder="Ask ARIA anything..." style={{ fontSize: 12, padding: "8px 12px" }} />
            <button onClick={send} className="btn btn-primary" style={{ padding: "8px 14px", fontSize: 13, flexShrink: 0 }}>↑</button>
          </div>
        </div>
      )}
    </>
  );
}
