"use client";

import Sidebar from "@/components/layout/SidebarGuru";
import TopBar from "@/components/layout/TopBar";
import { useState, useEffect } from "react";
import {
  Megaphone,
  CheckCircle,
  CheckCircle2,
  Plus,
  XCircle,
  Edit,
  Trash2,
  Calendar,
  Loader2,
  FileText,
  Bell,
  Send,
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

function AnnouncementCard({
  p,
  idx,
  onEdit,
  onDelete,
  onSend,
}: {
  p: Announcement;
  idx: number;
  onEdit: (idx: number) => void;
  onDelete: (idx: number) => void;
  onSend: (p: Announcement) => void;
}) {
  return (
    <div className="group bg-white border border-gray-100 rounded-2xl p-5 hover:shadow-md hover:border-indigo-100 transition-all duration-200">
      <div className="flex items-start justify-between gap-4">
        <div className="flex gap-4 flex-1 min-w-0">
          <div className="shrink-0 mt-0.5 w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center ring-1 ring-indigo-200">
            <Megaphone className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1.5">
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-full">
                Pengumuman
              </span>
              <span className="flex items-center gap-1 text-xs text-gray-400">
                <Calendar className="w-3 h-3" />
                {formatTanggal(p.tanggal)}
              </span>
            </div>
            <h4 className="font-semibold text-gray-800 text-sm sm:text-base leading-snug mb-2 break-words">
              {p.judul}
            </h4>
            <p className="text-gray-600 text-sm leading-relaxed break-words whitespace-pre-wrap line-clamp-3 group-hover:line-clamp-none transition-all">
              {p.isi}
            </p>
          </div>
        </div>
        <div className="flex gap-1 shrink-0 opacity-60 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onSend(p)}
            title="Kirim Notifikasi"
            className="p-2 rounded-lg hover:bg-sky-50 text-gray-400 hover:text-sky-600 transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
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
    </div>
  );
}

export default function GuruInformasi() {
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

  const handleSendNotification = (announcement: Announcement) => {
    alert(`Notifikasi push dikirim ke semua user: "${announcement.judul}"`);
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
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TopBar />
        <main className="flex-1 overflow-y-auto overflow-x-hidden bg-gray-50 px-4 sm:px-6 lg:px-8 py-7">
          {/* ── Page Header ── */}
          <div className="mb-7 flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2.5 mb-1">
                <span className="block w-1 h-6 bg-indigo-600 rounded-full" />
                <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                  Informasi PKL
                </h1>
              </div>
              <p className="text-gray-500 text-sm pl-3.5">
                Kelola pengumuman dan kirim notifikasi terkait Program Kerja
                Lapangan.
              </p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white rounded-xl text-sm font-semibold shadow-sm transition-colors"
            >
              <Plus className="w-4 h-4" /> Tambah
            </button>
          </div>

          {/* ── Stats Row ── */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4 flex items-center gap-4">
              <div className="p-2.5 rounded-xl bg-indigo-50 ring-1 ring-indigo-200 shrink-0">
                <Bell className="w-4 h-4 text-indigo-600" />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 mb-0.5">
                  Total
                </p>
                <p className="text-2xl font-bold text-gray-800">
                  {pengumuman.length}
                </p>
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4 flex items-center gap-4">
              <div className="p-2.5 rounded-xl bg-emerald-50 ring-1 ring-emerald-200 shrink-0">
                <FileText className="w-4 h-4 text-emerald-600" />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 mb-0.5">
                  Pengumuman
                </p>
                <p className="text-2xl font-bold text-gray-800">
                  {pengumuman.length}
                </p>
              </div>
            </div>
            <div className="hidden sm:flex bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4 items-center gap-4">
              <div className="p-2.5 rounded-xl bg-sky-50 ring-1 ring-sky-200 shrink-0">
                <Send className="w-4 h-4 text-sky-600" />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 mb-0.5">
                  Terbaru
                </p>
                <p className="text-sm font-semibold text-gray-700 truncate">
                  {pengumuman.length > 0
                    ? formatTanggal(pengumuman[0].tanggal)
                    : "—"}
                </p>
              </div>
            </div>
          </div>

          {/* ── Card Container ── */}
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="px-5 py-3.5 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-semibold text-gray-700 text-sm flex items-center gap-2">
                <Megaphone className="w-4 h-4 text-indigo-500" />
                Daftar Pengumuman
              </h2>
              <span className="text-xs text-gray-500 bg-gray-100 border border-gray-200 px-2.5 py-0.5 rounded-full font-medium">
                {pengumuman.length} item
              </span>
            </div>

            <div className="p-4 sm:p-5">
              {pengumuman.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
                    <Megaphone className="w-6 h-6 text-gray-400" />
                  </div>
                  <p className="text-gray-500 text-sm font-medium mb-1">
                    Belum ada pengumuman
                  </p>
                  <p className="text-gray-400 text-xs">
                    Klik tombol Tambah untuk membuat pengumuman baru.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {pengumuman.map((p, idx) => (
                    <AnnouncementCard
                      key={p.id}
                      p={p}
                      idx={idx}
                      onEdit={handleEditAnnouncement}
                      onDelete={handleDeleteAnnouncement}
                      onSend={handleSendNotification}
                    />
                  ))}
                </div>
              )}
            </div>
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
                        required
                        onChange={(e) =>
                          setNewAnnouncement({
                            ...newAnnouncement,
                            judul: e.target.value,
                          })
                        }
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
                        required
                        rows={5}
                        onChange={(e) =>
                          setNewAnnouncement({
                            ...newAnnouncement,
                            isi: e.target.value,
                          })
                        }
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
                        required
                        onChange={(e) =>
                          setNewAnnouncement({
                            ...newAnnouncement,
                            tanggal: e.target.value,
                          })
                        }
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
              <style>{`@keyframes slideUp { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }`}</style>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
