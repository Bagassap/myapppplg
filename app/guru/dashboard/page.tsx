"use client";
import Sidebar from "@/components/layout/SidebarGuru";
import TopBar from "@/components/layout/TopBar";
import { useState, useEffect } from "react";
import {
  Users,
  CheckCircle,
  XCircle,
  TrendingUp,
  Download,
  Filter,
} from "lucide-react";

export default function GuruDashboard() {
  const [selectedPKL, setSelectedPKL] = useState("Semua Tempat PKL");
  const [selectedPeriod, setSelectedPeriod] = useState("Semua Periode");
  const [loading, setLoading] = useState(true);

  // Stats Dashboard
  const [stats, setStats] = useState({
    totalSiswaPKL: 0,
    hadirHariIni: 0,
    tidakHadir: 0,
    persentaseKehadiran: 0,
  });
  const [pklData, setPklData] = useState<any[]>([]);

  // State Filter Real
  const [filters, setFilters] = useState({
    tempatPKL: [] as { id: string; label: string }[],
    tanggal: [] as string[],
  });

  // Fetch Data
  useEffect(() => {
    const fetchAllData = async () => {
      try {
        // 1. Fetch Filters
        const filterRes = await fetch("/api/dashboard/filters");
        if (filterRes.ok) {
          const filterData = await filterRes.json();
          setFilters({
            tempatPKL: filterData.tempatPKL || [], // Menggunakan key tempatPKL dari API
            tanggal: filterData.tanggal || [],
          });

          // Set default periode
          if (filterData.tanggal && filterData.tanggal.length > 0) {
            setSelectedPeriod(filterData.tanggal[0]);
          }
        }

        // 2. Fetch Dashboard
        const dashboardRes = await fetch("/api/dashboard");
        if (dashboardRes.ok) {
          const data = await dashboardRes.json();
          setStats(data.cards);
          setPklData(data.table);
        }
      } catch (error) {
        console.error("Gagal mengambil data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAllData();
  }, []);

  const handleExport = () => {
    // Menambahkan filter ke export
    const query = new URLSearchParams({
      tempatPKL: selectedPKL !== "Semua Tempat PKL" ? selectedPKL : "",
      tanggal: selectedPeriod !== "Semua Periode" ? selectedPeriod : "",
    }).toString();
    window.location.href = `/api/dashboard/export?${query}`;
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar />
        <main className="flex-1 p-6 sm:p-8 lg:p-12 overflow-y-auto overflow-x-hidden">
          <div className="mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2">
              Guru Dashboard
            </h1>
            <p className="text-gray-600 text-sm sm:text-base md:text-lg">
              Pantau ringkasan kehadiran siswa di tempat PKL yang Anda bimbing.
            </p>
          </div>

          {/* Filter Section */}
          <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-lg border border-gray-100 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Filter className="w-5 h-5 text-indigo-500" />
              Filter dan Ekspor Data
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 items-end">
              {/* Filter Tempat PKL (REAL DATA) */}
              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-700 mb-2">
                  Pilih Tempat PKL
                </label>
                <select
                  value={selectedPKL}
                  onChange={(e) => setSelectedPKL(e.target.value)}
                  className="w-full px-4 py-3 border border-indigo-300 rounded-xl bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 hover:shadow-md"
                >
                  <option>Semua Tempat PKL</option>
                  {filters.tempatPKL.map((pkl) => (
                    <option key={pkl.id} value={pkl.id}>
                      {pkl.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Filter Periode (REAL DATA TANGGAL) */}
              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-700 mb-2">
                  Pilih Periode
                </label>
                <select
                  value={selectedPeriod}
                  onChange={(e) => setSelectedPeriod(e.target.value)}
                  className="w-full px-4 py-3 border border-indigo-300 rounded-xl bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 hover:shadow-md"
                >
                  <option>Semua Periode</option>
                  {filters.tanggal.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-start md:justify-end">
                <button
                  onClick={handleExport}
                  className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-xl shadow-lg hover:shadow-xl hover:from-indigo-700 hover:to-blue-700 transition-all duration-200 transform hover:scale-105"
                >
                  <Download className="w-5 h-5" />
                  Ekspor Data
                </button>
              </div>
            </div>
          </div>

          {/* Statistik Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
            <div className="bg-gradient-to-br from-blue-100 to-blue-200 p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 border border-blue-200">
              <div className="flex items-center justify-between mb-4">
                <Users className="w-8 h-8 text-blue-600" />
                <span className="text-sm font-medium text-blue-700">Total</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                Total Siswa PKL
              </h3>
              <p className="text-3xl font-bold text-blue-600">
                {loading ? "..." : stats.totalSiswaPKL}
              </p>
            </div>
            <div className="bg-gradient-to-br from-green-100 to-green-200 p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 border border-green-200">
              <div className="flex items-center justify-between mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
                <span className="text-sm font-medium text-green-700">
                  Hadir
                </span>
              </div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                Hadir Hari Ini
              </h3>
              <p className="text-3xl font-bold text-green-600">
                {loading ? "..." : stats.hadirHariIni}
              </p>
            </div>
            <div className="bg-gradient-to-br from-red-100 to-red-200 p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 border border-red-200">
              <div className="flex items-center justify-between mb-4">
                <XCircle className="w-8 h-8 text-red-600" />
                <span className="text-sm font-medium text-red-700">Absen</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                Tidak Hadir
              </h3>
              <p className="text-3xl font-bold text-red-600">
                {loading ? "..." : stats.tidakHadir}
              </p>
            </div>
            <div className="bg-gradient-to-br from-indigo-100 to-blue-200 p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 border border-indigo-200">
              <div className="flex items-center justify-between mb-4">
                <TrendingUp className="w-8 h-8 text-indigo-600" />
                <span className="text-sm font-medium text-indigo-700">
                  Persentase
                </span>
              </div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                Persentase Kehadiran
              </h3>
              <p className="text-3xl font-bold text-indigo-600">
                {loading ? "..." : stats.persentaseKehadiran}%
              </p>
            </div>
          </div>

          {/* Tabel Responsive */}
          <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-lg border border-gray-100 mb-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <CheckCircle className="w-6 h-6 text-green-600" />
              Laporan Kehadiran per Siswa PKL
            </h3>
            <div className="w-full overflow-x-auto">
              <table className="w-full table-auto border-collapse min-w-[600px]">
                <thead>
                  <tr className="bg-gradient-to-r from-indigo-100 to-blue-100">
                    <th className="px-6 py-4 text-left font-semibold text-gray-700 rounded-tl-xl">
                      Tempat PKL
                    </th>
                    <th className="px-6 py-4 text-left font-semibold text-gray-700">
                      Siswa
                    </th>
                    <th className="px-6 py-4 text-left font-semibold text-gray-700">
                      Hari Hadir
                    </th>
                    <th className="px-6 py-4 text-left font-semibold text-gray-700 rounded-tr-xl">
                      Total Hari
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={4} className="text-center py-4">
                        Memuat data...
                      </td>
                    </tr>
                  ) : pklData.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="text-center py-4">
                        Tidak ada data siswa bimbingan.
                      </td>
                    </tr>
                  ) : (
                    pklData.map((item, index) => (
                      <tr
                        key={index}
                        className="border-b border-gray-100 hover:bg-indigo-50 transition-colors duration-200"
                      >
                        <td className="px-6 py-4 font-medium text-gray-900">
                          {item.tempatPKL}
                        </td>
                        <td className="px-6 py-4 text-gray-700">
                          {item.siswa}
                        </td>
                        <td className="px-6 py-4 text-gray-700">
                          {item.hadir}
                        </td>
                        <td className="px-6 py-4 text-gray-700">
                          {item.totalHari}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
