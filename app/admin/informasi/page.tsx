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
  const [detailItem, setDetailItem] = useState<Informasi | null>(null);
  const [showForm, setShowForm] = useState(false);
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

  const openCreate = () => { setEditingItem(null); setForm(EMPTY); setShowForm(true); };
  const openEdit = (item: Informasi) => {
    setDetailItem(null);
    setEditingItem(item);
    setForm({ judul: item.judul, konten: item.konten });
    setShowForm(true);
  };
  const closeForm = () => { setShowForm(false); setEditingItem(null); setForm(EMPTY); };

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
      closeForm();
      fetchData();
    } catch {
      alert("Terjadi kesalahan. Coba lagi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Hapus informasi ini?")) return;
    setDetailItem(null);
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
              <p className="text-white/50 text-sm mt-1.5">
                {isLoading ? "Memuat..." : `${items.length} informasi`}
              </p>
            </div>
            <button
              onClick={openCreate}
              className="shrink-0 flex items-center gap-2 bg-[#ACEC00] text-[#00182E] font-bold rounded-xl px-4 py-2.5 text-sm hover:brightness-105 transition-all shadow-lg"
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
              <div className="w-16 h-16 rounded-2xl bg-white/8 flex items-center justify-center mb-5">
                <Megaphone className="w-7 h-7 text-white/30" />
              </div>
              <p className="font-bold text-white/60 text-sm mb-1.5">Belum ada informasi</p>
              <p className="text-white/30 text-xs mb-5">Klik &quot;Tulis Informasi&quot; untuk memulai.</p>
              <button
                onClick={openCreate}
                className="flex items-center gap-2 bg-[#ACEC00] text-[#00182E] font-bold rounded-xl px-4 py-2 text-xs hover:brightness-105 transition-all"
              >
                <Plus className="w-3.5 h-3.5" /> Tulis Sekarang
              </button>
            </div>
          ) : (
            <div className="space-y-3 max-w-3xl">
              {items.map((item) => (
                <div
                  key={item.id}
                  onClick={() => setDetailItem(item)}
                  className="relative bg-white rounded-2xl shadow-sm overflow-hidden cursor-pointer hover:-translate-y-0.5 hover:shadow-lg transition-all duration-200 group"
                >
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#ACEC00]" />
                  <div className="pl-6 pr-5 py-5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-[#00182E] text-base leading-snug">
                          {item.judul}
                        </h3>
                        <p className="text-gray-500 text-sm leading-relaxed mt-1.5 line-clamp-2">
                          {item.konten}
                        </p>
                        <div className="flex items-center gap-2 mt-3">
                          <span className="text-xs font-semibold text-gray-400">{item.pembuat}</span>
                          <span className="w-1 h-1 rounded-full bg-gray-300" />
                          <span className="text-xs text-gray-400">{formatRelTime(item.createdAt)}</span>
                        </div>
                      </div>
                      <div
                        className="flex gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={e => e.stopPropagation()}
                      >
                        <button
                          onClick={() => openEdit(item)}
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-[#013FF6] hover:bg-blue-50 transition-colors"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-rose-500 hover:bg-rose-50 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Detail Modal */}
      {detailItem && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setDetailItem(null)} />
          <div className="relative bg-white w-full sm:max-w-lg max-h-[90vh] sm:rounded-2xl rounded-t-3xl shadow-2xl overflow-hidden flex flex-col">
            <div className="flex items-start justify-between px-5 pt-5 pb-4 border-b border-gray-100">
              <div className="flex-1 min-w-0 pr-2">
                <h2 className="font-extrabold text-[#00182E] text-lg leading-snug">{detailItem.judul}</h2>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="text-xs text-gray-400 font-medium">{detailItem.pembuat}</span>
                  <span className="text-gray-300">·</span>
                  <span className="text-xs text-gray-400">{formatRelTime(detailItem.createdAt)}</span>
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => openEdit(detailItem)}
                  className="p-2 rounded-xl text-gray-400 hover:text-[#013FF6] hover:bg-blue-50 transition-colors"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(detailItem.id)}
                  className="p-2 rounded-xl text-gray-400 hover:text-rose-500 hover:bg-rose-50 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setDetailItem(null)}
                  className="p-2 rounded-xl text-gray-400 hover:bg-gray-100 transition-colors ml-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto px-5 py-5">
              <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">{detailItem.konten}</p>
            </div>
          </div>
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={closeForm} />
          <div className="relative bg-white w-full sm:max-w-lg max-h-[92vh] sm:rounded-2xl rounded-t-3xl shadow-2xl overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <p className="font-bold text-[#00182E]">
                {editingItem ? "Edit Informasi" : "Tulis Informasi Baru"}
              </p>
              <button onClick={closeForm} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
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
                    onClick={closeForm}
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
                      : editingItem ? "Simpan" : "Publikasikan"
                    }
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
