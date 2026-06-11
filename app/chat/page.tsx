"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Search,
  Plus,
  MessageCircle,
  Send,
  ChevronLeft,
  Check,
  CheckCheck,
  Loader2,
  Users,
  X,
  MoreVertical,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
interface OtherUser {
  id: number;
  name: string | null;
  role: string;
}
interface LastMessage {
  id: number;
  content: string;
  senderId: number;
  isRead: boolean;
  createdAt: string;
}
interface Conversation {
  id: number;
  otherUser: OtherUser | null;
  lastMessage: LastMessage | null;
  unreadCount: number;
  updatedAt: string;
}
interface Message {
  id: number;
  conversationId: number;
  senderId: number;
  content: string;
  isRead: boolean;
  readAt: string | null;
  createdAt: string;
  sender: { id: number; name: string | null; role: string };
}
interface Recipient {
  id: number;
  name: string;
  username: string;
  kelas: string;
  tempatPKL: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatTime(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffDay = Math.floor(diffMs / 86400000);
  if (diffMin < 1) return "Baru saja";
  if (diffMin < 60) return `${diffMin}m`;
  if (diffDay < 1)
    return d.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
  if (diffDay === 1) return "Kemarin";
  if (diffDay < 7) return d.toLocaleDateString("id-ID", { weekday: "short" });
  return d.toLocaleDateString("id-ID", { day: "numeric", month: "short" });
}

function formatFullTime(iso: string) {
  return new Date(iso).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
}

function formatDateDivider(iso: string) {
  const d = new Date(iso);
  const now = new Date();
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
  const colors = [
    "#6366f1", "#8b5cf6", "#ec4899", "#f59e0b",
    "#10b981", "#3b82f6", "#ef4444", "#14b8a6",
    "#f97316", "#84cc16",
  ];
  if (!name) return colors[0];
  return colors[name.charCodeAt(0) % colors.length];
}

function getRoleBadge(role: string) {
  if (role === "ADMIN") return { label: "Admin", bg: "rgba(239,68,68,0.12)", fg: "#dc2626" };
  if (role === "GURU")  return { label: "Guru",  bg: "rgba(1,63,246,0.12)",  fg: "#013FF6" };
  return { label: "Siswa", bg: "rgba(172,236,0,0.2)", fg: "#00182E" };
}

function groupByDate(messages: Message[]) {
  const groups: { date: string; messages: Message[] }[] = [];
  let lastDate = "";
  for (const m of messages) {
    const d = new Date(m.createdAt).toDateString();
    if (d !== lastDate) {
      groups.push({ date: m.createdAt, messages: [m] });
      lastDate = d;
    } else {
      groups[groups.length - 1].messages.push(m);
    }
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
  const pollRef = useRef<NodeJS.Timeout | null>(null);

  const userId = Number(session?.user?.id);
  const role = session?.user?.role as string;

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

  // Polling percakapan setiap 2 detik
  useEffect(() => {
    if (status !== "authenticated") return;
    pollRef.current = setInterval(loadConversations, 2000);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [status, loadConversations]);

  const loadMessages = useCallback(async (convId: number) => {
    setLoadingMsgs(true);
    try {
      const r = await fetch(`/api/chat/messages?conversationId=${convId}`);
      if (r.ok) {
        setMessages(await r.json());
        setConversations((prev) =>
          prev.map((c) => (c.id === convId ? { ...c, unreadCount: 0 } : c)),
        );
      }
    } finally {
      setLoadingMsgs(false);
    }
  }, []);

  // Polling pesan setiap 2 detik
  useEffect(() => {
    if (!activeConv) return;
    const id = setInterval(() => loadMessages(activeConv.id), 2000);
    return () => clearInterval(id);
  }, [activeConv, loadMessages]);

  useEffect(() => {
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 60);
  }, [messages]);

  const selectConversation = (conv: Conversation) => {
    setActiveConv(conv);
    loadMessages(conv.id);
    setShowMobile("chat");
    setTimeout(() => inputRef.current?.focus(), 150);
  };

  const handleSend = async () => {
    if (!activeConv || !messageInput.trim() || sending) return;
    setSending(true);
    const content = messageInput.trim();
    setMessageInput("");
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
            .map((c) =>
              c.id === activeConv.id
                ? { ...c, lastMessage: msg, updatedAt: msg.createdAt }
                : c,
            )
            .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()),
        );
      }
    } catch {
      setMessageInput(content);
    } finally {
      setSending(false);
    }
  };

  const handleKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const loadRecipients = async () => {
    const r = await fetch("/api/chat/recipients");
    if (r.ok) setRecipients(await r.json());
  };

  const openNewChat = () => { setShowNewChat(true); loadRecipients(); };

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
      await loadConversations();
      const conv = conversations.find((c) => c.id === conversationId);
      if (conv) selectConversation(conv);
      else {
        const res = await fetch("/api/chat/conversations");
        if (res.ok) {
          const convs: Conversation[] = await res.json();
          setConversations(convs);
          const fresh = convs.find((c) => c.id === conversationId);
          if (fresh) selectConversation(fresh);
        }
      }
    }
  };

  const filteredConvs = conversations.filter(
    (c) => !searchQuery || (c.otherUser?.name ?? "").toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const filteredRecipients = recipients.filter(
    (r) =>
      !recipientSearch ||
      r.name.toLowerCase().includes(recipientSearch.toLowerCase()) ||
      r.username.toLowerCase().includes(recipientSearch.toLowerCase()) ||
      r.kelas.toLowerCase().includes(recipientSearch.toLowerCase()),
  );

  const grouped = groupByDate(messages);
  const canStartChat = role === "ADMIN" || role === "GURU";
  const myBadge = getRoleBadge(role);

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center h-screen" style={{ background: "var(--bg)" }}>
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: "#013FF6" }} />
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "var(--bg)" }}>

      {/* ── SIDEBAR ── */}
      <div
        className={`flex flex-col w-full md:w-[360px] lg:w-[380px] shrink-0 ${showMobile === "chat" ? "hidden md:flex" : "flex"}`}
        style={{ background: "var(--surface)", borderRight: "1px solid var(--bd)" }}
      >
        {/* Sidebar Header */}
        <div className="px-4 pt-5 pb-3" style={{ background: "var(--surface)", borderBottom: "1px solid var(--bd)" }}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0"
                style={{ background: getAvatarColor(session?.user?.name ?? null) }}
              >
                {getInitials(session?.user?.name ?? null)}
              </div>
              <div>
                <p className="font-semibold text-sm leading-tight" style={{ color: "var(--text-primary)" }}>
                  {session?.user?.name ?? "Pengguna"}
                </p>
                <span
                  className="text-[10px] font-medium px-1.5 py-0.5 rounded-full"
                  style={{ background: myBadge.bg, color: myBadge.fg }}
                >
                  {myBadge.label}
                </span>
              </div>
            </div>
            {canStartChat && (
              <button
                onClick={openNewChat}
                className="w-9 h-9 rounded-xl flex items-center justify-center transition-colors"
                style={{ background: "rgba(172,236,0,0.15)", color: "#00182E" }}
                title="Chat baru"
              >
                <Plus className="w-4 h-4" />
              </button>
            )}
          </div>
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "var(--text-secondary)" }} />
            <input
              type="text"
              placeholder="Cari percakapan..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl text-sm focus:outline-none"
              style={{
                background: "var(--bg-input)",
                border: "1px solid var(--bd)",
                color: "var(--text-primary)",
              }}
            />
          </div>
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto">
          {loadingConvs ? (
            <div className="flex items-center justify-center h-32 gap-2">
              <Loader2 className="w-5 h-5 animate-spin" style={{ color: "#013FF6" }} />
              <span className="text-sm" style={{ color: "var(--text-secondary)" }}>Memuat percakapan...</span>
            </div>
          ) : filteredConvs.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 gap-3 px-6 text-center">
              <MessageCircle className="w-10 h-10 opacity-20" style={{ color: "var(--text-secondary)" }} />
              <p className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>Belum ada percakapan</p>
              {canStartChat && (
                <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
                  Klik tombol + untuk mulai chat baru
                </p>
              )}
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
      <div className={`flex-1 flex flex-col ${showMobile === "list" ? "hidden md:flex" : "flex"}`}>
        {activeConv ? (
          <>
            {/* Chat Header */}
            <div
              className="shrink-0 px-4 py-3 flex items-center gap-3 shadow-sm"
              style={{ background: "#00182E", borderBottom: "1px solid rgba(255,255,255,0.1)" }}
            >
              <button
                onClick={() => { setShowMobile("list"); setActiveConv(null); }}
                className="md:hidden p-1.5 rounded-lg transition-colors"
                style={{ color: "rgba(255,255,255,0.7)" }}
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0"
                style={{ background: getAvatarColor(activeConv.otherUser?.name ?? null) }}
              >
                {getInitials(activeConv.otherUser?.name ?? null)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm truncate" style={{ color: "#ffffff" }}>
                  {activeConv.otherUser?.name ?? "Pengguna"}
                </p>
                {(() => {
                  const b = getRoleBadge(activeConv.otherUser?.role ?? "");
                  return (
                    <span
                      className="text-[10px] font-medium px-1.5 py-0.5 rounded-full"
                      style={{ background: b.bg, color: b.fg }}
                    >
                      {b.label}
                    </span>
                  );
                })()}
              </div>
              <div className="flex items-center gap-1">
                <button className="p-2 rounded-xl transition-colors" style={{ color: "rgba(255,255,255,0.7)" }}>
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div
              className="flex-1 overflow-y-auto px-4 py-4 space-y-1"
              style={{ background: "var(--bg)" }}
            >
              {loadingMsgs ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="w-6 h-6 animate-spin" style={{ color: "#013FF6" }} />
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-3">
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-sm" style={{ background: "var(--surface)" }}>
                    <MessageCircle className="w-8 h-8" style={{ color: "#013FF6" }} />
                  </div>
                  <p className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>Mulai percakapan</p>
                  <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
                    Kirim pesan pertamamu ke {activeConv.otherUser?.name}
                  </p>
                </div>
              ) : (
                grouped.map((group, gi) => (
                  <div key={gi}>
                    {/* Date divider */}
                    <div className="flex items-center justify-center my-4">
                      <span
                        className="px-3 py-1 rounded-full text-xs shadow-sm"
                        style={{ background: "var(--surface)", color: "var(--text-secondary)", border: "1px solid var(--bd)" }}
                      >
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

            {/* Input */}
            <div
              className="shrink-0 px-4 py-3"
              style={{ background: "var(--surface)", borderTop: "1px solid var(--bd)" }}
            >
              <div className="flex items-end gap-2">
                <div className="flex-1 relative">
                  <textarea
                    ref={inputRef}
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyDown={handleKey}
                    placeholder="Ketik pesan..."
                    rows={1}
                    className="w-full px-4 py-3 rounded-2xl text-sm focus:outline-none resize-none leading-relaxed max-h-32 overflow-y-auto"
                    style={{
                      background: "var(--bg-input)",
                      border: "1.5px solid var(--bd)",
                      color: "var(--text-primary)",
                      minHeight: "44px",
                    }}
                    onFocus={(e) => { e.currentTarget.style.borderColor = "#ACEC00"; }}
                    onBlur={(e) => { e.currentTarget.style.borderColor = "var(--bd)"; }}
                    onInput={(e) => {
                      const t = e.currentTarget;
                      t.style.height = "auto";
                      t.style.height = Math.min(t.scrollHeight, 128) + "px";
                    }}
                  />
                </div>
                <button
                  onClick={handleSend}
                  disabled={!messageInput.trim() || sending}
                  className="w-11 h-11 rounded-2xl flex items-center justify-center transition-all duration-150 shadow-sm shrink-0 disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{ background: "#ACEC00", color: "#00182E" }}
                >
                  {sending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </button>
              </div>
              <p className="text-[10px] mt-1.5 text-right" style={{ color: "var(--text-secondary)" }}>
                Enter kirim · Shift+Enter baris baru
              </p>
            </div>
          </>
        ) : (
          // Empty state
          <div className="flex-1 flex flex-col items-center justify-center gap-4" style={{ background: "var(--bg)" }}>
            <div className="w-24 h-24 rounded-3xl flex items-center justify-center shadow-lg" style={{ background: "var(--surface)" }}>
              <MessageCircle className="w-12 h-12" style={{ color: "#013FF6" }} />
            </div>
            <div className="text-center">
              <h2 className="text-xl font-semibold" style={{ color: "var(--text-primary)" }}>Pilih Percakapan</h2>
              <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
                {canStartChat ? "Pilih percakapan atau mulai chat baru" : "Pilih percakapan untuk mulai membaca"}
              </p>
            </div>
            {canStartChat && (
              <button
                onClick={openNewChat}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-colors shadow-sm"
                style={{ background: "#ACEC00", color: "#00182E" }}
              >
                <Plus className="w-4 h-4" /> Chat Baru
              </button>
            )}
          </div>
        )}
      </div>

      {/* ── MODAL: NEW CHAT ── */}
      {showNewChat && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="rounded-2xl shadow-2xl w-full max-w-md overflow-hidden" style={{ background: "var(--surface)" }}>
            <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: "1px solid var(--bd)" }}>
              <div>
                <h3 className="font-semibold" style={{ color: "var(--text-primary)" }}>Chat Baru</h3>
                <p className="text-xs mt-0.5" style={{ color: "var(--text-secondary)" }}>
                  {role === "GURU" ? "Pilih siswa yang Anda bimbing" : "Pilih siswa"}
                </p>
              </div>
              <button
                onClick={() => { setShowNewChat(false); setRecipientSearch(""); }}
                className="p-2 rounded-xl transition-colors"
                style={{ color: "var(--text-secondary)" }}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="px-4 py-3" style={{ borderBottom: "1px solid var(--bd)" }}>
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--text-secondary)" }} />
                <input
                  type="text"
                  placeholder="Cari nama, NIS, kelas..."
                  value={recipientSearch}
                  onChange={(e) => setRecipientSearch(e.target.value)}
                  autoFocus
                  className="w-full pl-9 pr-4 py-2 rounded-xl text-sm focus:outline-none"
                  style={{
                    background: "var(--bg-input)",
                    border: "1.5px solid var(--bd)",
                    color: "var(--text-primary)",
                  }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = "#ACEC00"; }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = "var(--bd)"; }}
                />
              </div>
            </div>
            <div className="overflow-y-auto max-h-72">
              {filteredRecipients.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 gap-2">
                  <Users className="w-8 h-8 opacity-30" style={{ color: "var(--text-secondary)" }} />
                  <p className="text-sm" style={{ color: "var(--text-secondary)" }}>Tidak ada siswa ditemukan</p>
                </div>
              ) : (
                filteredRecipients.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => startChat(r.id)}
                    className="w-full flex items-center gap-3 px-5 py-3.5 transition-colors text-left"
                    style={{ borderBottom: "1px solid var(--bd)" }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(1,63,246,0.05)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
                  >
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0"
                      style={{ background: getAvatarColor(r.name) }}
                    >
                      {getInitials(r.name)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate" style={{ color: "var(--text-primary)" }}>{r.name}</p>
                      <p className="text-xs truncate" style={{ color: "var(--text-secondary)" }}>
                        NIS: {r.username} · {r.kelas}
                        {r.tempatPKL !== "—" && ` · ${r.tempatPKL}`}
                      </p>
                    </div>
                    <MessageCircle className="w-4 h-4 shrink-0" style={{ color: "#013FF6" }} />
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
  conv,
  isActive,
  currentUserId,
  onClick,
}: {
  conv: Conversation;
  isActive: boolean;
  currentUserId: number;
  onClick: () => void;
}) {
  const isMine = conv.lastMessage?.senderId === currentUserId;

  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 px-4 py-3.5 transition-colors text-left relative"
      style={{
        background: isActive ? "rgba(1,63,246,0.08)" : "transparent",
        borderRight: isActive ? "2px solid #013FF6" : "2px solid transparent",
      }}
      onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.background = "rgba(1,63,246,0.04)"; }}
      onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.background = "transparent"; }}
    >
      {/* Avatar */}
      <div className="relative shrink-0">
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold"
          style={{ background: getAvatarColor(conv.otherUser?.name ?? null) }}
        >
          {getInitials(conv.otherUser?.name ?? null)}
        </div>
        {conv.unreadCount > 0 && (
          <span
            className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1"
            style={{ background: "#013FF6" }}
          >
            {conv.unreadCount > 99 ? "99+" : conv.unreadCount}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <p
            className="text-sm truncate"
            style={{
              fontWeight: conv.unreadCount > 0 ? 700 : 500,
              color: "var(--text-primary)",
            }}
          >
            {conv.otherUser?.name ?? "Pengguna"}
          </p>
          {conv.lastMessage && (
            <span
              className="text-[10px] shrink-0"
              style={{ color: conv.unreadCount > 0 ? "#013FF6" : "var(--text-secondary)", fontWeight: conv.unreadCount > 0 ? 600 : 400 }}
            >
              {formatTime(conv.lastMessage.createdAt)}
            </span>
          )}
        </div>
        {conv.lastMessage ? (
          <div className="flex items-center gap-1 mt-0.5">
            {isMine && (
              conv.lastMessage.isRead
                ? <CheckCheck className="w-3 h-3 shrink-0" style={{ color: "#013FF6" }} />
                : <Check className="w-3 h-3 shrink-0" style={{ color: "var(--text-secondary)" }} />
            )}
            <p
              className="text-xs truncate"
              style={{ color: conv.unreadCount > 0 ? "var(--text-primary)" : "var(--text-secondary)", fontWeight: conv.unreadCount > 0 ? 500 : 400 }}
            >
              {isMine ? "Kamu: " : ""}
              {conv.lastMessage.content}
            </p>
          </div>
        ) : (
          <p className="text-xs mt-0.5 italic" style={{ color: "var(--text-secondary)" }}>Belum ada pesan</p>
        )}
      </div>
    </button>
  );
}

