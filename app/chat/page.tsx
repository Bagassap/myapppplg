"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Search, Plus, MessageCircle, Send, ChevronLeft,
  Check, CheckCheck, Loader2, Users, X,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
interface OtherUser { id: number; name: string | null; role: string; }
interface LastMessage { id: number; content: string; senderId: number; isRead: boolean; createdAt: string; }
interface Conversation { id: number; otherUser: OtherUser | null; lastMessage: LastMessage | null; unreadCount: number; updatedAt: string; }
interface Message { id: number; conversationId: number; senderId: number; content: string; isRead: boolean; readAt: string | null; createdAt: string; sender: { id: number; name: string | null; role: string }; }
interface Recipient { id: number; name: string; username: string; kelas: string; tempatPKL: string; }

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatTime(iso: string) {
  const d = new Date(iso), now = new Date();
  const diffMin = Math.floor((now.getTime() - d.getTime()) / 60000);
  const diffDay = Math.floor(diffMin / 1440);
  if (diffMin < 1) return "Baru saja";
  if (diffMin < 60) return `${diffMin}m`;
  if (diffDay < 1) return d.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
  if (diffDay === 1) return "Kemarin";
  if (diffDay < 7) return d.toLocaleDateString("id-ID", { weekday: "short" });
  return d.toLocaleDateString("id-ID", { day: "numeric", month: "short" });
}

function formatFullTime(iso: string) {
  return new Date(iso).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
}

function formatDateDivider(iso: string) {
  const d = new Date(iso), now = new Date();
  const diffDay = Math.floor((now.getTime() - d.getTime()) / 86400000);
  if (diffDay === 0) return "Hari Ini";
  if (diffDay === 1) return "Kemarin";
  return d.toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
}

function getInitials(name: string | null) {
  if (!name) return "?";
  return name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
}

function getAvatarColor(name: string | null) {
  const colors = ["#6366f1","#8b5cf6","#ec4899","#f59e0b","#10b981","#3b82f6","#ef4444","#14b8a6","#f97316","#84cc16"];
  if (!name) return colors[0];
  return colors[name.charCodeAt(0) % colors.length];
}

