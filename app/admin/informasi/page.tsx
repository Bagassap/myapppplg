"use client";

import Sidebar from "@/components/layout/SidebarAdmin";
import TopBar from "@/components/layout/TopBar";
import { useState, useEffect } from "react";
import {
  Info,
  Megaphone,
  CheckCircle,
  CheckCircle2,
  Plus,
  X,
  XCircle,
  Edit,
  Trash2,
  Calendar,
  Loader2,
  FileText,
  Bell,
  ChevronRight,
  Sparkles,
  AlertTriangle,
} from "lucide-react";

interface Announcement {
  id: number;
  judul: string;
  isi: string;
  tanggal: string;
  kategori: string;
}

function formatTanggal(raw: string) {
  if (!raw) return "-";
  const d = new Date(raw);
  if (isNaN(d.getTime())) return raw;
  return d.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function getItemAccent(idx: number) {
  const accents = [
    {
      icon: <Info className="w-4 h-4" />,
      bg: "bg-blue-50",
      iconColor: "text-blue-600",
      ring: "ring-blue-100",
      dot: "bg-blue-400",
    },
    {
      icon: <CheckCircle className="w-4 h-4" />,
      bg: "bg-emerald-50",
      iconColor: "text-emerald-600",
      ring: "ring-emerald-100",
      dot: "bg-emerald-400",
    },
    {
      icon: <AlertTriangle className="w-4 h-4" />,
      bg: "bg-amber-50",
      iconColor: "text-amber-600",
      ring: "ring-amber-100",
      dot: "bg-amber-400",
    },
    {
      icon: <Megaphone className="w-4 h-4" />,
      bg: "bg-indigo-50",
      iconColor: "text-indigo-600",
      ring: "ring-indigo-100",
      dot: "bg-indigo-400",
    },
  ];
  return accents[idx % accents.length];
}

function AnnouncementItem({
  p,
  idx,
  onEdit,
  onDelete,
  isLast,
}: {
  p: Announcement;
  idx: number;
  onEdit: (idx: number) => void;
  onDelete: (idx: number) => void;
  isLast: boolean;
}) {
  const accent = getItemAccent(idx);
  return (
    <div
      className={`group flex items-start gap-4 px-6 py-5 hover:bg-slate-50 transition-colors duration-150 ${!isLast ? "border-b border-gray-100" : ""}`}
    >
      {/* Icon */}
      <div
        className={`shrink-0 mt-0.5 w-9 h-9 rounded-xl ${accent.bg} ring-1 ${accent.ring} flex items-center justify-center`}
      >
        <span className={accent.iconColor}>{accent.icon}</span>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
          <span
            className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${accent.bg} ${accent.iconColor} ring-1 ${accent.ring}`}
          >
            Pengumuman
          </span>
          <span className="flex items-center gap-1 text-xs text-gray-400">
            <Calendar className="w-3 h-3" />
            {formatTanggal(p.tanggal)}
          </span>
        </div>
        <h4 className="font-semibold text-gray-800 text-sm leading-snug mb-1.5 break-words">
          {p.judul}
        </h4>
        <p className="text-gray-500 text-sm leading-relaxed break-words whitespace-pre-wrap line-clamp-2 group-hover:line-clamp-none transition-all duration-200">
          {p.isi}
        </p>
      </div>

      {/* Actions */}
      <div className="flex gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-150 mt-0.5">
        <button
          onClick={() => onEdit(idx)}
          title="Edit"
          className="p-2 rounded-lg hover:bg-indigo-50 text-gray-400 hover:text-indigo-600 transition-colors"
        >
          <Edit className="w-4 h-4" />
        </button>
        <button
          onClick={() => onDelete(idx)}
          title="Hapus"
          className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

export default function AdminInformasi() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<number | null>(
    null,
  );
  const [newAnnouncement, setNewAnnouncement] = useState({
    judul: "",
    isi: "",
    tanggal: "",
    kategori: "Pengumuman",
  });
  const [pengumuman, setPengumuman] = useState<Announcement[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchInformasi = async () => {
    try {
      const res = await fetch("/api/informasi");
      const data = await res.json();
      setPengumuman(data);
    } catch (error) {
      console.error("Gagal mengambil data:", error);
    }
  };

  useEffect(() => {
    fetchInformasi();
  }, []);

  const handleAddAnnouncement = async () => {
    setIsLoading(true);
    try {
      if (editingAnnouncement !== null) {
        const idToUpdate = pengumuman[editingAnnouncement].id;
        const res = await fetch(`/api/informasi/${idToUpdate}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newAnnouncement),
        });
        if (!res.ok) throw new Error("Gagal update");
      } else {
        const res = await fetch("/api/informasi", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newAnnouncement),
        });
        if (!res.ok) throw new Error("Gagal simpan");
      }
      await fetchInformasi();
      handleCloseModal();
    } catch (error) {
      alert("Terjadi kesalahan saat menyimpan data.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditAnnouncement = (idx: number) => {
    setEditingAnnouncement(idx);
    setNewAnnouncement({
      judul: pengumuman[idx].judul,
      isi: pengumuman[idx].isi,
      tanggal: pengumuman[idx].tanggal,
      kategori: "Pengumuman",
    });
    setShowAddModal(true);
  };

  const handleDeleteAnnouncement = async (idx: number) => {
    if (confirm("Apakah Anda yakin ingin menghapus pengumuman ini?")) {
      const idToDelete = pengumuman[idx].id;
      try {
        await fetch(`/api/informasi/${idToDelete}`, { method: "DELETE" });
        await fetchInformasi();
      } catch (error) {
        alert("Gagal menghapus data");
      }
    }
  };

  const handleCloseModal = () => {
    setShowAddModal(false);
    setEditingAnnouncement(null);
    setNewAnnouncement({
      judul: "",
      isi: "",
      tanggal: "",
      kategori: "Pengumuman",
    });
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TopBar />
        <main className="flex-1 overflow-y-auto overflow-x-hidden bg-slate-50 px-4 sm:px-6 lg:px-8 py-7">
          {/* ── Page Header ── */}
          <div className="mb-7 flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2.5 mb-1">
                <span className="block w-1 h-6 bg-indigo-600 rounded-full" />
                <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                  Informasi PKL
                </h1>
              </div>
              <p className="text-gray-500 text-sm pl-3.5">
                Kelola pengumuman dan informasi terkait Program Kerja Lapangan.
              </p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white rounded-xl text-sm font-semibold shadow-sm transition-colors shrink-0"
            >
              <Plus className="w-4 h-4" /> Tambah
            </button>
          </div>

          {/* ── Main Card ── */}
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden animate-fade-in">
            {/* Card Header */}
            <div className="px-6 py-5 border-b border-gray-100">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 ring-1 ring-indigo-100 flex items-center justify-center shrink-0">
                    <Megaphone className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div>
                    <h2 className="font-semibold text-gray-800 text-base">
                      Informasi PKL
                    </h2>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Pengumuman &amp; informasi terkini seputar PKL
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 bg-indigo-50 border border-indigo-100 px-2.5 py-1 rounded-full">
                    <Sparkles className="w-3 h-3" />
                    Terbaru
                  </span>
                  <span className="text-xs text-gray-500 bg-gray-100 border border-gray-200 px-2.5 py-1 rounded-full font-medium">
                    {pengumuman.length} item
                  </span>
                </div>
              </div>

              {/* Stats mini row */}
              <div className="grid grid-cols-3 gap-3 mt-4">
                <div className="bg-slate-50 rounded-xl px-4 py-3 flex items-center gap-3 border border-gray-100">
                  <div className="p-1.5 rounded-lg bg-indigo-50">
                    <Bell className="w-3.5 h-3.5 text-indigo-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Total</p>
                    <p className="text-base font-bold text-gray-800 leading-none mt-0.5">
                      {pengumuman.length}
                    </p>
                  </div>
                </div>
                <div className="bg-slate-50 rounded-xl px-4 py-3 flex items-center gap-3 border border-gray-100">
                  <div className="p-1.5 rounded-lg bg-emerald-50">
                    <FileText className="w-3.5 h-3.5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Pengumuman</p>
                    <p className="text-base font-bold text-gray-800 leading-none mt-0.5">
                      {pengumuman.length}
                    </p>
                  </div>
                </div>
                <div className="bg-slate-50 rounded-xl px-4 py-3 flex items-center gap-3 border border-gray-100">
                  <div className="p-1.5 rounded-lg bg-amber-50">
                    <Calendar className="w-3.5 h-3.5 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Terbaru</p>
                    <p className="text-sm font-semibold text-gray-700 leading-none mt-0.5 truncate">
                      {pengumuman.length > 0
                        ? formatTanggal(pengumuman[0].tanggal)
                        : "—"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Card Body — List */}
            {pengumuman.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center px-6">
                <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
                  <Megaphone className="w-6 h-6 text-gray-400" />
                </div>
                <p className="text-gray-600 text-sm font-semibold mb-1">
                  Belum ada informasi
                </p>
                <p className="text-gray-400 text-xs max-w-xs">
                  Klik tombol{" "}
                  <span className="font-medium text-indigo-500">Tambah</span> di
                  atas untuk membuat pengumuman baru.
                </p>
              </div>
            ) : (
              <div>
                {pengumuman.map((p, idx) => (
                  <AnnouncementItem
                    key={p.id}
                    p={p}
                    idx={idx}
                    onEdit={handleEditAnnouncement}
                    onDelete={handleDeleteAnnouncement}
                    isLast={idx === pengumuman.length - 1}
                  />
                ))}
              </div>
            )}

            {/* Card Footer */}
            {pengumuman.length > 0 && (
              <div className="px-6 py-3.5 border-t border-gray-100 flex items-center justify-between bg-slate-50/60">
                <p className="text-xs text-gray-400">
                  Menampilkan {pengumuman.length} informasi
                </p>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-700 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" /> Tambah baru
                </button>
              </div>
            )}
          </div>

          {/* ── Modal ── */}
          {showAddModal && (
            <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
              <div
                className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
                onClick={handleCloseModal}
              />
              <div
                className="relative bg-white w-full sm:max-w-xl max-h-[92vh] sm:rounded-2xl rounded-t-3xl shadow-2xl overflow-hidden flex flex-col"
                style={{
                  animation: "slideUp .25s cubic-bezier(.32,1.25,.6,1)",
                }}
              >
                {/* Modal Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 sticky top-0 bg-white z-10">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-indigo-50">
                      <CheckCircle2 className="w-4 h-4 text-indigo-600" />
                    </div>
                    <p className="font-semibold text-gray-800">
                      {editingAnnouncement !== null
                        ? "Edit Pengumuman"
                        : "Tambah Pengumuman"}
                    </p>
                  </div>
                  <button
                    onClick={handleCloseModal}
                    className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                  >
                    <XCircle className="w-5 h-5 text-gray-400" />
                  </button>
                </div>

                {/* Modal Body */}
                <div className="flex-1 overflow-y-auto px-5 py-5">
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleAddAnnouncement();
                    }}
                    className="space-y-4"
                  >
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Judul Pengumuman
                      </label>
                      <input
                        type="text"
                        value={newAnnouncement.judul}
                        onChange={(e) =>
                          setNewAnnouncement({
                            ...newAnnouncement,
                            judul: e.target.value,
                          })
                        }
                        required
                        placeholder="Masukkan judul pengumuman..."
                        className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-800 text-sm focus:ring-2 focus:ring-indigo-300 outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Isi Pengumuman
                      </label>
                      <textarea
                        value={newAnnouncement.isi}
                        onChange={(e) =>
                          setNewAnnouncement({
                            ...newAnnouncement,
                            isi: e.target.value,
                          })
                        }
                        required
                        rows={5}
                        placeholder="Tulis isi pengumuman di sini..."
                        className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-800 text-sm focus:ring-2 focus:ring-indigo-300 outline-none resize-none transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Tanggal
                      </label>
                      <input
                        type="date"
                        value={newAnnouncement.tanggal}
                        onChange={(e) =>
                          setNewAnnouncement({
                            ...newAnnouncement,
                            tanggal: e.target.value,
                          })
                        }
                        required
                        className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-800 text-sm focus:ring-2 focus:ring-indigo-300 outline-none transition-all"
                      />
                    </div>
                    <div className="flex gap-3 pt-2">
                      <button
                        type="button"
                        onClick={handleCloseModal}
                        className="flex-1 py-2.5 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-100 transition-colors text-sm font-medium"
                      >
                        Batal
                      </button>
                      <button
                        type="submit"
                        disabled={isLoading}
                        className="flex-1 py-2.5 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-colors shadow-sm disabled:opacity-60 flex justify-center items-center gap-2"
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />{" "}
                            Menyimpan...
                          </>
                        ) : (
                          <>
                            <CheckCircle className="w-4 h-4" />{" "}
                            {editingAnnouncement !== null ? "Simpan" : "Tambah"}
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
              <style>{`
                @keyframes slideUp { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
                @keyframes fadeIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
                .animate-fade-in { animation: fadeIn 0.3s ease forwards; }
              `}</style>
            </div>
          )}

          <style>{`
            @keyframes fadeIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
            .animate-fade-in { animation: fadeIn 0.3s ease forwards; }
          `}</style>
        </main>
      </div>
    </div>
  );
}
