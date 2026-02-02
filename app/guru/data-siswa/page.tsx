"use client";

import Sidebar from "@/components/layout/SidebarGuru";
import TopBar from "@/components/layout/TopBar";
import {
  Users,
  School,
  ChevronLeft,
  ChevronRight,
  XCircle,
  Filter,
  CheckCircle,
  Send,
  Loader,
} from "lucide-react";
import { useState, useEffect } from "react";

interface Siswa {
  id: number;
  nama: string;
  nis: string;
  kelas: string;
  tempatPKL: string;
}

export default function GuruDataSiswa() {
  const [selectedPKL, setSelectedPKL] = useState("Semua Tempat PKL");
  const [currentPage, setCurrentPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [selectedSiswa, setSelectedSiswa] = useState<Siswa | null>(null);
  const [siswaData, setSiswaData] = useState<Record<string, Siswa[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const itemsPerPage = 10;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/api/data-siswa");
        if (!response.ok) throw new Error("Gagal mengambil data siswa.");

        const data = await response.json();
        if (!data || data.length === 0) {
          setSiswaData({});
          return;
        }

        const grouped: Record<string, Siswa[]> = {};
        data.forEach((item: any) => {
          const tempatPKL = item.tempatPKL || "Tidak Diketahui";
          if (!grouped[tempatPKL]) grouped[tempatPKL] = [];
          grouped[tempatPKL].push({
            id: item.id,
            nama: item.name || "Tidak Diketahui",
            nis: item.userId || "Tidak Ada",
            kelas: item.kelas || "Tidak Ada",
            tempatPKL,
          });
        });
        setSiswaData(grouped);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Terjadi kesalahan.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const pklPlaces = Object.keys(siswaData);
  const filteredPKLs =
    selectedPKL === "Semua Tempat PKL" ? pklPlaces : [selectedPKL];

  const totalPages = Math.ceil(
    filteredPKLs.reduce((acc, pkl) => acc + (siswaData[pkl]?.length || 0), 0) /
      itemsPerPage,
  );

  // LOGIC FIX: Sinkronkan dengan Admin untuk paginasi per table/filter
  const displayedSiswa = (pkl: string) => {
    const all = siswaData[pkl] || [];
    if (selectedPKL === pkl) {
      const start = (currentPage - 1) * itemsPerPage;
      return all.slice(start, start + itemsPerPage);
    }
    return all.slice(0, 10);
  };

  const openModal = (siswa: Siswa) => {
    setSelectedSiswa(siswa);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedSiswa(null);
  };

  const handleVerifikasiPresensi = () => {
    alert(`Presensi untuk ${selectedSiswa?.nama} telah diverifikasi.`);
    closeModal();
  };

  const handleKirimLaporan = () => {
    alert(`Laporan ke orang tua ${selectedSiswa?.nama} telah dikirim.`);
    closeModal();
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader className="w-8 h-8 animate-spin text-indigo-600" />
        <span className="ml-2">Memuat data siswa...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto overflow-x-hidden w-full">
          {/* Header Section */}
          <div className="mb-8">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2 flex items-center gap-3">
              <Users className="w-8 h-8 sm:w-10 sm:h-10 text-indigo-600 animate-pulse" />
              Data Siswa PKL
            </h1>
            <p className="text-gray-600 text-sm sm:text-base md:text-lg">
              Lihat data siswa di tempat PKL yang Anda bimbing untuk verifikasi
              presensi atau memberikan laporan ke orang tua.
            </p>
          </div>

          {/* Filter Section - LOCKED UI */}
          <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-lg border border-gray-100 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Filter className="w-5 h-5 text-indigo-500" />
              Filter Tempat PKL
            </h3>
            <div className="flex flex-col md:flex-row gap-6 items-end justify-between">
              <div className="flex flex-col w-full md:w-auto">
                <label className="text-sm font-medium text-gray-700 mb-2">
                  Pilih Tempat PKL
                </label>
                <select
                  value={selectedPKL}
                  onChange={(e) => {
                    setSelectedPKL(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="px-4 py-3 border border-indigo-300 rounded-xl bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 hover:shadow-md w-full"
                >
                  <option>Semua Tempat PKL</option>
                  {pklPlaces.map((pkl) => (
                    <option key={pkl} value={pkl}>
                      {pkl}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Data siswa per tempat PKL */}
          {filteredPKLs.map((pkl) => (
            <div
              key={pkl}
              className="bg-white p-4 sm:p-6 rounded-2xl shadow-lg mb-8 border border-gray-100"
            >
              <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                <School className="w-6 h-6 text-indigo-600" />
                {pkl}
              </h3>

              {/* === START PERBAIKAN TABLE === */}
              <div className="w-full overflow-x-auto rounded-xl border border-gray-100">
                <table className="w-full table-auto border-collapse min-w-[800px] whitespace-nowrap">
                  <thead>
                    <tr className="bg-linear-to-r from-indigo-100 to-blue-100">
                      <th className="px-3 py-2 sm:px-4 sm:py-3 lg:px-6 lg:py-4 text-xs sm:text-sm lg:text-base text-left font-semibold text-gray-700">
                        Nomor
                      </th>
                      <th className="px-3 py-2 sm:px-4 sm:py-3 lg:px-6 lg:py-4 text-xs sm:text-sm lg:text-base text-left font-semibold text-gray-700">
                        Nama Siswa
                      </th>
                      <th className="px-3 py-2 sm:px-4 sm:py-3 lg:px-6 lg:py-4 text-xs sm:text-sm lg:text-base text-left font-semibold text-gray-700">
                        NIS
                      </th>
                      <th className="px-3 py-2 sm:px-4 sm:py-3 lg:px-6 lg:py-4 text-xs sm:text-sm lg:text-base text-left font-semibold text-gray-700">
                        Kelas
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {displayedSiswa(pkl).map((siswa, idx) => (
                      <tr
                        key={siswa.id}
                        className="border-b border-gray-100 cursor-pointer hover:bg-indigo-50 transition"
                        onClick={() => openModal(siswa)}
                      >
                        <td className="px-3 py-2 sm:px-4 sm:py-3 lg:px-6 lg:py-4 text-xs sm:text-sm lg:text-base font-medium text-gray-900">
                          {selectedPKL === pkl
                            ? (currentPage - 1) * itemsPerPage + idx + 1
                            : idx + 1}
                        </td>
                        <td className="px-3 py-2 sm:px-4 sm:py-3 lg:px-6 lg:py-4 text-xs sm:text-sm lg:text-base text-gray-700">
                          {siswa.nama}
                        </td>
                        <td className="px-3 py-2 sm:px-4 sm:py-3 lg:px-6 lg:py-4 text-xs sm:text-sm lg:text-base text-gray-700">
                          {siswa.nis}
                        </td>
                        <td className="px-3 py-2 sm:px-4 sm:py-3 lg:px-6 lg:py-4 text-xs sm:text-sm lg:text-base text-gray-700">
                          {siswa.kelas}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {/* === END PERBAIKAN TABLE === */}

              <p className="text-sm text-gray-600 mt-4">
                Menampilkan {displayedSiswa(pkl).length} dari{" "}
                {(siswaData[pkl] || []).length} siswa di {pkl}
              </p>
            </div>
          ))}

          {/* Modal Detail Siswa */}
          {showModal && selectedSiswa && (
            <div
              className="fixed inset-0 flex items-center justify-center z-50 p-4"
              role="dialog"
              aria-modal="true"
              aria-labelledby="modal-title"
            >
              <div
                className="fixed inset-0 bg-black/50 transition-opacity"
                onClick={closeModal}
              />
              <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl p-6 sm:p-10 relative z-10 overflow-y-auto max-h-[90vh]">
                <div className="flex justify-between items-center mb-8">
                  <h3
                    id="modal-title"
                    className="text-2xl font-bold text-gray-900 flex items-center gap-3"
                  >
                    <Users className="w-8 h-8 text-indigo-600 animate-pulse" />
                    Detail Data Siswa
                  </h3>
                  <button
                    onClick={closeModal}
                    className="text-gray-500 hover:text-gray-700 transition-colors"
                    aria-label="Close modal"
                  >
                    <XCircle className="w-7 h-7" />
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full table-auto border-collapse text-gray-800">
                    <tbody>
                      <tr className="border-b border-gray-200">
                        <th className="px-4 sm:px-6 py-4 text-left font-semibold w-1/3">
                          Nomor
                        </th>
                        <td className="px-4 sm:px-6 py-4">
                          {selectedSiswa.id}
                        </td>
                      </tr>
                      <tr className="border-b border-gray-200">
                        <th className="px-4 sm:px-6 py-4 text-left font-semibold">
                          Nama
                        </th>
                        <td className="px-4 sm:px-6 py-4">
                          {selectedSiswa.nama}
                        </td>
                      </tr>
                      <tr className="border-b border-gray-200">
                        <th className="px-4 sm:px-6 py-4 text-left font-semibold">
                          NIS
                        </th>
                        <td className="px-4 sm:px-6 py-4">
                          {selectedSiswa.nis}
                        </td>
                      </tr>
                      <tr className="border-b border-gray-200">
                        <th className="px-4 sm:px-6 py-4 text-left font-semibold">
                          Kelas
                        </th>
                        <td className="px-4 sm:px-6 py-4">
                          {selectedSiswa.kelas}
                        </td>
                      </tr>
                      <tr>
                        <th className="px-4 sm:px-6 py-4 text-left font-semibold">
                          Tempat PKL
                        </th>
                        <td className="px-4 sm:px-6 py-4">
                          {selectedSiswa.tempatPKL}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="flex flex-col sm:flex-row justify-end gap-4 mt-6">
                  <button
                    onClick={handleVerifikasiPresensi}
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-green-500 text-white rounded-xl shadow-lg hover:shadow-xl hover:bg-green-600 transition-all duration-200 transform hover:scale-105"
                  >
                    <CheckCircle className="w-5 h-5" />
                    Verifikasi Presensi
                  </button>
                  <button
                    onClick={handleKirimLaporan}
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-xl shadow-lg hover:shadow-xl hover:bg-blue-600 transition-all duration-200 transform hover:scale-105"
                  >
                    <Send className="w-5 h-5" />
                    Kirim Laporan ke Orang Tua
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && selectedPKL !== "Semua Tempat PKL" && (
            <div className="flex justify-center items-center mt-8">
              <div className="flex gap-2">
                <button
                  onClick={() =>
                    currentPage > 1 && setCurrentPage(currentPage - 1)
                  }
                  disabled={currentPage === 1}
                  className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-1"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Sebelumnya
                </button>
                <span className="px-4 py-2 text-gray-700">
                  Halaman {currentPage} dari {totalPages}
                </span>
                <button
                  onClick={() =>
                    currentPage < totalPages && setCurrentPage(currentPage + 1)
                  }
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-1"
                >
                  Selanjutnya
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
