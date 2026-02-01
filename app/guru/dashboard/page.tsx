"use client";
import Sidebar from "@/components/layout/SidebarGuru"; // Menggunakan SidebarGuru untuk dashboard guru
import TopBar from "@/components/layout/TopBar";
import { useState } from "react";
import {
  Users,
  CheckCircle,
  XCircle,
  TrendingUp,
  Download,
  Filter,
  Bell,
} from "lucide-react";

export default function GuruDashboard() {
  // Contoh data dummy untuk demonstrasi (dalam aplikasi nyata, ambil dari API)
  const [selectedPKL, setSelectedPKL] = useState("Semua Tempat PKL");
  const [selectedPeriod, setSelectedPeriod] = useState("Hari Ini");

  const stats = {
    totalSiswaPKL: 50, // Total siswa yang dibimbing di PKL
    hadirHariIni: 45,
    tidakHadir: 5,
    persentaseKehadiran: 90,
  };

  const pklData = [
    { tempatPKL: "PT. ABC Industri", siswa: "Ahmad", hadir: 25, totalHari: 30 },
    { tempatPKL: "CV. XYZ Teknologi", siswa: "Budi", hadir: 28, totalHari: 30 },
    { tempatPKL: "PT. DEF Jasa", siswa: "Citra", hadir: 22, totalHari: 30 },
    // Tambahkan lebih banyak data sesuai kebutuhan
  ];

  const notifications = [
    {
      siswa: "Ahmad",
      pesan: "Sering absen dalam 3 hari terakhir",
      tingkat: "Tinggi",
    },
    { siswa: "Budi", pesan: "Absen kemarin tanpa alasan", tingkat: "Sedang" },
    // Tambahkan notifikasi lainnya
  ];

  const handleExport = () => {
    // Logika ekspor data (misalnya, generate CSV atau PDF)
    alert("Data diekspor ke file CSV!");
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <TopBar />
        <main className="flex-1 p-18 overflow-auto">
          {/* Header Section */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
              Guru Dashboard
            </h1>
            <p className="text-gray-600 text-lg">
              Pantau ringkasan kehadiran siswa di tempat PKL yang Anda bimbing.
            </p>
          </div>

          {/* Filter Section */}
          <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Filter className="w-5 h-5 text-indigo-500" />
              Filter dan Ekspor Data
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
              {/* Filter Tempat PKL */}
              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-700 mb-2">
                  Pilih Tempat PKL
                </label>
                <select
                  value={selectedPKL}
                  onChange={(e) => setSelectedPKL(e.target.value)}
                  className="px-4 py-3 border border-indigo-300 rounded-xl bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 hover:shadow-md"
                >
                  <option>Semua Tempat PKL</option>
                  <option>PT. ABC Industri</option>
                  <option>CV. XYZ Teknologi</option>
                  <option>PT. DEF Jasa</option>
                </select>
              </div>
              {/* Filter Periode */}
              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-700 mb-2">
                  Pilih Periode
                </label>
                <select
                  value={selectedPeriod}
                  onChange={(e) => setSelectedPeriod(e.target.value)}
                  className="px-4 py-3 border border-indigo-300 rounded-xl bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 hover:shadow-md"
                >
                  <option>Hari Ini</option>
                  <option>Bulan Ini</option>
                  <option>Tahun Ini</option>
                </select>
              </div>
              {/* Tombol Ekspor */}
              <div className="flex justify-start md:justify-end">
                <button
                  onClick={handleExport}
                  className="flex items-center gap-2 px-6 py-3 bg-linear-to-r from-indigo-600 to-blue-600 text-white rounded-xl shadow-lg hover:shadow-xl hover:from-indigo-700 hover:to-blue-700 transition-all duration-200 transform hover:scale-105"
                >
                  <Download className="w-5 h-5" />
                  Ekspor Data
                </button>
              </div>
            </div>
          </div>

          {/* Statistik Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-linear-to-br from-blue-100 to-blue-200 p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 border border-blue-200">
              <div className="flex items-center justify-between mb-4">
                <Users className="w-8 h-8 text-blue-600" />
                <span className="text-sm font-medium text-blue-700">Total</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                Total Siswa PKL
              </h3>
              <p className="text-3xl font-bold text-blue-600">
                {stats.totalSiswaPKL}
              </p>
            </div>
            <div className="bg-linear-to-br from-green-100 to-green-200 p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 border border-green-200">
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
            <div className="bg-linear-to-br from-red-100 to-red-200 p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 border border-red-200">
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
            <div className="bg-linear-to-br from-indigo-100 to-blue-200 p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 border border-indigo-200">
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

          {/* Notifikasi Siswa yang Sering Absen */}
          <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 mb-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <Bell className="w-6 h-6 text-orange-600" />
              Notifikasi Siswa Sering Absen
            </h3>
            <div className="space-y-4">
              {notifications.map((notif, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-xl border-l-4 ${
                    notif.tingkat === "Tinggi"
                      ? "border-red-500 bg-red-50"
                      : "border-yellow-500 bg-yellow-50"
                  }`}
                >
                  <p className="font-semibold text-gray-900">{notif.siswa}</p>
                  <p className="text-gray-700">{notif.pesan}</p>
                  <span
                    className={`text-sm font-medium ${
                      notif.tingkat === "Tinggi"
                        ? "text-red-600"
                        : "text-yellow-600"
                    }`}
                  >
                    Tingkat: {notif.tingkat}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Tabel Laporan Kehadiran per Siswa PKL */}
          <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 mb-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <CheckCircle className="w-6 h-6 text-green-600" />
              Laporan Kehadiran per Siswa PKL
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full table-auto border-collapse">
                <thead>
                  <tr className="bg-linear-to-r from-indigo-100 to-blue-100">
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
                  {pklData.map((item, index) => (
                    <tr
                      key={index}
                      className="border-b border-gray-100 hover:bg-indigo-50 transition-colors duration-200"
                    >
                      <td className="px-6 py-4 font-medium text-gray-900">
                        {item.tempatPKL}
                      </td>
                      <td className="px-6 py-4 text-gray-700">{item.siswa}</td>
                      <td className="px-6 py-4 text-gray-700">{item.hadir}</td>
                      <td className="px-6 py-4 text-gray-700">
                        {item.totalHari}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
