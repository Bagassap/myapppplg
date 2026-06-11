"use client";

import Sidebar from "@/components/layout/SidebarAdmin";
import TopBar from "@/components/layout/TopBar";
import { useState, useEffect, useCallback } from "react";
import { Plus, X, Pencil, Trash2, Loader2, Megaphone } from "lucide-react";

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

const EMPTY = { judul: "", konten: "" };

export default function AdminInformasi() {
  const [items, setItems] = useState<Informasi[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<Informasi | null>(null);
  const [form, setForm] = useState(EMPTY);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const openCreate = () => { setEditingItem(null); setForm(EMPTY); setShowModal(true); };
  const openEdit = (item: Informasi) => {
    setEditingItem(item);
    setForm({ judul: item.judul, konten: item.konten });
    setShowModal(true);
  };
  const closeModal = () => { setShowModal(false); setEditingItem(null); setForm(EMPTY); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const url = editingItem ? `/api/informasi/${editingItem.id}` : "/api/informasi";
      const method = editingItem ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error();
      closeModal();
      fetchData();
    } catch {
      alert("Terjadi kesalahan. Coba lagi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Hapus informasi ini?")) return;
    try {
      await fetch(`/api/informasi/${id}`, { method: "DELETE" });
      fetchData();
    } catch { alert("Gagal menghapus."); }
  };

  return (
    <div className="flex h-screen bg-[#00182E] overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TopBar />
        <main className="flex-1 overflow-y-auto overflow-x-hidden bg-[#00182E] px-4 sm:px-6 lg:px-8 py-8">

          {/* Header */}
          <div className="flex items-start justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Informasi PKL
              </h1>
              <p className="text-white/45 text-sm mt-1.5">
                {isLoading ? "Memuat..." : `${items.length} informasi terpublikasi`}
              </p>
            </div>
            <button
              onClick={openCreate}
              className="shrink-0 flex items-center gap-2 bg-[#ACEC00] text-[#00182E] font-bold rounded-xl px-4 py-2.5 text-sm hover:brightness-105 transition-all shadow-lg shadow-[#ACEC00]/20"
            >
              <Plus className="w-4 h-4" /> Tulis Informasi
            </button>
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
              <p className="text-white/30 text-[12px] mb-5">Klik &quot;Tulis Informasi&quot; untuk memulai.</p>
              <button
                onClick={openCreate}
                className="flex items-center gap-2 bg-[#ACEC00] text-[#00182E] font-bold rounded-xl px-4 py-2 text-xs hover:brightness-105 transition-all"
              >
                <Plus className="w-3.5 h-3.5" /> Tulis Sekarang
              </button>
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
                    className="group relative bg-white/5 border border-white/8 rounded-2xl p-5 cursor-pointer hover:bg-white/8 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-black/30 transition-all duration-200"
                  >
                    <div className="flex items-start gap-3">
                      <span className="shrink-0 mt-2 w-2 h-2 rounded-full bg-[#ACEC00]" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <h3 className="font-bold text-white text-[15px] leading-snug">
                            {item.judul}
                          </h3>
                          <div
                            className="flex gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={e => e.stopPropagation()}
                          >
                            <button
                              onClick={() => openEdit(item)}
                              className="w-7 h-7 rounded-lg flex items-center justify-center text-white/40 hover:text-[#ACEC00] hover:bg-white/10 transition-colors"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDelete(item.id)}
                              className="w-7 h-7 rounded-lg flex items-center justify-center text-white/40 hover:text-rose-400 hover:bg-white/10 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
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

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={closeModal} />
          <div
            className="relative bg-white w-full sm:max-w-lg max-h-[92vh] sm:rounded-2xl rounded-t-3xl shadow-2xl overflow-hidden flex flex-col"
            style={{ animation: "slideUp .25s cubic-bezier(.32,1.25,.6,1)" }}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <p className="font-bold text-gray-800">
                {editingItem ? "Edit Informasi" : "Tulis Informasi Baru"}
              </p>
              <button onClick={closeModal} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-5 py-5">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 mb-2 uppercase tracking-wider">
                    Judul
                  </label>
                  <input
                    type="text"
                    value={form.judul}
                    required
                    onChange={e => setForm({ ...form, judul: e.target.value })}
                    placeholder="Judul informasi..."
                    className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-800 text-sm focus:ring-2 focus:ring-[#013FF6]/30 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 mb-2 uppercase tracking-wider">
                    Konten
                  </label>
                  <textarea
                    value={form.konten}
                    required
                    rows={7}
                    onChange={e => setForm({ ...form, konten: e.target.value })}
                    placeholder="Tulis konten informasi di sini..."
                    className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-800 text-sm focus:ring-2 focus:ring-[#013FF6]/30 outline-none resize-none transition-all"
                  />
                </div>
                <div className="flex gap-3 pt-1">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="flex-1 py-2.5 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition-colors text-sm font-semibold"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 py-2.5 bg-[#ACEC00] text-[#00182E] font-bold rounded-xl hover:brightness-105 transition-all shadow-sm disabled:opacity-60 flex justify-center items-center gap-2 text-sm"
                  >
                    {isSubmitting
                      ? <Loader2 className="w-4 h-4 animate-spin" />
                      : editingItem ? "Simpan" : "Publikasikan →"
                    }
                  </button>
                </div>
              </form>
            </div>
          </div>
          <style>{`
            @keyframes slideUp{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}
            @keyframes fadeInUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
          `}</style>
        </div>
      )}
      <style>{`@keyframes fadeInUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}`}</style>
    </div>
  );
}
