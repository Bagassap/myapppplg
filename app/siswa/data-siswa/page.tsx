"use client";

import React from "react";
import Sidebar from "@/components/layout/SidebarSiswa";
import TopBar from "@/components/layout/TopBar";
import { useState, useEffect } from "react";
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
  Loader,
} from "lucide-react";

export default function SiswaDataSiswa() {
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({
    foto: null as File | null,
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

      const updatedData = {
        ...siswaData,
        telepon: editForm.telepon || siswaData.telepon,
        email: editForm.email || siswaData.email,
        foto: editForm.foto
          ? URL.createObjectURL(editForm.foto)
          : siswaData.foto,
      };
      setSiswaData(updatedData);
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

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader className="w-8 h-8 animate-spin text-indigo-600" />
        <span className="ml-2">Memuat data...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <TopBar />
        <main className="flex-1 p-18 overflow-auto">
          {/* Header Section */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2 flex items-center gap-3">
              <User className="w-10 h-10 text-indigo-600 animate-pulse" />
              Data Pribadi Siswa
            </h1>
            <p className="text-gray-600 text-lg">
              Lihat dan edit data pribadi Anda. Perubahan memerlukan persetujuan
              admin.
            </p>
          </div>

          {/* Card Data Pribadi */}
          <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 mb-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <User className="w-6 h-6 text-indigo-600" />
                Informasi Pribadi
              </h3>
              <button
                onClick={() => setShowEditModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors"
              >
                <Edit className="w-4 h-4" />
                Edit Data
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Foto Profil */}
              <div className="flex flex-col items-center">
                <div className="w-32 h-32 bg-gray-200 rounded-full flex items-center justify-center mb-4">
                  {siswaData.foto ? (
                    <img
                      src={siswaData.foto}
                      alt="Foto Profil"
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <User className="w-16 h-16 text-gray-500" />
                  )}
                </div>
                <p className="text-sm text-gray-500">Foto Profil</p>
              </div>

              {/* Data Teks */}
              <div className="space-y-4">
                <Field
                  label="Nama"
                  icon={<User className="w-5 h-5 text-indigo-500" />}
                  value={siswaData.nama}
                />
                <Field
                  label="NIS"
                  icon={<Calendar className="w-5 h-5 text-indigo-500" />}
                  value={siswaData.nis}
                />
                <Field
                  label="Kelas"
                  icon={<Calendar className="w-5 h-5 text-indigo-500" />}
                  value={siswaData.kelas}
                />
                <Field
                  label="Tempat PKL"
                  icon={<MapPin className="w-5 h-5 text-indigo-500" />}
                  value={siswaData.tempatPKL}
                />
                <Field
                  label="Tanggal Lahir"
                  icon={<Calendar className="w-5 h-5 text-indigo-500" />}
                  value={siswaData.tanggalLahir}
                />
                <Field
                  label="Alamat"
                  icon={<MapPin className="w-5 h-5 text-indigo-500" />}
                  value={siswaData.alamat}
                />
                <Field
                  label="Telepon"
                  icon={<Phone className="w-5 h-5 text-indigo-500" />}
                  value={siswaData.telepon}
                />
                <Field
                  label="Email"
                  icon={<Mail className="w-5 h-5 text-indigo-500" />}
                  value={siswaData.email}
                />
              </div>
            </div>
          </div>

          {/* Modal Edit Data */}
          {showEditModal && (
            <EditModal
              editForm={editForm}
              setEditForm={setEditForm}
              onSubmit={handleEditSubmit}
              onClose={handleCloseModal}
            />
          )}
        </main>
      </div>
    </div>
  );
}

interface FieldProps {
  label: string;
  icon: React.ReactElement;
  value: string;
}

function Field({ label, icon, value }: FieldProps) {
  return (
    <div className="flex items-center gap-3">
      {icon}
      <div>
        <p className="text-sm font-medium text-gray-700">{label}</p>
        <p className="text-gray-900">{value}</p>
      </div>
    </div>
  );
}

interface EditModalProps {
  editForm: { foto: File | null; telepon: string; email: string };
  setEditForm: React.Dispatch<
    React.SetStateAction<{ foto: File | null; telepon: string; email: string }>
  >;
  onSubmit: () => void;
  onClose: () => void;
}

function EditModal({
  editForm,
  setEditForm,
  onSubmit,
  onClose,
}: EditModalProps) {
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
      <div
        className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full mx-4 p-10 pointer-events-auto animate-fade-scale transform-gpu transition duration-300 ease-out"
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-modal-title"
      >
        <div className="flex justify-between items-center mb-8">
          <h3
            id="edit-modal-title"
            className="text-2xl font-bold text-gray-900 flex items-center gap-3"
          >
            <Edit className="w-8 h-8 text-indigo-600 animate-pulse" />
            Edit Data Pribadi
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
            aria-label="Close modal"
          >
            <XCircle className="w-7 h-7" />
          </button>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit();
          }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6 text-gray-800"
        >
          {/* Foto Profil */}
          <div className="flex flex-col">
            <label className="mb-2 font-medium text-gray-700 flex items-center gap-2">
              <Camera className="w-5 h-5" />
              Foto Profil Baru
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) =>
                setEditForm({
                  ...editForm,
                  foto: e.target.files?.[0] || null,
                })
              }
              className="px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Telepon */}
          <div className="flex flex-col">
            <label className="mb-2 font-medium text-gray-700 flex items-center gap-2">
              <Phone className="w-5 h-5" />
              Telepon
            </label>
            <input
              type="tel"
              placeholder="Masukkan nomor telepon"
              value={editForm.telepon}
              onChange={(e) =>
                setEditForm({ ...editForm, telepon: e.target.value })
              }
              className="px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Email */}
          <div className="flex flex-col md:col-span-2">
            <label className="mb-2 font-medium text-gray-700 flex items-center gap-2">
              <Mail className="w-5 h-5" />
              Email
            </label>
            <input
              type="email"
              placeholder="Masukkan alamat email"
              value={editForm.email}
              onChange={(e) =>
                setEditForm({ ...editForm, email: e.target.value })
              }
              className="px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Tombol Aksi */}
          <div className="md:col-span-2 flex justify-end gap-6 mt-6">
            <button
              type="submit"
              className="flex items-center gap-2 px-8 py-3 bg-linear-to-r from-indigo-600 to-blue-600 text-white rounded-xl shadow-lg hover:shadow-xl hover:from-indigo-700 hover:to-blue-700 transform transition duration-200 hover:scale-105"
            >
              <Save className="w-5 h-5" />
              Simpan Perubahan
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex items-center gap-2 px-8 py-3 bg-gray-500 text-white rounded-xl shadow-inner hover:bg-gray-600 transition-colors duration-200 hover:scale-105"
            >
              <XCircle className="w-5 h-5" />
              Batal
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
