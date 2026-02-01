"use client";

import Sidebar from "@/components/layout/SidebarGuru"; // Pastikan path ini benar sesuai struktur proyek Anda
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
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <TopBar />
        <main className="flex-1 p-18 overflow-auto">
          {/* Header Section */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2 flex items-center gap-3">
              <Info className="w-10 h-10 text-indigo-600 animate-pulse" />
              Informasi Guru
            </h1>
            <p className="text-gray-600 text-lg">
              Lihat pengumuman umum dan kelola pengumuman khusus untuk tempat
              PKL yang Anda bimbing.
            </p>
          </div>

          {/* Filter Section */}
          <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Filter className="w-5 h-5 text-indigo-500" />
              Filter dan Tambah Pengumuman
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
              {/* Filter Kategori */}
              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-700 mb-2">
                  Pilih Kategori
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-4 py-3 border border-indigo-300 rounded-xl bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 hover:shadow-md"
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
                  className="px-4 py-3 border border-indigo-300 rounded-xl bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 hover:shadow-md"
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
                  className="flex items-center gap-2 px-6 py-3 bg-linear-to-r from-indigo-600 to-blue-600 text-white rounded-xl shadow-lg hover:shadow-xl hover:from-indigo-700 hover:to-blue-700 transition-all duration-200 transform hover:scale-105"
                >
                  <Plus className="w-5 h-5" />
                  Tambah Pengumuman
                </button>
              </div>
            </div>
          </div>

          {/* Card Pengumuman */}
          <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:scale-105">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <Megaphone className="w-6 h-6 text-indigo-600 animate-bounce" />
                Pengumuman
              </h3>
            </div>
            {filteredPengumuman.length === 0 ? (
              <p className="text-gray-500 italic">
                Belum ada pengumuman yang sesuai filter.
              </p>
            ) : (
              <div className="space-y-6">
                {filteredPengumuman.map((p, idx) => (
                  <div
                    key={idx}
                    className="bg-linear-to-r from-indigo-50 to-purple-50 p-4 rounded-lg border-l-4 border-indigo-500 hover:bg-indigo-100 transition-all duration-200 transform hover:translate-x-2"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-semibold text-gray-900">
                          {p.judul}
                        </h4>
                        <span className="text-xs text-indigo-600 bg-indigo-100 px-2 py-1 rounded-full mr-2">
                          {p.kategori}
                        </span>
                        <span className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded-full">
                          {p.tipe === "umum" ? "Umum" : `PKL: ${p.tempatPKL}`}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        {p.tipe === "pkl" && (
                          <button
                            onClick={() => handleSendNotification(p)}
                            className="text-blue-600 hover:text-blue-800"
                            title="Kirim Notifikasi Push"
                          >
                            <Send className="w-5 h-5" />
                          </button>
                        )}
                        <button
                          onClick={() => handleEditAnnouncement(idx)}
                          className="text-indigo-600 hover:text-indigo-800"
                        >
                          <Edit className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDeleteAnnouncement(idx)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                    <p className="text-gray-700 mb-2">{p.isi}</p>
                    <span className="text-xs text-gray-500">{p.tanggal}</span>

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
                              className="bg-white p-2 rounded border"
                            >
                              <div className="flex items-center gap-2">
                                <User className="w-4 h-4 text-gray-600" />
                                <span className="text-sm font-medium">
                                  {komentar.nama}
                                </span>
                                <span className="text-xs text-gray-500">
                                  {komentar.tanggal}
                                </span>
                              </div>
                              <p className="text-sm text-gray-700">
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
                          className="flex-1 px-3 py-2 border rounded-lg text-sm"
                        />
                        <button
                          onClick={() => handleAddComment(idx)}
                          className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 text-sm"
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
            <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
              <div
                className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full mx-4 p-10 pointer-events-auto
                 animate-fade-scale transform-gpu transition duration-300 ease-out"
                role="dialog"
                aria-modal="true"
                aria-labelledby="modal-title"
              >
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                  <h3
                    id="modal-title"
                    className="text-2xl font-bold text-gray-900 flex items-center gap-3"
                  >
                    <CheckCircle2 className="w-8 h-8 text-indigo-600 animate-pulse" />
                    {editingAnnouncement !== null
                      ? "Edit Pengumuman"
                      : "Tambah Pengumuman Baru"}
                  </h3>
                  <button
                    onClick={handleCloseModal}
                    className="text-gray-500 hover:text-gray-700 transition-colors"
                    aria-label="Close modal"
                  >
                    <XCircle className="w-7 h-7" />
                  </button>
                </div>

                {/* Form */}
                <form
                  className="grid grid-cols-1 md:grid-cols-3 gap-8 text-gray-800"
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
                      className="px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                    />
                  </div>

                  {/* Isi Pengumuman */}
                  <div className="flex flex-col md:col-span-2 h-full">
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
                      className="w-full h-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition resize-none"
                    />
                  </div>

                  {/* Tanggal */}
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
                      className="px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                    />
                  </div>

                  {/* Kategori */}
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
                      className="px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                    >
                      {" "}
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Tipe Pengumuman */}
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
                      className="px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                    >
                      <option value="umum">Umum</option>
                      <option value="pkl">PKL Khusus</option>
                    </select>
                  </div>

                  {/* Tempat PKL - Muncul jika tipe PKL */}
                  {newAnnouncement.tipe === "pkl" && (
                    <div className="flex flex-col">
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
                        className="px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                      />
                    </div>
                  )}

                  {/* Tombol Aksi */}
                  <div className="md:col-span-3 flex justify-end gap-6 mt-6">
                    <button
                      type="submit"
                      className="flex items-center gap-2 px-8 py-3 bg-linear-to-r from-indigo-600 to-blue-600 text-white rounded-xl shadow-lg hover:shadow-xl hover:from-indigo-700 hover:to-blue-700 transform transition duration-200 hover:scale-105"
                    >
                      <CheckCircle className="w-5 h-5" />
                      {editingAnnouncement !== null ? "Simpan" : "Tambah"}
                    </button>
                    <button
                      type="button"
                      onClick={handleCloseModal}
                      className="flex items-center gap-2 px-8 py-3 bg-gray-500 text-white rounded-xl shadow-inner hover:bg-gray-600 transition-colors duration-200 hover:scale-105"
                    >
                      <X className="w-5 h-5" />
                      Batal
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
