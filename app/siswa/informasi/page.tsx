"use client";

import Sidebar from "@/components/layout/SidebarSiswa";
import TopBar from "@/components/layout/TopBar";
import { useState, useEffect, useCallback } from "react";
import { Loader2, Megaphone } from "lucide-react";

interface Informasi {
  id: number;
  judul: string;
  konten: string;
  pembuat: string;
  createdAt: string;
}

function formatRelTime(raw: string) {
  const diff = Date.now() - new Date(raw).getTime();
  const m = Math.floor(diff / 60000);
  const h = Math.floor(diff / 3600000);
  const d = Math.floor(diff / 86400000);
  if (m < 1) return "Baru saja";
  if (m < 60) return `${m} mnt lalu`;
  if (h < 24) return `${h} jam lalu`;
  if (d < 7) return `${d} hari lalu`;
  return new Date(raw).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
}

export default function SiswaInformasi() {
  const [items, setItems] = useState<Informasi[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/informasi");
      const json = await res.json();
      setItems(json.data || []);
    } catch {
      setItems([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const toggleExpand = (id: number) =>
    setExpandedIds(p => { const n = new Set(p); n.has(id) ? n.delete(id) : n.add(id); return n; });

  return (
    <div className="flex h-screen bg-[#00182E] overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TopBar />
        <main className="flex-1 overflow-y-auto overflow-x-hidden bg-[#00182E] px-4 sm:px-6 lg:px-8 py-8">

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Informasi PKL
            </h1>
            <p className="text-white/45 text-sm mt-1.5">
              {isLoading ? "Memuat..." : `${items.length} pengumuman untukmu`}
            </p>
          </div>

          {/* Feed */}
          {isLoading ? (
            <div className="flex items-center justify-center py-32">
              <Loader2 className="w-6 h-6 text-[#ACEC00] animate-spin" />
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-28 text-center">
              <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-5">
                <Megaphone className="w-7 h-7 text-white/20" />
              </div>
              <p className="font-bold text-white/50 text-sm mb-1.5">Belum ada informasi</p>
              <p className="text-white/30 text-[12px]">Pengumuman dari guru atau admin akan tampil di sini.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {items.map((item, idx) => {
                const isExpanded = expandedIds.has(item.id);
                const isLong = item.konten.length > 120;
                return (
                  <div
                    key={item.id}
                    onClick={() => toggleExpand(item.id)}
                    style={{ animation: `fadeInUp .35s ease ${idx * 0.06}s both` }}
                    className="bg-white/5 border border-white/8 rounded-2xl p-5 cursor-pointer hover:bg-white/8 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-black/30 transition-all duration-200"
                  >
                    <div className="flex items-start gap-3">
                      <span className="shrink-0 mt-2 w-2 h-2 rounded-full bg-[#ACEC00]" />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-white text-[15px] leading-snug mb-2">
                          {item.judul}
                        </h3>
                        <p className={`text-white/60 text-sm leading-relaxed whitespace-pre-wrap ${isExpanded ? "" : "line-clamp-2"}`}>
                          {item.konten}
                        </p>
                        {!isExpanded && isLong && (
                          <span className="text-[#ACEC00] text-[11px] font-semibold mt-1.5 block">
                            Baca selengkapnya →
                          </span>
                        )}
                        <div className="flex items-center gap-2 mt-3">
                          <span className="text-[11px] font-semibold text-white/50">{item.pembuat}</span>
                          <span className="w-1 h-1 rounded-full bg-white/20" />
                          <span className="text-[11px] text-white/35">{formatRelTime(item.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>
      <style>{`@keyframes fadeInUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}`}</style>
    </div>
  );
}
