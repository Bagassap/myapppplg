"use client";

import Sidebar from "@/components/layout/SidebarSiswa";
import TopBar from "@/components/layout/TopBar";
import { useState, useEffect } from "react";
import {
  Info,
  Megaphone,
  MessageSquare,
  User,
  Flag,
  XCircle,
  X,
  Send,
} from "lucide-react";

interface Announcement {
  id?: number;
  judul: string;
  isi: string;
  tanggal: string;
  kategori: string;
  tipe: "umum" | "pkl";
  tempatPKL?: string;
  komentar?: { nama: string; isi: string; tanggal: string }[];
}

export default function SiswaInformasi() {
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportForm, setReportForm] = useState({
    judul: "",
    deskripsi: "",
    announcementId: null as number | null,
  });
  const [newComment, setNewComment] = useState<{ [key: number]: string }>({});

  // STATE: Data awal kosong
  const [pengumuman, setPengumuman] = useState<Announcement[]>([]);

  // INTEGRASI: Fetch Data
  const fetchInformasi = async () => {
    try {
      const res = await fetch("/api/informasi");
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setPengumuman(data);
        }
      }
    } catch (error) {
      console.error("Gagal mengambil data:", error);
    }
  };

  useEffect(() => {
    fetchInformasi();
  }, []);

  const handleAddComment = async (idx: number) => {
    const commentContent = newComment[idx];
    if (commentContent) {
      try {
        const idInfo = pengumuman[idx].id;
        const payload = {
          nama: "Anda (Siswa)",
          isi: commentContent,
          tanggal: new Date().toISOString().split("T")[0],
        };

        const res = await fetch(`/api/informasi/${idInfo}/komentar`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (res.ok) {
          await fetchInformasi();
          setNewComment({ ...newComment, [idx]: "" });
        }
      } catch (error) {
        alert("Gagal mengirim komentar.");
      }
    }
  };

  const handleReportIssue = (idx: number) => {
    const realId = pengumuman[idx].id || null;
    setReportForm({ ...reportForm, announcementId: realId });
    setShowReportModal(true);
  };

  const handleSubmitReport = async () => {
    if (reportForm.judul && reportForm.deskripsi && reportForm.announcementId) {
      try {
        const res = await fetch(
          `/api/informasi/${reportForm.announcementId}/lapor`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              judul: reportForm.judul,
              deskripsi: reportForm.deskripsi,
            }),
          },
        );

        if (res.ok) {
          alert(`Laporan dikirim: ${reportForm.judul}`);
          setReportForm({
            judul: "",
            deskripsi: "",
            announcementId: null,
          });
          setShowReportModal(false);
        } else {
          alert("Gagal mengirim laporan.");
        }
      } catch (error) {
        console.error(error);
        alert("Terjadi kesalahan.");
      }
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
        <main className="flex-1 p-4 sm:p-8 lg:p-12 overflow-y-auto overflow-x-hidden w-full max-w-full">
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

          {/* Card Pengumuman (Filter Dihapus) */}
          <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:scale-[1.01]">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <Megaphone className="w-6 h-6 text-indigo-600 animate-bounce" />
                Daftar Pengumuman
              </h3>
            </div>

            {pengumuman.length === 0 ? (
              <p className="text-gray-500 italic text-center sm:text-left">
                Belum ada pengumuman yang ditambahkan.
              </p>
            ) : (
              <div className="space-y-6">
                {pengumuman.map((p, idx) => (
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
                          className="flex-1 px-3 py-2 border rounded-lg text-sm min-w-0 focus:ring-2 focus:ring-indigo-400 focus:outline-none"
                        />
                        <button
                          onClick={() => handleAddComment(idx)}
                          className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 text-sm shrink-0 transition-colors"
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
              <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl p-6 sm:p-10 relative z-10 animate-fade-scale transform-gpu transition duration-300 ease-out flex flex-col max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6 sm:mb-8">
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2 sm:gap-3">
                    <Flag className="w-6 h-6 sm:w-8 sm:h-8 text-red-600 animate-pulse" />
                    Laporkan Masalah
                  </h3>
                  <button
                    onClick={handleCloseReportModal}
                    className="text-gray-500 hover:text-gray-700 transition-colors"
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
