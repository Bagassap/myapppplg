"use client";

import Sidebar from "@/components/layout/SidebarGuru";
import TopBar from "@/components/layout/TopBar";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import {
  Filter,
  Download,
  CheckSquare,
  Clock,
  Calendar,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  UserCheck,
  MapPin,
  X,
  ImageIcon,
  PenTool,
} from "lucide-react";

export default function GuruAbsensi() {
  const { data: session, status } = useSession();

  // State Filter
  const [selectedPKL, setSelectedPKL] = useState("Semua Tempat PKL");
  const [selectedPeriod, setSelectedPeriod] = useState("Bulan Ini");
  const [selectedSiswa, setSelectedSiswa] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("Semua");

  // State Data & UI
  const [showSiswaPresensi, setShowSiswaPresensi] = useState(false);
  const [presensiData, setPresensiData] = useState<any[]>([]);
  const [siswaPresensiData, setSiswaPresensiData] = useState<
    Record<string, any[]>
  >({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // STATE BARU: Preview Gambar Modal
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const getKeterangan = (status: string, catatan: string) => {
    if (catatan && catatan !== "-") return catatan;
    return status;
  };

  useEffect(() => {
    if (status === "loading") return;
    if (!session) {
      setError("Unauthorized: Silakan login terlebih dahulu.");
      setLoading(false);
      return;
    }

    const fetchAbsensi = async () => {
      try {
        setLoading(true);
        setError(null);

        const params = new URLSearchParams();
        if (selectedPeriod === "Hari Ini") {
          const today = new Date().toISOString().split("T")[0];
          params.append("startDate", today);
          params.append("endDate", today);
        } else if (selectedPeriod === "Bulan Ini") {
          const now = new Date();
          const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
            .toISOString()
            .split("T")[0];
          const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)
            .toISOString()
            .split("T")[0];
          params.append("startDate", startOfMonth);
          params.append("endDate", endOfMonth);
        } else if (selectedPeriod === "Tahun Ini") {
          const now = new Date();
          const startOfYear = new Date(now.getFullYear(), 0, 1)
            .toISOString()
            .split("T")[0];
          const endOfYear = new Date(now.getFullYear(), 11, 31)
            .toISOString()
            .split("T")[0];
          params.append("startDate", startOfYear);
          params.append("endDate", endOfYear);
        }

        const response = await fetch(`/api/absensi?${params.toString()}`, {
          cache: "no-store",
        });
        if (!response.ok) throw new Error("Gagal mengambil data absensi.");

        const data = await response.json();
        const transformedData = Array.isArray(data)
          ? data.map((item: any) => ({
              id: item.id,
              siswa: item.siswa || "Siswa Tidak Dikenal",
              tempatPKL: item.tempatPKL || "-",
              status: item.status,
              waktu: item.waktu || "-",
              catatan: item.keterangan || "",
              kegiatan: item.kegiatan || "",
              lokasi: item.lokasi || "",
              foto: item.foto || "",
              tandaTangan: item.tandaTangan || "",
              bukti: item.bukti || "",
              tanggal: new Date(item.tanggal).toLocaleDateString("id-ID", {
                day: "numeric",
                month: "long",
                year: "numeric",
              }),
            }))
          : [];

        setPresensiData(transformedData);

        const grouped: Record<string, any[]> = {};
        transformedData.forEach((item: any) => {
          const siswaName = item.siswa;
          if (!grouped[siswaName]) grouped[siswaName] = [];
          grouped[siswaName].push(item);
        });
        setSiswaPresensiData(grouped);
      } catch (err: any) {
        setError(err.message || "Terjadi kesalahan.");
      } finally {
        setLoading(false);
      }
    };

    fetchAbsensi();
  }, [session, status, selectedPeriod]);

  const filteredData = presensiData.filter((item) => {
    const matchesPKL =
      selectedPKL === "Semua Tempat PKL" || item.tempatPKL === selectedPKL;
    const matchesStatus =
      selectedStatus === "Semua" ||
      item.status.toLowerCase() === selectedStatus.toLowerCase();
    const matchesSiswa = selectedSiswa === "" || item.siswa === selectedSiswa;
    return matchesPKL && matchesStatus && matchesSiswa;
  });

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = filteredData.slice(startIndex, endIndex);

  // FUNGSI BARU: Buka Modal Preview
  const openImagePreview = (url: string) => {
    if (url) setPreviewImage(url);
  };

  // ... (Kode handleExport, handleViewSiswaPresensi, pagination tetap sama) ...
  const handleViewSiswaPresensi = (siswa: string) => {
    setSelectedSiswa(siswa);
    setShowSiswaPresensi(true);
  };
  const handlePrevious = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };
  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };
  const handleExport = () => {
    /* ... kode export Anda ... */
  };

  if (loading)
    return (
      <div className="flex h-screen bg-gray-50 flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TopBar />
        <main className="flex-1 p-4 sm:p-8 lg:p-12 overflow-y-auto w-full">
          {/* ... (HEADER, ERROR, FILTER SECTION TETAP SAMA) ... */}
          {/* Salin bagian Header dan Filter dari kode lama Anda di sini */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold">Absensi Bimbingan</h1>
          </div>

          {/* FILTER UI PLACEHOLDER (Gunakan kode lama Anda) */}
          <div className="bg-white p-4 rounded-xl shadow mb-6">
            <h3 className="font-bold mb-4">Filter</h3>
            {/* ... Dropdown filter Anda ... */}
            <div className="flex gap-4 flex-wrap">
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="border p-2 rounded"
              >
                <option>Hari Ini</option>
                <option>Bulan Ini</option>
              </select>
              {/* ... dst ... */}
            </div>
          </div>

          {/* TABLE SECTION (Tabel Utama) */}
          {/* Di Tabel Utama biasanya hanya ringkasan. Tombol 'Lihat' membuka detail. */}
          <div className="bg-white rounded-2xl shadow-xl border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4">Tanggal</th>
                    <th className="px-6 py-4">Siswa</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {currentData.map((item) => (
                    <tr key={item.id} className="border-b hover:bg-gray-50">
                      <td className="px-6 py-4">{item.tanggal}</td>
                      <td className="px-6 py-4 font-medium">{item.siswa}</td>
                      <td className="px-6 py-4">{item.status}</td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleViewSiswaPresensi(item.siswa)}
                          className="bg-indigo-600 text-white px-3 py-1 rounded hover:bg-indigo-700"
                        >
                          Lihat Detail
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* MODAL DETAIL RIWAYAT SISWA (Popup Besar) */}
          {showSiswaPresensi && selectedSiswa && (
            <div
              className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
              onClick={() => setShowSiswaPresensi(false)}
            >
              <div
                className="bg-white w-full max-w-6xl max-h-[90vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-4 border-b flex justify-between">
                  <h3 className="font-bold text-xl">
                    Riwayat: {selectedSiswa}
                  </h3>
                  <button onClick={() => setShowSiswaPresensi(false)}>
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="flex-1 overflow-auto p-4">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 sticky top-0">
                      <tr>
                        <th className="px-4 py-3">Tanggal</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3 text-center">Foto</th>
                        <th className="px-4 py-3 text-center">TTD</th>
                        <th className="px-4 py-3">Keterangan</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(siswaPresensiData[selectedSiswa] || []).map(
                        (item: any) => (
                          <tr key={item.id} className="border-b">
                            <td className="px-4 py-3">{item.tanggal}</td>
                            <td className="px-4 py-3">{item.status}</td>

                            {/* FOTO DENGAN PREVIEW */}
                            <td className="px-4 py-3 text-center">
                              {item.foto ? (
                                <button
                                  onClick={() => openImagePreview(item.foto)}
                                  className="group relative w-12 h-12 border rounded overflow-hidden mx-auto"
                                >
                                  <img
                                    src={item.foto}
                                    className="w-full h-full object-cover"
                                    alt="Foto"
                                  />
                                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-all" />
                                </button>
                              ) : (
                                <ImageIcon className="w-5 h-5 mx-auto text-gray-300" />
                              )}
                            </td>

                            {/* TANDA TANGAN DENGAN PREVIEW */}
                            <td className="px-4 py-3 text-center">
                              {item.tandaTangan ? (
                                <button
                                  onClick={() =>
                                    openImagePreview(item.tandaTangan)
                                  }
                                  className="bg-white border rounded p-1 hover:border-indigo-500 transition-colors mx-auto block"
                                >
                                  <img
                                    src={item.tandaTangan}
                                    className="h-8 w-auto object-contain"
                                    alt="TTD"
                                  />
                                </button>
                              ) : (
                                <PenTool className="w-5 h-5 mx-auto text-gray-300" />
                              )}
                            </td>

                            <td className="px-4 py-3">
                              {getKeterangan(item.status, item.catatan)}
                            </td>
                          </tr>
                        ),
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* MODAL LIGHTBOX PREVIEW (Ditaruh paling luar) */}
      {previewImage && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md"
          onClick={() => setPreviewImage(null)}
        >
          <div
            className="relative max-w-4xl w-full max-h-screen flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute -top-10 right-0 text-white hover:text-gray-300"
            >
              <X className="w-8 h-8" />
            </button>
            <img
              src={previewImage}
              alt="Preview Besar"
              className="max-w-full max-h-[85vh] object-contain rounded shadow-2xl bg-white"
            />
            <a
              href={previewImage}
              download="file_presensi.png"
              className="mt-4 text-white underline hover:text-indigo-300"
            >
              Download Gambar
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
