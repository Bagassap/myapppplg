"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { MessageCircle } from "lucide-react";
import { useSession } from "next-auth/react";

export default function ChatIconButton() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [unread, setUnread] = useState(0);

  const isOnChat = pathname === "/chat";

  useEffect(() => {
    if (status !== "authenticated" || isOnChat) return;

    const fetchUnread = async () => {
      try {
        const r = await fetch("/api/chat/unread");
        if (r.ok) {
          const { count } = await r.json();
          setUnread(count);
        }
      } catch {}
    };

    fetchUnread();
    const id = setInterval(fetchUnread, 10000);
    return () => clearInterval(id);
  }, [status, isOnChat]);

  useEffect(() => {
    if (isOnChat) setUnread(0);
  }, [isOnChat]);

  return (
    <button
      onClick={() => router.push("/chat")}
      className="relative p-2 rounded-xl hover:bg-gray-100 transition-colors"
      title="Chat"
      aria-label="Buka chat"
    >
      <MessageCircle
        className={`w-5 h-5 ${isOnChat ? "text-indigo-600" : "text-gray-500"}`}
      />
      {unread > 0 && !isOnChat && (
        <span className="absolute top-1 right-1 min-w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center px-0.5 leading-none">
          {unread > 99 ? "99+" : unread}
        </span>
      )}
    </button>
  );
}
