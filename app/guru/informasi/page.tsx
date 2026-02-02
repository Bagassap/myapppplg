"use client";

import Sidebar from "@/components/layout/SidebarGuru";
import TopBar from "@/components/layout/TopBar";
import { CheckCircle2, XCircle } from "lucide-react";
import { useState } from "react";
import {
  Info,
  Calendar,
  FileText,
  Megaphone,
  CheckCircle,
  Clock,
  AlertTriangle,
  Plus,
  X,
  Edit,
  Trash2,
  Send,
  Filter,
  MessageSquare,
  User,
} from "lucide-react";

interface Announcement {
  judul: string;
  isi: string;
  tanggal: string;
  kategori: string;
  tipe: "umum" | "pkl";
  tempatPKL?: string;
  komentar?: { nama: string; isi: string; tanggal: string }[];
}

export default function GuruInformasi() {
  const [selectedCategory, setSelectedCategory] = useState("Semua");
  const [selectedType, setSelectedType] = useState("Semua");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<number | null>(
    null,
  );
  const [newAnnouncement, setNewAnnouncement] = useState({
    judul: "",
    isi: "",
    tanggal: "",
    kategori: "Berita Sekolah",
    tipe: "umum" as "umum" | "pkl",
    tempatPKL: "",
  });
  const [newComment, setNewComment] = useState<{ [key: number]: string }>({});

  const [pengumuman, setPengumuman] = useState<Announcement[]>([
    {
      judul: "Pengingat Monitoring PKL",
      isi: "Monitoring PKL di PT. ABC Industri akan dilakukan pada tanggal 15 Oktober 2023.",
      tanggal: "2023-10-01",
      kategori: "Kebijakan PKL",
      tipe: "pkl",
      tempatPKL: "PT. ABC Industri",
      komentar: [],
    },
  ]);

  const categories = [
    "Berita Sekolah",
    "Pengingat Absensi",
    "Kebijakan PKL",
    "Libur",
  ];

  const types = ["Semua", "Umum", "PKL Khusus"];

  const filteredPengumuman = pengumuman.filter((p) => {
    const categoryMatch =
      selectedCategory === "Semua" || p.kategori === selectedCategory;
    const typeMatch =
      selectedType === "Semua" ||
      (selectedType === "Umum" && p.tipe === "umum") ||
      (selectedType === "PKL Khusus" && p.tipe === "pkl");
    return categoryMatch && typeMatch;
  });

  const handleAddAnnouncement = () => {
    if (
      newAnnouncement.judul &&
      newAnnouncement.isi &&
      newAnnouncement.tanggal &&
      newAnnouncement.kategori &&
      (newAnnouncement.tipe === "umum" ||
        (newAnnouncement.tipe === "pkl" && newAnnouncement.tempatPKL))
    ) {
      if (editingAnnouncement !== null) {
        const updated = pengumuman.map((p, idx) =>
          idx === editingAnnouncement
            ? { ...newAnnouncement, komentar: p.komentar || [] }
            : p,
        );
        setPengumuman(updated);
        setEditingAnnouncement(null);
      } else {
        setPengumuman([...pengumuman, { ...newAnnouncement, komentar: [] }]);
      }
      setNewAnnouncement({
        judul: "",
        isi: "",
        tanggal: "",
        kategori: "Berita Sekolah",
        tipe: "umum",
        tempatPKL: "",
      });
      setShowAddModal(false);
    } else {
      alert("Harap isi semua field!");
    }
  };

  const handleEditAnnouncement = (idx: number) => {
    setEditingAnnouncement(idx);
    setNewAnnouncement(pengumuman[idx]);
    setShowAddModal(true);
  };

  const handleDeleteAnnouncement = (idx: number) => {
    if (confirm("Apakah Anda yakin ingin menghapus pengumuman ini?")) {
      setPengumuman(pengumuman.filter((_, i) => i !== idx));
    }
  };

  const handleSendNotification = (announcement: Announcement) => {
    alert(
      `Notifikasi push dikirim ke siswa PKL ${announcement.tempatPKL || "umum"}: "${announcement.judul}"`,
    );
  };

  const handleAddComment = (idx: number) => {
    const comment = newComment[idx];
    if (comment) {
      const updated = pengumuman.map((p, i) =>
        i === idx
          ? {
              ...p,
              komentar: [
                ...(p.komentar || []),
                {
                  nama: "Anda (Guru)",
                  isi: comment,
                  tanggal: new Date().toISOString().split("T")[0],
                },
              ],
            }
          : p,
      );
      setPengumuman(updated);
      setNewComment({ ...newComment, [idx]: "" });
    }
  };

  const handleCloseModal = () => {
    setShowAddModal(false);
    setEditingAnnouncement(null);
    setNewAnnouncement({
      judul: "",
      isi: "",
      tanggal: "",
      kategori: "Berita Sekolah",
      tipe: "umum",
      tempatPKL: "",
    });
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto overflow-x-hidden w-full">
          {/* Header Section */}
          <div className="mb-8">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2 flex items-center gap-3">
              <Info className="w-8 h-8 sm:w-10 sm:h-10 text-indigo-600 animate-pulse" />
              Informasi Guru
            </h1>
            <p className="text-gray-600 text-sm sm:text-lg">
              Lihat pengumuman umum dan kelola pengumuman khusus untuk tempat
              PKL yang Anda bimbing.
            </p>
          </div>

          {/* Filter Section */}
          <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-lg border border-gray-100 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Filter className="w-5 h-5 text-indigo-500" />
              Filter dan Tambah Pengumuman
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 items-end">
              {/* Filter Kategori */}
              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-700 mb-2">
                  Pilih Kategori
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-4 py-3 border border-indigo-300 rounded-xl bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 hover:shadow-md w-full"
                >
                  <option>Semua</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
              {/* Filter Tipe */}
              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-700 mb-2">
                  Pilih Tipe
                </label>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="px-4 py-3 border border-indigo-300 rounded-xl bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 hover:shadow-md w-full"
                >
                  {types.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
              {/* Tombol Tambah Pengumuman */}
              <div className="flex justify-start md:justify-end">
                <button
                  onClick={() => setShowAddModal(true)}
                  className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-linear-to-r from-indigo-600 to-blue-600 text-white rounded-xl shadow-lg hover:shadow-xl hover:from-indigo-700 hover:to-blue-700 transition-all duration-200 transform hover:scale-105"
                >
                  <Plus className="w-5 h-5" />
                  Tambah Pengumuman
                </button>
              </div>
            </div>
          </div>

          {/* Card Pengumuman */}
          <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:scale-[1.01]">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <Megaphone className="w-6 h-6 text-indigo-600 animate-bounce" />
                Pengumuman
              </h3>
            </div>
            {filteredPengumuman.length === 0 ? (
              <p className="text-gray-500 italic text-center sm:text-left">
                Belum ada pengumuman yang sesuai filter.
              </p>
            ) : (
              <div className="space-y-6">
                {filteredPengumuman.map((p, idx) => (
                  <div
                    key={idx}
                    className="bg-linear-to-r from-indigo-50 to-purple-50 p-4 rounded-lg border-l-4 border-indigo-500 hover:bg-indigo-100 transition-all duration-200"
                  >
                    <div className="flex flex-col sm:flex-row justify-between items-start gap-2 mb-2">
                      <div className="flex-1 min-w-0 w-full">
                        <h4 className="font-semibold text-gray-900 break-words">
                          {p.judul}
                        </h4>
                        <div className="flex flex-wrap gap-2 mt-1">
                          <span className="text-xs text-indigo-600 bg-indigo-100 px-2 py-1 rounded-full">
                            {p.kategori}
                          </span>
                          <span className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded-full">
                            {p.tipe === "umum" ? "Umum" : `PKL: ${p.tempatPKL}`}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2 self-end sm:self-start shrink-0">
                        {p.tipe === "pkl" && (
                          <button
                            onClick={() => handleSendNotification(p)}
                            className="text-blue-600 hover:text-blue-800 p-1"
                            title="Kirim Notifikasi Push"
                          >
                            <Send className="w-5 h-5" />
                          </button>
                        )}
                        <button
                          onClick={() => handleEditAnnouncement(idx)}
                          className="text-indigo-600 hover:text-indigo-800 p-1"
                        >
                          <Edit className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDeleteAnnouncement(idx)}
                          className="text-red-600 hover:text-red-800 p-1"
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

                    {/* Komentar/Feedback */}
                    <div className="mt-4">
                      <h5 className="text-sm font-medium text-gray-800 mb-2 flex items-center gap-1">
                        <MessageSquare className="w-4 h-4" />
                        Komentar/Feedback
                      </h5>
                      {p.komentar && p.komentar.length > 0 ? (
                        <div className="space-y-2 mb-4">
                          {p.komentar.map((komentar, kIdx) => (
                            <div
                              key={kIdx}
                              className="bg-white p-3 rounded-lg border shadow-sm"
                            >
                              <div className="flex items-center gap-2 flex-wrap">
                                <User className="w-4 h-4 text-gray-600" />
                                <span className="text-sm font-medium truncate max-w-[200px]">
                                  {komentar.nama}
                                </span>
                                <span className="text-xs text-gray-500">
                                  {komentar.tanggal}
                                </span>
                              </div>
                              <p className="text-sm text-gray-700 mt-1 break-words">
                                {komentar.isi}
                              </p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-gray-500 mb-4">
                          Belum ada komentar.
                        </p>
                      )}
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Tambahkan komentar..."
                          value={newComment[idx] || ""}
                          onChange={(e) =>
                            setNewComment({
                              ...newComment,
                              [idx]: e.target.value,
                            })
                          }
                          className="flex-1 px-3 py-2 border rounded-lg text-sm min-w-0"
                        />
                        <button
                          onClick={() => handleAddComment(idx)}
                          className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 text-sm shrink-0"
                        >
                          Kirim
                        </button>
                      </div>
                    </div>
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
              <div
                className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl p-6 sm:p-10 relative z-10 animate-fade-scale transform-gpu transition duration-300 ease-out flex flex-col max-h-[90vh] overflow-y-auto"
                role="dialog"
                aria-modal="true"
                aria-labelledby="modal-title"
              >
                {/* Header */}
                <div className="flex justify-between items-center mb-6 sm:mb-8">
                  <h3
                    id="modal-title"
                    className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2 sm:gap-3"
                  >
                    <CheckCircle2 className="w-6 h-6 sm:w-8 sm:h-8 text-indigo-600 animate-pulse" />
                    {editingAnnouncement !== null
                      ? "Edit Pengumuman"
                      : "Tambah Baru"}
                  </h3>
                  <button
                    onClick={handleCloseModal}
                    className="text-gray-500 hover:text-gray-700 transition-colors"
                    aria-label="Close modal"
                  >
                    <XCircle className="w-6 h-6 sm:w-7 sm:h-7" />
                  </button>
                </div>

                {/* Form */}
                <form
                  className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 text-gray-800"
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleAddAnnouncement();
                  }}
                >
                  {/* Judul Pengumuman */}
                  <div className="flex flex-col md:col-span-3">
                    <label
                      htmlFor="judul"
                      className="mb-2 font-medium text-gray-700"
                    >
                      Judul Pengumuman
                    </label>
                    <input
                      id="judul"
                      type="text"
                      placeholder="Judul Pengumuman"
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

                  {/* Isi Pengumuman */}
                  <div className="flex flex-col md:col-span-2">
                    <label
                      htmlFor="isi"
                      className="mb-2 font-medium text-gray-700"
                    >
                      Isi Pengumuman
                    </label>
                    <textarea
                      id="isi"
                      placeholder="Isi Pengumuman"
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

                  {/* Tanggal & Kategori & Tipe */}
                  <div className="flex flex-col gap-4">
                    <div className="flex flex-col">
                      <label
                        htmlFor="tanggal"
                        className="mb-2 font-medium text-gray-700"
                      >
                        Tanggal
                      </label>
                      <input
                        id="tanggal"
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

                    <div className="flex flex-col">
                      <label
                        htmlFor="kategori"
                        className="mb-2 font-medium text-gray-700"
                      >
                        Kategori
                      </label>
                      <select
                        id="kategori"
                        value={newAnnouncement.kategori}
                        onChange={(e) =>
                          setNewAnnouncement({
                            ...newAnnouncement,
                            kategori: e.target.value,
                          })
                        }
                        required
                        className="px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition w-full"
                      >
                        {categories.map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="flex flex-col">
                      <label
                        htmlFor="tipe"
                        className="mb-2 font-medium text-gray-700"
                      >
                        Tipe Pengumuman
                      </label>
                      <select
                        id="tipe"
                        value={newAnnouncement.tipe}
                        onChange={(e) =>
                          setNewAnnouncement({
                            ...newAnnouncement,
                            tipe: e.target.value as "umum" | "pkl",
                          })
                        }
                        required
                        className="px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition w-full"
                      >
                        <option value="umum">Umum</option>
                        <option value="pkl">PKL Khusus</option>
                      </select>
                    </div>

                    {/* Tempat PKL - Muncul jika tipe PKL */}
                    {newAnnouncement.tipe === "pkl" && (
                      <div className="flex flex-col animate-fade-in">
                        <label
                          htmlFor="tempatPKL"
                          className="mb-2 font-medium text-gray-700"
                        >
                          Tempat PKL
                        </label>
                        <input
                          id="tempatPKL"
                          type="text"
                          placeholder="e.g., PT. ABC Industri"
                          value={newAnnouncement.tempatPKL}
                          onChange={(e) =>
                            setNewAnnouncement({
                              ...newAnnouncement,
                              tempatPKL: e.target.value,
                            })
                          }
                          required
                          className="px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition w-full"
                        />
                      </div>
                    )}
                  </div>

                  {/* Tombol Aksi */}
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
                      className="flex items-center justify-center gap-2 px-8 py-3 bg-linear-to-r from-indigo-600 to-blue-600 text-white rounded-xl shadow-lg hover:shadow-xl hover:from-indigo-700 hover:to-blue-700 transform transition duration-200"
                    >
                      <CheckCircle className="w-5 h-5" />
                      {editingAnnouncement !== null ? "Simpan" : "Tambah"}
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
