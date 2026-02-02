"use client";

import Sidebar from "@/components/layout/SidebarAdmin";
import TopBar from "@/components/layout/TopBar";
import { CheckCircle2, XCircle } from "lucide-react";
import { useState, useEffect } from "react";
import {
  Info,
  Megaphone,
  CheckCircle,
  Plus,
  X,
  Edit,
  Trash2,
} from "lucide-react";

// Tipe data disesuaikan dengan response API
interface Announcement {
  id: number;
  judul: string;
  isi: string;
  tanggal: string;
  kategori: string;
}

export default function AdminInformasi() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<number | null>(
    null,
  );

  // Default state form
  const [newAnnouncement, setNewAnnouncement] = useState({
    judul: "",
    isi: "",
    tanggal: "",
    kategori: "Pengumuman", // Default value hardcoded
  });

  const [pengumuman, setPengumuman] = useState<Announcement[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch Data dari API
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
        // Edit Mode (PUT)
        const idToUpdate = pengumuman[editingAnnouncement].id;
        const res = await fetch(`/api/informasi/${idToUpdate}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newAnnouncement),
        });
        if (!res.ok) throw new Error("Gagal update");
      } else {
        // Add Mode (POST)
        const res = await fetch("/api/informasi", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newAnnouncement),
        });
        if (!res.ok) throw new Error("Gagal simpan");
      }

      await fetchInformasi(); // Refresh data
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
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar />
        <main className="flex-1 p-4 sm:p-8 lg:p-12 overflow-y-auto overflow-x-hidden w-full max-w-full">
          {/* Header Section */}
          <div className="mb-8">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2 flex items-center gap-3">
              <Info className="w-8 h-8 sm:w-10 sm:h-10 text-indigo-600 animate-pulse" />
              Informasi PKL
            </h1>
            <p className="text-gray-600 text-sm sm:text-lg">
              Kelola informasi, pengumuman, dan data terkait Program Kerja
              Lapangan (PKL).
            </p>
          </div>

          {/* Action Section */}
          <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-lg border border-gray-100 mb-8">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Megaphone className="w-5 h-5 text-indigo-500" />
                Daftar Pengumuman
              </h3>
              <button
                onClick={() => setShowAddModal(true)}
                className="flex items-center justify-center gap-2 
                 px-4 py-2 text-sm 
                 sm:px-6 sm:py-3 sm:text-base 
                 bg-linear-to-r from-indigo-600 to-blue-600 
                 text-white rounded-xl shadow-lg hover:shadow-xl 
                 hover:from-indigo-700 hover:to-blue-700 
                 transition-all duration-200 transform hover:scale-105"
              >
                <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                Tambah Pengumuman
              </button>
            </div>
          </div>

          {/* Card Pengumuman */}
          <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:scale-[1.01]">
            {pengumuman.length === 0 ? (
              <p className="text-gray-500 italic text-center sm:text-left">
                Belum ada pengumuman resmi yang ditambahkan.
              </p>
            ) : (
              <div className="space-y-4 sm:space-y-6">
                {pengumuman.map((p, idx) => (
                  <div
                    key={p.id}
                    className="bg-linear-to-r from-indigo-50 to-purple-50 p-4 rounded-lg border-l-4 border-indigo-500 hover:bg-indigo-100 transition-all duration-200"
                  >
                    <div className="flex flex-col sm:flex-row justify-between items-start gap-2 mb-2">
                      <div className="flex-1 min-w-0 w-full">
                        <h4 className="font-semibold text-gray-900 break-words">
                          {p.judul}
                        </h4>
                      </div>
                      <div className="flex gap-2 self-end sm:self-start shrink-0">
                        <button
                          onClick={() => handleEditAnnouncement(idx)}
                          className="text-indigo-600 hover:text-indigo-800 p-1 transition-colors"
                          title="Edit Pengumuman"
                        >
                          <Edit className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDeleteAnnouncement(idx)}
                          className="text-red-600 hover:text-red-800 p-1 transition-colors"
                          title="Hapus Pengumuman"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                    <p className="text-gray-700 mb-2 text-sm sm:text-base break-words whitespace-pre-wrap">
                      {p.isi}
                    </p>
                    <span className="text-xs text-gray-500 block">
                      {p.tanggal}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Modal Tambah/Edit Pengumuman */}
          {showAddModal && (
            <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
              <div
                className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
                onClick={handleCloseModal}
              />
              <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl p-6 sm:p-10 relative z-10 animate-fade-scale transform-gpu transition duration-300 ease-out flex flex-col max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6 sm:mb-8">
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2 sm:gap-3">
                    <CheckCircle2 className="w-6 h-6 sm:w-8 sm:h-8 text-indigo-600 animate-pulse" />
                    {editingAnnouncement !== null
                      ? "Edit Pengumuman"
                      : "Tambah Baru"}
                  </h3>
                  <button
                    onClick={handleCloseModal}
                    className="text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    <XCircle className="w-6 h-6 sm:w-7 sm:h-7" />
                  </button>
                </div>

                <form
                  className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 text-gray-800"
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleAddAnnouncement();
                  }}
                >
                  <div className="flex flex-col md:col-span-3">
                    <label className="mb-2 font-medium text-gray-700">
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
                      className="px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition w-full"
                    />
                  </div>

                  <div className="flex flex-col md:col-span-2">
                    <label className="mb-2 font-medium text-gray-700">
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
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition resize-none min-h-[150px]"
                    />
                  </div>

                  <div className="flex flex-col gap-6">
                    <div className="flex flex-col">
                      <label className="mb-2 font-medium text-gray-700">
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
                        className="px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition w-full"
                      />
                    </div>
                  </div>

                  <div className="md:col-span-3 flex flex-col-reverse sm:flex-row justify-end gap-4 sm:gap-6 mt-2">
                    <button
                      type="button"
                      onClick={handleCloseModal}
                      className="flex items-center justify-center gap-2 px-8 py-3 bg-gray-500 text-white rounded-xl shadow-inner hover:bg-gray-600 transition-colors duration-200"
                    >
                      <X className="w-5 h-5" />
                      Batal
                    </button>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="flex items-center justify-center gap-2 px-8 py-3 bg-linear-to-r from-indigo-600 to-blue-600 text-white rounded-xl shadow-lg hover:shadow-xl hover:from-indigo-700 hover:to-blue-700 transform transition duration-200"
                    >
                      <CheckCircle className="w-5 h-5" />
                      {isLoading
                        ? "Menyimpan..."
                        : editingAnnouncement !== null
                          ? "Simpan"
                          : "Tambah"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
