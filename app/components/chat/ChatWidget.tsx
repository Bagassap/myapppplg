"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useSession } from "next-auth/react";
import {
  MessageCircle,
  X,
  Send,
  Search,
  ChevronLeft,
  Check,
  CheckCheck,
  Loader2,
  Users,
  Plus,
  MoreVertical,
} from "lucide-react";

// ─── Types ───
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

// ─── Helpers ───
function formatTime(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffDay = Math.floor(diffMs / 86400000);
  if (diffMin < 1) return "Baru saja";
  if (diffMin < 60) return `${diffMin}m`;
  if (diffDay < 1)
    return d.toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    });
  if (diffDay === 1) return "Kemarin";
  return d.toLocaleDateString("id-ID", { day: "numeric", month: "short" });
}

function formatFullTime(iso: string) {
  return new Date(iso).toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDateDivider(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const diffDay = Math.floor((now.getTime() - d.getTime()) / 86400000);
  if (diffDay === 0) return "Hari Ini";
  if (diffDay === 1) return "Kemarin";
  return d.toLocaleDateString("id-ID", { day: "numeric", month: "long" });
}

function getInitials(name: string | null) {
  if (!name) return "?";
  return name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function getAvatarColor(name: string | null) {
  const colors = [
    "#6366f1",
    "#8b5cf6",
    "#ec4899",
    "#f59e0b",
    "#10b981",
    "#3b82f6",
    "#ef4444",
    "#14b8a6",
  ];
  if (!name) return colors[0];
  return colors[name.charCodeAt(0) % colors.length];
}

function getRoleBadge(role: string) {
  if (role === "ADMIN")
    return { label: "Admin", cls: "bg-rose-100 text-rose-700" };
  if (role === "GURU")
    return { label: "Guru", cls: "bg-violet-100 text-violet-700" };
  return { label: "Siswa", cls: "bg-indigo-100 text-indigo-700" };
}

function groupByDate(messages: Message[]) {
  const groups: { date: string; messages: Message[] }[] = [];
  let lastDate = "";
  for (const m of messages) {
    const d = new Date(m.createdAt).toDateString();
    if (d !== lastDate) {
      groups.push({ date: m.createdAt, messages: [m] });
      lastDate = d;
    } else groups[groups.length - 1].messages.push(m);
  }
  return groups;
}

// ─── Main Widget ───
export default function ChatWidget({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const { data: session } = useSession();
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);

  const [view, setView] = useState<"list" | "thread" | "new">("list");
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [activeConv, setActiveConv] = useState<Conversation | null>(null);
  const [messageInput, setMessageInput] = useState("");
  const [sending, setSending] = useState(false);
  const [loadingConvs, setLoadingConvs] = useState(true);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [recipientSearch, setRecipientSearch] = useState("");
  const [loadingRec, setLoadingRec] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const userId = Number(session?.user?.id);
  const role = session?.user?.role as string;
  const canStartChat = role === "ADMIN" || role === "GURU";

  // Animate open/close
  useEffect(() => {
    if (isOpen) {
      setMounted(true);
      setTimeout(() => setVisible(true), 10);
    } else {
      setVisible(false);
      setTimeout(() => setMounted(false), 280);
    }
  }, [isOpen]);

  // Load conversations
  const loadConversations = useCallback(async () => {
    try {
      const r = await fetch("/api/chat/conversations");
      if (r.ok) {
        setConversations(await r.json());
        setLoadingConvs(false);
      }
    } catch {}
  }, []);

  useEffect(() => {
    if (isOpen) loadConversations();
  }, [isOpen, loadConversations]);

  // Polling conversations
  useEffect(() => {
    if (!isOpen) return;
    const id = setInterval(loadConversations, 5000);
    return () => clearInterval(id);
  }, [isOpen, loadConversations]);

  // Load messages
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

  // Polling messages
  useEffect(() => {
    if (!activeConv || view !== "thread") return;
    const id = setInterval(() => loadMessages(activeConv.id), 3000);
    return () => clearInterval(id);
  }, [activeConv, view, loadMessages]);

  // Auto scroll
  useEffect(() => {
    setTimeout(
      () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }),
      60,
    );
  }, [messages]);

  const selectConversation = (conv: Conversation) => {
    setActiveConv(conv);
    setView("thread");
    loadMessages(conv.id);
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
            .sort(
              (a, b) =>
                new Date(b.updatedAt).getTime() -
                new Date(a.updatedAt).getTime(),
            ),
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

  const openNewChat = async () => {
    setView("new");
    setLoadingRec(true);
    try {
      const r = await fetch("/api/chat/recipients");
      if (r.ok) setRecipients(await r.json());
    } finally {
      setLoadingRec(false);
    }
  };

  const startChat = async (targetId: number) => {
    const r = await fetch("/api/chat/conversations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ targetId }),
    });
    if (!r.ok) return;
    const { conversationId } = await r.json();
    setRecipientSearch("");
    await loadConversations();
    // Reload conversations and select
    const res = await fetch("/api/chat/conversations");
    if (res.ok) {
      const convs: Conversation[] = await res.json();
      setConversations(convs);
      const conv = convs.find((c) => c.id === conversationId);
      if (conv) selectConversation(conv);
    }
  };

  const goBack = () => {
    setView("list");
    setActiveConv(null);
    setMessages([]);
  };

  const filteredConvs = conversations.filter(
    (c) =>
      !searchQuery ||
      (c.otherUser?.name ?? "")
        .toLowerCase()
        .includes(searchQuery.toLowerCase()),
  );

  const filteredRecipients = recipients.filter(
    (r) =>
      !recipientSearch ||
      r.name.toLowerCase().includes(recipientSearch.toLowerCase()) ||
      r.username.toLowerCase().includes(recipientSearch.toLowerCase()) ||
      r.kelas.toLowerCase().includes(recipientSearch.toLowerCase()),
  );

  const grouped = groupByDate(messages);

  if (!mounted) return null;

  return (
    <div
      className="fixed bottom-20 right-4 sm:right-6 z-50 w-[calc(100vw-2rem)] sm:w-[740px] max-w-[740px]"
      style={{
        transition: "opacity .28s, transform .28s cubic-bezier(.32,1.25,.6,1)",
        opacity: visible ? 1 : 0,
        transform: visible
          ? "translateY(0) scale(1)"
          : "translateY(16px) scale(.97)",
        pointerEvents: visible ? "auto" : "none",
      }}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden flex"
        style={{ height: "520px" }}
      >
        {/* ── SIDEBAR KIRI ── */}
        <div
          className={`
          flex flex-col border-r border-gray-100
          w-full sm:w-[260px] shrink-0
          ${view === "thread" ? "hidden sm:flex" : "flex"}
        `}
        >
          {/* Sidebar Header */}
          <div className="px-4 pt-4 pb-3 border-b border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                  style={{
                    background: getAvatarColor(session?.user?.name ?? null),
                  }}
                >
                  {getInitials(session?.user?.name ?? null)}
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-800 leading-tight truncate max-w-[110px]">
                    {session?.user?.name ?? "Pengguna"}
                  </p>
                  <span
                    className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${getRoleBadge(role).cls}`}
                  >
                    {getRoleBadge(role).label}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {canStartChat && (
                  <button
                    onClick={openNewChat}
                    className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                    title="Chat baru"
                  >
                    <Plus className="w-4 h-4 text-indigo-600" />
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <X className="w-4 h-4 text-gray-500" />
                </button>
              </div>
            </div>
            {/* Search */}
            {view !== "new" && (
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Cari..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-gray-50 border border-gray-200 text-xs text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                />
              </div>
            )}
          </div>

          {/* ── View: New Chat ── */}
          {view === "new" && (
            <>
              <div className="px-3 py-2 border-b border-gray-100 flex items-center gap-2">
                <button
                  onClick={goBack}
                  className="p-1 rounded-lg hover:bg-gray-100"
                >
                  <ChevronLeft className="w-4 h-4 text-gray-500" />
                </button>
                <span className="text-xs font-semibold text-gray-600">
                  Pilih Siswa
                </span>
              </div>
              <div className="px-3 py-2 border-b border-gray-100">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Cari nama, NIS, kelas..."
                    value={recipientSearch}
                    onChange={(e) => setRecipientSearch(e.target.value)}
                    autoFocus
                    className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-gray-50 border border-gray-200 text-xs text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                  />
                </div>
              </div>
              <div className="flex-1 overflow-y-auto">
                {loadingRec ? (
                  <div className="flex items-center justify-center h-24 gap-2 text-gray-400">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-xs">Memuat...</span>
                  </div>
                ) : filteredRecipients.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-24 gap-2 text-gray-400">
                    <Users className="w-6 h-6 opacity-30" />
                    <p className="text-xs">Tidak ada siswa</p>
                  </div>
                ) : (
                  filteredRecipients.map((r) => (
                    <button
                      key={r.id}
                      onClick={() => startChat(r.id)}
                      className="w-full flex items-center gap-2.5 px-3 py-2.5 hover:bg-indigo-50 transition-colors text-left"
                    >
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                        style={{ background: getAvatarColor(r.name) }}
                      >
                        {getInitials(r.name)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 truncate">
                          {r.name}
                        </p>
                        <p className="text-[10px] text-gray-400 truncate">
                          {r.kelas} · NIS {r.username}
                        </p>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </>
          )}

          {/* ── View: List ── */}
          {view !== "new" && (
            <div className="flex-1 overflow-y-auto">
              {loadingConvs ? (
                <div className="flex items-center justify-center h-24 gap-2 text-gray-400">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-xs">Memuat...</span>
                </div>
              ) : filteredConvs.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-32 gap-2 text-gray-400 text-center px-4">
                  <MessageCircle className="w-8 h-8 opacity-20" />
                  <p className="text-xs font-medium text-gray-500">
                    Belum ada percakapan
                  </p>
                  {canStartChat && (
                    <p className="text-[10px] text-gray-400">
                      Klik + untuk chat baru
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
          )}
        </div>

        {/* ── AREA CHAT KANAN ── */}
        <div
          className={`
          flex-1 flex flex-col min-w-0
          ${view !== "thread" ? "hidden sm:flex" : "flex"}
        `}
        >
          {activeConv ? (
            <>
              {/* Chat Header */}
              <div className="shrink-0 px-4 py-3 border-b border-gray-100 flex items-center gap-3 bg-white">
                <button
                  onClick={goBack}
                  className="sm:hidden p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4 text-gray-600" />
                </button>
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0"
                  style={{
                    background: getAvatarColor(
                      activeConv.otherUser?.name ?? null,
                    ),
                  }}
                >
                  {getInitials(activeConv.otherUser?.name ?? null)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-800 text-sm truncate">
                    {activeConv.otherUser?.name ?? "Pengguna"}
                  </p>
                  <span
                    className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${getRoleBadge(activeConv.otherUser?.role ?? "").cls}`}
                  >
                    {getRoleBadge(activeConv.otherUser?.role ?? "").label}
                  </span>
                </div>
              </div>

              {/* Messages */}
              <div
                className="flex-1 overflow-y-auto px-3 py-3 space-y-0.5"
                style={{
                  background:
                    "linear-gradient(135deg, #f8faff 0%, #f0f4ff 100%)",
                  backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23e0e7ff' fill-opacity='0.25'%3E%3Cpath d='M20 20.5V18H0v5h20v-2.5zM20 0H0v5h20V0zm0 12H0v5h20v-5zm0-6H0v3h20V6zm0 24H0v5h20v-5zm20-24H20v5h20V6z'/%3E%3C/g%3E%3C/svg%3E")`,
                }}
              >
                {loadingMsgs ? (
                  <div className="flex items-center justify-center h-full">
                    <Loader2 className="w-5 h-5 animate-spin text-indigo-400" />
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full gap-2 text-gray-400">
                    <MessageCircle className="w-8 h-8 opacity-20" />
                    <p className="text-sm text-gray-500">Mulai percakapan</p>
                  </div>
                ) : (
                  grouped.map((group, gi) => (
                    <div key={gi}>
                      <div className="flex items-center justify-center my-3">
                        <span className="px-2.5 py-0.5 bg-white/80 rounded-full text-[10px] text-gray-400 shadow-sm border border-gray-100">
                          {formatDateDivider(group.date)}
                        </span>
                      </div>
                      {group.messages.map((msg, mi) => (
                        <MsgBubble
                          key={msg.id}
                          message={msg}
                          isOwn={msg.senderId === userId}
                          showName={
                            !msg.senderId &&
                            (mi === 0 ||
                              group.messages[mi - 1]?.senderId !== msg.senderId)
                          }
                        />
                      ))}
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="shrink-0 px-3 py-2.5 border-t border-gray-100 bg-white">
                <div className="flex items-end gap-2">
                  <textarea
                    ref={inputRef}
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyDown={handleKey}
                    placeholder={`Pesan ke ${activeConv.otherUser?.name ?? ""}...`}
                    rows={1}
                    className="flex-1 resize-none px-3 py-2 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-200 leading-relaxed max-h-24 overflow-y-auto"
                    onInput={(e) => {
                      const t = e.currentTarget;
                      t.style.height = "auto";
                      t.style.height = Math.min(t.scrollHeight, 96) + "px";
                    }}
                  />
                  <button
                    onClick={handleSend}
                    disabled={!messageInput.trim() || sending}
                    className="w-9 h-9 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-200 disabled:cursor-not-allowed flex items-center justify-center transition-all shrink-0"
                  >
                    {sending ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
                    ) : (
                      <Send
                        className={`w-3.5 h-3.5 ${messageInput.trim() ? "text-white" : "text-gray-400"}`}
                      />
                    )}
                  </button>
                </div>
                <p className="text-[9px] text-gray-400 mt-1 text-right">
                  Enter kirim · Shift+Enter baris baru
                </p>
              </div>
            </>
          ) : (
            // Empty state kanan
            <div className="flex-1 flex flex-col items-center justify-center gap-3 bg-gradient-to-br from-gray-50 to-indigo-50/20">
              <div className="w-14 h-14 rounded-2xl bg-white shadow-md flex items-center justify-center">
                <MessageCircle className="w-7 h-7 text-indigo-400" />
              </div>
              <div className="text-center px-4">
                <p className="text-sm font-semibold text-gray-600">
                  Pilih Percakapan
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {canStartChat
                    ? "Atau klik + untuk mulai chat baru"
                    : "Pilih untuk membaca pesan"}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Conversation Item ───
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
      className={`w-full flex items-center gap-2.5 px-3 py-3 transition-colors text-left
        ${isActive ? "bg-indigo-50 border-r-2 border-indigo-500" : "hover:bg-gray-50"}`}
    >
      <div className="relative shrink-0">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm"
          style={{ background: getAvatarColor(conv.otherUser?.name ?? null) }}
        >
          {getInitials(conv.otherUser?.name ?? null)}
        </div>
        {conv.unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 bg-indigo-600 text-white text-[9px] font-bold rounded-full flex items-center justify-center px-0.5">
            {conv.unreadCount > 9 ? "9+" : conv.unreadCount}
          </span>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-1">
          <p
            className={`text-sm truncate ${conv.unreadCount > 0 ? "font-semibold text-gray-900" : "font-medium text-gray-700"}`}
          >
            {conv.otherUser?.name ?? "Pengguna"}
          </p>
          {conv.lastMessage && (
            <span
              className={`text-[10px] shrink-0 ${conv.unreadCount > 0 ? "text-indigo-600 font-medium" : "text-gray-400"}`}
            >
              {formatTime(conv.lastMessage.createdAt)}
            </span>
          )}
        </div>
        {conv.lastMessage ? (
          <div className="flex items-center gap-1 mt-0.5">
            {isMine &&
              (conv.lastMessage.isRead ? (
                <CheckCheck className="w-2.5 h-2.5 text-indigo-500 shrink-0" />
              ) : (
                <Check className="w-2.5 h-2.5 text-gray-400 shrink-0" />
              ))}
            <p
              className={`text-xs truncate ${conv.unreadCount > 0 ? "text-gray-700" : "text-gray-400"}`}
            >
              {isMine ? "Kamu: " : ""}
              {conv.lastMessage.content}
            </p>
          </div>
        ) : (
          <p className="text-xs text-gray-400 italic">Belum ada pesan</p>
        )}
      </div>
    </button>
  );
}

// ─── Message Bubble ───
function MsgBubble({
  message,
  isOwn,
  showName,
}: {
  message: Message;
  isOwn: boolean;
  showName: boolean;
}) {
  return (
    <div
      className={`flex items-end gap-1.5 mb-1 ${isOwn ? "justify-end" : "justify-start"}`}
    >
      {!isOwn && (
        <div
          className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[9px] font-bold shrink-0 mb-0.5"
          style={{
            background: getAvatarColor(message.sender.name),
            opacity: showName ? 1 : 0,
          }}
        >
          {getInitials(message.sender.name)}
        </div>
      )}
      <div
        className={`max-w-[75%] flex flex-col ${isOwn ? "items-end" : "items-start"}`}
      >
        <div
          className={`px-3 py-2 shadow-sm ${
            isOwn
              ? "bg-indigo-600 text-white rounded-2xl rounded-br-sm"
              : "bg-white text-gray-800 rounded-2xl rounded-bl-sm border border-gray-100"
          }`}
        >
          <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
            {message.content}
          </p>
          <div
            className={`flex items-center gap-1 mt-0.5 ${isOwn ? "justify-end" : "justify-start"}`}
          >
            <span
              className={`text-[9px] ${isOwn ? "text-indigo-200" : "text-gray-400"}`}
            >
              {formatFullTime(message.createdAt)}
            </span>
            {isOwn &&
              (message.isRead ? (
                <CheckCheck className="w-2.5 h-2.5 text-indigo-200" />
              ) : (
                <Check className="w-2.5 h-2.5 text-indigo-300" />
              ))}
          </div>
        </div>
      </div>
      {isOwn && <div className="w-6 shrink-0" />}
    </div>
  );
}
