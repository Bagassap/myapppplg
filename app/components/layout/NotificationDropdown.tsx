"use client";

import { useState, useEffect, useRef, useCallback } from "react";

interface Notif {
  id: string;
  type: "chat" | "informasi";
  title: string;
  body: string;
  isRead: boolean;
  createdAt: string;
  conversationId?: number;
  informasiId?: number;
}

const LS_KEY = "pplg-notif-read";

function getReadIds(): Set<string> {
  try { return new Set(JSON.parse(localStorage.getItem(LS_KEY) ?? "[]")); }
  catch { return new Set(); }
}
function saveReadIds(ids: Set<string>) {
  try { localStorage.setItem(LS_KEY, JSON.stringify([...ids])); }
  catch {}
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "Baru saja";
  if (m < 60) return `${m} menit lalu`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} jam lalu`;
  return new Date(iso).toLocaleDateString("id-ID", { day: "numeric", month: "short" });
}

export default function NotificationDropdown({ onOpenChat }: { onOpenChat?: (convId: number) => void }) {
  const [open, setOpen] = useState(false);
  const [notifs, setNotifs] = useState<Notif[]>([]);
  const [readIds, setReadIds] = useState<Set<string>>(new Set());
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setReadIds(getReadIds()); }, []);

  const fetchNotifs = useCallback(async () => {
    try {
      const res = await fetch("/api/notifications");
      if (res.ok) {
        const json = await res.json();
        if (json.success) setNotifs(json.data);
      }
    } catch {}
  }, []);

  useEffect(() => {
    fetchNotifs();
    const id = setInterval(fetchNotifs, 5000);
    return () => clearInterval(id);
  }, [fetchNotifs]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const markOne = useCallback((id: string, type: "chat" | "informasi", convId?: number) => {
    setReadIds((prev) => {
      const next = new Set(prev);
      next.add(id);
      saveReadIds(next);
      return next;
    });
    if (type === "chat" && convId) {
      fetch("/api/chat/read", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId: convId }),
      }).catch(() => {});
    }
  }, []);

  const markAll = useCallback(() => {
    const all = new Set([...readIds, ...notifs.map((n) => n.id)]);
    saveReadIds(all);
    setReadIds(all);
    notifs.filter((n) => n.type === "chat" && n.conversationId).forEach((n) => {
      fetch("/api/chat/read", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId: n.conversationId }),
      }).catch(() => {});
    });
  }, [notifs, readIds]);

  const merged = notifs.map((n) => ({ ...n, isRead: n.isRead || readIds.has(n.id) }));
  const unread = merged.filter((n) => !n.isRead).length;

  return (
    <div ref={dropdownRef} style={{ position: "relative" }}>
      {/* Bell button */}
      <button
        onClick={() => { setOpen((v) => !v); }}
        title="Notifikasi"
        style={{ position: "relative", background: "transparent", border: "none", cursor: "pointer", padding: "8px", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-primary)" }}
      >
        <span style={{ fontSize: "20px", lineHeight: 1 }}>🔔</span>
        {unread > 0 && (
          <span style={{ position: "absolute", top: "2px", right: "2px", background: "#ACEC00", color: "#00182E", borderRadius: "50%", minWidth: "16px", height: "16px", fontSize: "9px", fontWeight: "bold", display: "flex", alignItems: "center", justifyContent: "center", padding: "0 2px", lineHeight: 1 }}>
            {unread > 99 ? "99+" : unread}
          </span>
        )}
      </button>

      {/* Dropdown panel */}
      {open && (
        <div
          style={{ position: "absolute", top: "calc(100% + 8px)", right: 0, width: "360px", background: "var(--surface, #ffffff)", borderRadius: "16px", boxShadow: "0 8px 40px rgba(0,0,0,0.18)", zIndex: 1000, overflow: "hidden", border: "1px solid var(--bd, #e5e7eb)" }}
        >
          {/* Header */}
          <div style={{ background: "#00182E", padding: "14px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ color: "#ACEC00", fontWeight: 700, fontSize: "15px" }}>🔔 Notifikasi</span>
            {unread > 0 && (
              <button
                onClick={markAll}
                style={{ background: "transparent", border: "1px solid rgba(172,236,0,0.4)", color: "#ACEC00", borderRadius: "8px", padding: "3px 10px", fontSize: "11px", cursor: "pointer" }}
              >
                Tandai semua dibaca
              </button>
            )}
          </div>

          {/* List */}
          <div style={{ maxHeight: "380px", overflowY: "auto" }}>
            {merged.length === 0 ? (
              <div style={{ padding: "36px 20px", textAlign: "center" }}>
                <div style={{ fontSize: "36px", marginBottom: "8px" }}>🎉</div>
                <div style={{ color: "var(--text-secondary)", fontSize: "13px" }}>Tidak ada notifikasi baru</div>
              </div>
            ) : (
              merged.map((n) => (
                <div
                  key={n.id}
                  onClick={() => {
                    markOne(n.id, n.type, n.conversationId);
                    if (n.type === "chat" && n.conversationId && onOpenChat) {
                      onOpenChat(n.conversationId);
                      setOpen(false);
                    }
                  }}
                  style={{ padding: "12px 20px", borderBottom: "1px solid var(--bd, #f3f4f6)", background: n.isRead ? "transparent" : "rgba(172,236,0,0.05)", cursor: "pointer", display: "flex", gap: "12px", alignItems: "flex-start", transition: "background .15s" }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = n.isRead ? "rgba(0,0,0,0.03)" : "rgba(172,236,0,0.08)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = n.isRead ? "transparent" : "rgba(172,236,0,0.05)"; }}
                >
                  <span style={{ width: "34px", height: "34px", borderRadius: "10px", background: n.type === "chat" ? "#013FF6" : "#00182E", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px", flexShrink: 0 }}>
                    {n.type === "chat" ? "💬" : "📢"}
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ color: "var(--text-primary)", fontWeight: n.isRead ? 400 : 700, fontSize: "13px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {n.title}
                    </div>
                    <div style={{ color: "var(--text-secondary)", fontSize: "12px", marginTop: "2px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {n.body}
                    </div>
                    <div style={{ color: "rgba(1,63,246,0.6)", fontSize: "11px", marginTop: "3px" }}>
                      {timeAgo(n.createdAt)}
                    </div>
                  </div>
                  {!n.isRead && (
                    <div style={{ width: "8px", height: "8px", background: "#ACEC00", borderRadius: "50%", marginTop: "4px", flexShrink: 0 }} />
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
