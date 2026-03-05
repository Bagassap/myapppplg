"use client";

import Sidebar from "@/components/layout/SidebarGuru";
import TopBar from "@/components/layout/TopBar";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import TidakHadirSection from "@/components/absensi/TidakHadirSection";
import {
  SlidersHorizontal,
  CheckSquare,
  X,
  Calendar,
  ChevronLeft,
  ChevronRight,
  UserCheck,
  UserX,
  MapPin,
  Image as ImageIcon,
  PenTool,
} from "lucide-react";

export default function GuruAbsensi() {
  const { data: session, status } = useSession();
  const [selectedPKL, setSelectedPKL] = useState("Semua Tempat PKL");
  const [selectedPeriod, setSelectedPeriod] = useState("Bulan Ini");
  const [selectedSiswa, setSelectedSiswa] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("Semua");
  const [showSiswaPresensi, setShowSiswaPresensi] = useState(false);
  const [presensiData, setPresensiData] = useState<any[]>([]);
  const [siswaPresensiData, setSiswaPresensiData] = useState<
    Record<string, any[]>
  >({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewType, setPreviewType] = useState<"foto" | "ttd">("foto");
  const itemsPerPage = 10;

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

        const response = await fetch(`/api/absensi?${params.toString()}`);
        if (!response.ok)
          throw new Error(
            `Gagal mengambil data absensi: ${await response.text()}`,
          );

        const data = await response.json();
        const transformedData = data.map((item: any) => ({
          id: item.id,
          siswa: item.siswa || "Tidak Diketahui",
          tempatPKL: item.tempatPKL || "Tidak Diketahui",
          status: item.status,
          waktu: item.waktu || "-",
          catatan: item.keterangan || "",
          kegiatan: item.kegiatan || "",
          lokasi: item.lokasi || "",
          foto: item.foto || "",
          tandaTangan: item.tandaTangan || "",
          bukti: item.bukti || "",
          tanggal: new Date(item.tanggal).toLocaleDateString("id-ID"),
        }));

        setPresensiData(transformedData);
        const grouped: Record<string, any[]> = {};
        transformedData.forEach((item: any) => {
          if (!grouped[item.siswa]) grouped[item.siswa] = [];
          grouped[item.siswa].push(item);
        });
        setSiswaPresensiData(grouped);
      } catch (err: any) {
        setError(err.message);
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

  const openPreview = (url: string, type: "foto" | "ttd") => {
    if (!url) return;
    setPreviewUrl(url);
    setPreviewType(type);
  };

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

  if (loading || error) {
    return (
      <div className="flex h-screen bg-gray-50 overflow-hidden">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <TopBar />
          <main className="flex-1 flex items-center justify-center p-6 sm:p-8 lg:p-12">
            {loading ? (
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" />
            ) : (
              <p className="text-red-600">{error}</p>
            )}
          </main>
        </div>
      </div>
    );
  }

  const renderTableHeaders = () => (
    <>
      <th className="px-2 py-3 sm:px-6 sm:py-4 text-left font-semibold text-gray-700 rounded-tl-xl text-xs sm:text-base">
        Siswa
      </th>
      <th className="px-2 py-3 sm:px-6 sm:py-4 text-left font-semibold text-gray-700 text-xs sm:text-base hidden sm:table-cell">
        Tempat PKL
      </th>
      <th className="px-2 py-3 sm:px-6 sm:py-4 text-left font-semibold text-gray-700 text-xs sm:text-base">
        Status
      </th>
      <th className="px-2 py-3 sm:px-6 sm:py-4 text-left font-semibold text-gray-700 text-xs sm:text-base">
        Waktu
      </th>
      <th className="px-2 py-3 sm:px-6 sm:py-4 text-left font-semibold text-gray-700 text-xs sm:text-base hidden md:table-cell">
        Catatan
      </th>
      <th className="px-2 py-3 sm:px-6 sm:py-4 text-left font-semibold text-gray-700 rounded-tr-xl text-xs sm:text-base">
        Aksi
      </th>
    </>
  );

  const renderTableRow = (item: any) => (
    <tr
      key={item.id}
      className="border-b border-gray-100 hover:bg-indigo-50 transition-colors"
    >
      <td className="px-2 py-3 sm:px-6 sm:py-4 font-medium text-gray-900 text-xs sm:text-base break-words">
        {item.siswa}
        <div className="text-[10px] text-gray-500 sm:hidden mt-1">
          {item.tempatPKL}
        </div>
      </td>
      <td className="px-2 py-3 sm:px-6 sm:py-4 text-gray-700 text-xs sm:text-base hidden sm:table-cell">
        {item.tempatPKL}
      </td>
      <td className="px-2 py-3 sm:px-6 sm:py-4 text-gray-700 text-xs sm:text-base">
        <div className="flex items-center gap-1 sm:gap-2">
          {item.status === "Hadir" && (
            <CheckSquare className="w-3 h-3 sm:w-4 sm:h-4 text-green-600 shrink-0" />
          )}
          <span>{item.status}</span>
        </div>
      </td>
      <td className="px-2 py-3 sm:px-6 sm:py-4 text-gray-700 text-xs sm:text-base whitespace-nowrap">
        {item.waktu}
      </td>
      <td className="px-2 py-3 sm:px-6 sm:py-4 text-gray-700 text-xs sm:text-base hidden md:table-cell">
        {item.catatan || "-"}
      </td>
      <td className="px-2 py-3 sm:px-6 sm:py-4 text-gray-700">
        <div className="flex flex-wrap gap-1 sm:gap-2">
          <button
            onClick={() => handleViewSiswaPresensi(item.siswa)}
            className="flex items-center gap-1 px-3 py-1.5 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors text-xs sm:text-sm font-medium"
          >
            <UserCheck className="w-3 h-3 sm:w-4 sm:h-4" />
            <span>Lihat Presensi</span>
          </button>
        </div>
      </td>
    </tr>
  );

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TopBar />
        <main className="flex-1 p-4 sm:p-8 lg:p-12 overflow-y-auto overflow-x-hidden w-full max-w-full">
          <div className="mb-6 sm:mb-8">
            <h1 className="text-xl sm:text-3xl font-bold text-gray-900 mb-2 flex items-center gap-2 sm:gap-3">
              <Calendar className="w-8 h-8 sm:w-12 sm:h-12 text-indigo-600" />
              Absensi
            </h1>
            <p className="text-gray-600 text-sm sm:text-lg">
              Lihat presensi siswa bimbingan Anda.
            </p>
          </div>

          <div className="bg-white px-5 py-4 rounded-2xl shadow-sm border border-gray-100 mb-6 sm:mb-8 flex flex-wrap gap-3 items-center">
            <SlidersHorizontal className="w-4 h-4 text-indigo-400 shrink-0" />
            <div className="flex flex-wrap gap-3 flex-1">
              <select
                value={selectedPKL}
                onChange={(e) => setSelectedPKL(e.target.value)}
                className="px-4 py-2 border border-gray-200 rounded-xl bg-gray-50 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-300 min-w-[150px]"
              >
                <option>Semua Tempat PKL</option>
                {[...new Set(presensiData.map((i) => i.tempatPKL))].map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="px-4 py-2 border border-gray-200 rounded-xl bg-gray-50 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-300 min-w-[130px]"
              >
                {["Hari Ini", "Bulan Ini", "Tahun Ini"].map((o) => (
                  <option key={o}>{o}</option>
                ))}
              </select>
              <select
                value={selectedSiswa}
                onChange={(e) => setSelectedSiswa(e.target.value)}
                className="px-4 py-2 border border-gray-200 rounded-xl bg-gray-50 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-300 min-w-[150px]"
              >
                <option value="">Semua Siswa</option>
                {[...new Set(presensiData.map((i) => i.siswa))].map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-4 py-2 border border-gray-200 rounded-xl bg-gray-50 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-300 min-w-[120px]"
              >
                {["Semua", "Hadir", "Pulang", "Izin", "Libur"].map((o) => (
                  <option key={o}>{o}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl border border-gray-200 overflow-hidden">
            <div className="p-4 sm:p-8 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-lg sm:text-2xl font-bold text-gray-900 flex items-center gap-2">
                <CheckSquare className="w-5 h-5 sm:w-7 sm:h-7 text-green-600" />
                Daftar Presensi
              </h3>
            </div>
            <div className="w-full overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300">
              <table className="w-full table-auto min-w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    {renderTableHeaders()}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {currentData.map((item) => renderTableRow(item))}
                </tbody>
              </table>
            </div>
            {currentData.length === 0 && (
              <div className="py-12 text-center text-gray-500 text-sm sm:text-base">
                Data tidak ditemukan.
              </div>
            )}
            <div className="p-4 sm:p-8 bg-gray-50 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-xs sm:text-sm text-gray-600 font-medium">
                Menampilkan {startIndex + 1}-
                {Math.min(endIndex, filteredData.length)} dari{" "}
                {filteredData.length}
              </p>
              <div className="flex gap-2 w-full sm:w-auto">
                <button
                  disabled={currentPage === 1}
                  onClick={handlePrevious}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-1 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm disabled:opacity-50"
                >
                  <ChevronLeft className="w-4 h-4" /> Prev
                </button>
                <button
                  disabled={currentPage === totalPages}
                  onClick={handleNext}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-1 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm disabled:opacity-50"
                >
                  Next <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* ── SECTION SISWA TIDAK HADIR ─────────────────────────── */}
          <TidakHadirSection period={selectedPeriod} role="guru" />

          {showSiswaPresensi && selectedSiswa && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center p-2 sm:p-4">
              <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={() => setShowSiswaPresensi(false)}
              />
              <div className="relative bg-white w-full max-w-6xl max-h-[90vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col">
                <div className="p-4 sm:p-6 border-b flex items-center justify-between">
                  <h3 className="font-bold text-lg sm:text-2xl truncate pr-4">
                    Riwayat {selectedSiswa}
                  </h3>
                  <button
                    onClick={() => setShowSiswaPresensi(false)}
                    className="p-2 hover:bg-gray-100 rounded-full"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
                <div className="flex-1 overflow-auto p-2 sm:p-6">
                  <div className="w-full overflow-x-auto">
                    <table className="w-full text-xs sm:text-base min-w-[800px] sm:min-w-full">
                      <thead className="bg-gray-50 sticky top-0 z-10">
                        <tr>
                          <th className="px-2 py-2 sm:px-4 sm:py-3 text-left">
                            Tanggal
                          </th>
                          <th className="px-2 py-2 sm:px-4 sm:py-3 text-left">
                            Status
                          </th>
                          <th className="px-2 py-2 sm:px-4 sm:py-3 text-left">
                            Waktu
                          </th>
                          <th className="px-2 py-2 sm:px-4 sm:py-3 text-left">
                            Lokasi
                          </th>
                          <th className="px-2 py-2 sm:px-4 sm:py-3 text-center w-24">
                            Foto
                          </th>
                          <th className="px-2 py-2 sm:px-4 sm:py-3 text-center w-24">
                            TTD
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {(siswaPresensiData[selectedSiswa] || []).map(
                          (item: any) => (
                            <tr key={item.id} className="hover:bg-gray-50">
                              <td className="px-2 py-2 sm:px-4 sm:py-3">
                                {item.tanggal}
                              </td>
                              <td className="px-2 py-2 sm:px-4 sm:py-3">
                                <span
                                  className={`px-2 py-1 rounded text-xs font-medium ${item.status === "Hadir" ? "bg-green-100 text-green-800" : item.status === "Izin" ? "bg-yellow-100 text-yellow-800" : "bg-gray-100 text-gray-800"}`}
                                >
                                  {item.status}
                                </span>
                              </td>
                              <td className="px-2 py-2 sm:px-4 sm:py-3">
                                {item.waktu}
                              </td>
                              <td className="px-2 py-2 sm:px-4 sm:py-3">
                                {item.lokasi ? (
                                  <a
                                    href={`https://www.google.com/maps?q=${item.lokasi}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:underline flex items-center gap-1"
                                  >
                                    <MapPin className="w-3 h-3" /> Map
                                  </a>
                                ) : (
                                  "-"
                                )}
                              </td>
                              <td className="px-2 py-2 sm:px-4 sm:py-3 text-center">
                                {item.foto ? (
                                  <div
                                    className="flex justify-center cursor-pointer group"
                                    onClick={() =>
                                      openPreview(item.foto, "foto")
                                    }
                                    title="Klik untuk memperbesar"
                                  >
                                    <div className="relative w-10 h-10 sm:w-12 sm:h-12 border rounded overflow-hidden shadow-sm hover:shadow-md transition-all">
                                      <img
                                        src={item.foto}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                                        alt="Foto"
                                        onError={(e) => {
                                          (
                                            e.target as HTMLImageElement
                                          ).style.display = "none";
                                        }}
                                      />
                                    </div>
                                  </div>
                                ) : (
                                  <div className="flex justify-center text-gray-300">
                                    <ImageIcon className="w-5 h-5" />
                                  </div>
                                )}
                              </td>
                              <td className="px-2 py-2 sm:px-4 sm:py-3 text-center">
                                {item.tandaTangan ? (
                                  <div
                                    className="flex justify-center cursor-pointer group"
                                    onClick={() =>
                                      openPreview(item.tandaTangan, "ttd")
                                    }
                                    title="Klik untuk memperbesar"
                                  >
                                    <div className="relative w-10 h-10 sm:w-12 sm:h-12 border rounded bg-white overflow-hidden shadow-sm hover:shadow-md transition-all">
                                      <img
                                        src={item.tandaTangan}
                                        className="w-full h-full object-contain group-hover:scale-110 transition-transform p-1"
                                        alt="TTD"
                                        onError={(e) => {
                                          (
                                            e.target as HTMLImageElement
                                          ).style.display = "none";
                                        }}
                                      />
                                    </div>
                                  </div>
                                ) : (
                                  <div className="flex justify-center text-gray-300">
                                    <PenTool className="w-5 h-5" />
                                  </div>
                                )}
                              </td>
                            </tr>
                          ),
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {previewUrl && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center"
          style={{ animation: "fadeIn 0.2s ease" }}
          onClick={() => setPreviewUrl(null)}
        >
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(135deg, rgba(15,23,42,0.95) 0%, rgba(30,27,75,0.95) 100%)",
              backdropFilter: "blur(20px)",
            }}
          />
          <div
            className="absolute top-0 left-0 w-96 h-96 rounded-full opacity-10"
            style={{
              background: "radial-gradient(circle, #6366f1, transparent)",
              filter: "blur(60px)",
              transform: "translate(-30%, -30%)",
            }}
          />
          <div
            className="absolute bottom-0 right-0 w-96 h-96 rounded-full opacity-10"
            style={{
              background: "radial-gradient(circle, #8b5cf6, transparent)",
              filter: "blur(60px)",
              transform: "translate(30%, 30%)",
            }}
          />
          <div
            className="relative w-full mx-4 flex flex-col items-center"
            style={{
              maxWidth: previewType === "ttd" ? "480px" : "720px",
              animation: "scaleIn 0.25s cubic-bezier(0.34,1.56,0.64,1)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-4 self-start">
              <div
                className="flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold tracking-widest uppercase"
                style={{
                  background: "rgba(99,102,241,0.2)",
                  border: "1px solid rgba(99,102,241,0.4)",
                  color: "#a5b4fc",
                }}
              >
                {previewType === "ttd" ? (
                  <PenTool className="w-3 h-3" />
                ) : (
                  <ImageIcon className="w-3 h-3" />
                )}
                {previewType === "ttd" ? "Tanda Tangan" : "Foto Absensi"}
              </div>
            </div>
            <div
              className="w-full rounded-2xl overflow-hidden relative"
              style={{
                background:
                  previewType === "ttd"
                    ? "rgba(255,255,255,0.98)"
                    : "transparent",
                boxShadow:
                  "0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.08)",
                padding: previewType === "ttd" ? "32px" : "0",
              }}
            >
              {previewType !== "ttd" && (
                <div
                  className="absolute inset-0 rounded-2xl"
                  style={{
                    background:
                      "linear-gradient(to bottom, transparent 60%, rgba(15,23,42,0.8))",
                    zIndex: 1,
                    pointerEvents: "none",
                  }}
                />
              )}
              <img
                src={previewUrl}
                alt={previewType === "foto" ? "Foto Absensi" : "Tanda Tangan"}
                className="w-full block"
                style={{
                  maxHeight: previewType === "ttd" ? "200px" : "70vh",
                  objectFit: previewType === "ttd" ? "contain" : "cover",
                  borderRadius: previewType === "ttd" ? "0" : "16px",
                }}
              />
            </div>
            <div className="flex items-center justify-between w-full mt-4 px-1">
              <p className="text-xs" style={{ color: "rgba(165,180,252,0.6)" }}>
                Klik di luar untuk menutup
              </p>
              <button
                onClick={() => setPreviewUrl(null)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all"
                style={{
                  background: "rgba(255,255,255,0.08)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  color: "rgba(255,255,255,0.8)",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = "rgba(255,255,255,0.15)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "rgba(255,255,255,0.08)")
                }
              >
                <X className="w-4 h-4" /> Tutup
              </button>
            </div>
          </div>
          <style>{`
            @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
            @keyframes scaleIn { from { opacity: 0; transform: scale(0.92) translateY(12px); } to { opacity: 1; transform: scale(1) translateY(0); } }
          `}</style>
        </div>
      )}
    </div>
  );
}
