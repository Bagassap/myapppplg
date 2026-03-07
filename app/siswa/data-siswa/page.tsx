"use client";

import React, { useState, useEffect } from "react";
import Sidebar from "@/components/layout/SidebarSiswa";
import TopBar from "@/components/layout/TopBar";
import {
  User,
  Edit,
  Camera,
  Phone,
  Mail,
  MapPin,
  Calendar,
  XCircle,
  Save,
  Loader2,
  School,
  Hash,
  Building2,
  CheckCircle2,
} from "lucide-react";

export default function SiswaDataSiswa() {
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState<{
    foto: File | null;
    telepon: string;
    email: string;
  }>({
    foto: null,
    telepon: "",
    email: "",
  });
  const [siswaData, setSiswaData] = useState({
    nama: "",
    nis: "",
    kelas: "",
    tempatPKL: "",
    tanggalLahir: "",
    alamat: "",
    telepon: "",
    email: "",
    foto: null as string | null,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/api/data-siswa");
        if (!response.ok) throw new Error("Gagal mengambil data.");
        const data = await response.json();
        if (!data || data.length === 0)
          throw new Error("Data tidak ditemukan.");
        const siswa = data[0];
        setSiswaData({
          nama: siswa.name || "",
          nis: siswa.userId || "",
          kelas: siswa.kelas || "",
          tempatPKL: siswa.tempatPKL || "",
          tanggalLahir: siswa.tanggalLahir || "",
          alamat: siswa.alamat || "",
          telepon: siswa.telepon || "",
          email: siswa.email || "",
          foto: siswa.foto || null,
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Terjadi kesalahan.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleEditSubmit = async () => {
    try {
      const responseFetch = await fetch("/api/data-siswa");
      const data = await responseFetch.json();
      const siswaId = data[0]?.id;
      if (!siswaId) throw new Error("ID siswa tidak ditemukan.");
      const formData = new FormData();
      if (editForm.foto) formData.append("foto", editForm.foto);
      formData.append("telepon", editForm.telepon);
      formData.append("email", editForm.email);
      const response = await fetch(`/api/data-siswa/${siswaId}`, {
        method: "PUT",
        body: formData,
      });
      if (!response.ok) throw new Error("Gagal memperbarui data.");
      setSiswaData({
        ...siswaData,
        telepon: editForm.telepon || siswaData.telepon,
        email: editForm.email || siswaData.email,
        foto: editForm.foto
          ? URL.createObjectURL(editForm.foto)
          : siswaData.foto,
      });
      setEditForm({ foto: null, telepon: "", email: "" });
      setShowEditModal(false);
      alert("Data berhasil diperbarui! Menunggu persetujuan admin.");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Terjadi kesalahan.");
    }
  };

  const handleCloseModal = () => {
    setShowEditModal(false);
    setEditForm({ foto: null, telepon: "", email: "" });
  };

  if (loading)
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="flex items-center gap-3 text-gray-500">
          <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
          <span className="text-sm font-medium">Memuat data...</span>
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

  const infoFields = [
    {
      label: "Nama Lengkap",
      value: siswaData.nama,
      icon: <User className="w-4 h-4 text-indigo-500" />,
    },
    {
      label: "NIS",
      value: siswaData.nis,
      icon: <Hash className="w-4 h-4 text-indigo-500" />,
    },
    {
      label: "Kelas",
      value: siswaData.kelas,
      icon: <School className="w-4 h-4 text-indigo-500" />,
    },
    {
      label: "Tempat PKL",
      value: siswaData.tempatPKL,
      icon: <Building2 className="w-4 h-4 text-indigo-500" />,
    },
    {
      label: "Tanggal Lahir",
      value: siswaData.tanggalLahir,
      icon: <Calendar className="w-4 h-4 text-indigo-500" />,
    },
    {
      label: "Alamat",
      value: siswaData.alamat,
      icon: <MapPin className="w-4 h-4 text-indigo-500" />,
    },
    {
      label: "Telepon",
      value: siswaData.telepon,
      icon: <Phone className="w-4 h-4 text-indigo-500" />,
    },
    {
      label: "Email",
      value: siswaData.email,
      icon: <Mail className="w-4 h-4 text-indigo-500" />,
    },
  ];

  const editableFields = ["Telepon", "Email", "Foto Profil"];

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
                  Data Pribadi
                </h1>
              </div>
              <p className="text-gray-500 text-sm pl-3.5">
                Lihat dan perbarui data pribadi Anda.
              </p>
            </div>
            <button
              onClick={() => setShowEditModal(true)}
              className="shrink-0 flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold shadow-sm transition-colors"
            >
              <Edit className="w-4 h-4" /> Edit Data
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Profile Card */}
            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
              {/* Cover */}
              <div className="h-20 bg-gradient-to-br from-indigo-500 to-indigo-700" />
              <div className="px-5 pb-5 -mt-10 flex flex-col items-center text-center">
                {/* Avatar */}
                <div className="w-20 h-20 rounded-2xl border-4 border-white shadow-md overflow-hidden bg-indigo-100 flex items-center justify-center mb-3">
                  {siswaData.foto ? (
                    <img
                      src={siswaData.foto}
                      alt="Foto Profil"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-2xl font-bold text-indigo-600">
                      {siswaData.nama.slice(0, 2).toUpperCase()}
                    </span>
                  )}
                </div>
                <p className="font-bold text-gray-900 text-base">
                  {siswaData.nama || "—"}
                </p>
                <p className="text-xs text-gray-400 mt-0.5 mb-3">
                  {siswaData.nis || "—"}
                </p>
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200">
                  <School className="w-3 h-3" />
                  {siswaData.kelas || "—"}
                </span>
              </div>
              {/* Editable notice */}
              <div className="mx-4 mb-4 p-3 bg-amber-50 border border-amber-100 rounded-xl">
                <p className="text-xs text-amber-700 font-medium flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0 mt-0.5 text-amber-500" />
                  Data yang bisa diedit: {editableFields.join(", ")}. Perubahan
                  memerlukan persetujuan admin.
                </p>
              </div>
            </div>

            {/* Detail Fields */}
            <div className="lg:col-span-2 bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
                <User className="w-4 h-4 text-indigo-500" />
                <h2 className="font-semibold text-gray-700 text-sm">
                  Informasi Lengkap
                </h2>
              </div>
              <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
                {infoFields.map((field) => (
                  <div
                    key={field.label}
                    className={`flex items-start gap-3 p-3 rounded-xl border transition-colors ${
                      ["Telepon", "Email"].includes(field.label)
                        ? "bg-indigo-50/60 border-indigo-100"
                        : "bg-gray-50 border-gray-100"
                    } ${field.label === "Alamat" ? "sm:col-span-2" : ""}`}
                  >
                    <div className="p-1.5 bg-white rounded-lg border border-gray-200 shrink-0 mt-0.5">
                      {field.icon}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide">
                          {field.label}
                        </p>
                        {["Telepon", "Email"].includes(field.label) && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-indigo-100 text-indigo-600 font-bold">
                            Dapat diedit
                          </span>
                        )}
                      </div>
                      <p className="text-sm font-semibold text-gray-800 break-words">
                        {field.value || "—"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Modal Edit */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div
            className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
            onClick={handleCloseModal}
          />
          <div
            className="relative bg-white w-full sm:max-w-md sm:rounded-2xl rounded-t-3xl shadow-2xl overflow-hidden"
            style={{ animation: "slideUp .25s cubic-bezier(.32,1.25,.6,1)" }}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-indigo-50">
                  <Edit className="w-4 h-4 text-indigo-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-800 text-sm">
                    Edit Data Pribadi
                  </p>
                  <p className="text-xs text-gray-400">
                    Perubahan perlu persetujuan admin
                  </p>
                </div>
              </div>
              <button
                onClick={handleCloseModal}
                className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
              >
                <XCircle className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            <div className="p-5">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleEditSubmit();
                }}
                className="space-y-4"
              >
                {/* Foto */}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                    <span className="flex items-center gap-1.5">
                      <Camera className="w-3.5 h-3.5" />
                      Foto Profil Baru
                    </span>
                  </label>
                  <div className="relative">
                    <input
                      type="file"
                      accept="image/*"
                      id="foto-upload"
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          foto: e.target.files?.[0] || null,
                        })
                      }
                      className="hidden"
                    />
                    <label
                      htmlFor="foto-upload"
                      className="flex items-center gap-3 px-4 py-3 rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 hover:border-indigo-300 hover:bg-indigo-50/50 cursor-pointer transition-colors"
                    >
                      <Camera className="w-4 h-4 text-gray-400 shrink-0" />
                      <span className="text-sm text-gray-500 truncate">
                        {editForm.foto ? editForm.foto.name : "Pilih foto..."}
                      </span>
                    </label>
                  </div>
                </div>
                {/* Telepon */}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                    <span className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5" />
                      Nomor Telepon
                    </span>
                  </label>
                  <input
                    type="tel"
                    placeholder={siswaData.telepon || "Masukkan nomor telepon"}
                    value={editForm.telepon}
                    onChange={(e) =>
                      setEditForm({ ...editForm, telepon: e.target.value })
                    }
                    className="w-full px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-sm text-gray-800 focus:ring-2 focus:ring-indigo-300 outline-none"
                  />
                </div>
                {/* Email */}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                    <span className="flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5" />
                      Email
                    </span>
                  </label>
                  <input
                    type="email"
                    placeholder={siswaData.email || "Masukkan alamat email"}
                    value={editForm.email}
                    onChange={(e) =>
                      setEditForm({ ...editForm, email: e.target.value })
                    }
                    className="w-full px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-sm text-gray-800 focus:ring-2 focus:ring-indigo-300 outline-none"
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="flex-1 py-2.5 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition-colors text-sm font-medium"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-colors shadow-sm flex items-center justify-center gap-2 text-sm"
                  >
                    <Save className="w-4 h-4" /> Simpan
                  </button>
                </div>
              </form>
            </div>
          </div>
          <style>{`@keyframes slideUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}`}</style>
        </div>
      )}
    </div>
  );
}
