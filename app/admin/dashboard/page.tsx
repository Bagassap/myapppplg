"use client";
import Sidebar from "@/components/layout/SidebarAdmin";
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

export default function AdminDashboard() {
  const [selectedClass, setSelectedClass] = useState("Semua Kelas");
  const [selectedPeriod, setSelectedPeriod] = useState("Semua Periode");
  const [loading, setLoading] = useState(true);

  // Stats Dashboard
  const [stats, setStats] = useState({
    totalSiswa: 0,
    hadirHariIni: 0,
    tidakHadir: 0,
    persentaseKehadiran: 0,
  });
  const [classData, setClassData] = useState<any[]>([]);

  // Filters
  const [filters, setFilters] = useState({
    kelas: [] as { id: string; label: string }[],
    tanggal: [] as string[],
  });

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        // 1. Fetch Filters
        const filterRes = await fetch("/api/dashboard/filters");
        if (filterRes.ok) {
          const filterData = await filterRes.json();
          setFilters({
            kelas: filterData.kelas || [],
            tanggal: filterData.tanggal || [],
          });
          if (filterData.tanggal && filterData.tanggal.length > 0) {
            setSelectedPeriod(filterData.tanggal[0]);
          }
        }

        // 2. Fetch Dashboard
        const dashboardRes = await fetch(
          "/api/dashboard?t=" + new Date().getTime(),
        );
        if (dashboardRes.ok) {
          const data = await dashboardRes.json();
          if (data.cards) setStats(data.cards);
          if (data.table) setClassData(data.table);
        }
      } catch (error) {
        // Silent error
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleExport = () => {
    const query = new URLSearchParams({
      kelas: selectedClass !== "Semua Kelas" ? selectedClass : "",
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
              Admin Dashboard
            </h1>
            <p className="text-gray-600 text-sm sm:text-base md:text-lg">
              Pantau statistik kehadiran siswa secara keseluruhan dengan mudah.
            </p>
          </div>

          {/* Filter Section */}
          <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-lg border border-gray-100 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Filter className="w-5 h-5 text-indigo-500" />
              Filter dan Ekspor Data
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 items-end">
              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-700 mb-2">
                  Pilih Kelas
                </label>
                <select
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  className="px-4 py-3 border border-indigo-300 rounded-xl bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 hover:shadow-md w-full"
                >
                  <option>Semua Kelas</option>
                  {filters.kelas.map((k) => (
                    <option key={k.id} value={k.id}>
                      {k.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-700 mb-2">
                  Pilih Periode
                </label>
                <select
                  value={selectedPeriod}
                  onChange={(e) => setSelectedPeriod(e.target.value)}
                  className="px-4 py-3 border border-indigo-300 rounded-xl bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 hover:shadow-md w-full"
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
                  className="flex items-center justify-center w-full md:w-auto gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-xl shadow-lg hover:shadow-xl hover:from-indigo-700 hover:to-blue-700 transition-all duration-200 transform hover:scale-105"
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
                Total Siswa
              </h3>
              <p className="text-3xl font-bold text-blue-600">
                {stats.totalSiswa}
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
                {stats.hadirHariIni}
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
                {stats.tidakHadir}
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
                {stats.persentaseKehadiran}%
              </p>
            </div>
          </div>

          {/* Tabel Laporan Cepat */}
          <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-lg border border-gray-100 mb-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <CheckCircle className="w-6 h-6 text-green-600" />
              Laporan Kehadiran per Kelas
            </h3>
            <div className="w-full overflow-x-auto">
              <table className="w-full table-auto border-collapse min-w-[600px]">
                <thead>
                  <tr className="bg-gradient-to-r from-indigo-100 to-blue-100">
                    <th className="px-6 py-4 text-left font-semibold text-gray-700 rounded-tl-xl">
                      Kelas
                    </th>
                    <th className="px-6 py-4 text-left font-semibold text-gray-700">
                      Hadir
                    </th>
                    <th className="px-6 py-4 text-left font-semibold text-gray-700">
                      Total Siswa
                    </th>
                    <th className="px-6 py-4 text-left font-semibold text-gray-700 rounded-tr-xl">
                      Persentase
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {classData.length === 0 ? (
                    <tr>
                      <td
                        colSpan={4}
                        className="text-center py-4 text-gray-500"
                      >
                        {loading ? "Memuat data..." : "Tidak ada data."}
                      </td>
                    </tr>
                  ) : (
                    classData.map((item, index) => (
                      <tr
                        key={index}
                        className="border-b border-gray-100 hover:bg-indigo-50 transition-colors duration-200"
                      >
                        <td className="px-6 py-4 font-medium text-gray-900">
                          {item.kelas}
                        </td>
                        <td className="px-6 py-4 text-gray-700">
                          {item.hadir}
                        </td>
                        <td className="px-6 py-4 text-gray-700">
                          {item.total}
                        </td>
                        <td className="px-6 py-4 text-gray-700 font-semibold">
                          {item.persentase}%
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
