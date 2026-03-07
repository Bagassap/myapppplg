"use client";

import Sidebar from "@/components/layout/SidebarAdmin";
import TopBar from "@/components/layout/TopBar";
import {
  Users,
  School,
  ChevronLeft,
  ChevronRight,
  XCircle,
  SlidersHorizontal,
  Plus,
  Search,
  Edit,
  MapPin,
  Hash,
  BookOpen,
  Building2,
} from "lucide-react";
import { useState, useEffect } from "react";

type SiswaType = {
  id: number;
  userId: string;
  name: string;
  kelas: string;
  tempatPKL: string | null;
  guruPembimbing: string | null;
};

function Avatar({
  name,
  size = "sm",
}: {
  name: string;
  size?: "sm" | "md" | "lg";
}) {
  const colors = [
    "bg-indigo-100 text-indigo-700",
    "bg-violet-100 text-violet-700",
    "bg-sky-100 text-sky-700",
    "bg-emerald-100 text-emerald-700",
    "bg-amber-100 text-amber-700",
    "bg-rose-100 text-rose-700",
  ];
  const color = colors[name.charCodeAt(0) % colors.length];
  const sz =
    size === "lg"
      ? "w-14 h-14 text-lg"
      : size === "md"
        ? "w-10 h-10 text-sm"
        : "w-8 h-8 text-xs";
  return (
    <div
      className={`${sz} ${color} rounded-full font-bold flex items-center justify-center shrink-0 select-none`}
    >
      {name.slice(0, 2).toUpperCase()}
    </div>
  );
}

function KelasBadge({ kelas }: { kelas: string }) {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200">
      <BookOpen className="w-3 h-3" />
      {kelas}
    </span>
  );
}

type ModalSiswaFormProps = {
  title: string;
  formData: {
    username: string;
    email?: string;
    password: string;
    namaLengkap: string;
    kelas: string;
    tempatPKL: string;
  };
  setFormData: React.Dispatch<
    React.SetStateAction<{
      username: string;
      email?: string;
      password: string;
      namaLengkap: string;
      kelas: string;
      tempatPKL: string;
    }>
  >;
  onClose: () => void;
  onSubmit: () => void;
  kelasOptions: string[];
  isEdit: boolean;
};

function ModalSiswaForm({
  title,
  formData,
  setFormData,
  onClose,
  onSubmit,
  kelasOptions,
  isEdit,
}: ModalSiswaFormProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div
        className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        className="relative bg-white w-full sm:max-w-xl sm:rounded-2xl rounded-t-3xl shadow-2xl flex flex-col max-h-[92vh]"
        style={{ animation: "slideUp .25s cubic-bezier(.32,1.25,.6,1)" }}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 sticky top-0 bg-white z-10 rounded-t-3xl sm:rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-indigo-50">
              <Users className="w-4 h-4 text-indigo-600" />
            </div>
            <p className="font-semibold text-gray-800">{title}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <XCircle className="w-5 h-5 text-gray-400" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-5">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              onSubmit();
            }}
            className="space-y-4"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                  NIS (Username)
                </label>
                <input
                  type="text"
                  value={formData.username}
                  disabled={isEdit}
                  required
                  onChange={(e) =>
                    setFormData({ ...formData, username: e.target.value })
                  }
                  placeholder="NIS siswa"
                  className="w-full px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-sm text-gray-800 focus:ring-2 focus:ring-indigo-300 outline-none disabled:opacity-50"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                  Nama Lengkap
                </label>
                <input
                  type="text"
                  value={formData.namaLengkap}
                  required
                  onChange={(e) =>
                    setFormData({ ...formData, namaLengkap: e.target.value })
                  }
                  placeholder="Nama lengkap"
                  className="w-full px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-sm text-gray-800 focus:ring-2 focus:ring-indigo-300 outline-none"
                />
              </div>
              {!isEdit && (
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email || ""}
                    required
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    placeholder="email@siswa.sch.id"
                    className="w-full px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-sm text-gray-800 focus:ring-2 focus:ring-indigo-300 outline-none"
                  />
                </div>
              )}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                  {isEdit ? "Ubah Password (opsional)" : "Password Default"}
                </label>
                <input
                  type="password"
                  value={formData.password}
                  required={!isEdit}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  placeholder={
                    isEdit ? "Kosongkan jika tidak ganti" : "Password default"
                  }
                  className="w-full px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-sm text-gray-800 focus:ring-2 focus:ring-indigo-300 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                  Kelas
                </label>
                <select
                  value={formData.kelas}
                  required
                  onChange={(e) =>
                    setFormData({ ...formData, kelas: e.target.value })
                  }
                  className="w-full px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-sm text-gray-800 focus:ring-2 focus:ring-indigo-300 outline-none"
                >
                  {kelasOptions.map((k) => (
                    <option key={k} value={k}>
                      {k}
                    </option>
                  ))}
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                  Tempat PKL
                </label>
                <input
                  type="text"
                  value={formData.tempatPKL}
                  required
                  onChange={(e) =>
                    setFormData({ ...formData, tempatPKL: e.target.value })
                  }
                  placeholder="Nama tempat PKL"
                  className="w-full px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-sm text-gray-800 focus:ring-2 focus:ring-indigo-300 outline-none"
                />
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition-colors text-sm font-medium"
              >
                Batal
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-colors shadow-sm text-sm"
              >
                {isEdit ? "Simpan Perubahan" : "Tambah Siswa"}
              </button>
            </div>
          </form>
        </div>
      </div>
      <style>{`@keyframes slideUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}`}</style>
    </div>
  );
}

