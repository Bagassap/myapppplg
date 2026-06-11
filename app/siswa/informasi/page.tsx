"use client";

import Sidebar from "@/components/layout/SidebarSiswa";
import TopBar from "@/components/layout/TopBar";
import { useState, useEffect, useCallback } from "react";
import {
  Info, Bell, AlertTriangle, CheckCircle2, X,
  Pin, Search, Eye, MessageCircle, Calendar, Loader2,
  Megaphone, ChevronRight, BarChart2, Clock, Send, Flag,
} from "lucide-react";

interface Komentar {
  id: number;
  nama: string;
  isi: string;
  tanggal: string;
  createdAt: string;
}

interface Informasi {
  id: number;
  judul: string;
  isi: string;
  tanggal: string;
  kategori: string;
  tipe: string;
  tempatPKL: string | null;
  isPinned: boolean;
  viewCount: number;
  target: string;
  createdAt: string;
  _count: { komentar: number };
}

type KategoriKey = "Pengumuman" | "Update" | "Perhatian" | "Penting";
type TargetKey = "SEMUA" | "GURU" | "SISWA";

const KATEGORI_CFG: Record<KategoriKey, {
  Icon: React.ComponentType<{ className?: string }>;
  bg: string; text: string; border: string; dot: string;
}> = {
  Pengumuman: { Icon: Info, bg: "bg-[#013FF6]/10", text: "text-[#013FF6]", border: "border-[#013FF6]/20", dot: "bg-[#013FF6]" },
  Update: { Icon: CheckCircle2, bg: "bg-[#ACEC00]/10", text: "text-[#00182E]", border: "border-[#ACEC00]/30", dot: "bg-[#ACEC00]" },
  Perhatian: { Icon: AlertTriangle, bg: "bg-[#013FF6]/10", text: "text-[#013FF6]", border: "border-[#013FF6]/20", dot: "bg-[#013FF6]" },
  Penting: { Icon: Bell, bg: "bg-[#00182E]/10", text: "text-[#00182E]", border: "border-[#00182E]/20", dot: "bg-[#00182E]" },
};

const TARGET_CFG: Record<TargetKey, { label: string; bg: string; text: string; border: string }> = {
  SEMUA: { label: "Semua", bg: "bg-[#013FF6]/10", text: "text-[#013FF6]", border: "border-[#013FF6]/20" },
  GURU: { label: "Guru", bg: "bg-[#00182E]/10", text: "text-[#00182E]", border: "border-[#00182E]/20" },
  SISWA: { label: "Siswa", bg: "bg-[#ACEC00]/10", text: "text-[#00182E]", border: "border-[#ACEC00]/30" },
};

const KATEGORI_LIST: KategoriKey[] = ["Pengumuman", "Update", "Perhatian", "Penting"];
const TARGET_KEYS: TargetKey[] = ["SEMUA", "GURU", "SISWA"];

function formatRelTime(raw: string) {
  const d = new Date(raw);
  const diff = Date.now() - d.getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (mins < 1) return "Baru saja";
  if (mins < 60) return `${mins} mnt lalu`;
  if (hours < 24) return `${hours} jam lalu`;
  if (days < 7) return `${days} hari lalu`;
  return d.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
}

function formatDate(raw: string) {
  if (!raw) return "-";
  const d = new Date(raw);
  if (isNaN(d.getTime())) return raw;
  return d.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
}

function getInitial(nama: string) {
  return nama.trim().charAt(0).toUpperCase();
}

