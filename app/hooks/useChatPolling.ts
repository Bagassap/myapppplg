"use client";

import { useState, useEffect, useCallback, useRef } from "react";

export interface ChatMessage {
    id: number;
    senderId: number;     // Int
    receiverId: number;     // Int
    senderName: string;
    senderRole: "ADMIN" | "GURU";
    content: string;
    isRead: boolean;
    readAt: string | null;
    createdAt: string;
}

interface UseChatPollingOptions {
    role: "SISWA" | "ADMIN" | "GURU";
    pollInterval?: number;  // ms, default 10000
    enabled?: boolean;
}

export function useChatPolling({
    role,
    pollInterval = 10000,
    enabled = true,
}: UseChatPollingOptions) {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const isMountedRef = useRef(true);

    useEffect(() => {
        isMountedRef.current = true;
        return () => { isMountedRef.current = false; };
    }, []);

    const fetchMessages = useCallback(async () => {
        if (!isMountedRef.current) return;
        try {
            const res = await fetch("/api/chat", { credentials: "include" });
            if (!res.ok) throw new Error("Gagal memuat pesan");
            const data: ChatMessage[] = await res.json();
            if (!isMountedRef.current) return;
            setMessages(data);
            if (role === "SISWA") {
                setUnreadCount(data.filter((m) => !m.isRead).length);
            }
            setError(null);
        } catch (err) {
            if (!isMountedRef.current) return;
            setError(err instanceof Error ? err.message : "Error");
        } finally {
            if (isMountedRef.current) setLoading(false);
        }
    }, [role]);

    const pollUnread = useCallback(async () => {
        if (role !== "SISWA" || !isMountedRef.current) return;
        try {
            const res = await fetch("/api/chat/unread", { credentials: "include" });
            if (!res.ok || !isMountedRef.current) return;
            const { count } = await res.json();
            setUnreadCount(count);
        } catch { }
    }, [role]);

    useEffect(() => {
        if (!enabled) return;
        setLoading(true);
        fetchMessages();
    }, [enabled, fetchMessages]);

    useEffect(() => {
        if (!enabled || role !== "SISWA") return;
        intervalRef.current = setInterval(pollUnread, pollInterval);
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [enabled, role, pollInterval, pollUnread]);

    const sendMessage = useCallback(async (receiverId: number, content: string) => {
        const res = await fetch("/api/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ receiverId, content }),
        });
        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err.error ?? "Gagal mengirim pesan");
        }
        const newMsg: ChatMessage = await res.json();
        setMessages((prev) => [...prev, newMsg]);
        return newMsg;
    }, []);

    const markAllRead = useCallback(async () => {
        if (role !== "SISWA") return;
        try {
            await fetch("/api/chat/read", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ messageIds: [] }),
            });
            setMessages((prev) => prev.map((m) => ({ ...m, isRead: true })));
            setUnreadCount(0);
        } catch { }
    }, [role]);

    const refetch = useCallback(() => {
        setLoading(true);
        fetchMessages();
    }, [fetchMessages]);

    return {
        messages,
        unreadCount,
        loading,
        error,
        sendMessage,
        markAllRead,
        refetch,
    };
}