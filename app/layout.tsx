"use client";
import "./globals.css";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("dz_user");
    if (stored) setUser(JSON.parse(stored));
    else if (pathname !== "/login") router.push("/login");
  }, [pathname]);

  const logout = () => {
    localStorage.removeItem("dz_user");
    setUser(null);
    router.push("/login");
  };

  if (pathname === "/login") return (
    <html lang="en">
      <head><title>DropZone — Login</title></head>
      <body>
        <div className="orb1" /><div className="orb2" />
        {children}
      </body>
    </html>
  );

  const links = [
    { href: "/", label: "Drop", icon: "🔥" },
    { href: "/orders", label: "Orders", icon: "📦" },
    { href: "/admin", label: "Admin", icon: "⚡" },
    { href: "/test", label: "Stress Test", icon: "🧪" },
  ];

  return (
    <html lang="en">
      <head><title>DropZone — Midnight Product Drop</title></head>
      <body>
        <div className="orb1" /><div className="orb2" />
        <nav className="nav">
          <div className="nav-logo">DROPZONE</div>
          <div className="nav-links">
            {links.map(l => (
              <Link key={l.href} href={l.href} className={`nav-link ${pathname === l.href ? "active" : ""}`}>
                {l.icon} {l.label}
              </Link>
            ))}
          </div>
          <div className="nav-user">
            {user && (
              <>
                <div className="avatar">{user.name.slice(0, 2).toUpperCase()}</div>
                <span style={{ fontSize: 13 }}>{user.name}</span>
                <button onClick={logout} className="btn btn-ghost" style={{ padding: "5px 12px", fontSize: 12 }}>
                  Logout
                </button>
              </>
            )}
          </div>
        </nav>
        <div className="page">{children}</div>
      </body>
    </html>
  );
}