export default function SiswaInformasi() {
  const [items, setItems] = useState<Informasi[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [detailItem, setDetailItem] = useState<Informasi | null>(null);
  const [komentars, setKomentars] = useState<Komentar[]>([]);
  const [komentarLoading, setKomentarLoading] = useState(false);
  const [newKomentar, setNewKomentar] = useState("");
  const [sendingKomentar, setSendingKomentar] = useState(false);

  const [showLapor, setShowLapor] = useState(false);
  const [laporForm, setLaporForm] = useState({ judul: "", deskripsi: "" });
  const [sendingLapor, setSendingLapor] = useState(false);
  const [laporSent, setLaporSent] = useState(false);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      const res = await fetch(`/api/informasi?${params}`);
      if (!res.ok) throw new Error();
      const json = await res.json();
      setItems(json.data || []);
      setTotal(json.total || 0);
    } catch {
      setItems([]);
    } finally {
      setIsLoading(false);
    }
  }, [search]);

  useEffect(() => {
    const t = setTimeout(fetchData, 300);
    return () => clearTimeout(t);
  }, [fetchData]);

  const openDetail = async (item: Informasi) => {
    setDetailItem(item);
    setKomentarLoading(true);
    setKomentars([]);
    setNewKomentar("");
    setShowLapor(false);
    setLaporSent(false);
    setLaporForm({ judul: "", deskripsi: "" });
    try {
      const res = await fetch(`/api/informasi/komentar?informasiId=${item.id}`);
      if (res.ok) setKomentars(await res.json());
    } catch {} finally { setKomentarLoading(false); }
  };

  const closeDetail = () => {
    setDetailItem(null);
    setKomentars([]);
    setNewKomentar("");
    setShowLapor(false);
    setLaporSent(false);
  };

  const handleSendKomentar = async () => {
    if (!newKomentar.trim() || !detailItem) return;
    setSendingKomentar(true);
    try {
      const res = await fetch("/api/informasi/komentar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ informasiId: detailItem.id, isi: newKomentar }),
      });
      if (res.ok) {
        const k = await res.json();
        setKomentars(prev => [...prev, k]);
        setNewKomentar("");
        setItems(prev => prev.map(it => it.id === detailItem.id ? { ...it, _count: { komentar: it._count.komentar + 1 } } : it));
      }
    } catch {} finally { setSendingKomentar(false); }
  };

  const handleSendLapor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!detailItem) return;
    setSendingLapor(true);
    try {
      const res = await fetch("/api/informasi/lapor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ informasiId: detailItem.id, ...laporForm }),
      });
      if (res.ok) {
        setLaporSent(true);
        setShowLapor(false);
        setLaporForm({ judul: "", deskripsi: "" });
      }
    } catch {} finally { setSendingLapor(false); }
  };

  return (
    <div className="flex h-screen bg-slate-100 overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TopBar />
        <main className="flex-1 overflow-y-auto overflow-x-hidden bg-slate-100 px-4 sm:px-6 lg:px-8 py-6">
          <nav className="flex items-center gap-1.5 mb-5 text-[11px]">
            <span className="text-gray-400">absensipkl</span>
            <ChevronRight className="w-3 h-3 text-gray-300" />
            <span className="text-gray-400">siswa</span>
            <ChevronRight className="w-3 h-3 text-gray-300" />
            <span className="font-semibold text-gray-700">informasi</span>
          </nav>

          {/* Hero Banner */}
          <div className="relative bg-[#00182E] rounded-2xl overflow-hidden mb-5 p-6 sm:p-8">
            <div className="absolute -top-12 -right-12 w-52 h-52 rounded-full bg-[#013FF6]/10 pointer-events-none" />
            <div className="absolute -bottom-10 right-24 w-36 h-36 rounded-full bg-[#ACEC00]/8 pointer-events-none" />
            <div className="absolute top-6 right-36 w-14 h-14 rounded-full bg-[#013FF6]/10 pointer-events-none" />
            <div className="absolute top-4 right-8 grid grid-cols-5 gap-1.5 opacity-15 pointer-events-none">
              {Array.from({ length: 15 }).map((_, i) => (
                <div key={i} className="w-1 h-1 rounded-full bg-white" />
              ))}
            </div>

            <div className="relative z-10 flex items-start justify-between gap-4 mb-5">
              <span className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-3 py-1.5 text-[11px] font-semibold text-white/90 tracking-wide">
                <span className="w-1.5 h-1.5 rounded-full bg-[#ACEC00]" />
                Informasi PKL Aktif
              </span>
            </div>

            <div className="relative z-10 mb-6">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-1.5">Informasi PKL</h1>
              <p className="text-sm text-white/55 max-w-md leading-relaxed">
                Lihat pengumuman &amp; informasi terkini terkait Program Kerja Lapangan kamu.
              </p>
            </div>

            <div className="relative z-10 grid grid-cols-3 gap-3">
              {[
                { icon: <BarChart2 className="w-3.5 h-3.5" />, val: total, label: "TOTAL INFORMASI" },
                { icon: <Pin className="w-3.5 h-3.5" />, val: items.filter(i => i.isPinned).length, label: "DISEMATKAN" },
                { icon: <MessageCircle className="w-3.5 h-3.5" />, val: items.reduce((a, b) => a + b._count.komentar, 0), label: "TOTAL KOMENTAR" },
              ].map((st, i) => (
                <div key={i} className="bg-white/8 border border-white/10 rounded-2xl p-4">
                  <div className="w-7 h-7 rounded-lg bg-white/12 flex items-center justify-center mb-3 text-white/75">
                    {st.icon}
                  </div>
                  <div className="text-2xl font-bold text-white leading-none">{st.val}</div>
                  <div className="text-[10px] font-semibold text-white/45 mt-1.5 tracking-wider">{st.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Cari informasi..."
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-800 placeholder:text-gray-400 focus:ring-2 focus:ring-[#013FF6]/30 outline-none transition-all shadow-sm"
            />
          </div>

          {/* Feed */}
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#00182E] flex items-center justify-center">
                  <Megaphone className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="font-bold text-gray-800 text-[15px]">Daftar Informasi PKL</h2>
                  <p className="text-[11px] text-gray-400">Klik untuk baca &amp; komentar</p>
                </div>
              </div>
              <span className="text-[11px] font-bold text-[#013FF6] bg-[#013FF6]/10 border border-[#013FF6]/20 px-2.5 py-1 rounded-full">
                {total} item
              </span>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-6 h-6 text-[#013FF6] animate-spin" />
              </div>
            ) : items.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center px-6">
                <div className="w-20 h-20 rounded-full border-2 border-dashed border-gray-200 flex items-center justify-center mb-5">
                  <Megaphone className="w-7 h-7 text-gray-300" />
                </div>
                <p className="font-bold text-gray-700 text-sm mb-1.5">Belum ada informasi</p>
                <p className="text-gray-400 text-[12px] max-w-xs leading-relaxed">
                  Pengumuman dari guru atau admin akan tampil di sini.
                </p>
              </div>
            ) : (
              <div>
                {items.map((item, idx) => {
                  const katKey = KATEGORI_LIST.includes(item.kategori as KategoriKey) ? item.kategori as KategoriKey : "Pengumuman";
                  const tgtKey = TARGET_KEYS.includes(item.target as TargetKey) ? item.target as TargetKey : "SEMUA";
                  const cfg = KATEGORI_CFG[katKey];
                  const tgtCfg = TARGET_CFG[tgtKey];
                  const { Icon } = cfg;
                  const isLast = idx === items.length - 1;
                  return (
                    <div
                      key={item.id}
                      onClick={() => openDetail(item)}
                      className={`group relative flex items-start gap-4 px-6 py-5 cursor-pointer transition-all duration-150 hover:bg-[#013FF6]/5 ${!isLast ? "border-b border-gray-100" : ""}`}
                    >
                      {item.isPinned && <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#ACEC00]" />}
                      <div className={`shrink-0 mt-0.5 w-10 h-10 rounded-xl ${cfg.bg} flex items-center justify-center`}>
                        <Icon className={`w-5 h-5 ${cfg.text}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1.5">
                          {item.isPinned && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#ACEC00]/10 text-[#00182E] border border-[#ACEC00]/30">
                              <Pin className="w-2.5 h-2.5" /> Disematkan
                            </span>
                          )}
                          <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />{item.kategori}
                          </span>
                          <span className={`inline-flex text-[10px] font-bold px-2 py-0.5 rounded-full border ${tgtCfg.bg} ${tgtCfg.text} ${tgtCfg.border}`}>
                            {tgtCfg.label}
                          </span>
                          <span className="text-[11px] text-gray-400 flex items-center gap-1">
                            <Clock className="w-3 h-3" />{formatRelTime(item.createdAt)}
                          </span>
                        </div>
                        <h4 className="font-bold text-gray-800 text-sm leading-snug mb-1.5 group-hover:text-[#013FF6] transition-colors">
                          {item.judul}
                        </h4>
                        <p className="text-gray-500 text-[12.5px] leading-relaxed line-clamp-2">{item.isi}</p>
                        <div className="flex items-center gap-4 mt-3">
                          <span className="flex items-center gap-1 text-[11px] text-gray-400"><Eye className="w-3 h-3" /> {item.viewCount}</span>
                          <span className="flex items-center gap-1 text-[11px] text-[#013FF6] font-semibold"><MessageCircle className="w-3 h-3" /> {item._count.komentar}</span>
                          <span className="flex items-center gap-1 text-[11px] text-gray-400"><Calendar className="w-3 h-3" /> {formatDate(item.tanggal)}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {items.length > 0 && (
              <div className="flex items-center gap-2 px-6 py-4 bg-slate-50 border-t border-gray-100">
                <Clock className="w-3.5 h-3.5 text-gray-400" />
                <span className="text-[11px] text-gray-400">Menampilkan</span>
                <span className="w-1 h-1 rounded-full bg-gray-300" />
                <span className="text-[11px] font-bold text-[#013FF6] bg-[#013FF6]/10 px-2 py-0.5 rounded-lg">
                  {total} informasi aktif
                </span>
              </div>
            )}
          </div>

          {/* Detail Modal */}
          {detailItem && (
            <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
              <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={closeDetail} />
              <div
                className="relative bg-white w-full sm:max-w-2xl max-h-[92vh] sm:rounded-2xl rounded-t-3xl shadow-2xl overflow-hidden flex flex-col"
                style={{ animation: "slideUp .25s cubic-bezier(.32,1.25,.6,1)" }}
              >
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 sticky top-0 bg-white z-10">
                  <div className="flex items-center gap-3 min-w-0">
                    {(() => {
                      const k = KATEGORI_LIST.includes(detailItem.kategori as KategoriKey) ? detailItem.kategori as KategoriKey : "Pengumuman";
                      const c = KATEGORI_CFG[k]; const { Icon } = c;
                      return <div className={`shrink-0 w-9 h-9 rounded-xl ${c.bg} flex items-center justify-center`}><Icon className={`w-4 h-4 ${c.text}`} /></div>;
                    })()}
                    <p className="font-bold text-gray-800 truncate">{detailItem.judul}</p>
                  </div>
                  <button onClick={closeDetail} className="shrink-0 p-2 hover:bg-gray-100 rounded-xl transition-colors">
                    <X className="w-5 h-5 text-gray-400" />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto">
                  {/* Content */}
                  <div className="px-5 py-5 border-b border-gray-100">
                    <div className="flex items-center gap-2 flex-wrap mb-3">
                      {(() => {
                        const k = KATEGORI_LIST.includes(detailItem.kategori as KategoriKey) ? detailItem.kategori as KategoriKey : "Pengumuman";
                        const t = TARGET_KEYS.includes(detailItem.target as TargetKey) ? detailItem.target as TargetKey : "SEMUA";
                        const c = KATEGORI_CFG[k]; const tc = TARGET_CFG[t];
                        return (
                          <>
                            <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${c.bg} ${c.text} ${c.border}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />{detailItem.kategori}
                            </span>
                            <span className={`inline-flex text-[10px] font-bold px-2 py-0.5 rounded-full border ${tc.bg} ${tc.text} ${tc.border}`}>{tc.label}</span>
                            <span className="text-[11px] text-gray-400 flex items-center gap-1"><Calendar className="w-3 h-3" />{formatDate(detailItem.tanggal)}</span>
                            <span className="text-[11px] text-gray-400">{formatRelTime(detailItem.createdAt)}</span>
                          </>
                        );
                      })()}
                    </div>
                    <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap mb-4">{detailItem.isi}</p>

                    {/* Lapor toggle */}
                    {laporSent ? (
                      <div className="flex items-center gap-2 p-3 rounded-xl bg-[#ACEC00]/10 border border-[#ACEC00]/20">
                        <CheckCircle2 className="w-4 h-4 text-[#00182E]" />
                        <span className="text-[12px] font-semibold text-[#00182E]">Laporan berhasil dikirim.</span>
                      </div>
                    ) : (
                      <button
                        onClick={() => setShowLapor(v => !v)}
                        className="flex items-center gap-2 text-[11px] font-semibold text-gray-500 hover:text-rose-500 transition-colors"
                      >
                        <Flag className="w-3.5 h-3.5" /> Laporkan konten ini
                      </button>
                    )}

                    {/* Lapor form */}
                    {showLapor && !laporSent && (
                      <form onSubmit={handleSendLapor} className="mt-3 p-4 rounded-xl bg-gray-50 border border-gray-200 space-y-3">
                        <p className="text-[11px] font-bold text-gray-600 uppercase tracking-wider">Form Laporan</p>
                        <input
                          value={laporForm.judul}
                          required
                          onChange={e => setLaporForm({ ...laporForm, judul: e.target.value })}
                          placeholder="Judul masalah..."
                          className="w-full px-3 py-2.5 rounded-xl bg-white border border-gray-200 text-sm text-gray-800 focus:ring-2 focus:ring-[#013FF6]/30 outline-none"
                        />
                        <textarea
                          value={laporForm.deskripsi}
                          required
                          rows={3}
                          onChange={e => setLaporForm({ ...laporForm, deskripsi: e.target.value })}
                          placeholder="Jelaskan masalah..."
                          className="w-full px-3 py-2.5 rounded-xl bg-white border border-gray-200 text-sm text-gray-800 focus:ring-2 focus:ring-[#013FF6]/30 outline-none resize-none"
                        />
                        <div className="flex gap-2">
                          <button type="button" onClick={() => setShowLapor(false)}
                            className="flex-1 py-2 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-100 text-xs font-semibold transition-colors">
                            Batal
                          </button>
                          <button type="submit" disabled={sendingLapor}
                            className="flex-1 py-2 bg-[#00182E] text-white rounded-xl hover:bg-[#013FF6] text-xs font-bold transition-colors disabled:opacity-60 flex justify-center items-center gap-1.5">
                            {sendingLapor ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <><Flag className="w-3.5 h-3.5" /> Kirim Laporan</>}
                          </button>
                        </div>
                      </form>
                    )}
                  </div>

                  {/* Komentar */}
                  <div className="px-5 py-5">
                    <h3 className="text-[12px] font-bold text-gray-700 mb-4 flex items-center gap-2">
                      <MessageCircle className="w-4 h-4 text-[#013FF6]" /> Komentar ({komentars.length})
                    </h3>
                    {komentarLoading ? (
                      <div className="flex justify-center py-6"><Loader2 className="w-5 h-5 text-[#013FF6] animate-spin" /></div>
                    ) : komentars.length === 0 ? (
                      <p className="text-[12px] text-gray-400 text-center py-6">Belum ada komentar. Jadilah yang pertama!</p>
                    ) : (
                      <div className="space-y-3 mb-4">
                        {komentars.map(k => (
                          <div key={k.id} className="flex gap-3">
                            <div className="shrink-0 w-8 h-8 rounded-full bg-[#013FF6]/10 flex items-center justify-center text-[#013FF6] text-xs font-bold">
                              {getInitial(k.nama)}
                            </div>
                            <div className="flex-1 bg-gray-50 rounded-xl px-3 py-2.5">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-[11px] font-bold text-gray-700">{k.nama}</span>
                                <span className="text-[10px] text-gray-400">{formatRelTime(k.createdAt)}</span>
                              </div>
                              <p className="text-[12px] text-gray-600 leading-relaxed">{k.isi}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="flex gap-2 mt-2">
                      <input
                        value={newKomentar}
                        onChange={e => setNewKomentar(e.target.value)}
                        onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSendKomentar(); } }}
                        placeholder="Tulis komentar..."
                        className="flex-1 px-3.5 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-sm text-gray-800 placeholder:text-gray-400 focus:ring-2 focus:ring-[#013FF6]/30 outline-none"
                      />
                      <button
                        onClick={handleSendKomentar}
                        disabled={sendingKomentar || !newKomentar.trim()}
                        className="w-10 h-10 rounded-xl bg-[#00182E] text-white flex items-center justify-center hover:bg-[#013FF6] transition-colors disabled:opacity-50"
                      >
                        {sendingKomentar ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              <style>{`@keyframes slideUp{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}`}</style>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
