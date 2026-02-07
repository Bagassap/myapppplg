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

  // State Stats dengan default 0
  const [stats, setStats] = useState({
    totalSiswa: 0,
    hadirHariIni: 0,
    tidakHadir: 0,
    persentaseKehadiran: 0,
  });
  const [classData, setClassData] = useState<any[]>([]);

  const [filters, setFilters] = useState({
    kelas: [] as { id: string; label: string }[],
    tanggal: [] as string[],
  });

  useEffect(() => {
    const fetchAllData = async () => {
      console.log("🚀 MEMULAI FETCH DASHBOARD ADMIN...");
      try {
        // 1. Fetch Filters
        const filterRes = await fetch("/api/dashboard/filters");
        if (filterRes.ok) {
          const filterData = await filterRes.json();
          console.log("✅ Data Filter Diterima:", filterData);
          setFilters({
            kelas: filterData.kelas || [],
            tanggal: filterData.tanggal || [],
          });

          if (filterData.tanggal && filterData.tanggal.length > 0) {
            setSelectedPeriod(filterData.tanggal[0]);
          }
        } else {
          console.error("❌ Gagal ambil filter:", filterRes.status);
        }

        // 2. Fetch Dashboard Data
        const dashboardRes = await fetch("/api/dashboard", {
          cache: "no-store",
        }); // Anti-cache

        if (dashboardRes.ok) {
          const data = await dashboardRes.json();
          console.log("✅ DATA DASHBOARD DITERIMA DARI API:", data);

          if (data.cards) {
            console.log("📊 Mengupdate Stats UI dengan:", data.cards);
            setStats(data.cards);
          } else {
            console.error("⚠️ Data 'cards' tidak ditemukan di response API");
          }

          if (data.table) {
            console.log("📋 Mengupdate Tabel UI dengan:", data.table);
            setClassData(data.table);
          }
        } else {
          console.error("❌ Gagal ambil dashboard:", dashboardRes.status);
        }
      } catch (error) {
        console.error("🔥 ERROR FATAL di Frontend:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
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
            <p className="text-gray-600">
              Debug Mode: Cek Console (F12) untuk melihat aliran data.
            </p>
          </div>

          {/* Filter Section */}
          <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-lg border border-gray-100 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Filter className="w-5 h-5 text-indigo-500" />
              Filter Data
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 items-end">
              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-700 mb-2">
                  Pilih Kelas
                </label>
                <select
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  className="px-4 py-3 border border-indigo-300 rounded-xl w-full"
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
                  className="px-4 py-3 border border-indigo-300 rounded-xl w-full"
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
                  className="flex items-center justify-center w-full md:w-auto gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl"
                >
                  <Download className="w-5 h-5" /> Ekspor
                </button>
              </div>
            </div>
          </div>

          {/* Statistik Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
            <div className="bg-blue-100 p-6 rounded-2xl shadow-lg border border-blue-200">
              <div className="flex items-center justify-between mb-4">
                <Users className="w-8 h-8 text-blue-600" />
                <span className="text-sm font-medium text-blue-700">Total</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                Total Siswa
              </h3>
              <p className="text-3xl font-bold text-blue-600">
                {loading ? "..." : stats.totalSiswa}
              </p>
            </div>

            <div className="bg-green-100 p-6 rounded-2xl shadow-lg border border-green-200">
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

            <div className="bg-red-100 p-6 rounded-2xl shadow-lg border border-red-200">
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

            <div className="bg-indigo-100 p-6 rounded-2xl shadow-lg border border-indigo-200">
              <div className="flex items-center justify-between mb-4">
                <TrendingUp className="w-8 h-8 text-indigo-600" />
                <span className="text-sm font-medium text-indigo-700">
                  Persentase
                </span>
              </div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                Persentase
              </h3>
              <p className="text-3xl font-bold text-indigo-600">
                {loading ? "..." : stats.persentaseKehadiran}%
              </p>
            </div>
          </div>

          {/* Tabel */}
          <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-lg border border-gray-100 mb-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <CheckCircle className="w-6 h-6 text-green-600" />
              Laporan Kehadiran per Kelas
            </h3>
            <div className="w-full overflow-x-auto">
              <table className="w-full table-auto border-collapse">
                <thead>
                  <tr className="bg-indigo-50">
                    <th className="px-6 py-4 text-left font-semibold text-gray-700">
                      Kelas
                    </th>
                    <th className="px-6 py-4 text-left font-semibold text-gray-700">
                      Hadir
                    </th>
                    <th className="px-6 py-4 text-left font-semibold text-gray-700">
                      Total Siswa
                    </th>
                    <th className="px-6 py-4 text-left font-semibold text-gray-700">
                      Persentase
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
                  ) : classData.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="text-center py-4">
                        Tidak ada data.
                      </td>
                    </tr>
                  ) : (
                    classData.map((item, index) => (
                      <tr key={index} className="border-b border-gray-100">
                        <td className="px-6 py-4">{item.kelas}</td>
                        <td className="px-6 py-4">{item.hadir}</td>
                        <td className="px-6 py-4">{item.total}</td>
                        <td className="px-6 py-4">{item.persentase}%</td>
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