// ─── Message Bubble ───────────────────────────────────────────────────────────
function MessageBubble({
  message,
  isOwn,
  showAvatar,
}: {
  message: Message;
  isOwn: boolean;
  showAvatar: boolean;
}) {
  return (
    <div className={`flex items-end gap-2 mb-1 ${isOwn ? "justify-end" : "justify-start"}`}>
      {/* Avatar (other user) */}
      {!isOwn && (
        <div
          className={`w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-bold shrink-0 mb-0.5 ${showAvatar ? "visible" : "invisible"}`}
          style={{ background: getAvatarColor(message.sender.name) }}
        >
          {getInitials(message.sender.name)}
        </div>
      )}

      <div className={`max-w-[72%] ${isOwn ? "items-end" : "items-start"} flex flex-col`}>
        {/* Sender name (for received) */}
        {!isOwn && showAvatar && (
          <span className="text-[10px] font-semibold mb-1 ml-1" style={{ color: "#013FF6" }}>
            {message.sender.name}
          </span>
        )}

        {/* Bubble */}
        <div
          className="relative px-3.5 py-2.5 shadow-sm"
          style={
            isOwn
              ? { background: "#013FF6", color: "#ffffff", borderRadius: "16px 16px 4px 16px" }
              : { background: "var(--surface)", color: "var(--text-primary)", borderRadius: "16px 16px 16px 4px", border: "1px solid var(--bd)" }
          }
        >
          <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">{message.content}</p>
          {/* Time + read status */}
          <div className={`flex items-center gap-1 mt-1 ${isOwn ? "justify-end" : "justify-start"}`}>
            <span
              className="text-[10px]"
              style={{ color: isOwn ? "rgba(255,255,255,0.6)" : "var(--text-secondary)" }}
            >
              {formatFullTime(message.createdAt)}
            </span>
            {isOwn && (
              message.isRead
                ? <CheckCheck className="w-3 h-3" style={{ color: "rgba(255,255,255,0.6)" }} />
                : <Check className="w-3 h-3" style={{ color: "rgba(255,255,255,0.5)" }} />
            )}
          </div>
        </div>
      </div>

      {/* Spacer for own messages alignment */}
      {isOwn && <div className="w-7 shrink-0" />}
    </div>
  );
}
