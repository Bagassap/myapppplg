"use client";

import Sidebar from "@/components/layout/SidebarAdmin";
import TopBar from "@/components/layout/TopBar";
import {
  Users,
  School,
  ChevronLeft,
  ChevronRight,
  XCircle,
  Filter,
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

export default function AdminDataSiswa() {
  const [selectedClass, setSelectedClass] = useState("Semua Kelas");
  const [currentPage, setCurrentPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedSiswa, setSelectedSiswa] = useState<null | SiswaType>(null);

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

  const itemsPerPage = 10;

  const [siswaData, setSiswaData] = useState<Record<string, SiswaType[]>>({});

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

  const totalPages = Math.ceil(
    (siswaData[selectedClass] || []).length / itemsPerPage,
  );

  const classes = Object.keys(siswaData);
  const filteredClasses: string[] =
    selectedClass === "Semua Kelas" ? classes : [selectedClass];

  const openDetailModal = (siswa: SiswaType) => {
    setSelectedSiswa(siswa);
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

  const closeAddModal = () => {
    setShowAddModal(false);
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

  const closeEditModal = () => {
    setShowEditModal(false);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
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
      closeAddModal();
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
      const body: any = { username, namaLengkap, kelas, tempatPKL };
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
      closeEditModal();
      closeDetailModal();
      setSelectedClass("Semua Kelas");
    } catch (error) {
      alert((error as Error).message);
    }
  };

  const displayedSiswa = (kelas: string) => {
    const all = siswaData[kelas] || [];
    if (selectedClass === kelas) {
      const start = (currentPage - 1) * itemsPerPage;
      return all.slice(start, start + itemsPerPage);
    }
    return all;
  };

  const kelasOptions = ["XII PG 1", "XII RPL 1", "XII RPL 2"];

  const showPagination =
    selectedClass !== "Semua Kelas" &&
    siswaData[selectedClass]?.length > itemsPerPage;

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto overflow-x-hidden w-full">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2 flex items-center gap-3">
              <Users className="w-8 h-8 sm:w-10 sm:h-10 text-indigo-600 animate-pulse" />
              Data Siswa PKL
            </h1>
            <p className="text-gray-600 text-sm sm:text-base md:text-lg">
              Kelola dan pantau data siswa yang mengikuti Program Kerja Lapangan
              (PKL).
            </p>
          </div>

          {/* Filter & Tambah - TIDAK DIUBAH */}
          <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-lg border border-gray-100 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Filter className="w-5 h-5 text-indigo-500" />
              Filter Kelas
            </h3>
            <div className="flex flex-col md:flex-row gap-4 sm:gap-6 items-end justify-between">
              <div className="flex flex-col w-full md:w-auto">
                <label className="text-sm font-medium text-gray-700 mb-2">
                  Pilih Kelas
                </label>
                <select
                  value={selectedClass}
                  onChange={(e) => {
                    setSelectedClass(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="px-4 py-3 border border-indigo-300 rounded-xl bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 hover:shadow-md w-full"
                >
                  <option>Semua Kelas</option>
                  {kelasOptions.map((k) => (
                    <option key={k} value={k}>
                      {k}
                    </option>
                  ))}
                </select>
              </div>
              <button
                onClick={openAddModal}
                className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-linear-to-r from-indigo-600 to-blue-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
              >
                <Users className="w-5 h-5" />
                Tambah Siswa
              </button>
            </div>
          </div>

          {/* Tables per kelas */}
          {filteredClasses.map((kelas) => (
            <div
              key={kelas}
              className="bg-white p-4 sm:p-6 rounded-2xl shadow-lg mb-8 border border-gray-100"
            >
              <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                <School className="w-6 h-6 text-indigo-600" />
                {kelas}
              </h3>

              {/* MODIFIKASI DIMULAI DARI SINI: Table Wrapper & Responsive Classes */}
              <div className="w-full overflow-x-auto">
                <table className="w-full table-auto border-collapse min-w-[800px]">
                  <thead>
                    <tr className="bg-linear-to-r from-indigo-100 to-blue-100">
                      <th className="px-3 py-2 sm:px-4 sm:py-3 lg:px-6 lg:py-4 text-xs sm:text-sm lg:text-base text-left font-semibold text-gray-700 rounded-tl-xl whitespace-nowrap">
                        Nomor
                      </th>
                      <th className="px-3 py-2 sm:px-4 sm:py-3 lg:px-6 lg:py-4 text-xs sm:text-sm lg:text-base text-left font-semibold text-gray-700 whitespace-nowrap">
                        Nama Siswa
                      </th>
                      <th className="px-3 py-2 sm:px-4 sm:py-3 lg:px-6 lg:py-4 text-xs sm:text-sm lg:text-base text-left font-semibold text-gray-700 whitespace-nowrap">
                        NIS
                      </th>
                      <th className="px-3 py-2 sm:px-4 sm:py-3 lg:px-6 lg:py-4 text-xs sm:text-sm lg:text-base text-left font-semibold text-gray-700 whitespace-nowrap">
                        Kelas
                      </th>
                      <th className="px-3 py-2 sm:px-4 sm:py-3 lg:px-6 lg:py-4 text-xs sm:text-sm lg:text-base text-left font-semibold text-gray-700 rounded-tr-xl whitespace-nowrap">
                        Tempat PKL
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {displayedSiswa(kelas).map((siswa, idx) => (
                      <tr
                        key={siswa.id}
                        className="border-b border-gray-100 cursor-pointer hover:bg-indigo-50 transition"
                        onClick={() => openDetailModal(siswa)}
                      >
                        <td className="px-3 py-2 sm:px-4 sm:py-3 lg:px-6 lg:py-4 text-xs sm:text-sm lg:text-base font-medium text-gray-900">
                          {(currentPage - 1) * itemsPerPage + idx + 1}
                        </td>
                        <td className="px-3 py-2 sm:px-4 sm:py-3 lg:px-6 lg:py-4 text-xs sm:text-sm lg:text-base text-gray-700">
                          {siswa.name}
                        </td>
                        <td className="px-3 py-2 sm:px-4 sm:py-3 lg:px-6 lg:py-4 text-xs sm:text-sm lg:text-base text-gray-700">
                          {siswa.userId}
                        </td>
                        <td className="px-3 py-2 sm:px-4 sm:py-3 lg:px-6 lg:py-4 text-xs sm:text-sm lg:text-base text-gray-700">
                          {kelas}
                        </td>
                        <td className="px-3 py-2 sm:px-4 sm:py-3 lg:px-6 lg:py-4 text-xs sm:text-sm lg:text-base text-gray-700">
                          {siswa.tempatPKL || "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {/* MODIFIKASI BERAKHIR */}

              <p className="text-sm text-gray-600 mt-4">
                Menampilkan {displayedSiswa(kelas).length} dari{" "}
                {siswaData[kelas]?.length || 0} siswa di {kelas}
              </p>
            </div>
          ))}

          {/* Pagination */}
          {showPagination && (
            <div className="flex justify-center items-center mt-8">
              <div className="flex gap-2">
                <button
                  onClick={() =>
                    currentPage > 1 && setCurrentPage(currentPage - 1)
                  }
                  disabled={currentPage === 1}
                  className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-1"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Sebelumnya
                </button>
                <span className="px-4 py-2 text-gray-700">
                  Halaman {currentPage} dari {totalPages}
                </span>
                <button
                  onClick={() =>
                    currentPage < totalPages && setCurrentPage(currentPage + 1)
                  }
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-1"
                >
                  Selanjutnya
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Modal Detail Siswa */}
          {showModal && selectedSiswa && (
            <div
              className="fixed inset-0 flex items-center justify-center z-50 p-4"
              role="dialog"
              aria-modal="true"
              aria-labelledby="modal-title"
            >
              <div
                className="fixed inset-0 bg-black/50 transition-opacity"
                onClick={closeDetailModal}
              />
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl p-6 sm:p-8 relative z-10 overflow-y-auto max-h-[90vh]">
                <div className="flex justify-between items-center mb-8">
                  <h3
                    id="modal-title"
                    className="text-2xl font-bold text-gray-900 flex items-center gap-3"
                  >
                    <Users className="w-8 h-8 text-indigo-600 animate-pulse" />
                    Detail Data Siswa
                  </h3>
                  <button
                    onClick={closeDetailModal}
                    className="text-gray-500 hover:text-gray-700 transition-colors"
                    aria-label="Close modal"
                  >
                    <XCircle className="w-7 h-7" />
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full table-auto border-collapse text-gray-800 mb-6">
                    <tbody>
                      <tr className="border-b border-gray-200">
                        <th className="px-4 sm:px-6 py-4 text-left font-semibold w-1/3">
                          Nama
                        </th>
                        <td className="px-4 sm:px-6 py-4">
                          {selectedSiswa.name}
                        </td>
                      </tr>
                      <tr className="border-b border-gray-200">
                        <th className="px-4 sm:px-6 py-4 text-left font-semibold">
                          NIS
                        </th>
                        <td className="px-4 sm:px-6 py-4">
                          {selectedSiswa.userId}
                        </td>
                      </tr>
                      <tr className="border-b border-gray-200">
                        <th className="px-4 sm:px-6 py-4 text-left font-semibold">
                          Kelas
                        </th>
                        <td className="px-4 sm:px-6 py-4">
                          {selectedSiswa.kelas}
                        </td>
                      </tr>
                      <tr>
                        <th className="px-4 sm:px-6 py-4 text-left font-semibold">
                          Tempat PKL
                        </th>
                        <td className="px-4 sm:px-6 py-4">
                          {selectedSiswa.tempatPKL || "-"}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <button
                  onClick={() => {
                    closeDetailModal();
                    openEditModal();
                  }}
                  className="w-full sm:w-auto px-6 py-3 bg-indigo-600 text-white rounded-xl shadow-lg hover:bg-indigo-700 transition transform hover:scale-105"
                >
                  Edit Data
                </button>
              </div>
            </div>
          )}

          {/* Modal Tambah Siswa */}
          {showAddModal && (
            <ModalSiswaForm
              title="Tambah Siswa Baru"
              formData={formData}
              setFormData={setFormData}
              onClose={closeAddModal}
              onSubmit={handleAddSiswa}
              kelasOptions={kelasOptions}
              isEdit={false}
            />
          )}

          {/* Modal Edit Siswa */}
          {showEditModal && (
            <ModalSiswaForm
              title="Edit Data Siswa"
              formData={formData}
              setFormData={setFormData}
              onClose={closeEditModal}
              onSubmit={handleEditSiswa}
              kelasOptions={classes}
              isEdit={true}
            />
          )}
        </main>
      </div>
    </div>
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
    <div
      className="fixed inset-0 flex items-center justify-center z-50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        className="fixed inset-0 bg-black/50 transition-opacity"
        onClick={onClose}
      />
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl p-6 sm:p-8 relative z-10 overflow-y-auto max-h-[90vh]">
        <div className="flex justify-between items-center mb-8">
          <h3
            id="modal-title"
            className="text-2xl font-semibold text-gray-900 flex items-center gap-3"
          >
            {title}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
            aria-label="Tutup modal"
            type="button"
          >
            <XCircle className="w-7 h-7" />
          </button>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit();
          }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6 text-gray-900"
        >
          <div className="flex flex-col">
            <label className="mb-1 font-medium text-gray-700 flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-600" />
              NIS (Username)
            </label>
            <input
              type="text"
              name="username"
              placeholder="NIS"
              value={formData.username}
              onChange={(e) =>
                setFormData({ ...formData, username: e.target.value })
              }
              required
              className="px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
              disabled={isEdit}
            />
          </div>

          {!isEdit && (
            <div className="flex flex-col">
              <label className="mb-1 font-medium text-gray-700">Email</label>
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email || ""}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                required
                className="px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
              />
            </div>
          )}

          {!isEdit && (
            <div className="flex flex-col">
              <label className="mb-1 font-medium text-gray-700">
                Password Default
              </label>
              <input
                type="password"
                name="password"
                placeholder="Password Default"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                required
                className="px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
              />
            </div>
          )}

          {isEdit && (
            <div className="flex flex-col">
              <label className="mb-1 font-medium text-gray-700">
                Ubah Password (Kosongkan jika tidak ganti)
              </label>
              <input
                type="password"
                name="password"
                placeholder="Password Baru"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                className="px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
              />
            </div>
          )}

          <div className="flex flex-col">
            <label className="mb-1 font-medium text-gray-700 flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-600" />
              Nama Lengkap
            </label>
            <input
              type="text"
              name="namaLengkap"
              placeholder="Nama Lengkap"
              value={formData.namaLengkap}
              onChange={(e) =>
                setFormData({ ...formData, namaLengkap: e.target.value })
              }
              required
              className="px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
            />
          </div>

          <div className="flex flex-col">
            <label className="mb-1 font-medium text-gray-700 flex items-center gap-2">
              <School className="w-5 h-5 text-indigo-600" />
              Kelas
            </label>
            <select
              name="kelas"
              value={formData.kelas}
              onChange={(e) =>
                setFormData({ ...formData, kelas: e.target.value })
              }
              required
              className="px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
            >
              {kelasOptions.map((k) => (
                <option key={k} value={k}>
                  {k}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col md:col-span-2">
            <label className="mb-1 font-medium text-gray-700 flex items-center gap-2">
              Tempat PKL
            </label>
            <input
              type="text"
              name="tempatPKL"
              placeholder="Tempat PKL"
              value={formData.tempatPKL}
              onChange={(e) =>
                setFormData({ ...formData, tempatPKL: e.target.value })
              }
              required
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
            />
          </div>

          <div className="md:col-span-2 flex flex-col-reverse sm:flex-row justify-end gap-4 sm:gap-6 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex items-center justify-center gap-2 px-8 py-3 bg-gray-500 text-white rounded-xl shadow-inner hover:bg-gray-600 transition transform hover:scale-105"
            >
              <XCircle className="w-5 h-5" />
              Batal
            </button>
            <button
              type="submit"
              className="flex items-center justify-center gap-2 px-8 py-3 bg-linear-to-r from-indigo-600 to-blue-600 text-white rounded-xl shadow-lg hover:shadow-xl transition transform hover:scale-105"
            >
              <Users className="w-5 h-5" />
              {isEdit ? "Update" : "Tambah"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
