"use client";

import Sidebar from "@/components/layout/SidebarSiswa";
import TopBar from "@/components/layout/TopBar";
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
  Flag,
  XCircle,
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

export default function SiswaInformasi() {
  const [selectedCategory, setSelectedCategory] = useState("Semua");
  const [selectedType, setSelectedType] = useState("Semua");
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportForm, setReportForm] = useState({
    judul: "",
    deskripsi: "",
    announcementId: null as number | null,
  });
  const [newComment, setNewComment] = useState<{ [key: number]: string }>({});

  // Data pengumuman (dalam aplikasi nyata, ambil dari API)
  const [pengumuman, setPengumuman] = useState<Announcement[]>([
    {
      judul: "Pengingat Monitoring PKL",
      isi: "Monitoring PKL di PT. ABC Industri akan dilakukan pada tanggal 15 Oktober 2023.",
      tanggal: "2023-10-01",
      kategori: "Kebijakan PKL",
      tipe: "pkl",
      tempatPKL: "PT. ABC Industri",
      komentar: [
        {
          nama: "Ahmad Fauzi",
          isi: "Baik, saya akan siap.",
          tanggal: "2023-10-02",
        },
      ],
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
                  nama: "Anda (Siswa)", // Dalam aplikasi nyata, ambil nama dari login
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

  const handleReportIssue = (idx: number) => {
    setReportForm({ ...reportForm, announcementId: idx });
    setShowReportModal(true);
  };

  const handleSubmitReport = () => {
    if (reportForm.judul && reportForm.deskripsi) {
      // Simulasi submit laporan (dalam aplikasi nyata, kirim ke API)
      alert(`Laporan dikirim: ${reportForm.judul}`);
      setReportForm({ judul: "", deskripsi: "", announcementId: null });
      setShowReportModal(false);
    } else {
      alert("Harap isi judul dan deskripsi laporan!");
    }
  };

  const handleCloseReportModal = () => {
    setShowReportModal(false);
    setReportForm({ judul: "", deskripsi: "", announcementId: null });
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
              Informasi Siswa
            </h1>
            <p className="text-gray-600 text-sm sm:text-lg">
              Lihat pengumuman dari guru, seperti aturan absensi, jadwal libur,
              atau berita terkini. Berikan feedback atau laporkan masalah
              terkait informasi.
            </p>
          </div>

          {/* Filter Section */}
          <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-lg border border-gray-100 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Filter className="w-5 h-5 text-indigo-500" />
              Filter Pengumuman
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 items-end">
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
                      <button
                        onClick={() => handleReportIssue(idx)}
                        className="text-red-600 hover:text-red-800 p-1 self-end sm:self-start shrink-0"
                        title="Laporkan Masalah"
                      >
                        <Flag className="w-5 h-5" />
                      </button>
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

          {/* Modal Laporkan Masalah */}
          {showReportModal && (
            <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
              <div
                className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
                onClick={handleCloseReportModal}
              />
              <div
                className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl p-6 sm:p-10 relative z-10 animate-fade-scale transform-gpu transition duration-300 ease-out flex flex-col max-h-[90vh] overflow-y-auto"
                role="dialog"
                aria-modal="true"
                aria-labelledby="report-modal-title"
              >
                <div className="flex justify-between items-center mb-6 sm:mb-8">
                  <h3
                    id="report-modal-title"
                    className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2 sm:gap-3"
                  >
                    <Flag className="w-6 h-6 sm:w-8 sm:h-8 text-red-600 animate-pulse" />
                    Laporkan Masalah
                  </h3>
                  <button
                    onClick={handleCloseReportModal}
                    className="text-gray-500 hover:text-gray-700 transition-colors"
                    aria-label="Close modal"
                  >
                    <XCircle className="w-6 h-6 sm:w-7 sm:h-7" />
                  </button>
                </div>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSubmitReport();
                  }}
                  className="grid grid-cols-1 gap-6 text-gray-800"
                >
                  {/* Judul Laporan */}
                  <div className="flex flex-col">
                    <label className="mb-2 font-medium text-gray-700">
                      Judul Laporan
                    </label>
                    <input
                      type="text"
                      placeholder="Judul masalah"
                      value={reportForm.judul}
                      onChange={(e) =>
                        setReportForm({ ...reportForm, judul: e.target.value })
                      }
                      required
                      className="px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full"
                    />
                  </div>

                  {/* Deskripsi Laporan */}
                  <div className="flex flex-col">
                    <label className="mb-2 font-medium text-gray-700">
                      Deskripsi
                    </label>
                    <textarea
                      placeholder="Jelaskan masalah terkait informasi ini"
                      value={reportForm.deskripsi}
                      onChange={(e) =>
                        setReportForm({
                          ...reportForm,
                          deskripsi: e.target.value,
                        })
                      }
                      required
                      className="px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none w-full min-h-[120px]"
                      rows={4}
                    />
                  </div>

                  {/* Tombol Aksi */}
                  <div className="flex flex-col-reverse sm:flex-row justify-end gap-4 sm:gap-6 mt-2">
                    <button
                      type="button"
                      onClick={handleCloseReportModal}
                      className="flex items-center justify-center gap-2 px-8 py-3 bg-gray-500 text-white rounded-xl shadow-inner hover:bg-gray-600 transition-colors duration-200"
                    >
                      <X className="w-5 h-5" />
                      Batal
                    </button>
                    <button
                      type="submit"
                      className="flex items-center justify-center gap-2 px-8 py-3 bg-linear-to-r from-red-600 to-red-700 text-white rounded-xl shadow-lg hover:shadow-xl hover:from-red-700 hover:to-red-800 transform transition duration-200"
                    >
                      <Send className="w-5 h-5" />
                      Kirim Laporan
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
