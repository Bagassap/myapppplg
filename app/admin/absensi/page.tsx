"use client";

import Sidebar from "@/components/layout/SidebarAdmin";
import TopBar from "@/components/layout/TopBar";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import {
  Filter,
  Download,
  CheckSquare,
  Clock,
  X,
  Edit,
  Calendar,
  FileText,
  CheckCircle,
  XCircle,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  QrCode,
  UserCheck,
  MessageSquare,
  Camera,
  MapPin,
  Clock as ClockIcon,
} from "lucide-react";

export default function AdminAbsensi() {
  const { data: session, status } = useSession();
  const [selectedPKL, setSelectedPKL] = useState("Semua Tempat PKL");
  const [selectedPeriod, setSelectedPeriod] = useState("Hari Ini");
  const [selectedSiswa, setSelectedSiswa] = useState(""); // Default "" = Semua Siswa
  const [selectedStatus, setSelectedStatus] = useState("Semua"); // Default "Semua"
  const [showSiswaPresensi, setShowSiswaPresensi] = useState(false);
  const [presensiData, setPresensiData] = useState<any[]>([]);
  const [siswaPresensiData, setSiswaPresensiData] = useState<
    Record<string, any[]>
  >({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [editingNote, setEditingNote] = useState<number | null>(null);
  const [newNote, setNewNote] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
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
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Gagal mengambil data absensi: ${errorText}`);
        }

        const data = await response.json();
        console.log("Data absensi dari API untuk admin:", data);

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

  // Filter data berdasarkan pilihan
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

  const handleApprove = (id: number) => {
    setPresensiData(
      presensiData.map((item) =>
        item.id === id
          ? { ...item, permintaan: false, status: "Disetujui" }
          : item,
      ),
    );
  };

  const handleReject = (id: number) => {
    setPresensiData(
      presensiData.map((item) =>
        item.id === id
          ? { ...item, permintaan: false, status: "Ditolak" }
          : item,
      ),
    );
  };

  const handleEditNote = (id: number) => {
    setPresensiData(
      presensiData.map((item) =>
        item.id === id ? { ...item, catatan: newNote } : item,
      ),
    );
    setEditingNote(null);
    setNewNote("");
  };

  const handleExport = async () => {
    try {
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
      params.append("export", "csv");

      const response = await fetch(
        `/api/absensi/download?${params.toString()}`,
      );
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

  const handleGenerateReport = () => alert("Laporan presensi dihasilkan!");

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

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <TopBar />
          <main className="flex-1 p-8 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Memuat data absensi...</p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <TopBar />
          <main className="flex-1 p-8 flex items-center justify-center">
            <div className="text-center">
              <XCircle className="w-12 h-12 text-red-500 mx-auto" />
              <p className="mt-4 text-red-600">{error}</p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  // Fungsi untuk render kolom HEADER berdasarkan status
  const renderTableHeaders = () => {
    if (selectedStatus === "Hadir") {
      return (
        <>
          <th className="px-8 py-5 text-left font-semibold text-gray-700 rounded-tl-2xl text-lg">
            Nama
          </th>
          <th className="px-8 py-5 text-left font-semibold text-gray-700 text-lg">
            Tempat PKL
          </th>
          <th className="px-8 py-5 text-left font-semibold text-gray-700 text-lg">
            Status Kehadiran
          </th>
          <th className="px-8 py-5 text-left font-semibold text-gray-700 text-lg">
            Foto
          </th>
          <th className="px-8 py-5 text-left font-semibold text-gray-700 text-lg">
            Lokasi
          </th>
          <th className="px-8 py-5 text-left font-semibold text-gray-700 text-lg">
            Waktu
          </th>
          <th className="px-8 py-5 text-left font-semibold text-gray-700 rounded-tr-2xl text-lg">
            Tanda Tangan
          </th>
        </>
      );
    } else if (selectedStatus === "Pulang") {
      return (
        <>
          <th className="px-8 py-5 text-left font-semibold text-gray-700 rounded-tl-2xl text-lg">
            Nama
          </th>
          <th className="px-8 py-5 text-left font-semibold text-gray-700 text-lg">
            Tempat PKL
          </th>
          <th className="px-8 py-5 text-left font-semibold text-gray-700 text-lg">
            Status Kehadiran
          </th>
          <th className="px-8 py-5 text-left font-semibold text-gray-700 text-lg">
            Catatan (Kegiatan)
          </th>
          <th className="px-8 py-5 text-left font-semibold text-gray-700 text-lg">
            Foto
          </th>
          <th className="px-8 py-5 text-left font-semibold text-gray-700 text-lg">
            Lokasi
          </th>
          <th className="px-8 py-5 text-left font-semibold text-gray-700 text-lg">
            Waktu
          </th>
          <th className="px-8 py-5 text-left font-semibold text-gray-700 rounded-tr-2xl text-lg">
            Tanda Tangan
          </th>
        </>
      );
    } else if (selectedStatus === "Izin") {
      return (
        <>
          <th className="px-8 py-5 text-left font-semibold text-gray-700 rounded-tl-2xl text-lg">
            Nama
          </th>
          <th className="px-8 py-5 text-left font-semibold text-gray-700 text-lg">
            Tempat PKL
          </th>
          <th className="px-8 py-5 text-left font-semibold text-gray-700 text-lg">
            Status Kehadiran
          </th>
          <th className="px-8 py-5 text-left font-semibold text-gray-700 text-lg">
            Catatan (Alasan Izin)
          </th>
          <th className="px-8 py-5 text-left font-semibold text-gray-700 text-lg">
            Foto
          </th>
          <th className="px-8 py-5 text-left font-semibold text-gray-700 text-lg">
            Waktu
          </th>
          <th className="px-8 py-5 text-left font-semibold text-gray-700 rounded-tr-2xl text-lg">
            Tanda Tangan
          </th>
        </>
      );
    } else if (selectedStatus === "Libur") {
      return (
        <>
          <th className="px-8 py-5 text-left font-semibold text-gray-700 rounded-tl-2xl text-lg">
            Nama
          </th>
          <th className="px-8 py-5 text-left font-semibold text-gray-700 text-lg">
            Tempat PKL
          </th>
          <th className="px-8 py-5 text-left font-semibold text-gray-700 text-lg">
            Status Kehadiran
          </th>
          <th className="px-8 py-5 text-left font-semibold text-gray-700 text-lg">
            Catatan (Alasan Libur)
          </th>
          <th className="px-8 py-5 text-left font-semibold text-gray-700 rounded-tr-2xl text-lg">
            Tanda Tangan
          </th>
        </>
      );
    } else {
      // Default untuk Semua
      return (
        <>
          <th className="px-8 py-5 text-left font-semibold text-gray-700 rounded-tl-2xl text-lg">
            Siswa
          </th>
          <th className="px-8 py-5 text-left font-semibold text-gray-700 text-lg">
            Tempat PKL
          </th>
          <th className="px-8 py-5 text-left font-semibold text-gray-700 text-lg">
            Status
          </th>
          <th className="px-8 py-5 text-left font-semibold text-gray-700 text-lg">
            Waktu
          </th>
          <th className="px-8 py-5 text-left font-semibold text-gray-700 text-lg">
            Catatan
          </th>
          <th className="px-8 py-5 text-left font-semibold text-gray-700 rounded-tr-2xl text-lg">
            Aksi
          </th>
        </>
      );
    }
  };

  // Fungsi untuk render BARIS berdasarkan status
  const renderTableRow = (item: any) => {
    if (selectedStatus === "Hadir") {
      return (
        <tr
          key={item.id}
          className="border-b border-gray-100 hover:bg-indigo-50 transition-colors duration-200"
        >
          <td className="px-8 py-5 font-medium text-gray-900 text-lg">
            {item.siswa}
          </td>
          <td className="px-8 py-5 text-gray-700 text-lg">{item.tempatPKL}</td>
          <td className="px-8 py-5 text-gray-700 flex items-center gap-3 text-lg">
            <CheckSquare className="w-5 h-5 text-green-600" />
            {item.status}
          </td>
          <td className="px-8 py-5 text-gray-700 text-lg">
            {item.foto ? (
              <img src={item.foto} alt="Foto" className="w-16 h-16 rounded" />
            ) : (
              "-"
            )}
          </td>
          <td className="px-8 py-5 text-gray-700 text-lg">
            {item.lokasi ? (
              <a
                href={`https://www.google.com/maps?q=${encodeURIComponent(item.lokasi)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 underline"
              >
                {item.lokasi}
              </a>
            ) : (
              "-"
            )}
          </td>
          <td className="px-8 py-5 text-gray-700 text-lg">{item.waktu}</td>
          <td className="px-8 py-5 text-gray-700 text-lg">
            {item.tandaTangan ? (
              <img
                src={item.tandaTangan}
                alt="Tanda Tangan"
                className="w-32 h-8"
              />
            ) : (
              "-"
            )}
          </td>
        </tr>
      );
    } else if (selectedStatus === "Pulang") {
      return (
        <tr
          key={item.id}
          className="border-b border-gray-100 hover:bg-indigo-50 transition-colors duration-200"
        >
          <td className="px-8 py-5 font-medium text-gray-900 text-lg">
            {item.siswa}
          </td>
          <td className="px-8 py-5 text-gray-700 text-lg">{item.tempatPKL}</td>
          <td className="px-8 py-5 text-gray-700 flex items-center gap-3 text-lg">
            <Clock className="w-5 h-5 text-blue-500" />
            {item.status}
          </td>
          <td className="px-8 py-5 text-gray-700 text-lg">
            {item.catatan || "-"}
          </td>
          <td className="px-8 py-5 text-gray-700 text-lg">
            {item.foto ? (
              <img src={item.foto} alt="Foto" className="w-16 h-16 rounded" />
            ) : (
              "-"
            )}
          </td>
          <td className="px-8 py-5 text-gray-700 text-lg">
            {item.lokasi ? (
              <a
                href={`https://www.google.com/maps?q=${encodeURIComponent(item.lokasi)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 underline"
              >
                {item.lokasi}
              </a>
            ) : (
              "-"
            )}
          </td>
          <td className="px-8 py-5 text-gray-700 text-lg">{item.waktu}</td>
          <td className="px-8 py-5 text-gray-700 text-lg">
            {item.tandaTangan ? (
              <img
                src={item.tandaTangan}
                alt="Tanda Tangan"
                className="w-32 h-8"
              />
            ) : (
              "-"
            )}
          </td>
        </tr>
      );
    } else if (selectedStatus === "Izin") {
      return (
        <tr
          key={item.id}
          className="border-b border-gray-100 hover:bg-indigo-50 transition-colors duration-200"
        >
          <td className="px-8 py-5 font-medium text-gray-900 text-lg">
            {item.siswa}
          </td>
          <td className="px-8 py-5 text-gray-700 text-lg">{item.tempatPKL}</td>
          <td className="px-8 py-5 text-gray-700 flex items-center gap-3 text-lg">
            <AlertCircle className="w-5 h-5 text-red-500" />
            {item.status}
          </td>
          <td className="px-8 py-5 text-gray-700 text-lg">
            {item.catatan || "-"}
          </td>
          <td className="px-8 py-5 text-gray-700 text-lg">
            {item.foto ? (
              <img src={item.foto} alt="Foto" className="w-16 h-16 rounded" />
            ) : (
              "-"
            )}
          </td>
          <td className="px-8 py-5 text-gray-700 text-lg">{item.waktu}</td>
          <td className="px-8 py-5 text-gray-700 text-lg">
            {item.tandaTangan ? (
              <img
                src={item.tandaTangan}
                alt="Tanda Tangan"
                className="w-32 h-8"
              />
            ) : (
              "-"
            )}
          </td>
        </tr>
      );
    } else if (selectedStatus === "Libur") {
      return (
        <tr
          key={item.id}
          className="border-b border-gray-100 hover:bg-indigo-50 transition-colors duration-200"
        >
          <td className="px-8 py-5 font-medium text-gray-900 text-lg">
            {item.siswa}
          </td>
          <td className="px-8 py-5 text-gray-700 text-lg">{item.tempatPKL}</td>
          <td className="px-8 py-5 text-gray-700 flex items-center gap-3 text-lg">
            <Calendar className="w-5 h-5 text-purple-500" />
            {item.status}
          </td>
          <td className="px-8 py-5 text-gray-700 text-lg">
            {item.catatan || "-"}
          </td>
          <td className="px-8 py-5 text-gray-700 text-lg">
            {item.tandaTangan ? (
              <img
                src={item.tandaTangan}
                alt="Tanda Tangan"
                className="w-32 h-8"
              />
            ) : (
              "-"
            )}
          </td>
        </tr>
      );
    } else {
      // PERBAIKAN: Default View (Status = Semua)
      // Ini menampilkan semua data siswa secara default di tabel utama
      return (
        <tr
          key={item.id}
          className="border-b border-gray-100 hover:bg-indigo-50 transition-colors duration-200"
        >
          <td className="px-8 py-5 font-medium text-gray-900 text-lg">
            {item.siswa}
          </td>
          <td className="px-8 py-5 text-gray-700 text-lg">{item.tempatPKL}</td>
          <td className="px-8 py-5 text-gray-700 flex items-center gap-3 text-lg">
            {item.status === "Hadir" && (
              <CheckSquare className="w-5 h-5 text-green-600" />
            )}
            {item.status === "Pulang" && (
              <Clock className="w-5 h-5 text-blue-500" />
            )}
            {item.status === "Terlambat" && (
              <Clock className="w-5 h-5 text-yellow-500" />
            )}
            {(item.status === "Izin" || item.status === "Sakit") && (
              <AlertCircle className="w-5 h-5 text-red-500" />
            )}
            {item.status === "Libur" && (
              <Calendar className="w-5 h-5 text-purple-500" />
            )}
            {item.status}
          </td>
          <td className="px-8 py-5 text-gray-700 text-lg">{item.waktu}</td>
          <td className="px-8 py-5 text-gray-700 text-lg">
            {item.catatan || "-"}
          </td>
          <td className="px-8 py-5 text-gray-700 flex gap-3 flex-wrap">
            {item.permintaan && (
              <>
                <button
                  onClick={() => handleApprove(item.id)}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors duration-200 text-sm"
                >
                  Setujui
                </button>
                <button
                  onClick={() => handleReject(item.id)}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors duration-200 text-sm"
                >
                  Tolak
                </button>
              </>
            )}
            <button
              onClick={() => setEditingNote(item.id)}
              className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors duration-200 flex items-center gap-2 text-sm"
            >
              <Edit className="w-4 h-4" />
              Edit
            </button>
            {editingNote === item.id && (
              <div className="absolute bg-white p-4 rounded-lg shadow-lg border mt-2 z-10">
                <input
                  type="text"
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="Masukkan catatan baru"
                  className="px-3 py-2 border rounded-md w-full"
                />
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={() => handleEditNote(item.id)}
                    className="px-3 py-1 bg-blue-500 text-white rounded"
                  >
                    Simpan
                  </button>
                  <button
                    onClick={() => setEditingNote(null)}
                    className="px-3 py-1 bg-gray-500 text-white rounded"
                  >
                    Batal
                  </button>
                </div>
              </div>
            )}
            <button
              onClick={() => handleViewSiswaPresensi(item.siswa)}
              className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors duration-200 flex items-center gap-2 text-sm"
            >
              <UserCheck className="w-4 h-4" />
              Lihat Presensi
            </button>
          </td>
        </tr>
      );
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <TopBar />
        <main className="flex-1 p-18 overflow-auto">
          {/* Header Section */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2 flex items-center gap-3">
              <Calendar className="w-12 h-12 text-indigo-600 animate-pulse" />
              Absensi
            </h1>
            <p className="text-gray-600 text-lg">
              Lihat dan kelola data absensi
            </p>
          </div>

          {/* Filter Section */}
          <div className="bg-white p-8 rounded-3xl shadow-2xl border border-gray-200 mb-10 hover:shadow-3xl transition-shadow duration-300">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <Filter className="w-7 h-7 text-indigo-600" />
              Filter dan Ekspor Data
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-8 items-end">
              {/* Filter Tempat PKL */}
              <div className="flex flex-col">
                <label className="text-lg font-semibold text-gray-700 mb-3">
                  Pilih Tempat PKL
                </label>
                <select
                  value={selectedPKL}
                  onChange={(e) => setSelectedPKL(e.target.value)}
                  className="px-5 py-4 border border-indigo-300 rounded-xl bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 hover:shadow-md text-lg"
                >
                  <option>Semua Tempat PKL</option>
                  {[...new Set(presensiData.map((item) => item.tempatPKL))].map(
                    (pkl) => (
                      <option key={pkl} value={pkl}>
                        {pkl}
                      </option>
                    ),
                  )}
                </select>
              </div>
              {/* Filter Periode */}
              <div className="flex flex-col">
                <label className="text-lg font-semibold text-gray-700 mb-3">
                  Pilih Periode
                </label>
                <select
                  value={selectedPeriod}
                  onChange={(e) => setSelectedPeriod(e.target.value)}
                  className="px-5 py-4 border border-indigo-300 rounded-xl bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 hover:shadow-md text-lg"
                >
                  <option>Hari Ini</option>
                  <option>Bulan Ini</option>
                  <option>Tahun Ini</option>
                </select>
              </div>
              {/* Filter Siswa */}
              <div className="flex flex-col">
                <label className="text-lg font-semibold text-gray-700 mb-3">
                  Pilih Siswa
                </label>
                <select
                  value={selectedSiswa}
                  onChange={(e) => setSelectedSiswa(e.target.value)}
                  className="px-5 py-4 border border-indigo-300 rounded-xl bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 hover:shadow-md text-lg"
                >
                  <option value="">Semua Siswa</option>
                  {[...new Set(presensiData.map((item) => item.siswa))].map(
                    (siswa) => (
                      <option key={siswa} value={siswa}>
                        {siswa}
                      </option>
                    ),
                  )}
                </select>
              </div>
              {/* Filter Status */}
              <div className="flex flex-col">
                <label className="text-lg font-semibold text-gray-700 mb-3">
                  Pilih Status
                </label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="px-5 py-4 border border-indigo-300 rounded-xl bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 hover:shadow-md text-lg"
                >
                  <option>Semua</option>
                  <option>Hadir</option>
                  <option>Pulang</option>
                  <option>Izin</option>
                  <option>Libur</option>
                </select>
              </div>
              {/* Tombol Ekspor */}
              <div className="flex justify-start md:justify-end">
                <button
                  onClick={handleExport}
                  className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-xl shadow-lg hover:shadow-xl hover:from-indigo-700 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 text-lg"
                >
                  <Download className="w-6 h-6" />
                  Ekspor Data
                </button>
              </div>
            </div>
          </div>

          {/* Metode Pencatatan Absensi */}
          <div className="bg-white p-8 rounded-3xl shadow-2xl mb-10 border border-gray-200 hover:shadow-3xl transition-shadow duration-300">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <UserCheck className="w-7 h-7 text-indigo-600" />
              Metode Pencatatan Absensi
            </h3>
            <div className="flex gap-6">
              <button
                onClick={handleScanQR}
                className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl shadow-lg hover:shadow-xl hover:from-green-700 hover:to-green-800 transition-all duration-300 transform hover:scale-105 text-lg"
              >
                <QrCode className="w-6 h-6" />
                Scan QR Code
              </button>
              <button
                onClick={handleManualInput}
                className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl shadow-lg hover:shadow-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 transform hover:scale-105 text-lg"
              >
                <UserCheck className="w-6 h-6" />
                Input Manual
              </button>
            </div>
          </div>

          {/* Tabel Daftar Presensi */}
          <div className="bg-white p-8 rounded-3xl shadow-2xl mb-10 border border-gray-200 hover:shadow-3xl transition-shadow duration-300">
            <h3 className="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-3">
              <CheckSquare className="w-7 h-7 text-green-600" />
              Daftar Presensi Siswa PKL
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full table-auto border-collapse">
                <thead>
                  <tr className="bg-gradient-to-r from-indigo-100 to-blue-100">
                    {renderTableHeaders()}
                  </tr>
                </thead>
                <tbody>{currentData.map((item) => renderTableRow(item))}</tbody>
              </table>
              {currentData.length === 0 && (
                <div className="p-4 text-center text-gray-500">
                  Tidak ada data untuk periode ini.
                </div>
              )}
            </div>
            {/* Pagination */}
            <div className="flex justify-between items-center mt-6">
              <p className="text-lg text-gray-600">
                Menampilkan {startIndex + 1}-
                {Math.min(endIndex, filteredData.length)} dari{" "}
                {filteredData.length} siswa
              </p>
              <div className="flex gap-3">
                <button
                  onClick={handlePrevious}
                  disabled={currentPage === 1}
                  className="px-6 py-3 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2 text-lg"
                >
                  <ChevronLeft className="w-5 h-5" />
                  Sebelumnya
                </button>
                <span className="px-6 py-3 text-gray-700 text-lg">
                  Halaman {currentPage} dari {totalPages}
                </span>
                <button
                  onClick={handleNext}
                  disabled={currentPage === totalPages}
                  className="px-6 py-3 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2 text-lg"
                >
                  Selanjutnya
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Modal Presensi Siswa */}
          {showSiswaPresensi && selectedSiswa && (
            <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
              <div
                className="bg-white rounded-3xl shadow-2xl max-w-6xl w-full mx-4 p-10 pointer-events-auto animate-fade-scale transform-gpu transition duration-300 ease-out"
                role="dialog"
                aria-modal="true"
                aria-labelledby="siswa-presensi-title"
              >
                <div className="flex justify-between items-center mb-10">
                  <h3
                    id="siswa-presensi-title"
                    className="text-3xl font-bold text-gray-900 flex items-center gap-4"
                  >
                    <CheckSquare className="w-10 h-10 text-green-600 animate-pulse" />
                    Riwayat Presensi {selectedSiswa}
                  </h3>
                  <button
                    onClick={() => setShowSiswaPresensi(false)}
                    className="text-gray-500 hover:text-gray-700 transition-colors"
                    aria-label="Close modal"
                  >
                    <XCircle className="w-8 h-8" />
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full table-auto border-collapse">
                    <thead>
                      <tr className="bg-gradient-to-r from-indigo-100 to-blue-100">
                        {renderTableHeaders()}
                      </tr>
                    </thead>
                    <tbody>
                      {(siswaPresensiData[selectedSiswa] || []).map((item) => (
                        <tr
                          key={item.id}
                          className="border-b border-gray-100 hover:bg-indigo-50 transition-colors duration-200"
                        >
                          <td className="px-8 py-5 font-medium text-gray-900 text-lg">
                            {item.siswa}
                          </td>
                          <td className="px-8 py-5 text-gray-700 text-lg">
                            {item.tempatPKL}
                          </td>
                          <td className="px-8 py-5 text-gray-700 flex items-center gap-3 text-lg">
                            {item.status === "Hadir" && (
                              <CheckSquare className="w-5 h-5 text-green-600" />
                            )}
                            {item.status === "Pulang" && (
                              <Clock className="w-5 h-5 text-blue-500" />
                            )}
                            {item.status === "Terlambat" && (
                              <Clock className="w-5 h-5 text-yellow-500" />
                            )}
                            {(item.status === "Izin" ||
                              item.status === "Sakit") && (
                              <AlertCircle className="w-5 h-5 text-red-500" />
                            )}
                            {item.status === "Libur" && (
                              <Calendar className="w-5 h-5 text-purple-500" />
                            )}
                            {item.status}
                          </td>
                          <td className="px-8 py-5 text-gray-700 text-lg">
                            {item.waktu}
                          </td>
                          <td className="px-8 py-5 text-gray-700 text-lg">
                            {item.catatan || "-"}
                          </td>
                          <td className="px-8 py-5 text-gray-700 text-lg">
                            {item.tandaTangan ? (
                              <img
                                src={item.tandaTangan}
                                alt="Tanda Tangan"
                                className="w-32 h-8"
                              />
                            ) : (
                              "-"
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
