"use client";
import Sidebar from "@/components/layout/SidebarAdmin";
import TopBar from "@/components/layout/TopBar";
import { useState } from "react";
import {
  Users,
  CheckCircle,
  XCircle,
  TrendingUp,
  Download,
  Filter,
} from "lucide-react";

export default function AdminDashboard() {
  // Contoh data dummy untuk demonstrasi (dalam aplikasi nyata, ambil dari API)
  const [selectedClass, setSelectedClass] = useState("Semua Kelas");
  const [selectedPeriod, setSelectedPeriod] = useState("Hari Ini");

  const stats = {
    totalSiswa: 500,
    hadirHariIni: 450,
    tidakHadir: 50,
    persentaseKehadiran: 90,
  };

  const classData = [
    { kelas: "Kelas XII PG 1", hadir: 25, total: 30 },
    { kelas: "Kelas XII RPL 1", hadir: 28, total: 30 },
    { kelas: "Kelas XII RPL 2", hadir: 22, total: 30 },
    // Tambahkan lebih banyak data sesuai kebutuhan
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
          {" "}
          {/* Header Section */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
              Admin Dashboard
            </h1>
            <p className="text-gray-600 text-lg">
              Pantau statistik kehadiran siswa secara keseluruhan dengan mudah.
            </p>
          </div>
          {/* Filter Section - Diperbaiki untuk lebih rapi dan elegant */}
          <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Filter className="w-5 h-5 text-indigo-500" />
              Filter dan Ekspor Data
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
              {/* Filter Kelas */}
              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-700 mb-2">
                  Pilih Kelas
                </label>
                <select
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  className="px-4 py-3 border border-indigo-300 rounded-xl bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 hover:shadow-md"
                >
                  <option>Semua Kelas</option>
                  <option>Kelas 1A</option>
                  <option>Kelas 1B</option>
                  <option>Kelas 2A</option>
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
                Total Siswa
              </h3>
              <p className="text-3xl font-bold text-blue-600">
                {stats.totalSiswa}
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
          {/* Tabel Laporan Cepat */}
          <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 mb-8">
            {" "}
            {/* Ditambah mb-8 untuk margin bawah yang proporsional */}
            <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <CheckCircle className="w-6 h-6 text-green-600" />
              Laporan Kehadiran per Kelas
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full table-auto border-collapse">
                <thead>
                  <tr className="bg-linear-to-r from-indigo-100 to-blue-100">
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
                  {classData.map((item, index) => (
                    <tr
                      key={index}
                      className="border-b border-gray-100 hover:bg-indigo-50 transition-colors duration-200"
                    >
                      <td className="px-6 py-4 font-medium text-gray-900">
                        {item.kelas}
                      </td>
                      <td className="px-6 py-4 text-gray-700">{item.hadir}</td>
                      <td className="px-6 py-4 text-gray-700">{item.total}</td>
                      <td className="px-6 py-4 text-gray-700 font-semibold">
                        {((item.hadir / item.total) * 100).toFixed(1)}%
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
