"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useSession } from "next-auth/react";
import {
  MessageCircle, X, Send, Search, ChevronLeft,
  Check, CheckCheck, Loader2, Users, Plus, Megaphone,
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────
interface OtherUser { id: number; name: string | null; role: string; }
interface LastMessage { id: number; content: string; senderId: number; isRead: boolean; createdAt: string; }
interface Conversation { id: number; otherUser: OtherUser | null; lastMessage: LastMessage | null; unreadCount: number; updatedAt: string; }
interface Message { id: number; conversationId: number; senderId: number; content: string; isRead: boolean; createdAt: string; sender: { id: number; name: string | null; role: string }; }
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
  return d.toLocaleDateString("id-ID", { day: "numeric", month: "long" });
}
function getInitials(name: string | null) {
  if (!name) return "?";
  return name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
}
function getAvatarColor(name: string | null) {
  const colors = ["#6366f1","#8b5cf6","#ec4899","#f59e0b","#10b981","#3b82f6","#ef4444","#14b8a6"];
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

// ─── Toast ────────────────────────────────────────────────────────────────────
function ToastNotif({ toast, onClose, onOpen }: {
  toast: { id: number; name: string; content: string; convId: number };
  onClose: (id: number) => void;
  onOpen: (convId: number) => void;
}) {
  useEffect(() => {
    const t = setTimeout(() => onClose(toast.id), 4000);
    return () => clearTimeout(t);
  }, [toast.id, onClose]);

  return (
    <div
      onClick={() => { onOpen(toast.convId); onClose(toast.id); }}
      style={{ display: "flex", alignItems: "flex-start", gap: "10px", padding: "12px 14px", borderRadius: "14px", boxShadow: "0 8px 30px rgba(0,0,0,0.5)", cursor: "pointer", minWidth: "240px", maxWidth: "300px", background: "#00182E", animation: "slideInRight .25s ease" }}
    >
      <div style={{ width: "34px", height: "34px", borderRadius: "50%", background: getAvatarColor(toast.name), display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: "11px", fontWeight: "bold", flexShrink: 0 }}>
        {getInitials(toast.name)}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ color: "#ffffff", fontSize: "13px", fontWeight: 600, margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{toast.name}</p>
        <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "12px", margin: "2px 0 0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{toast.content}</p>
      </div>
      <button onClick={(e) => { e.stopPropagation(); onClose(toast.id); }} style={{ background: "transparent", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.4)", padding: "2px", flexShrink: 0 }}>
        <X style={{ width: "14px", height: "14px" }} />
      </button>
    </div>
  );
}

// ─── Main Widget ──────────────────────────────────────────────────────────────
export default function ChatWidget({
  isOpen: isOpenProp,
  onClose: onCloseProp,
  showFAB = true,
}: {
  isOpen?: boolean;
  onClose?: () => void;
  showFAB?: boolean;
}) {
  const { data: session } = useSession();
  const [internalOpen, setInternalOpen] = useState(false);
  const isOpen = isOpenProp !== undefined ? isOpenProp : internalOpen;
  const handleClose = onCloseProp ?? (() => setInternalOpen(false));
  const handleOpen = () => setInternalOpen(true);

  const [unreadFAB, setUnreadFAB] = useState(0);
  const [toasts, setToasts] = useState<{ id: number; name: string; content: string; convId: number }[]>([]);
  const prevConvsRef = useRef<Conversation[]>([]);
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
  const [showBroadcast, setShowBroadcast] = useState(false);
  const [broadcastMsg, setBroadcastMsg] = useState("");
  const [broadcasting, setBroadcasting] = useState(false);
  const [broadcastResult, setBroadcastResult] = useState<{ sent: number; total: number } | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const userId = Number(session?.user?.id);
  const role = session?.user?.role as string;
  const canStartChat = role === "ADMIN" || role === "GURU";
  const activeConvId = activeConv?.id;

  useEffect(() => {
    if (isOpen) { setMounted(true); setTimeout(() => setVisible(true), 10); }
    else { setVisible(false); setTimeout(() => setMounted(false), 280); }
  }, [isOpen]);

  const loadConversations = useCallback(async () => {
    try {
      const r = await fetch("/api/chat/conversations");
      if (r.ok) {
        const fresh: Conversation[] = await r.json();
        setConversations(fresh);
        setLoadingConvs(false);
        const total = fresh.reduce((s, c) => s + c.unreadCount, 0);
        setUnreadFAB(total);
        if (!isOpen) {
          for (const conv of fresh) {
            const prev = prevConvsRef.current.find((c) => c.id === conv.id);
            if (conv.unreadCount > (prev?.unreadCount ?? 0) && conv.lastMessage) {
              setToasts((t) => [...t, { id: Date.now() + Math.random(), name: conv.otherUser?.name ?? "Pesan baru", content: conv.lastMessage!.content, convId: conv.id }]);
            }
          }
        }
        prevConvsRef.current = fresh;
      }
    } catch {}
  }, [isOpen]);

  useEffect(() => {
    loadConversations();
    const id = setInterval(loadConversations, 5000);
    return () => clearInterval(id);
  }, [loadConversations]);

  // SSE real-time untuk pesan
  useEffect(() => {
    if (!activeConvId || view !== "thread") return;
    const es = new EventSource(`/api/chat/stream?conversationId=${activeConvId}`);
    es.onmessage = (e) => {
      try {
        const msgs: Message[] = JSON.parse(e.data);
        setMessages(msgs);
        setConversations((prev) => prev.map((c) => c.id === activeConvId ? { ...c, unreadCount: 0 } : c));
        setLoadingMsgs(false);
        setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
      } catch {}
    };
    es.onerror = () => es.close();
    return () => es.close();
  }, [activeConvId, view]);

  useEffect(() => {
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 60);
  }, [messages]);

  const selectConversation = (conv: Conversation) => {
    setActiveConv(conv);
    setView("thread");
    setMessages([]);
    setLoadingMsgs(true);
    setTimeout(() => inputRef.current?.focus(), 150);
  };

  const handleSend = async () => {
    if (!activeConv || !messageInput.trim() || sending) return;
    setSending(true);
    const content = messageInput.trim();
    setMessageInput("");
    if (inputRef.current) inputRef.current.style.height = "auto";
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
          prev.map((c) => c.id === activeConv.id ? { ...c, lastMessage: msg, updatedAt: msg.createdAt } : c)
            .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
        );
        setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
      }
    } catch { setMessageInput(content); }
    finally { setSending(false); }
  };

  const handleKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const openNewChat = async () => {
    setView("new"); setLoadingRec(true);
    try { const r = await fetch("/api/chat/recipients"); if (r.ok) setRecipients(await r.json()); }
    finally { setLoadingRec(false); }
  };

  const startChat = async (targetId: number) => {
    const r = await fetch("/api/chat/conversations", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ targetId }) });
    if (!r.ok) return;
    const { conversationId } = await r.json();
    setRecipientSearch("");
    await loadConversations();
    const res = await fetch("/api/chat/conversations");
    if (res.ok) {
      const convs: Conversation[] = await res.json();
      setConversations(convs);
      const conv = convs.find((c) => c.id === conversationId);
      if (conv) selectConversation(conv);
    }
  };

  const openFromToast = (convId: number) => {
    handleOpen();
    setTimeout(() => { const conv = conversations.find((c) => c.id === convId); if (conv) selectConversation(conv); }, 100);
  };

  const goBack = () => { setView("list"); setActiveConv(null); setMessages([]); };

  const handleBroadcast = async () => {
    if (!broadcastMsg.trim() || broadcasting) return;
    setBroadcasting(true);
    try {
      const r = await fetch("/api/chat/broadcast", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ content: broadcastMsg.trim() }) });
      if (r.ok) {
        setBroadcastResult(await r.json());
        setBroadcastMsg("");
        setTimeout(() => { setBroadcastResult(null); setShowBroadcast(false); loadConversations(); }, 2500);
      }
    } catch { alert("Gagal mengirim broadcast"); }
    finally { setBroadcasting(false); }
  };

  const filteredConvs = conversations.filter((c) => !searchQuery || (c.otherUser?.name ?? "").toLowerCase().includes(searchQuery.toLowerCase()));
  const filteredRecipients = recipients.filter((r) => !recipientSearch || r.name.toLowerCase().includes(recipientSearch.toLowerCase()) || r.username.toLowerCase().includes(recipientSearch.toLowerCase()) || r.kelas.toLowerCase().includes(recipientSearch.toLowerCase()));
  const grouped = groupByDate(messages);

  return (
    <>
      <style>{`
        @keyframes slideInRight { from { opacity:0; transform:translateX(40px); } to { opacity:1; transform:translateX(0); } }
      `}</style>

      {/* FAB */}
      {showFAB && (
        <button
          onClick={isOpen ? (onCloseProp ?? handleClose) : (isOpenProp !== undefined ? () => {} : handleOpen)}
          aria-label="Chat"
          style={{ position: "fixed", bottom: "20px", right: "20px", zIndex: 50, height: "52px", padding: "0 20px", borderRadius: "16px", boxShadow: "0 8px 25px rgba(0,24,46,0.4)", display: "flex", alignItems: "center", gap: "10px", border: "none", cursor: "pointer", background: isOpen ? "#012444" : "#013FF6", transition: "all .2s", userSelect: "none" }}
          className="hover:scale-105 active:scale-95 transition-transform"
        >
          {isOpen ? <X style={{ width: "22px", height: "22px", color: "#ACEC00" }} /> : <MessageCircle style={{ width: "22px", height: "22px", color: "#ffffff" }} />}
          <span style={{ color: isOpen ? "#ACEC00" : "#ffffff", fontSize: "14px", fontWeight: 600 }}>{isOpen ? "Tutup" : "Chat"}</span>
          {unreadFAB > 0 && !isOpen && (
            <span style={{ position: "absolute", top: "-6px", right: "-6px", minWidth: "20px", height: "20px", background: "#ACEC00", color: "#00182E", fontSize: "10px", fontWeight: "bold", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", padding: "0 4px", border: "2px solid #00182E" }} className="animate-bounce">
              {unreadFAB > 99 ? "99+" : unreadFAB}
            </span>
          )}
        </button>
      )}

      {/* Toast */}
      <div style={{ position: "fixed", top: "16px", right: "16px", zIndex: 60, display: "flex", flexDirection: "column", gap: "8px", pointerEvents: "auto" }}>
        {toasts.map((t) => (
          <ToastNotif key={t.id} toast={t} onClose={(id) => setToasts((x) => x.filter((y) => y.id !== id))} onOpen={openFromToast} />
        ))}
      </div>

      {/* Broadcast Modal */}
      {showBroadcast && (
        <div style={{ position: "fixed", inset: 0, zIndex: 70, display: "flex", alignItems: "center", justifyContent: "center", padding: "16px" }}>
          <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }} onClick={() => { setShowBroadcast(false); setBroadcastMsg(""); setBroadcastResult(null); }} />
          <div style={{ position: "relative", background: "#00182E", borderRadius: "16px", boxShadow: "0 20px 60px rgba(0,0,0,0.6)", width: "100%", maxWidth: "400px", overflow: "hidden", zIndex: 10 }}>
            <div style={{ padding: "16px 20px", background: "#001525", display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "rgba(245,158,11,0.15)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Megaphone style={{ width: "18px", height: "18px", color: "#f59e0b" }} />
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ color: "#ffffff", fontWeight: 600, fontSize: "14px", margin: 0 }}>Broadcast ke Semua Siswa</p>
                <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "11px", margin: "2px 0 0" }}>Pesan dikirim ke seluruh siswa</p>
              </div>
              <button onClick={() => { setShowBroadcast(false); setBroadcastMsg(""); setBroadcastResult(null); }} style={{ background: "transparent", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.4)" }}>
                <X style={{ width: "16px", height: "16px" }} />
              </button>
            </div>
            <div style={{ padding: "16px 20px" }}>
              {broadcastResult ? (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "10px", padding: "16px 0" }}>
                  <div style={{ width: "48px", height: "48px", borderRadius: "50%", background: "rgba(16,185,129,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <CheckCheck style={{ width: "24px", height: "24px", color: "#10b981" }} />
                  </div>
                  <p style={{ color: "#ffffff", fontWeight: 600, fontSize: "14px", margin: 0, textAlign: "center" }}>
                    Berhasil dikirim ke {broadcastResult.sent} dari {broadcastResult.total} siswa
                  </p>
                </div>
              ) : (
                <>
                  <textarea
                    value={broadcastMsg}
                    onChange={(e) => setBroadcastMsg(e.target.value)}
                    placeholder="Tulis pesan broadcast..."
                    rows={4}
                    autoFocus
                    style={{ width: "100%", background: "#012444", borderRadius: "10px", padding: "10px 12px", color: "#ffffff", outline: "none", border: "none", fontSize: "13px", resize: "none", boxSizing: "border-box", lineHeight: 1.5 }}
                  />
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "12px" }}>
                    <p style={{ color: "rgba(255,255,255,0.35)", fontSize: "11px", margin: 0 }}>Dikirim ke semua siswa terdaftar</p>
                    <button
                      onClick={handleBroadcast}
                      disabled={!broadcastMsg.trim() || broadcasting}
                      style={{ display: "flex", alignItems: "center", gap: "6px", padding: "8px 16px", background: broadcastMsg.trim() && !broadcasting ? "#ACEC00" : "rgba(172,236,0,0.3)", color: "#00182E", border: "none", borderRadius: "8px", fontWeight: 600, fontSize: "13px", cursor: broadcastMsg.trim() && !broadcasting ? "pointer" : "not-allowed" }}
                    >
                      {broadcasting ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Mengirim...</> : <><Megaphone style={{ width: "14px", height: "14px" }} /> Kirim</>}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Backdrop */}
      {mounted && (
        <div
          style={{ position: "fixed", inset: 0, zIndex: 40, backdropFilter: visible ? "blur(4px)" : "blur(0px)", backgroundColor: visible ? "rgba(0,0,0,0.3)" : "rgba(0,0,0,0)", transition: "backdrop-filter .28s, background-color .28s", pointerEvents: visible ? "auto" : "none" }}
          onClick={handleClose}
        />
      )}

      {/* Widget Panel */}
      {mounted && (
        <div
          className="sm:w-[740px]"
          style={{ position: "fixed", bottom: "84px", right: "16px", zIndex: 50, width: "calc(100vw - 2rem)", maxWidth: "740px", transition: "opacity .28s, transform .28s cubic-bezier(.32,1.25,.6,1)", opacity: visible ? 1 : 0, transform: visible ? "translateY(0) scale(1)" : "translateY(16px) scale(.97)", pointerEvents: visible ? "auto" : "none" }}
        >
          <div style={{ background: "#00182E", borderRadius: "16px", boxShadow: "0 20px 60px rgba(0,0,0,0.6)", overflow: "hidden", display: "flex", height: "520px" }}>

            {/* ── SIDEBAR KIRI ── */}
            <div
              className={`flex flex-col w-full sm:w-[260px] shrink-0 ${view === "thread" ? "hidden sm:flex" : "flex"}`}
              style={{ background: "#00182E" }}
            >
              {/* Sidebar Header */}
              <div style={{ padding: "16px", background: "#001525" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: getAvatarColor(session?.user?.name ?? null), display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: "11px", fontWeight: "bold", flexShrink: 0 }}>
                      {getInitials(session?.user?.name ?? null)}
                    </div>
                    <div>
                      <p style={{ color: "#ffffff", fontSize: "13px", fontWeight: 600, margin: 0, lineHeight: 1.2, maxWidth: "100px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {session?.user?.name ?? "Pengguna"}
                      </p>
                      <span style={{ fontSize: "10px", fontWeight: 600, padding: "1px 6px", borderRadius: "10px", background: role === "ADMIN" ? "rgba(239,68,68,0.15)" : role === "GURU" ? "rgba(1,63,246,0.2)" : "rgba(172,236,0,0.2)", color: role === "ADMIN" ? "#f87171" : role === "GURU" ? "#60a5fa" : "#ACEC00" }}>
                        {role === "ADMIN" ? "Admin" : role === "GURU" ? "Guru" : "Siswa"}
                      </span>
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                    {canStartChat && (
                      <button onClick={openNewChat} title="Chat baru" style={{ background: "transparent", border: "none", cursor: "pointer", padding: "6px", borderRadius: "8px", color: "#ACEC00", display: "flex" }}>
                        <Plus style={{ width: "16px", height: "16px" }} />
                      </button>
                    )}
                    {role === "ADMIN" && (
                      <button onClick={() => setShowBroadcast(true)} title="Broadcast" style={{ background: "transparent", border: "none", cursor: "pointer", padding: "6px", borderRadius: "8px", color: "#f59e0b", display: "flex" }}>
                        <Megaphone style={{ width: "16px", height: "16px" }} />
                      </button>
                    )}
                    <button onClick={handleClose} style={{ background: "transparent", border: "none", cursor: "pointer", padding: "6px", borderRadius: "8px", color: "rgba(255,255,255,0.4)", display: "flex" }}>
                      <X style={{ width: "16px", height: "16px" }} />
                    </button>
                  </div>
                </div>
                {view !== "new" && (
                  <div style={{ position: "relative" }}>
                    <Search style={{ width: "13px", height: "13px", position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: "rgba(255,255,255,0.3)", pointerEvents: "none" }} />
                    <input
                      type="text"
                      placeholder="Cari..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      style={{ width: "100%", paddingLeft: "30px", paddingRight: "10px", paddingTop: "7px", paddingBottom: "7px", background: "#012444", border: "none", borderRadius: "8px", color: "#ffffff", outline: "none", fontSize: "12px", boxSizing: "border-box" }}
                    />
                  </div>
                )}
              </div>

              {/* New Chat view */}
              {view === "new" && (
                <>
                  <div style={{ padding: "10px 12px", display: "flex", alignItems: "center", gap: "8px" }}>
                    <button onClick={goBack} style={{ background: "transparent", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.5)", display: "flex", padding: "4px" }}>
                      <ChevronLeft style={{ width: "16px", height: "16px" }} />
                    </button>
                    <span style={{ color: "rgba(255,255,255,0.6)", fontSize: "12px", fontWeight: 600 }}>Pilih Siswa</span>
                  </div>
                  <div style={{ padding: "10px 12px" }}>
                    <div style={{ position: "relative" }}>
                      <Search style={{ width: "13px", height: "13px", position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: "rgba(255,255,255,0.3)", pointerEvents: "none" }} />
                      <input
                        type="text"
                        placeholder="Cari nama, NIS, kelas..."
                        value={recipientSearch}
                        onChange={(e) => setRecipientSearch(e.target.value)}
                        autoFocus
                        style={{ width: "100%", paddingLeft: "30px", paddingRight: "10px", paddingTop: "7px", paddingBottom: "7px", background: "#012444", border: "none", borderRadius: "8px", color: "#ffffff", outline: "none", fontSize: "12px", boxSizing: "border-box" }}
                      />
                    </div>
                  </div>
                  <div style={{ flex: 1, overflowY: "auto" }}>
                    {loadingRec ? (
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "80px", gap: "8px" }}>
                        <Loader2 className="w-4 h-4 animate-spin" style={{ color: "#ACEC00" }} />
                        <span style={{ color: "rgba(255,255,255,0.4)", fontSize: "12px" }}>Memuat...</span>
                      </div>
                    ) : filteredRecipients.length === 0 ? (
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "80px", gap: "8px" }}>
                        <Users style={{ width: "24px", height: "24px", color: "rgba(255,255,255,0.15)" }} />
                        <p style={{ color: "rgba(255,255,255,0.35)", fontSize: "12px", margin: 0 }}>Tidak ada siswa</p>
                      </div>
                    ) : (
                      filteredRecipients.map((r) => (
                        <button
                          key={r.id}
                          onClick={() => startChat(r.id)}
                          style={{ width: "100%", display: "flex", alignItems: "center", gap: "10px", padding: "10px 12px", background: "transparent", border: "none", cursor: "pointer", textAlign: "left", transition: "background .15s" }}
                          onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(1,63,246,0.1)"; }}
                          onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
                        >
                          <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: getAvatarColor(r.name), display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: "11px", fontWeight: "bold", flexShrink: 0 }}>
                            {getInitials(r.name)}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{ color: "#ffffff", fontWeight: 600, fontSize: "13px", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.name}</p>
                            <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "11px", margin: "1px 0 0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.kelas} · NIS {r.username}</p>
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                </>
              )}

              {/* List view */}
              {view !== "new" && (
                <div style={{ flex: 1, overflowY: "auto" }}>
                  {loadingConvs ? (
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "80px", gap: "8px" }}>
                      <Loader2 className="w-4 h-4 animate-spin" style={{ color: "#ACEC00" }} />
                      <span style={{ color: "rgba(255,255,255,0.4)", fontSize: "12px" }}>Memuat...</span>
                    </div>
                  ) : filteredConvs.length === 0 ? (
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "120px", gap: "8px", padding: "0 16px", textAlign: "center" }}>
                      <MessageCircle style={{ width: "32px", height: "32px", color: "rgba(255,255,255,0.12)" }} />
                      <p style={{ color: "rgba(255,255,255,0.35)", fontSize: "12px", margin: 0 }}>Belum ada percakapan</p>
                      {canStartChat && <p style={{ color: "rgba(172,236,0,0.6)", fontSize: "11px", margin: 0 }}>Klik + untuk chat baru</p>}
                    </div>
                  ) : (
                    filteredConvs.map((conv) => (
                      <ConvItem key={conv.id} conv={conv} isActive={activeConv?.id === conv.id} currentUserId={userId} onClick={() => selectConversation(conv)} />
                    ))
                  )}
                </div>
              )}
            </div>

            {/* ── AREA CHAT KANAN ── */}
            <div
              className={`flex-1 flex flex-col min-w-0 ${view !== "thread" ? "hidden sm:flex" : "flex"}`}
            >
              {activeConv ? (
                <>
                  {/* Chat Header */}
                  <div style={{ background: "#00182E", padding: "14px 20px", borderBottom: "2px solid #ACEC00", display: "flex", alignItems: "center", gap: "12px", flexShrink: 0 }}>
                    <button onClick={goBack} className="sm:hidden" style={{ background: "transparent", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.5)", display: "flex", padding: "4px" }}>
                      <ChevronLeft style={{ width: "18px", height: "18px" }} />
                    </button>
                    <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: getAvatarColor(activeConv.otherUser?.name ?? null), display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: "bold", fontSize: "13px", flexShrink: 0 }}>
                      {getInitials(activeConv.otherUser?.name ?? null)}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ color: "#ffffff", fontWeight: "bold", fontSize: "15px", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {activeConv.otherUser?.name ?? "Pengguna"}
                      </p>
                      <span style={{ color: "#ACEC00", fontSize: "11px" }}>
                        {activeConv.otherUser?.role === "GURU" ? "Guru" : activeConv.otherUser?.role === "ADMIN" ? "Admin" : "Siswa"}
                      </span>
                    </div>
                  </div>

                  {/* Messages */}
                  <div style={{ flex: 1, overflowY: "auto", padding: "16px", display: "flex", flexDirection: "column", gap: "2px", background: "#001525" }}>
                    {loadingMsgs ? (
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%" }}>
                        <Loader2 className="w-5 h-5 animate-spin" style={{ color: "#ACEC00" }} />
                      </div>
                    ) : messages.length === 0 ? (
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", gap: "8px" }}>
                        <MessageCircle style={{ width: "32px", height: "32px", color: "#013FF6" }} />
                        <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "13px", margin: 0 }}>Mulai percakapan</p>
                      </div>
                    ) : (
                      grouped.map((group, gi) => (
                        <div key={gi}>
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", margin: "12px 0" }}>
                            <span style={{ background: "#012444", color: "rgba(255,255,255,0.4)", padding: "3px 10px", borderRadius: "20px", fontSize: "10px" }}>
                              {formatDateDivider(group.date)}
                            </span>
                          </div>
                          {group.messages.map((msg, mi) => (
                            <MsgBubble
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
                  <div style={{ background: "#00182E", padding: "12px 16px", display: "flex", gap: "10px", alignItems: "flex-end", flexShrink: 0 }}>
                    <textarea
                      ref={inputRef}
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      onKeyDown={handleKey}
                      placeholder={`Pesan ke ${activeConv.otherUser?.name ?? ""}...`}
                      rows={1}
                      style={{ flex: 1, background: "#012444", border: "none", borderRadius: "20px", padding: "8px 16px", color: "#ffffff", outline: "none", fontSize: "13px", resize: "none", lineHeight: 1.5, maxHeight: "80px", overflowY: "auto", fontFamily: "inherit" }}
                      onInput={(e) => { const t = e.currentTarget; t.style.height = "auto"; t.style.height = Math.min(t.scrollHeight, 80) + "px"; }}
                    />
                    <button
                      onClick={handleSend}
                      disabled={!messageInput.trim() || sending}
                      style={{ background: !messageInput.trim() || sending ? "rgba(172,236,0,0.3)" : "#ACEC00", color: "#00182E", border: "none", borderRadius: "50%", width: "38px", height: "38px", cursor: !messageInput.trim() || sending ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "background .15s" }}
                    >
                      {sending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send style={{ width: "15px", height: "15px" }} />}
                    </button>
                  </div>
                </>
              ) : (
                <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "12px", background: "#001525" }}>
                  <div style={{ width: "56px", height: "56px", borderRadius: "14px", background: "#012444", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <MessageCircle style={{ width: "28px", height: "28px", color: "#013FF6" }} />
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <p style={{ color: "#ffffff", fontWeight: 600, fontSize: "15px", margin: "0 0 4px" }}>Pilih Percakapan</p>
                    <p style={{ color: "rgba(255,255,255,0.35)", fontSize: "12px", margin: 0 }}>
                      {canStartChat ? "Atau klik + untuk chat baru" : "Pilih untuk membaca pesan"}
                    </p>
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
      )}
    </>
  );
}

// ─── Conversation Item ─────────────────────────────────────────────────────────
function ConvItem({ conv, isActive, currentUserId, onClick }: { conv: Conversation; isActive: boolean; currentUserId: number; onClick: () => void; }) {
  const isMine = conv.lastMessage?.senderId === currentUserId;
  return (
    <button
      onClick={onClick}
      style={{ width: "100%", display: "flex", alignItems: "center", gap: "10px", padding: "10px 12px", cursor: "pointer", textAlign: "left", background: isActive ? "#012444" : "transparent", border: "none", borderLeft: isActive ? "3px solid #ACEC00" : "3px solid transparent", transition: "background .15s", boxSizing: "border-box" }}
      onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.background = "#011f3a"; }}
      onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.background = "transparent"; }}
    >
      <div style={{ position: "relative", flexShrink: 0 }}>
        <div style={{ width: "38px", height: "38px", borderRadius: "50%", background: getAvatarColor(conv.otherUser?.name ?? null), display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: "bold", fontSize: "13px" }}>
          {getInitials(conv.otherUser?.name ?? null)}
        </div>
        {conv.unreadCount > 0 && (
          <span style={{ position: "absolute", top: "-2px", right: "-2px", minWidth: "16px", height: "16px", background: "#ACEC00", color: "#00182E", borderRadius: "50%", fontSize: "9px", fontWeight: "bold", display: "flex", alignItems: "center", justifyContent: "center", padding: "0 2px" }}>
            {conv.unreadCount > 9 ? "9+" : conv.unreadCount}
          </span>
        )}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "6px" }}>
          <p style={{ color: "#ffffff", fontWeight: conv.unreadCount > 0 ? 700 : 500, fontSize: "13px", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {conv.otherUser?.name ?? "Pengguna"}
          </p>
          {conv.lastMessage && (
            <span style={{ color: conv.unreadCount > 0 ? "#ACEC00" : "rgba(255,255,255,0.3)", fontSize: "10px", flexShrink: 0, fontWeight: conv.unreadCount > 0 ? 600 : 400 }}>
              {formatTime(conv.lastMessage.createdAt)}
            </span>
          )}
        </div>
        {conv.lastMessage ? (
          <div style={{ display: "flex", alignItems: "center", gap: "4px", marginTop: "1px" }}>
            {isMine && (conv.lastMessage.isRead
              ? <CheckCheck style={{ width: "11px", height: "11px", color: "#ACEC00", flexShrink: 0 }} />
              : <Check style={{ width: "11px", height: "11px", color: "rgba(255,255,255,0.3)", flexShrink: 0 }} />
            )}
            <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "12px", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {isMine ? "Kamu: " : ""}{conv.lastMessage.content}
            </p>
          </div>
        ) : (
          <p style={{ color: "rgba(255,255,255,0.3)", fontSize: "12px", margin: "1px 0 0", fontStyle: "italic" }}>Belum ada pesan</p>
        )}
      </div>
    </button>
  );
}

