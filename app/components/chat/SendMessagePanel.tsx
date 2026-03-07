// components/chat/SendMessagePanel.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import {
  MessageCircle,
  X,
  Send,
  Search,
  ChevronLeft,
  CheckCheck,
  Check,
  Loader2,
  Users,
  School,
  MapPin,
} from "lucide-react";
import { useChatPolling, type ChatMessage } from "@/hooks/useChatPolling";
import { useSession } from "next-auth/react";

interface Recipient {
  id: number; // Int — sesuai User.id
  name: string;
  username: string; // NIS
  kelas: string;
  tempatPKL: string;
}

// ── Helpers ────────────────────────────────────────────────────────────────────
function formatTime(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const diffMin = Math.floor((now.getTime() - d.getTime()) / 60000);
  if (diffMin < 1) return "Baru saja";
  if (diffMin < 60) return `${diffMin}m lalu`;
  if (diffMin < 1440)
    return d.toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    });
  return d.toLocaleDateString("id-ID", { day: "numeric", month: "short" });
}

// ── Main Component ─────────────────────────────────────────────────────────────
export default function SendMessagePanel({ role }: { role: "ADMIN" | "GURU" }) {
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [panelMounted, setPanelMounted] = useState(false);
  const [view, setView] = useState<"list" | "thread">("list");

  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRec, setSelectedRec] = useState<Recipient | null>(null);
  const [messageInput, setMessageInput] = useState("");
  const [sending, setSending] = useState(false);
  const [loadingRec, setLoadingRec] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const { messages, sendMessage, refetch } = useChatPolling({
    role,
    enabled: !!session?.user?.id,
  });

  // Load daftar siswa saat panel dibuka
  useEffect(() => {
    if (!isOpen) return;
    setLoadingRec(true);
    fetch("/api/chat/recipients", { credentials: "include" })
      .then((r) => r.json())
      .then((d) => setRecipients(Array.isArray(d) ? d : []))
      .catch(() => {})
      .finally(() => setLoadingRec(false));
  }, [isOpen]);

  // Auto-scroll
  useEffect(() => {
    if (view === "thread") {
      setTimeout(
        () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }),
        80,
      );
    }
  }, [messages, view]);

  const open = () => {
    setPanelMounted(true);
    setTimeout(() => setIsOpen(true), 10);
    setView("list");
    refetch();
  };

  const close = () => {
    setIsOpen(false);
    setTimeout(() => setPanelMounted(false), 300);
  };

  const toggle = () => (isOpen ? close() : open());

  const selectRecipient = (r: Recipient) => {
    setSelectedRec(r);
    setView("thread");
    setMessageInput("");
    setTimeout(() => inputRef.current?.focus(), 120);
  };

  const goBack = () => {
    setView("list");
    setSelectedRec(null);
  };

  const handleSend = async () => {
    if (!selectedRec || !messageInput.trim() || sending) return;
    setSending(true);
    try {
      await sendMessage(selectedRec.id, messageInput.trim());
      setMessageInput("");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Gagal mengirim");
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

  // Pesan untuk thread yang dipilih
  const thread: ChatMessage[] = selectedRec
    ? messages.filter((m) => m.receiverId === selectedRec.id)
    : [];

  // List dengan preview + status
  const recWithStats = recipients.map((r) => {
    const msgs = messages.filter((m) => m.receiverId === r.id);
    const lastMsg = msgs[msgs.length - 1];
    const unread = msgs.filter((m) => !m.isRead).length;
    return { ...r, lastMsg, unread, msgCount: msgs.length };
  });

  const filtered = recWithStats.filter(
    (r) =>
      r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.kelas.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.tempatPKL.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // Warna aksen berdasarkan role
  const accent =
    role === "ADMIN"
      ? { bg: "#4f46e5", hover: "#4338ca", shadow: "indigo-500/30" }
      : { bg: "#7c3aed", hover: "#6d28d9", shadow: "violet-500/30" };

  if (!session?.user || session.user.role === "SISWA") return null;

  return (
    <>
      {/* ── Floating Panel ── */}
      {panelMounted && (
        <div
          className="fixed bottom-[88px] right-4 sm:right-6 z-50 w-[calc(100vw-2rem)] sm:w-[380px] max-w-[380px]"
          style={{
            transition:
              "opacity .28s, transform .28s cubic-bezier(.32,1.25,.6,1)",
            opacity: isOpen ? 1 : 0,
            transform: isOpen
              ? "translateY(0) scale(1)"
              : "translateY(14px) scale(.97)",
            pointerEvents: isOpen ? "auto" : "none",
          }}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden"
            style={{ height: "500px" }}
          >
            {/* Header */}
            <div
              className="shrink-0 px-4 py-3.5 flex items-center justify-between"
              style={{
                background: `linear-gradient(to right, ${accent.bg}, ${accent.hover})`,
              }}
            >
              <div className="flex items-center gap-2.5">
                {view === "thread" && (
                  <button
                    onClick={goBack}
                    className="p-1 rounded-lg hover:bg-white/20 transition-colors shrink-0"
                  >
                    <ChevronLeft className="w-4 h-4 text-white" />
                  </button>
                )}
                <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                  {view === "thread" && selectedRec ? (
                    <span className="text-white text-xs font-bold">
                      {selectedRec.name.charAt(0)}
                    </span>
                  ) : (
                    <MessageCircle className="w-4 h-4 text-white" />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-white font-semibold text-sm leading-tight truncate">
                    {view === "thread" && selectedRec
                      ? selectedRec.name
                      : "Kirim Pesan"}
                  </p>
                  <p className="text-white/70 text-[11px] truncate">
                    {view === "thread" && selectedRec
                      ? `NIS: ${selectedRec.username} · ${selectedRec.kelas}`
                      : `${messages.length} pesan terkirim`}
                  </p>
                </div>
              </div>
              <button
                onClick={close}
                className="p-1.5 rounded-lg hover:bg-white/20 transition-colors shrink-0"
              >
                <X className="w-4 h-4 text-white" />
              </button>
            </div>

            {/* ── View: List ── */}
            {view === "list" && (
              <>
                {/* Search */}
                <div className="shrink-0 px-3 py-2.5 border-b border-gray-100">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      placeholder="Cari nama, NIS, kelas..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-gray-50 border border-gray-200 text-xs text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                    />
                  </div>
                </div>

                {/* Recipient list */}
                <div className="flex-1 overflow-y-auto">
                  {loadingRec ? (
                    <div className="flex items-center justify-center h-full gap-2 text-gray-400">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span className="text-sm">Memuat daftar siswa...</span>
                    </div>
                  ) : filtered.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full gap-2 text-gray-400 px-4">
                      <Users className="w-8 h-8 opacity-30" />
                      <p className="text-sm">Tidak ada siswa ditemukan</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-50">
                      {filtered.map((r) => (
                        <button
                          key={r.id}
                          onClick={() => selectRecipient(r)}
                          className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left"
                        >
                          {/* Avatar */}
                          <div
                            className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0"
                            style={{ background: accent.bg }}
                          >
                            {r.name.slice(0, 2).toUpperCase()}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-1">
                              <p className="font-semibold text-gray-800 text-sm truncate">
                                {r.name}
                              </p>
                              {r.lastMsg && (
                                <span className="text-[10px] text-gray-400 shrink-0">
                                  {formatTime(r.lastMsg.createdAt)}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className="text-[10px] text-gray-400 flex items-center gap-1 shrink-0">
                                <School className="w-3 h-3" />
                                {r.kelas}
                              </span>
                              {r.tempatPKL !== "—" && (
                                <>
                                  <span className="text-gray-200">·</span>
                                  <span className="text-[10px] text-gray-400 truncate flex items-center gap-1">
                                    <MapPin className="w-3 h-3 shrink-0" />
                                    <span className="truncate">
                                      {r.tempatPKL}
                                    </span>
                                  </span>
                                </>
                              )}
                            </div>
                            {/* Last message preview */}
                            {r.lastMsg && (
                              <div className="flex items-center gap-1 mt-0.5">
                                {r.unread > 0 ? (
                                  <Check className="w-3 h-3 text-gray-300 shrink-0" />
                                ) : (
                                  <CheckCheck
                                    className="w-3 h-3 shrink-0"
                                    style={{ color: accent.bg }}
                                  />
                                )}
                                <p className="text-[10px] text-gray-400 truncate">
                                  {r.lastMsg.content}
                                </p>
                                {r.unread > 0 && (
                                  <span className="shrink-0 text-[9px] font-bold px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded-full">
                                    belum dibaca
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}

            {/* ── View: Thread ── */}
            {view === "thread" && selectedRec && (
              <>
                {/* Messages */}
                <div className="flex-1 overflow-y-auto px-3 py-3 bg-gray-50/60 space-y-1">
                  {thread.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full gap-3 text-gray-400">
                      <MessageCircle className="w-8 h-8 opacity-30" />
                      <div className="text-center">
                        <p className="text-sm font-medium text-gray-500">
                          Belum ada pesan
                        </p>
                        <p className="text-xs mt-1">
                          Mulai percakapan dengan {selectedRec.name}
                        </p>
                      </div>
                    </div>
                  ) : (
                    thread.map((msg) => (
                      <SentBubble
                        key={msg.id}
                        message={msg}
                        accentColor={accent.bg}
                      />
                    ))
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="shrink-0 px-3 py-3 border-t border-gray-100 bg-white">
                  <div className="flex items-end gap-2">
                    <textarea
                      ref={inputRef}
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      onKeyDown={handleKey}
                      placeholder={`Tulis pesan ke ${selectedRec.name}...`}
                      rows={2}
                      className="flex-1 resize-none px-3 py-2 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-200 leading-relaxed"
                    />
                    <button
                      onClick={handleSend}
                      disabled={!messageInput.trim() || sending}
                      className="p-2.5 rounded-xl transition-all shrink-0 disabled:opacity-40 disabled:cursor-not-allowed"
                      style={{
                        background:
                          messageInput.trim() && !sending
                            ? accent.bg
                            : undefined,
                        color:
                          messageInput.trim() && !sending ? "white" : undefined,
                        backgroundColor:
                          !messageInput.trim() || sending
                            ? "#f3f4f6"
                            : undefined,
                      }}
                    >
                      {sending ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Send
                          className={`w-4 h-4 ${!messageInput.trim() ? "text-gray-300" : ""}`}
                        />
                      )}
                    </button>
                  </div>
                  <p className="text-[10px] text-gray-400 mt-1.5 text-right">
                    Enter kirim · Shift+Enter baris baru
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ── FAB ── */}
      <button
        onClick={toggle}
        aria-label="Buka panel kirim pesan"
        className={`fixed bottom-5 right-4 sm:right-6 z-50 w-14 h-14 rounded-2xl shadow-lg flex items-center justify-center transition-all duration-200 select-none ${
          isOpen
            ? "bg-gray-700 hover:bg-gray-800 scale-95"
            : "hover:scale-105 active:scale-95"
        }`}
        style={
          !isOpen
            ? {
                background: accent.bg,
                boxShadow: `0 8px 25px -5px ${accent.bg}55`,
              }
            : undefined
        }
      >
        {isOpen ? (
          <X className="w-5 h-5 text-white" />
        ) : (
          <MessageCircle className="w-5 h-5 text-white" />
        )}
      </button>
    </>
  );
}

// ── Sent Bubble ────────────────────────────────────────────────────────────────
function SentBubble({
  message,
  accentColor,
}: {
  message: ChatMessage;
  accentColor: string;
}) {
  return (
    <div className="flex justify-end mb-2">
      <div className="max-w-[82%]">
        <div
          className="rounded-2xl rounded-br-sm px-3.5 py-2.5 text-white"
          style={{ background: accentColor }}
        >
          <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
            {message.content}
          </p>
        </div>
        <div className="flex items-center justify-end gap-1.5 mt-1 pr-0.5">
          <span className="text-[10px] text-gray-400">
            {formatTime(message.createdAt)}
          </span>
          {message.isRead ? (
            <CheckCheck
              className="w-3 h-3 text-indigo-500"
              title="Sudah dibaca"
            />
          ) : (
            <Check className="w-3 h-3 text-gray-300" title="Belum dibaca" />
          )}
        </div>
      </div>
    </div>
  );
}