export default function AdminDataSiswa() {
  const [selectedClass, setSelectedClass] = useState("Semua Kelas");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedSiswa, setSelectedSiswa] = useState<null | SiswaType>(null);
  const [siswaData, setSiswaData] = useState<Record<string, SiswaType[]>>({});
  const itemsPerPage = 10;

  const [formData, setFormData] = useState<{
    username: string;
    email?: string;
    password: string;
    namaLengkap: string;
    kelas: string;
    tempatPKL: string;
  }>({
    username: "",
    email: "",
    password: "",
    namaLengkap: "",
    kelas: "XII RPL 1",
    tempatPKL: "",
  });

  const kelasOptions = ["XII PG 1", "XII RPL 1", "XII RPL 2"];

  useEffect(() => {
    async function fetchData() {
      try {
        const url =
          selectedClass === "Semua Kelas"
            ? "/api/data-siswa"
            : `/api/data-siswa?kelas=${encodeURIComponent(selectedClass)}`;
        const res = await fetch(url, { credentials: "include" });
        if (!res.ok) throw new Error("Gagal memuat data");
        const data: SiswaType[] = await res.json();
        const grouped: Record<string, SiswaType[]> = {};
        data.forEach((item) => {
          const kelas = item.kelas || "Tidak Diketahui";
          if (!grouped[kelas]) grouped[kelas] = [];
          grouped[kelas].push(item);
        });
        setSiswaData(grouped);
        setCurrentPage(1);
      } catch (error) {
        alert((error as Error).message);
      }
    }
    fetchData();
  }, [selectedClass]);

  const classes = Object.keys(siswaData);
  const filteredClasses =
    selectedClass === "Semua Kelas" ? classes : [selectedClass];
  const allSiswa: SiswaType[] = filteredClasses.flatMap(
    (k) => siswaData[k] || [],
  );

  const searched = searchQuery.trim()
    ? allSiswa.filter(
        (s) =>
          s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.userId.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (s.tempatPKL || "").toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : null;

  const displayedSiswa = (kelas: string) => {
    if (searched) return [];
    const all = siswaData[kelas] || [];
    if (selectedClass === kelas) {
      const start = (currentPage - 1) * itemsPerPage;
      return all.slice(start, start + itemsPerPage);
    }
    return all.slice(0, 10);
  };

  const totalPages = searched
    ? Math.max(1, Math.ceil(searched.length / itemsPerPage))
    : Math.ceil((siswaData[selectedClass] || []).length / itemsPerPage);

  const searchedPage = searched
    ? searched.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage,
      )
    : [];

  const showPagination = searched
    ? searched.length > itemsPerPage
    : selectedClass !== "Semua Kelas" &&
      (siswaData[selectedClass]?.length || 0) > itemsPerPage;

  const openDetailModal = (s: SiswaType) => {
    setSelectedSiswa(s);
    setShowModal(true);
  };
  const closeDetailModal = () => {
    setSelectedSiswa(null);
    setShowModal(false);
  };
  const openAddModal = () => {
    setFormData({
      username: "",
      email: "",
      password: "",
      namaLengkap: "",
      kelas: classes[0] || "XII RPL 1",
      tempatPKL: "",
    });
    setShowAddModal(true);
  };
  const openEditModal = () => {
    if (!selectedSiswa) return;
    setFormData({
      username: selectedSiswa.userId,
      email: "",
      password: "",
      namaLengkap: selectedSiswa.name,
      kelas: selectedSiswa.kelas,
      tempatPKL: selectedSiswa.tempatPKL || "",
    });
    setShowEditModal(true);
  };
  const handleAddSiswa = async () => {
    const { username, email, password, namaLengkap, kelas, tempatPKL } =
      formData;
    if (
      !username ||
      !email ||
      !password ||
      !namaLengkap ||
      !kelas ||
      !tempatPKL
    ) {
      alert("Harap isi semua field!");
      return;
    }
    try {
      const res = await fetch("/api/data-siswa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username,
          email,
          password,
          namaLengkap,
          kelas,
          tempatPKL,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Gagal menambahkan siswa");
      }
      alert("Siswa berhasil ditambahkan");
      setShowAddModal(false);
      setSelectedClass("Semua Kelas");
    } catch (error) {
      alert((error as Error).message);
    }
  };
  const handleEditSiswa = async () => {
    if (!selectedSiswa) return;
    const { username, password, namaLengkap, kelas, tempatPKL } = formData;
    if (!username || !namaLengkap || !kelas || !tempatPKL) {
      alert("Harap isi semua field yang wajib!");
      return;
    }
    try {
      const body: Record<string, string> = {
        username,
        namaLengkap,
        kelas,
        tempatPKL,
      };
      if (password) body.password = password;
      const res = await fetch(`/api/data-siswa/${selectedSiswa.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Gagal mengupdate siswa");
      }
      alert("Siswa berhasil diupdate");
      setShowEditModal(false);
      closeDetailModal();
      setSelectedClass("Semua Kelas");
    } catch (error) {
      alert((error as Error).message);
    }
  };

  const uniquePKL = new Set(allSiswa.map((s) => s.tempatPKL).filter(Boolean))
    .size;

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TopBar />
        <main className="flex-1 overflow-y-auto overflow-x-hidden px-4 sm:px-6 lg:px-8 py-7">
          {/* Page Header */}
          <div className="mb-7 flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2.5 mb-1">
                <span className="block w-1 h-6 bg-indigo-600 rounded-full" />
                <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                  Data Siswa PKL
                </h1>
              </div>
              <p className="text-gray-500 text-sm pl-3.5">
                Kelola dan pantau data siswa yang mengikuti PKL.
              </p>
            </div>
            <button
              onClick={openAddModal}
              className="shrink-0 flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold shadow-sm transition-colors"
            >
              <Plus className="w-4 h-4" /> Tambah Siswa
            </button>
          </div>

          {/* Stat Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
            {[
              {
                label: "Total Siswa",
                value: allSiswa.length,
                icon: <Users className="w-4 h-4 text-indigo-600" />,
                bg: "bg-indigo-50",
                ring: "ring-indigo-200",
              },
              {
                label: "Total Kelas",
                value: classes.length,
                icon: <School className="w-4 h-4 text-emerald-600" />,
                bg: "bg-emerald-50",
                ring: "ring-emerald-200",
              },
              {
                label: "Tempat PKL",
                value: uniquePKL,
                icon: <MapPin className="w-4 h-4 text-amber-600" />,
                bg: "bg-amber-50",
                ring: "ring-amber-200",
              },
            ].map((s) => (
              <div
                key={s.label}
                className={`bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4 flex items-center gap-4 ${s.label === "Tempat PKL" ? "hidden sm:flex" : ""}`}
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
                className="pl-8 pr-3 py-1.5 border border-gray-200 rounded-lg bg-gray-50 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-300 w-44"
              />
            </div>
            <span className="hidden sm:block w-px h-5 bg-gray-200" />
            <select
              value={selectedClass}
              onChange={(e) => {
                setSelectedClass(e.target.value);
                setCurrentPage(1);
                setSearchQuery("");
              }}
              className="px-3 py-1.5 border border-gray-200 rounded-lg bg-gray-50 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-300"
            >
              <option>Semua Kelas</option>
              {kelasOptions.map((k) => (
                <option key={k} value={k}>
                  {k}
                </option>
              ))}
            </select>
          </div>

          {/* Tables */}
          {searched ? (
            <TableCard
              title="Hasil Pencarian"
              icon={<Search className="w-4 h-4 text-indigo-500" />}
              count={searched.length}
              countLabel="siswa"
              data={searchedPage}
              startIndex={(currentPage - 1) * itemsPerPage}
              onRowClick={openDetailModal}
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
            filteredClasses.map((kelas) => (
              <TableCard
                key={kelas}
                title={kelas}
                icon={<School className="w-4 h-4 text-indigo-500" />}
                count={siswaData[kelas]?.length || 0}
                countLabel="siswa"
                data={displayedSiswa(kelas)}
                startIndex={
                  selectedClass === kelas ? (currentPage - 1) * itemsPerPage : 0
                }
                onRowClick={openDetailModal}
                pagination={
                  showPagination && selectedClass === kelas
                    ? {
                        currentPage,
                        totalPages,
                        total: siswaData[kelas]?.length || 0,
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
            onClick={closeDetailModal}
          />
          <div
            className="relative bg-white w-full sm:max-w-md sm:rounded-2xl rounded-t-3xl shadow-2xl overflow-hidden"
            style={{ animation: "slideUp .25s cubic-bezier(.32,1.25,.6,1)" }}
          >
            {/* Header */}
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar name={selectedSiswa.name} size="md" />
                <div>
                  <p className="font-semibold text-gray-800 text-sm">
                    {selectedSiswa.name}
                  </p>
                  <p className="text-xs text-gray-400">Detail Siswa</p>
                </div>
              </div>
              <button
                onClick={closeDetailModal}
                className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
              >
                <XCircle className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            {/* Body */}
            <div className="p-5 space-y-2.5">
              {[
                {
                  label: "Nama Lengkap",
                  value: selectedSiswa.name,
                  icon: <Users className="w-3.5 h-3.5 text-indigo-500" />,
                },
                {
                  label: "NIS",
                  value: selectedSiswa.userId,
                  icon: <Hash className="w-3.5 h-3.5 text-indigo-500" />,
                },
                {
                  label: "Kelas",
                  value: selectedSiswa.kelas,
                  icon: <BookOpen className="w-3.5 h-3.5 text-indigo-500" />,
                },
                {
                  label: "Tempat PKL",
                  value: selectedSiswa.tempatPKL || "—",
                  icon: <MapPin className="w-3.5 h-3.5 text-indigo-500" />,
                },
                {
                  label: "Guru Pembimbing",
                  value: selectedSiswa.guruPembimbing || "—",
                  icon: <Users className="w-3.5 h-3.5 text-indigo-500" />,
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
            {/* Footer */}
            <div className="px-5 py-4 border-t border-gray-100 flex gap-3">
              <button
                onClick={closeDetailModal}
                className="flex-1 py-2.5 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition-colors text-sm font-medium"
              >
                Tutup
              </button>
              <button
                onClick={() => {
                  closeDetailModal();
                  openEditModal();
                }}
                className="flex-1 py-2.5 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-colors shadow-sm flex items-center justify-center gap-2 text-sm"
              >
                <Edit className="w-4 h-4" /> Edit Data
              </button>
            </div>
          </div>
          <style>{`@keyframes slideUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}`}</style>
        </div>
      )}

      {showAddModal && (
        <ModalSiswaForm
          title="Tambah Siswa Baru"
          formData={formData}
          setFormData={setFormData}
          onClose={() => setShowAddModal(false)}
          onSubmit={handleAddSiswa}
          kelasOptions={kelasOptions}
          isEdit={false}
        />
      )}
      {showEditModal && (
        <ModalSiswaForm
          title="Edit Data Siswa"
          formData={formData}
          setFormData={setFormData}
          onClose={() => setShowEditModal(false)}
          onSubmit={handleEditSiswa}
          kelasOptions={classes}
          isEdit={true}
        />
      )}
    </div>
  );
}

// ── Reusable Table Card ────────────────────────────────────────────────────────
type PaginationProps = {
  currentPage: number;
  totalPages: number;
  total: number;
  itemsPerPage: number;
  onPrev: () => void;
  onNext: () => void;
};
type TableCardProps = {
  title: string;
  icon: React.ReactNode;
  count: number;
  countLabel: string;
  data: SiswaType[];
  startIndex: number;
  onRowClick: (s: SiswaType) => void;
  pagination?: PaginationProps;
};
function TableCard({
  title,
  icon,
  count,
  countLabel,
  data,
  startIndex,
  onRowClick,
  pagination,
}: TableCardProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden mb-5">
      <div className="px-5 py-3.5 border-b border-gray-100 flex items-center justify-between">
        <h2 className="font-semibold text-gray-700 text-sm flex items-center gap-2">
          {icon}
          {title}
        </h2>
        <span className="text-xs text-gray-500 bg-gray-100 border border-gray-200 px-2.5 py-0.5 rounded-full font-medium">
          {count} {countLabel}
        </span>
      </div>
      {data.length === 0 ? (
        <div className="py-12 flex flex-col items-center text-gray-400 text-sm">
          <Users className="w-8 h-8 mb-2 opacity-30" />
          Tidak ada data.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[500px]">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/80">
                {["#", "Nama Siswa", "NIS", "Kelas", "Tempat PKL"].map(
                  (h, i) => (
                    <th
                      key={h}
                      className={`px-5 py-2.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider ${i >= 3 ? "hidden sm:table-cell" : ""}`}
                    >
                      {h}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data.map((siswa, idx) => (
                <tr
                  key={siswa.id}
                  onClick={() => onRowClick(siswa)}
                  className="hover:bg-indigo-50/40 transition-colors cursor-pointer group"
                >
                  <td className="px-5 py-3.5 text-xs text-gray-400 font-mono w-10">
                    {startIndex + idx + 1}
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-600 text-xs font-bold flex items-center justify-center shrink-0">
                        {siswa.name.slice(0, 2).toUpperCase()}
                      </div>
                      <span className="font-semibold text-gray-800 group-hover:text-indigo-700 transition-colors">
                        {siswa.name}
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-gray-500 font-mono text-xs">
                    {siswa.userId}
                  </td>
                  <td className="px-5 py-3.5 hidden sm:table-cell">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200">
                      <BookOpen className="w-3 h-3" />
                      {siswa.kelas}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-gray-500 text-xs hidden sm:table-cell max-w-[160px] truncate">
                    {siswa.tempatPKL || "—"}
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
              className="flex items-center gap-1 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs disabled:opacity-40 transition-colors"
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