// ─── Message Bubble ────────────────────────────────────────────────────────────
function MsgBubble({ message, isOwn, showAvatar }: { message: Message; isOwn: boolean; showAvatar: boolean; }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: "6px", marginBottom: "3px", justifyContent: isOwn ? "flex-end" : "flex-start" }}>
      {!isOwn && (
        <div style={{ width: "24px", height: "24px", borderRadius: "50%", background: getAvatarColor(message.sender.name), display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: "9px", fontWeight: "bold", flexShrink: 0, marginBottom: "2px", visibility: showAvatar ? "visible" : "hidden" }}>
          {getInitials(message.sender.name)}
        </div>
      )}
      <div style={{ maxWidth: "75%", display: "flex", flexDirection: "column", alignItems: isOwn ? "flex-end" : "flex-start" }}>
        <div style={
          isOwn
            ? { alignSelf: "flex-end", background: "#013FF6", color: "#ffffff", padding: "8px 14px", borderRadius: "16px 16px 4px 16px", maxWidth: "100%", fontSize: "13px" }
            : { alignSelf: "flex-start", background: "#012444", color: "#ffffff", padding: "8px 14px", borderRadius: "16px 16px 16px 4px", maxWidth: "100%", fontSize: "13px" }
        }>
          <p style={{ margin: 0, lineHeight: 1.5, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>{message.content}</p>
          <div style={{ display: "flex", alignItems: "center", gap: "3px", marginTop: "3px", justifyContent: isOwn ? "flex-end" : "flex-start" }}>
            <span style={{ color: "rgba(255,255,255,0.4)", fontSize: "10px" }}>{formatFullTime(message.createdAt)}</span>
            {isOwn && (message.isRead
              ? <CheckCheck style={{ width: "11px", height: "11px", color: "rgba(255,255,255,0.4)" }} />
              : <Check style={{ width: "11px", height: "11px", color: "rgba(255,255,255,0.3)" }} />
            )}
          </div>
        </div>
      </div>
      {isOwn && <div style={{ width: "24px", flexShrink: 0 }} />}
    </div>
  );
}
