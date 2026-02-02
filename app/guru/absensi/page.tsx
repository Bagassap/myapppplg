"use client";

import Sidebar from "@/components/layout/SidebarGuru"; // Tetap Sidebar Guru
import TopBar from "@/components/layout/TopBar";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import {
  Filter,
  Download,
  CheckSquare,
  Clock,
  XCircle,
  Calendar,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  QrCode,
  UserCheck,
  MapPin,
  X,
  Clock as ClockIcon,
} from "lucide-react";

export default function GuruAbsensi() {
  // --- STATE & LOGIC (TIDAK DIUBAH) ---
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
  const itemsPerPage = 10;

  const getKeterangan = (status: string, catatan: string) => {
    if (catatan) return catatan;
    switch (status) {
      case "Hadir":
        return "Siswa absen hadir";
      case "Pulang":
        return "Siswa absen pulang";
      case "Izin":
        return "Siswa absen izin";
      case "Libur":
        return "Siswa absen libur";
      case "Sakit":
        return "Siswa absen sakit";
      case "Terlambat":
        return "Siswa absen terlambat";
      default:
        return "-";
    }
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
          headers: {
            Pragma: "no-cache",
            "Cache-Control": "no-cache",
          },
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Gagal mengambil data absensi: ${errorText}`);
        }

        const data = await response.json();

        const transformedData = data.map((item: any) => ({
          id: item.id,
          siswa: item.siswaName || "Tidak Diketahui",
          tempatPKL: item.dataSiswa?.tempatPKL || "Tidak Diketahui",
          status: item.status,
          waktu: item.waktu || "-",
          catatan: item.keterangan || "",
          kegiatan: item.kegiatan || "",
          lokasi: item.lokasi || "",
          foto: item.foto || "",
          bukti: item.bukti || "",
          tandaTangan: item.tandaTangan || "",
          permintaan: item.status === "Izin" || item.status === "Libur",
          tanggal: new Date(item.tanggal).toLocaleDateString(),
        }));

        setPresensiData(transformedData);

        const grouped: Record<string, any[]> = {};
        transformedData.forEach((item: any) => {
          const siswa = item.siswa;
          if (!grouped[siswa]) grouped[siswa] = [];
          grouped[siswa].push(item);
        });
        setSiswaPresensiData(grouped);
      } catch (err: any) {
        console.error("Fetch error:", err);
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

  const handleExport = async () => {
    try {
      const params = new URLSearchParams();
      // ... (Logic export tetap sama) ...
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
      params.append("export", "csv");

      const response = await fetch(`/api/absensi?${params.toString()}`);
      if (!response.ok) throw new Error("Gagal ekspor CSV");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "laporan_absensi.csv";
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      alert("Error exporting CSV: " + err.message);
    }
  };

  const handleScanQR = () => alert("Fitur scan QR belum diimplementasikan!");
  const handleManualInput = () =>
    alert("Fitur input manual belum diimplementasikan!");

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

  // --- RENDER VISUAL (DISAMAKAN DENGAN ADMIN) ---

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
      <th className="px-6 py-4 text-left font-semibold text-gray-700 rounded-tl-xl text-base whitespace-nowrap">
        Tanggal
      </th>
      <th className="px-6 py-4 text-left font-semibold text-gray-700 text-base whitespace-nowrap">
        Siswa
      </th>
      <th className="px-6 py-4 text-left font-semibold text-gray-700 text-base whitespace-nowrap">
        Tempat PKL
      </th>
      <th className="px-6 py-4 text-left font-semibold text-gray-700 text-base whitespace-nowrap">
        Status
      </th>
      <th className="px-6 py-4 text-left font-semibold text-gray-700 text-base whitespace-nowrap">
        Waktu
      </th>
      <th className="px-6 py-4 text-left font-semibold text-gray-700 rounded-tr-xl text-base whitespace-nowrap">
        Aksi
      </th>
    </>
  );

  const renderTableRow = (item: any) => (
    <tr
      key={item.id}
      className="border-b border-gray-100 hover:bg-indigo-50 transition-colors"
    >
      <td className="px-6 py-4 font-medium text-gray-900 text-base whitespace-nowrap">
        {item.tanggal}
      </td>
      <td className="px-6 py-4 text-gray-700 text-base font-medium whitespace-nowrap">
        {item.siswa}
      </td>
      <td className="px-6 py-4 text-gray-700 text-base whitespace-nowrap">
        {item.tempatPKL}
      </td>
      <td className="px-6 py-4 text-gray-700 flex items-center gap-2 text-base whitespace-nowrap">
        {item.status === "Hadir" && (
          <CheckSquare className="w-4 h-4 text-green-600" />
        )}
        {item.status === "Pulang" && (
          <Clock className="w-4 h-4 text-blue-500" />
        )}
        {item.status === "Terlambat" && (
          <Clock className="w-4 h-4 text-yellow-500" />
        )}
        {(item.status === "Izin" || item.status === "Sakit") && (
          <AlertCircle className="w-4 h-4 text-red-500" />
        )}
        {item.status === "Libur" && (
          <Calendar className="w-4 h-4 text-purple-500" />
        )}
        {item.status}
      </td>
      <td className="px-6 py-4 text-gray-700 text-base whitespace-nowrap">
        {item.waktu}
      </td>
      <td className="px-6 py-4 text-gray-700 text-base whitespace-nowrap">
        <button
          onClick={() => handleViewSiswaPresensi(item.siswa)}
          className="p-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors duration-200 flex items-center gap-2"
        >
          <UserCheck className="w-4 h-4" />
          <span className="hidden sm:inline">Lihat</span>
        </button>
      </td>
    </tr>
  );

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TopBar />
        {/* Main Wrapper with increased padding (p-6 sm:p-8 lg:p-12) */}
        <main className="flex-1 p-6 sm:p-8 lg:p-12 overflow-y-auto overflow-x-hidden w-full max-w-full">
          {/* Header Section */}
          <div className="mb-6 sm:mb-8">
            <h1 className="text-xl sm:text-3xl font-bold text-gray-900 mb-2 flex items-center gap-2 sm:gap-3">
              <Calendar className="w-8 h-8 sm:w-12 sm:h-12 text-indigo-600 animate-pulse" />
              Absensi
            </h1>
            <p className="text-gray-600 text-sm sm:text-lg">
              Lihat presensi siswa untuk tempat PKL yang Anda bimbing.
            </p>
          </div>

          {/* Filter Card */}
          <div className="bg-white p-4 sm:p-8 rounded-2xl sm:rounded-3xl shadow-lg border border-gray-200 mb-6 sm:mb-10 hover:shadow-xl transition-shadow duration-300">
            <h3 className="text-lg sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6 flex items-center gap-2">
              <Filter className="w-5 h-5 sm:w-7 sm:h-7 text-indigo-600" />
              Filter & Ekspor
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {[
                {
                  label: "Tempat PKL",
                  val: selectedPKL,
                  set: setSelectedPKL,
                  opt: [
                    "Semua Tempat PKL",
                    ...new Set(presensiData.map((i) => i.tempatPKL)),
                  ],
                },
                {
                  label: "Periode",
                  val: selectedPeriod,
                  set: setSelectedPeriod,
                  opt: ["Hari Ini", "Bulan Ini", "Tahun Ini"],
                },
                {
                  label: "Siswa",
                  val: selectedSiswa,
                  set: setSelectedSiswa,
                  opt: [
                    "Semua Siswa",
                    ...new Set(presensiData.map((i) => i.siswa)),
                  ],
                },
                {
                  label: "Status",
                  val: selectedStatus,
                  set: setSelectedStatus,
                  opt: ["Semua", "Hadir", "Pulang", "Izin", "Libur"],
                },
              ].map((f, idx) => (
                <div key={idx} className="flex flex-col">
                  <label className="text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-2">
                    {f.label}
                  </label>
                  <select
                    value={f.val}
                    onChange={(e) => f.set(e.target.value)}
                    className="w-full px-3 py-2 sm:py-3 border border-indigo-200 rounded-xl bg-gray-50 text-sm sm:text-base focus:ring-2 focus:ring-indigo-500 outline-none transition-all duration-200"
                  >
                    {f.opt.map((o) => (
                      <option key={o} value={o === "Semua Siswa" ? "" : o}>
                        {o}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
              <div className="flex items-end">
                <button
                  onClick={handleExport}
                  className="w-full flex items-center justify-center gap-2 py-2 sm:py-3 bg-linear-to-r from-indigo-600 to-blue-600 text-white rounded-xl shadow hover:bg-indigo-700 hover:from-indigo-700 hover:to-blue-700 transition-all text-sm sm:text-base font-medium transform hover:scale-105"
                >
                  <Download className="w-4 h-4 sm:w-5 sm:h-5" /> Ekspor
                </button>
              </div>
            </div>
          </div>

          {/* Quick Action Card (Metode Pencatatan) */}
          <div className="bg-white p-4 sm:p-8 rounded-2xl sm:rounded-3xl shadow-lg border border-gray-200 mb-6 sm:mb-10 hover:shadow-xl transition-shadow duration-300">
            <h3 className="text-lg sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6 flex items-center gap-2">
              <UserCheck className="w-5 h-5 sm:w-7 sm:h-7 text-indigo-600" />
              Metode Pencatatan
            </h3>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <button
                onClick={handleScanQR}
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-linear-to-r from-green-600 to-green-700 text-white rounded-xl font-medium hover:from-green-700 hover:to-green-800 transition-all text-sm sm:text-base shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <QrCode className="w-5 h-5" /> Scan QR
              </button>
              <button
                onClick={handleManualInput}
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-linear-to-r from-blue-600 to-blue-700 text-white rounded-xl font-medium hover:from-blue-700 hover:to-blue-800 transition-all text-sm sm:text-base shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <UserCheck className="w-5 h-5" /> Input Manual
              </button>
            </div>
          </div>

          {/* Table Card */}
          <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl border border-gray-200 overflow-hidden hover:shadow-2xl transition-shadow duration-300">
            <div className="p-4 sm:p-8 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-lg sm:text-2xl font-bold text-gray-900 flex items-center gap-2">
                <CheckSquare className="w-5 h-5 sm:w-7 sm:h-7 text-green-600" />
                Daftar Presensi
              </h3>
            </div>

            {/* Table Wrapper with horizontal scroll and no parent meluber */}
            <div className="w-full overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300">
              <table className="w-full table-auto min-w-[800px] sm:min-w-full">
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

            {/* Pagination */}
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
                  className="flex-1 sm:flex-none flex items-center justify-center gap-1 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm disabled:opacity-50 hover:bg-gray-50 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" /> Prev
                </button>
                <button
                  disabled={currentPage === totalPages || totalPages === 0}
                  onClick={handleNext}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-1 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm disabled:opacity-50 hover:bg-indigo-700 transition-colors"
                >
                  Next <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Modal Riwayat (Mobile Optimized - Sama persis Admin) */}
          {showSiswaPresensi && selectedSiswa && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center p-2 sm:p-4">
              <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={() => setShowSiswaPresensi(false)}
              />
              <div className="relative bg-white w-full max-w-5xl max-h-[90vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-fade-scale">
                <div className="p-4 sm:p-6 border-b flex items-center justify-between">
                  <h3 className="font-bold text-lg sm:text-2xl truncate pr-4 flex items-center gap-2">
                    <CheckSquare className="w-6 h-6 text-green-600" />
                    Riwayat {selectedSiswa}
                  </h3>
                  <button
                    onClick={() => setShowSiswaPresensi(false)}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <X className="w-6 h-6 text-gray-500" />
                  </button>
                </div>
                <div className="flex-1 overflow-auto p-2 sm:p-6">
                  <div className="min-w-[800px]">
                    {/* Inner Modal Table */}
                    <table className="w-full text-sm sm:text-base border-collapse">
                      <thead className="bg-gray-50 sticky top-0 z-10 shadow-sm">
                        <tr>
                          <th className="px-4 py-3 text-left font-semibold text-gray-700 rounded-tl-lg">
                            Tanggal
                          </th>
                          <th className="px-4 py-3 text-left font-semibold text-gray-700">
                            Status
                          </th>
                          <th className="px-4 py-3 text-left font-semibold text-gray-700">
                            Waktu
                          </th>
                          <th className="px-4 py-3 text-left font-semibold text-gray-700">
                            Kegiatan
                          </th>
                          <th className="px-4 py-3 text-left font-semibold text-gray-700">
                            Lokasi
                          </th>
                          <th className="px-4 py-3 text-left font-semibold text-gray-700">
                            Foto/Bukti
                          </th>
                          <th className="px-4 py-3 text-left font-semibold text-gray-700">
                            TTD
                          </th>
                          <th className="px-4 py-3 text-left font-semibold text-gray-700 rounded-tr-lg">
                            Keterangan
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {(siswaPresensiData[selectedSiswa] || []).map(
                          (item: any) => (
                            <tr
                              key={item.id}
                              className="hover:bg-indigo-50 transition-colors"
                            >
                              <td className="px-4 py-3 text-gray-900 font-medium">
                                {item.tanggal}
                              </td>
                              <td className="px-4 py-3 text-gray-700 flex items-center gap-2">
                                {item.status === "Hadir" && (
                                  <CheckSquare className="w-4 h-4 text-green-600" />
                                )}
                                {item.status === "Pulang" && (
                                  <Clock className="w-4 h-4 text-blue-500" />
                                )}
                                {item.status === "Terlambat" && (
                                  <Clock className="w-4 h-4 text-yellow-500" />
                                )}
                                {(item.status === "Izin" ||
                                  item.status === "Sakit") && (
                                  <AlertCircle className="w-4 h-4 text-red-500" />
                                )}
                                {item.status === "Libur" && (
                                  <Calendar className="w-4 h-4 text-purple-500" />
                                )}
                                {item.status}
                              </td>
                              <td className="px-4 py-3 text-gray-700">
                                {item.waktu}
                              </td>
                              <td className="px-4 py-3 text-gray-700">
                                {item.kegiatan || "-"}
                              </td>
                              <td className="px-4 py-3 text-gray-700">
                                {item.lokasi ? (
                                  <a
                                    href={`http://googleusercontent.com/maps.google.com/?q=${item.lokasi}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 flex items-center gap-1 hover:underline"
                                  >
                                    <MapPin className="w-3 h-3" /> Map
                                  </a>
                                ) : (
                                  "-"
                                )}
                              </td>
                              <td className="px-4 py-3">
                                {item.status === "Izin" ||
                                item.status === "Sakit" ? (
                                  item.bukti ? (
                                    <img
                                      src={item.bukti}
                                      alt="Bukti"
                                      className="w-10 h-10 object-cover rounded border"
                                    />
                                  ) : (
                                    "-"
                                  )
                                ) : item.foto ? (
                                  <img
                                    src={item.foto}
                                    alt="Foto"
                                    className="w-10 h-10 object-cover rounded border"
                                  />
                                ) : (
                                  "-"
                                )}
                              </td>
                              <td className="px-4 py-3">
                                {item.tandaTangan ? (
                                  <img
                                    src={item.tandaTangan}
                                    alt="TTD"
                                    className="w-16 h-8 object-contain bg-white rounded border"
                                  />
                                ) : (
                                  "-"
                                )}
                              </td>
                              <td className="px-4 py-3 text-gray-700">
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
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
