// components/chat/SiswaChatWidget.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { MessageCircle, X, CheckCheck, Check, Loader2 } from "lucide-react";
import { useChatPolling, type ChatMessage } from "@/hooks/useChatPolling";
import { useSession } from "next-auth/react";

// ── Helpers ───────────────────────────────────────────────────────────────────
function formatTime(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffH = Math.floor(diffMs / 3600000);

  if (diffMin < 1) return "Baru saja";
  if (diffMin < 60) return `${diffMin}m lalu`;
  if (diffH < 24)
    return d.toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    });
  return d.toLocaleDateString("id-ID", { day: "numeric", month: "short" });
}

function formatDateLabel(iso: string) {
  return new Date(iso).toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function isSameDay(a: string, b: string) {
  return new Date(a).toDateString() === new Date(b).toDateString();
}

// ── Role Badge ─────────────────────────────────────────────────────────────────
function RoleBadge({ role }: { role: string }) {
  const isAdmin = role === "ADMIN";
  return (
    <span
      className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full ${
        isAdmin ? "bg-rose-100 text-rose-600" : "bg-violet-100 text-violet-600"
      }`}
    >
      {isAdmin ? "Admin" : "Guru"}
    </span>
  );
}

// ── Main Widget ───────────────────────────────────────────────────────────────
export default function SiswaChatWidget() {
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [panelMounted, setPanelMounted] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const markedRef = useRef(false);

  const { messages, unreadCount, loading, markAllRead, refetch } =
    useChatPolling({
      role: "SISWA",
      enabled: !!session?.user?.id,
    });

  // Auto-scroll
  useEffect(() => {
    if (isOpen) {
      setTimeout(
        () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }),
        80,
      );
    }
  }, [messages, isOpen]);

  // Mark all read saat panel dibuka
  useEffect(() => {
    if (isOpen && unreadCount > 0 && !markedRef.current) {
      markedRef.current = true;
      markAllRead();
    }
    if (!isOpen) markedRef.current = false;
  }, [isOpen, unreadCount, markAllRead]);

  const open = () => {
    setPanelMounted(true);
    setTimeout(() => setIsOpen(true), 10);
    refetch();
  };

  const close = () => {
    setIsOpen(false);
    setTimeout(() => setPanelMounted(false), 300);
  };

  const toggle = () => (isOpen ? close() : open());

  if (!session?.user || session.user.role !== "SISWA") return null;

  // Group messages by date
  const groups: { date: string; items: ChatMessage[] }[] = [];
  messages.forEach((m) => {
    const last = groups[groups.length - 1];
    if (last && isSameDay(last.date, m.createdAt)) {
      last.items.push(m);
    } else {
      groups.push({ date: m.createdAt, items: [m] });
    }
  });

  return (
    <>
      {/* ── Floating Panel ── */}
      {panelMounted && (
        <div
          className="fixed bottom-[88px] right-4 sm:right-6 z-50 w-[calc(100vw-2rem)] sm:w-[360px] max-w-[360px]"
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
            style={{ height: "460px" }}
          >
            {/* Header */}
            <div className="shrink-0 bg-gradient-to-r from-indigo-600 to-indigo-700 px-4 py-3.5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
                  <MessageCircle className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-white font-semibold text-sm leading-tight">
                    Pesan Masuk
                  </p>
                  <p className="text-indigo-200 text-[11px]">
                    {messages.length} pesan
                    {unreadCount > 0 && ` · ${unreadCount} belum dibaca`}
                  </p>
                </div>
              </div>
              <button
                onClick={close}
                className="p-1.5 rounded-lg hover:bg-white/20 transition-colors"
              >
                <X className="w-4 h-4 text-white" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-3 py-3 bg-gray-50/60">
              {loading ? (
                <div className="flex items-center justify-center h-full gap-2 text-gray-400">
                  <Loader2 className="w-5 h-5 animate-spin text-indigo-400" />
                  <span className="text-sm">Memuat pesan...</span>
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-3 text-gray-400 px-4">
                  <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center">
                    <MessageCircle className="w-6 h-6 opacity-40" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium text-gray-500">
                      Belum ada pesan
                    </p>
                    <p className="text-xs mt-1">
                      Pesan dari guru atau admin akan muncul di sini
                    </p>
                  </div>
                </div>
              ) : (
                groups.map((group, gi) => (
                  <div key={gi}>
                    {/* Date divider */}
                    <div className="flex items-center gap-2 my-3">
                      <div className="flex-1 h-px bg-gray-200" />
                      <span className="text-[10px] text-gray-400 font-semibold px-2 whitespace-nowrap">
                        {formatDateLabel(group.date)}
                      </span>
                      <div className="flex-1 h-px bg-gray-200" />
                    </div>

                    {group.items.map((msg) => (
                      <InboxBubble key={msg.id} message={msg} />
                    ))}
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Footer */}
            <div className="shrink-0 px-4 py-2.5 border-t border-gray-100 bg-white">
              <p className="text-[10px] text-gray-400 text-center">
                Balas pesan langsung ke guru atau admin Anda
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── FAB Button ── */}
      <button
        onClick={toggle}
        aria-label={`Chat${unreadCount > 0 ? ` — ${unreadCount} pesan baru` : ""}`}
        className={`fixed bottom-5 right-4 sm:right-6 z-50 w-14 h-14 rounded-2xl shadow-lg shadow-indigo-500/30 flex items-center justify-center transition-all duration-200 select-none ${
          isOpen
            ? "bg-gray-700 hover:bg-gray-800 scale-95"
            : "bg-indigo-600 hover:bg-indigo-700 hover:scale-105 active:scale-95"
        }`}
      >
        {isOpen ? (
          <X className="w-5 h-5 text-white" />
        ) : (
          <MessageCircle className="w-5 h-5 text-white" />
        )}
        {/* Badge */}
        {!isOpen && unreadCount > 0 && (
          <span
            className="absolute -top-1.5 -right-1.5 min-w-[20px] h-5 bg-rose-500 rounded-full border-2 border-white text-white text-[10px] font-bold flex items-center justify-center px-1"
            style={{ animation: "badgePop .3s cubic-bezier(.32,1.25,.6,1)" }}
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      <style>{`
        @keyframes badgePop {
          from { transform: scale(0); }
          to   { transform: scale(1); }
        }
      `}</style>
    </>
  );
}

// ── Inbox Bubble ───────────────────────────────────────────────────────────────
function InboxBubble({ message }: { message: ChatMessage }) {
  return (
    <div className="flex items-end gap-2.5 mb-3">
      {/* Sender avatar */}
      <div
        className={`w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-bold shrink-0 mb-0.5 ${
          message.senderRole === "ADMIN" ? "bg-rose-500" : "bg-violet-500"
        }`}
      >
        {message.senderName.charAt(0).toUpperCase()}
      </div>

      <div className="flex-1 min-w-0">
        {/* Name + role */}
        <div className="flex items-center gap-1.5 mb-1">
          <span className="text-[11px] font-semibold text-gray-700 truncate">
            {message.senderName}
          </span>
          <RoleBadge role={message.senderRole} />
        </div>

        {/* Bubble */}
        <div
          className={`rounded-2xl rounded-tl-sm px-3.5 py-2.5 relative inline-block max-w-full ${
            message.isRead
              ? "bg-white border border-gray-200 shadow-sm"
              : "bg-indigo-50 border border-indigo-200 shadow-sm"
          }`}
        >
          {/* Unread dot */}
          {!message.isRead && (
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-indigo-500 border-2 border-white" />
          )}
          <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap break-words">
            {message.content}
          </p>
          <div className="flex items-center justify-end gap-1.5 mt-1">
            <span className="text-[10px] text-gray-400">
              {formatTime(message.createdAt)}
            </span>
            {message.isRead ? (
              <CheckCheck className="w-3 h-3 text-indigo-500" />
            ) : (
              <Check className="w-3 h-3 text-gray-300" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
