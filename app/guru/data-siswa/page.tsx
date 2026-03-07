"use client";

import Sidebar from "@/components/layout/SidebarGuru";
import TopBar from "@/components/layout/TopBar";
import {
  Users,
  School,
  ChevronLeft,
  ChevronRight,
  XCircle,
  SlidersHorizontal,
  Search,
  CheckCircle,
  Send,
  Loader2,
  MapPin,
  Hash,
  BookOpen,
  Building2,
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
  const [searchQuery, setSearchQuery] = useState("");
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
            nama: item.name || "—",
            nis: item.userId || "—",
            kelas: item.kelas || "—",
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
  const allSiswa: Siswa[] = filteredPKLs.flatMap((p) => siswaData[p] || []);

  const searched = searchQuery.trim()
    ? allSiswa.filter(
        (s) =>
          s.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.nis.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.kelas.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : null;

  const displayedSiswa = (pkl: string) => {
    if (searched) return [];
    const all = siswaData[pkl] || [];
    if (selectedPKL === pkl) {
      const start = (currentPage - 1) * itemsPerPage;
      return all.slice(start, start + itemsPerPage);
    }
    return all.slice(0, 10);
  };

  const totalPages = searched
    ? Math.max(1, Math.ceil(searched.length / itemsPerPage))
    : Math.ceil((siswaData[selectedPKL] || []).length / itemsPerPage);

  const searchedPage = searched
    ? searched.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage,
      )
    : [];

  const showPagination = searched
    ? searched.length > itemsPerPage
    : selectedPKL !== "Semua Tempat PKL" &&
      (siswaData[selectedPKL]?.length || 0) > itemsPerPage;

  const openModal = (s: Siswa) => {
    setSelectedSiswa(s);
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

  if (loading)
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="flex items-center gap-3 text-gray-500">
          <Loader2 className="w-6 h-6 animate-spin text-violet-600" />
          <span className="text-sm font-medium">Memuat data siswa...</span>
        </div>
      </div>
    );

  if (error)
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center mx-auto mb-3">
            <XCircle className="w-6 h-6 text-red-500" />
          </div>
          <p className="text-red-600 font-medium text-sm">{error}</p>
        </div>
      </div>
    );

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TopBar />
        <main className="flex-1 overflow-y-auto overflow-x-hidden px-4 sm:px-6 lg:px-8 py-7">
          {/* Page Header */}
          <div className="mb-7">
            <div className="flex items-center gap-2.5 mb-1">
              <span className="block w-1 h-6 bg-violet-600 rounded-full" />
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                Data Siswa PKL
              </h1>
            </div>
            <p className="text-gray-500 text-sm pl-3.5">
              Lihat dan verifikasi data siswa bimbingan Anda.
            </p>
          </div>

          {/* Stat Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
            {[
              {
                label: "Total Siswa",
                value: allSiswa.length,
                icon: <Users className="w-4 h-4 text-violet-600" />,
                bg: "bg-violet-50",
                ring: "ring-violet-200",
              },
              {
                label: "Tempat PKL",
                value: pklPlaces.length,
                icon: <Building2 className="w-4 h-4 text-emerald-600" />,
                bg: "bg-emerald-50",
                ring: "ring-emerald-200",
              },
              {
                label: "Total Kelas",
                value: new Set(allSiswa.map((s) => s.kelas)).size,
                icon: <School className="w-4 h-4 text-sky-600" />,
                bg: "bg-sky-50",
                ring: "ring-sky-200",
              },
            ].map((s) => (
              <div
                key={s.label}
                className={`bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4 flex items-center gap-4 ${s.label === "Total Kelas" ? "hidden sm:flex" : ""}`}
              >
                <div
                  className={`p-2.5 rounded-xl ${s.bg} ring-1 ${s.ring} shrink-0`}
                >
                  {s.icon}
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 mb-0.5">
                    {s.label}
                  </p>
                  <p className="text-2xl font-bold text-gray-800">{s.value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Filter Bar */}
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm px-4 py-3 mb-5 flex flex-wrap items-center gap-2.5">
            <SlidersHorizontal className="w-4 h-4 text-gray-400 shrink-0" />
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Cari nama / NIS..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-8 pr-3 py-1.5 border border-gray-200 rounded-lg bg-gray-50 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-violet-300 w-44"
              />
            </div>
            <span className="hidden sm:block w-px h-5 bg-gray-200" />
            <select
              value={selectedPKL}
              onChange={(e) => {
                setSelectedPKL(e.target.value);
                setCurrentPage(1);
                setSearchQuery("");
              }}
              className="px-3 py-1.5 border border-gray-200 rounded-lg bg-gray-50 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-violet-300"
            >
              <option>Semua Tempat PKL</option>
              {pklPlaces.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>

          {/* Tables */}
          {searched ? (
            <PKLTableCard
              title="Hasil Pencarian"
              icon={<Search className="w-4 h-4 text-violet-500" />}
              count={searched.length}
              data={searchedPage}
              startIndex={(currentPage - 1) * itemsPerPage}
              onRowClick={openModal}
              pagination={
                searched.length > itemsPerPage
                  ? {
                      currentPage,
                      totalPages,
                      total: searched.length,
                      itemsPerPage,
                      onPrev: () => setCurrentPage((p) => p - 1),
                      onNext: () => setCurrentPage((p) => p + 1),
                    }
                  : undefined
              }
            />
          ) : (
            filteredPKLs.map((pkl) => (
              <PKLTableCard
                key={pkl}
                title={pkl}
                icon={<Building2 className="w-4 h-4 text-violet-500" />}
                count={siswaData[pkl]?.length || 0}
                data={displayedSiswa(pkl)}
                startIndex={
                  selectedPKL === pkl ? (currentPage - 1) * itemsPerPage : 0
                }
                onRowClick={openModal}
                pagination={
                  showPagination && selectedPKL === pkl
                    ? {
                        currentPage,
                        totalPages,
                        total: siswaData[pkl]?.length || 0,
                        itemsPerPage,
                        onPrev: () => setCurrentPage((p) => p - 1),
                        onNext: () => setCurrentPage((p) => p + 1),
                      }
                    : undefined
                }
              />
            ))
          )}
        </main>
      </div>

      {/* Modal Detail */}
      {showModal && selectedSiswa && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div
            className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
            onClick={closeModal}
          />
          <div
            className="relative bg-white w-full sm:max-w-md sm:rounded-2xl rounded-t-3xl shadow-2xl overflow-hidden"
            style={{ animation: "slideUp .25s cubic-bezier(.32,1.25,.6,1)" }}
          >
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-violet-100 text-violet-700 font-bold text-sm flex items-center justify-center shrink-0">
                  {selectedSiswa.nama.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold text-gray-800 text-sm">
                    {selectedSiswa.nama}
                  </p>
                  <p className="text-xs text-gray-400">Detail Siswa</p>
                </div>
              </div>
              <button
                onClick={closeModal}
                className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
              >
                <XCircle className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            <div className="p-5 space-y-2.5">
              {[
                {
                  label: "Nama Lengkap",
                  value: selectedSiswa.nama,
                  icon: <Users className="w-3.5 h-3.5 text-violet-500" />,
                },
                {
                  label: "NIS",
                  value: selectedSiswa.nis,
                  icon: <Hash className="w-3.5 h-3.5 text-violet-500" />,
                },
                {
                  label: "Kelas",
                  value: selectedSiswa.kelas,
                  icon: <BookOpen className="w-3.5 h-3.5 text-violet-500" />,
                },
                {
                  label: "Tempat PKL",
                  value: selectedSiswa.tempatPKL,
                  icon: <MapPin className="w-3.5 h-3.5 text-violet-500" />,
                },
              ].map((f) => (
                <div
                  key={f.label}
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100"
                >
                  <div className="p-1.5 bg-white rounded-lg border border-gray-200 shrink-0">
                    {f.icon}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide">
                      {f.label}
                    </p>
                    <p className="text-sm font-semibold text-gray-800 truncate">
                      {f.value}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <div className="px-5 py-4 border-t border-gray-100 flex gap-3">
              <button
                onClick={handleVerifikasiPresensi}
                className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl transition-colors shadow-sm flex items-center justify-center gap-2 text-xs"
              >
                <CheckCircle className="w-4 h-4" /> Verifikasi
              </button>
              <button
                onClick={handleKirimLaporan}
                className="flex-1 py-2.5 bg-violet-600 hover:bg-violet-700 text-white font-semibold rounded-xl transition-colors shadow-sm flex items-center justify-center gap-2 text-xs"
              >
                <Send className="w-4 h-4" /> Kirim Laporan
              </button>
            </div>
          </div>
          <style>{`@keyframes slideUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}`}</style>
        </div>
      )}
    </div>
  );
}

type PKLPaginationProps = {
  currentPage: number;
  totalPages: number;
  total: number;
  itemsPerPage: number;
  onPrev: () => void;
  onNext: () => void;
};
type PKLTableCardProps = {
  title: string;
  icon: React.ReactNode;
  count: number;
  data: Siswa[];
  startIndex: number;
  onRowClick: (s: Siswa) => void;
  pagination?: PKLPaginationProps;
};
function PKLTableCard({
  title,
  icon,
  count,
  data,
  startIndex,
  onRowClick,
  pagination,
}: PKLTableCardProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden mb-5">
      <div className="px-5 py-3.5 border-b border-gray-100 flex items-center justify-between">
        <h2 className="font-semibold text-gray-700 text-sm flex items-center gap-2">
          {icon}
          {title}
        </h2>
        <span className="text-xs text-gray-500 bg-gray-100 border border-gray-200 px-2.5 py-0.5 rounded-full font-medium">
          {count} siswa
        </span>
      </div>
      {data.length === 0 ? (
        <div className="py-12 flex flex-col items-center text-gray-400 text-sm">
          <Users className="w-8 h-8 mb-2 opacity-30" />
          Tidak ada data.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[460px]">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/80">
                {["#", "Nama Siswa", "NIS", "Kelas"].map((h, i) => (
                  <th
                    key={h}
                    className={`px-5 py-2.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider ${i === 3 ? "hidden sm:table-cell" : ""}`}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data.map((siswa, idx) => (
                <tr
                  key={siswa.id}
                  onClick={() => onRowClick(siswa)}
                  className="hover:bg-violet-50/40 transition-colors cursor-pointer group"
                >
                  <td className="px-5 py-3.5 text-xs text-gray-400 font-mono w-10">
                    {startIndex + idx + 1}
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-full bg-violet-100 text-violet-600 text-xs font-bold flex items-center justify-center shrink-0">
                        {siswa.nama.slice(0, 2).toUpperCase()}
                      </div>
                      <span className="font-semibold text-gray-800 group-hover:text-violet-700 transition-colors">
                        {siswa.nama}
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-gray-500 font-mono text-xs">
                    {siswa.nis}
                  </td>
                  <td className="px-5 py-3.5 hidden sm:table-cell">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-violet-50 text-violet-700 ring-1 ring-violet-200">
                      <BookOpen className="w-3 h-3" />
                      {siswa.kelas}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {pagination && (
        <div className="px-5 py-3 border-t border-gray-100 bg-gray-50/60 flex items-center justify-between">
          <p className="text-xs text-gray-400">
            {(pagination.currentPage - 1) * pagination.itemsPerPage + 1}–
            {Math.min(
              pagination.currentPage * pagination.itemsPerPage,
              pagination.total,
            )}{" "}
            dari {pagination.total}
          </p>
          <div className="flex items-center gap-1">
            <button
              disabled={pagination.currentPage === 1}
              onClick={pagination.onPrev}
              className="flex items-center gap-1 px-3 py-1.5 border border-gray-200 bg-white rounded-lg text-xs hover:bg-gray-50 disabled:opacity-40 transition-colors"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              Prev
            </button>
            <span className="px-2.5 text-xs font-semibold text-gray-600">
              {pagination.currentPage}/{pagination.totalPages}
            </span>
            <button
              disabled={pagination.currentPage >= pagination.totalPages}
              onClick={pagination.onNext}
              className="flex items-center gap-1 px-3 py-1.5 bg-violet-600 hover:bg-violet-700 text-white rounded-lg text-xs disabled:opacity-40 transition-colors"
            >
              Next
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