function groupByDate(messages: Message[]) {
  const groups: { date: string; messages: Message[] }[] = [];
  let lastDate = "";
  for (const m of messages) {
    const d = new Date(m.createdAt).toDateString();
    if (d !== lastDate) { groups.push({ date: m.createdAt, messages: [m] }); lastDate = d; }
    else groups[groups.length - 1].messages.push(m);
  }
  return groups;
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function ChatPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [activeConv, setActiveConv] = useState<Conversation | null>(null);
  const [messageInput, setMessageInput] = useState("");
  const [sending, setSending] = useState(false);
  const [loadingConvs, setLoadingConvs] = useState(true);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showNewChat, setShowNewChat] = useState(false);
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [recipientSearch, setRecipientSearch] = useState("");
  const [showMobile, setShowMobile] = useState<"list" | "chat">("list");

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const userId = Number(session?.user?.id);
  const role = session?.user?.role as string;
  const canStartChat = role === "ADMIN" || role === "GURU";
  const activeConvId = activeConv?.id;

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  const loadConversations = useCallback(async () => {
    try {
      const r = await fetch("/api/chat/conversations");
      if (r.ok) setConversations(await r.json());
    } finally {
      setLoadingConvs(false);
    }
  }, []);

  useEffect(() => {
    if (status === "authenticated") loadConversations();
  }, [status, loadConversations]);

  // Polling daftar percakapan setiap 3 detik
  useEffect(() => {
    if (status !== "authenticated") return;
    const id = setInterval(loadConversations, 3000);
    return () => clearInterval(id);
  }, [status, loadConversations]);

  // SSE real-time untuk pesan aktif
  useEffect(() => {
    if (!activeConvId) return;
    const es = new EventSource(`/api/chat/stream?conversationId=${activeConvId}`);
    es.onmessage = (e) => {
      try {
        const msgs: Message[] = JSON.parse(e.data);
        setMessages(msgs);
        setConversations((prev) =>
          prev.map((c) => (c.id === activeConvId ? { ...c, unreadCount: 0 } : c))
        );
        setLoadingMsgs(false);
        setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
      } catch { /* ignore parse errors */ }
    };
    es.onerror = () => es.close();
    return () => es.close();
  }, [activeConvId]);

  const selectConversation = (conv: Conversation) => {
    setActiveConv(conv);
    setMessages([]);
    setLoadingMsgs(true);
    setShowMobile("chat");
    setTimeout(() => inputRef.current?.focus(), 150);
  };

  const handleSend = async () => {
    if (!activeConv || !messageInput.trim() || sending) return;
    setSending(true);
    const content = messageInput.trim();
    setMessageInput("");
    // reset textarea height
    if (inputRef.current) { inputRef.current.style.height = "auto"; }
    try {
      const r = await fetch("/api/chat/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId: activeConv.id, content }),
      });
      if (r.ok) {
        const msg = await r.json();
        setMessages((prev) => [...prev, msg]);
        setConversations((prev) =>
          prev
            .map((c) => c.id === activeConv.id ? { ...c, lastMessage: msg, updatedAt: msg.createdAt } : c)
            .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
        );
        setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
      }
    } catch {
      setMessageInput(content);
    } finally {
      setSending(false);
    }
  };

  const handleKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const loadRecipients = async () => {
    const r = await fetch("/api/chat/recipients");
    if (r.ok) setRecipients(await r.json());
  };

  const startChat = async (targetId: number) => {
    const r = await fetch("/api/chat/conversations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ targetId }),
    });
    if (r.ok) {
      const { conversationId } = await r.json();
      setShowNewChat(false);
      setRecipientSearch("");
      const res = await fetch("/api/chat/conversations");
      if (res.ok) {
        const convs: Conversation[] = await res.json();
        setConversations(convs);
        const fresh = convs.find((c) => c.id === conversationId);
        if (fresh) selectConversation(fresh);
      }
    }
  };

  const filteredConvs = conversations.filter(
    (c) => !searchQuery || (c.otherUser?.name ?? "").toLowerCase().includes(searchQuery.toLowerCase())
  );
  const filteredRecipients = recipients.filter(
    (r) => !recipientSearch ||
      r.name.toLowerCase().includes(recipientSearch.toLowerCase()) ||
      r.username.toLowerCase().includes(recipientSearch.toLowerCase()) ||
      r.kelas.toLowerCase().includes(recipientSearch.toLowerCase())
  );
  const grouped = groupByDate(messages);

  if (status === "loading") {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", background: "#00182E" }}>
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: "#ACEC00" }} />
      </div>
    );
  }

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden", background: "#00182E" }}>

      {/* ── SIDEBAR ── */}
      <div
        className="md:flex"
        style={{
          display: showMobile === "chat" ? "none" : "flex",
          flexDirection: "column",
          width: "320px",
          flexShrink: 0,
          background: "#00182E",
          borderRight: "1px solid #013FF6",
        }}
      >
        {/* Sidebar Header */}
        <div style={{ padding: "20px", borderBottom: "1px solid #013FF6", background: "#00182E" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
            <span style={{ color: "#ACEC00", fontWeight: "bold", fontSize: "20px" }}>💬 Chat</span>
            {canStartChat && (
              <button
                onClick={() => { setShowNewChat(true); loadRecipients(); }}
                title="Chat baru"
                style={{ background: "#013FF6", color: "#ffffff", border: "none", borderRadius: "8px", width: "32px", height: "32px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
              >
                <Plus style={{ width: "16px", height: "16px" }} />
              </button>
            )}
          </div>
          <div style={{ position: "relative" }}>
            <Search style={{ width: "14px", height: "14px", position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "rgba(255,255,255,0.35)", pointerEvents: "none" }} />
            <input
              type="text"
              placeholder="Cari percakapan..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ width: "100%", paddingLeft: "36px", paddingRight: "12px", paddingTop: "9px", paddingBottom: "9px", background: "#012444", border: "1px solid #013FF6", borderRadius: "10px", color: "#ffffff", outline: "none", fontSize: "13px", boxSizing: "border-box" }}
            />
          </div>
        </div>

        {/* Conversation List */}
        <div style={{ flex: 1, overflowY: "auto" }}>
          {loadingConvs ? (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "80px", gap: "8px" }}>
              <Loader2 className="w-4 h-4 animate-spin" style={{ color: "#ACEC00" }} />
              <span style={{ color: "rgba(255,255,255,0.4)", fontSize: "13px" }}>Memuat...</span>
            </div>
          ) : filteredConvs.length === 0 ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "160px", gap: "10px", padding: "0 20px", textAlign: "center" }}>
              <MessageCircle style={{ width: "36px", height: "36px", color: "rgba(255,255,255,0.12)" }} />
              <span style={{ color: "rgba(255,255,255,0.4)", fontSize: "13px" }}>Belum ada percakapan</span>
              {canStartChat && <span style={{ color: "rgba(172,236,0,0.65)", fontSize: "12px" }}>Klik + untuk chat baru</span>}
            </div>
          ) : (
            filteredConvs.map((conv) => (
              <ConvItem
                key={conv.id}
                conv={conv}
                isActive={activeConv?.id === conv.id}
                currentUserId={userId}
                onClick={() => selectConversation(conv)}
              />
            ))
          )}
        </div>
      </div>

      {/* ── CHAT AREA ── */}
      <div
        className="md:flex"
        style={{ flex: 1, display: showMobile === "list" ? "none" : "flex", flexDirection: "column" }}
      >
        {activeConv ? (
          <>
            {/* Chat Header */}
            <div style={{ background: "#00182E", padding: "16px 24px", borderBottom: "2px solid #ACEC00", display: "flex", alignItems: "center", gap: "12px", flexShrink: 0 }}>
              <button
                onClick={() => { setShowMobile("list"); setActiveConv(null); }}
                className="md:hidden"
                style={{ color: "rgba(255,255,255,0.6)", background: "transparent", border: "none", cursor: "pointer", padding: "4px", borderRadius: "6px", display: "flex" }}
              >
                <ChevronLeft style={{ width: "20px", height: "20px" }} />
              </button>
              <div style={{ width: "42px", height: "42px", borderRadius: "50%", background: getAvatarColor(activeConv.otherUser?.name ?? null), display: "flex", alignItems: "center", justifyContent: "center", color: "#ffffff", fontWeight: "bold", fontSize: "14px", flexShrink: 0 }}>
                {getInitials(activeConv.otherUser?.name ?? null)}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ color: "#ffffff", fontWeight: "bold", fontSize: "18px", margin: 0, lineHeight: 1.2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {activeConv.otherUser?.name ?? "Pengguna"}
                </p>
                <span style={{ color: "#ACEC00", fontSize: "12px" }}>
                  {activeConv.otherUser?.role === "GURU" ? "Guru" : activeConv.otherUser?.role === "ADMIN" ? "Admin" : "Siswa"}
                </span>
              </div>
            </div>

            {/* Messages Area */}
            <div style={{ flex: 1, overflowY: "auto", padding: "24px", display: "flex", flexDirection: "column", gap: "4px", background: "#010d1a" }}>
              {loadingMsgs ? (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%" }}>
                  <Loader2 className="w-6 h-6 animate-spin" style={{ color: "#ACEC00" }} />
                </div>
              ) : messages.length === 0 ? (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", gap: "12px" }}>
                  <MessageCircle style={{ width: "48px", height: "48px", color: "#013FF6" }} />
                  <p style={{ color: "rgba(255,255,255,0.45)", fontSize: "14px", margin: 0 }}>Mulai percakapan</p>
                  <p style={{ color: "rgba(255,255,255,0.25)", fontSize: "12px", margin: 0 }}>
                    Kirim pesan pertamamu ke {activeConv.otherUser?.name}
                  </p>
                </div>
              ) : (
                grouped.map((group, gi) => (
                  <div key={gi}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", margin: "16px 0" }}>
                      <span style={{ background: "#012444", color: "rgba(255,255,255,0.45)", padding: "4px 14px", borderRadius: "20px", fontSize: "11px", border: "1px solid #013FF6" }}>
                        {formatDateDivider(group.date)}
                      </span>
                    </div>
                    {group.messages.map((msg, mi) => (
                      <MessageBubble
                        key={msg.id}
                        message={msg}
                        isOwn={msg.senderId === userId}
                        showAvatar={mi === 0 || group.messages[mi - 1]?.senderId !== msg.senderId}
                      />
                    ))}
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div style={{ background: "#00182E", padding: "16px 24px", borderTop: "2px solid #ACEC00", display: "flex", gap: "12px", alignItems: "flex-end", flexShrink: 0 }}>
              <textarea
                ref={inputRef}
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                onKeyDown={handleKey}
                placeholder="Ketik pesan..."
                rows={1}
                style={{ flex: 1, background: "#012444", border: "1px solid #013FF6", borderRadius: "24px", padding: "10px 20px", color: "#ffffff", outline: "none", fontSize: "14px", resize: "none", lineHeight: 1.5, maxHeight: "120px", overflowY: "auto", fontFamily: "inherit" }}
                onInput={(e) => {
                  const t = e.currentTarget;
                  t.style.height = "auto";
                  t.style.height = Math.min(t.scrollHeight, 120) + "px";
                }}
              />
              <button
                onClick={handleSend}
                disabled={!messageInput.trim() || sending}
                style={{ background: !messageInput.trim() || sending ? "rgba(172,236,0,0.35)" : "#ACEC00", color: "#00182E", border: "none", borderRadius: "50%", width: "44px", height: "44px", cursor: !messageInput.trim() || sending ? "not-allowed" : "pointer", fontWeight: "bold", fontSize: "18px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "background 0.15s" }}
              >
                {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send style={{ width: "18px", height: "18px" }} />}
              </button>
            </div>
          </>
        ) : (
          // Empty state — belum pilih percakapan
          <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "16px", background: "#010d1a" }}>
            <div style={{ width: "80px", height: "80px", borderRadius: "20px", background: "#012444", border: "2px solid #013FF6", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <MessageCircle style={{ width: "40px", height: "40px", color: "#013FF6" }} />
            </div>
            <div style={{ textAlign: "center" }}>
              <h2 style={{ color: "#ffffff", fontWeight: "bold", fontSize: "20px", margin: "0 0 8px" }}>Pilih Percakapan</h2>
              <p style={{ color: "rgba(255,255,255,0.35)", fontSize: "14px", margin: 0 }}>
                {canStartChat ? "Pilih percakapan atau klik + untuk chat baru" : "Pilih percakapan untuk mulai membaca"}
              </p>
            </div>
            {canStartChat && (
              <button
                onClick={() => { setShowNewChat(true); loadRecipients(); }}
                style={{ background: "#ACEC00", color: "#00182E", border: "none", borderRadius: "10px", padding: "10px 24px", fontWeight: "bold", fontSize: "14px", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px" }}
              >
                <Plus style={{ width: "16px", height: "16px" }} /> Chat Baru
              </button>
            )}
          </div>
        )}
      </div>

      {/* ── MODAL: NEW CHAT ── */}
      {showNewChat && (
        <div style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: "16px", background: "rgba(0,0,0,0.65)", backdropFilter: "blur(4px)" }}>
          <div style={{ background: "#00182E", border: "1px solid #013FF6", borderRadius: "16px", boxShadow: "0 20px 60px rgba(0,0,0,0.6)", width: "100%", maxWidth: "420px", overflow: "hidden" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 24px", borderBottom: "1px solid #013FF6" }}>
              <div>
                <h3 style={{ color: "#ACEC00", fontWeight: "bold", fontSize: "16px", margin: 0 }}>Chat Baru</h3>
                <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "12px", margin: "4px 0 0" }}>
                  {role === "GURU" ? "Pilih siswa yang Anda bimbing" : "Pilih siswa"}
                </p>
              </div>
              <button
                onClick={() => { setShowNewChat(false); setRecipientSearch(""); }}
                style={{ background: "transparent", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.45)", display: "flex", padding: "4px", borderRadius: "6px" }}
              >
                <X style={{ width: "18px", height: "18px" }} />
              </button>
            </div>
            <div style={{ padding: "16px 24px", borderBottom: "1px solid #013FF6" }}>
              <div style={{ position: "relative" }}>
                <Search style={{ width: "14px", height: "14px", position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "rgba(255,255,255,0.35)" }} />
                <input
                  type="text"
                  placeholder="Cari nama, NIS, kelas..."
                  value={recipientSearch}
                  onChange={(e) => setRecipientSearch(e.target.value)}
                  autoFocus
                  style={{ width: "100%", paddingLeft: "36px", paddingRight: "12px", paddingTop: "9px", paddingBottom: "9px", background: "#012444", border: "1px solid #013FF6", borderRadius: "10px", color: "#ffffff", outline: "none", fontSize: "13px", boxSizing: "border-box" }}
                />
              </div>
            </div>
            <div style={{ overflowY: "auto", maxHeight: "300px" }}>
              {filteredRecipients.length === 0 ? (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 20px", gap: "10px" }}>
                  <Users style={{ width: "32px", height: "32px", color: "rgba(255,255,255,0.15)" }} />
                  <p style={{ color: "rgba(255,255,255,0.35)", fontSize: "13px", margin: 0 }}>Tidak ada siswa ditemukan</p>
                </div>
              ) : (
                filteredRecipients.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => startChat(r.id)}
                    style={{ width: "100%", display: "flex", alignItems: "center", gap: "12px", padding: "12px 24px", background: "transparent", border: "none", borderBottom: "1px solid rgba(1,63,246,0.25)", cursor: "pointer", textAlign: "left", transition: "background 0.15s" }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(1,63,246,0.12)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
                  >
                    <div style={{ width: "40px", height: "40px", borderRadius: "50%", background: getAvatarColor(r.name), display: "flex", alignItems: "center", justifyContent: "center", color: "#ffffff", fontWeight: "bold", fontSize: "13px", flexShrink: 0 }}>
                      {getInitials(r.name)}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ color: "#ffffff", fontWeight: 600, fontSize: "14px", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.name}</p>
                      <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "12px", margin: "2px 0 0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        NIS: {r.username} · {r.kelas}{r.tempatPKL !== "—" ? ` · ${r.tempatPKL}` : ""}
                      </p>
                    </div>
                    <MessageCircle style={{ width: "16px", height: "16px", color: "#013FF6", flexShrink: 0 }} />
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Conversation Item ────────────────────────────────────────────────────────
function ConvItem({
  conv, isActive, currentUserId, onClick,
}: { conv: Conversation; isActive: boolean; currentUserId: number; onClick: () => void; }) {
  const isMine = conv.lastMessage?.senderId === currentUserId;

  return (
    <button
      onClick={onClick}
      style={{
        width: "100%",
        display: "flex",
        alignItems: "center",
        gap: "12px",
        padding: "12px 16px",
        cursor: "pointer",
        textAlign: "left",
        background: isActive ? "#012444" : "transparent",
        borderTop: "none",
        borderRight: "none",
        borderBottom: "none",
        borderLeft: isActive ? "3px solid #ACEC00" : "3px solid transparent",
        transition: "background 0.15s",
        boxSizing: "border-box",
      }}
      onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.background = "#011f3a"; }}
      onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.background = "transparent"; }}
    >
      {/* Avatar */}
      <div style={{ position: "relative", flexShrink: 0 }}>
        <div style={{ width: "46px", height: "46px", borderRadius: "50%", background: getAvatarColor(conv.otherUser?.name ?? null), display: "flex", alignItems: "center", justifyContent: "center", color: "#ffffff", fontWeight: "bold", fontSize: "15px" }}>
          {getInitials(conv.otherUser?.name ?? null)}
        </div>
        {conv.unreadCount > 0 && (
          <span style={{ position: "absolute", top: "-2px", right: "-2px", minWidth: "18px", height: "18px", background: "#ACEC00", color: "#00182E", borderRadius: "50%", fontSize: "11px", fontWeight: "bold", display: "flex", alignItems: "center", justifyContent: "center", padding: "0 3px" }}>
            {conv.unreadCount > 99 ? "99+" : conv.unreadCount}
          </span>
        )}
      </div>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px" }}>
          <p style={{ color: "#ffffff", fontWeight: conv.unreadCount > 0 ? 700 : 600, fontSize: "14px", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {conv.otherUser?.name ?? "Pengguna"}
          </p>
          {conv.lastMessage && (
            <span style={{ color: conv.unreadCount > 0 ? "#ACEC00" : "rgba(255,255,255,0.3)", fontSize: "11px", flexShrink: 0, fontWeight: conv.unreadCount > 0 ? 600 : 400 }}>
              {formatTime(conv.lastMessage.createdAt)}
            </span>
          )}
        </div>
        {conv.lastMessage ? (
          <div style={{ display: "flex", alignItems: "center", gap: "4px", marginTop: "2px" }}>
            {isMine && (
              conv.lastMessage.isRead
                ? <CheckCheck style={{ width: "12px", height: "12px", color: "#ACEC00", flexShrink: 0 }} />
                : <Check style={{ width: "12px", height: "12px", color: "rgba(255,255,255,0.3)", flexShrink: 0 }} />
            )}
            <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "13px", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {isMine ? "Kamu: " : ""}{conv.lastMessage.content}
            </p>
          </div>
        ) : (
          <p style={{ color: "rgba(255,255,255,0.3)", fontSize: "13px", margin: "2px 0 0", fontStyle: "italic" }}>Belum ada pesan</p>
        )}
      </div>
    </button>
  );
}

// ─── Message Bubble ───────────────────────────────────────────────────────────
function MessageBubble({
  message, isOwn, showAvatar,
}: { message: Message; isOwn: boolean; showAvatar: boolean; }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: "8px", marginBottom: "4px", justifyContent: isOwn ? "flex-end" : "flex-start" }}>
      {/* Avatar lawan */}
      {!isOwn && (
        <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: getAvatarColor(message.sender.name), display: "flex", alignItems: "center", justifyContent: "center", color: "#ffffff", fontSize: "10px", fontWeight: "bold", flexShrink: 0, marginBottom: "2px", visibility: showAvatar ? "visible" : "hidden" }}>
          {getInitials(message.sender.name)}
        </div>
      )}

      <div style={{ maxWidth: "65%", display: "flex", flexDirection: "column", alignItems: isOwn ? "flex-end" : "flex-start" }}>
        {!isOwn && showAvatar && (
          <span style={{ color: "#ACEC00", fontSize: "11px", fontWeight: 600, marginBottom: "4px", marginLeft: "4px" }}>
            {message.sender.name}
          </span>
        )}

        {/* Bubble */}
        <div style={
          isOwn
            ? { alignSelf: "flex-end", background: "#013FF6", color: "#ffffff", padding: "10px 16px", borderRadius: "18px 18px 4px 18px", maxWidth: "100%", fontSize: "14px" }
            : { alignSelf: "flex-start", background: "#012444", color: "#ffffff", padding: "10px 16px", borderRadius: "18px 18px 18px 4px", maxWidth: "100%", fontSize: "14px", border: "1px solid #013FF6" }
        }>
          <p style={{ margin: 0, lineHeight: 1.5, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>{message.content}</p>
          <div style={{ display: "flex", alignItems: "center", gap: "4px", marginTop: "4px", justifyContent: isOwn ? "flex-end" : "flex-start" }}>
            <span style={{ color: "rgba(255,255,255,0.4)", fontSize: "11px" }}>
              {formatFullTime(message.createdAt)}
            </span>
            {isOwn && (
              message.isRead
                ? <CheckCheck style={{ width: "12px", height: "12px", color: "rgba(255,255,255,0.4)" }} />
                : <Check style={{ width: "12px", height: "12px", color: "rgba(255,255,255,0.3)" }} />
            )}
          </div>
        </div>
      </div>

      {isOwn && <div style={{ width: "28px", flexShrink: 0 }} />}
    </div>
  );
}
