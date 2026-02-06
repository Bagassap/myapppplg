"use client";

import Sidebar from "@/components/layout/SidebarSiswa";
import TopBar from "@/components/layout/TopBar";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import {
  Filter,
  CheckSquare,
  Clock,
  X,
  Edit,
  Calendar,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  UserCheck,
  Camera,
  MapPin,
  Clock as ClockIcon,
  XCircle,
  Image as ImageIcon,
  PenTool,
} from "lucide-react";

export default function SiswaAbsensi() {
  const { data: session, status } = useSession();
  const [showAbsenModal, setShowAbsenModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [presensiData, setPresensiData] = useState<any[]>([]);

  const [siswaData, setSiswaData] = useState({
    nama: "",
    nis: "",
    kelas: "",
    tempatPKL: "",
  });

  const [absenForm, setAbsenForm] = useState({
    status: "Hadir",
    kegiatan: "",
    foto: null as File | null,
    lokasi: "",
    waktuLokasi: new Date().toLocaleTimeString(),
    alasan: "Izin",
    catatan: "",
    bukti: null as File | null,
    tandaTangan: null as File | null,
  });

  const getLocalDateString = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const fetchPresensiHariIni = async () => {
    try {
      const params = new URLSearchParams();
      const now = new Date();
      const today = getLocalDateString(now);

      params.append("startDate", today);
      params.append("endDate", today);

      const presensiRes = await fetch(
        `/api/absensi?${params.toString()}&t=${now.getTime()}`,
        {
          cache: "no-store",
          headers: { Pragma: "no-cache", "Cache-Control": "no-store" },
        },
      );

      if (!presensiRes.ok) throw new Error(`Gagal memuat data presensi.`);
      const presensiRaw = await presensiRes.json();

      const transformedPresensi = presensiRaw.map((item: any) => ({
        id: item.id,
        tanggal: new Date(item.tanggal).toLocaleDateString("id-ID"),
        status: item.status,
        waktu: item.waktu || "-",
        kegiatan: item.kegiatan || "",
        lokasi: item.lokasi || "",
        catatan: item.keterangan || "",
        foto: item.foto || "",
        bukti: item.bukti || "",
        tandaTangan: item.tandaTangan || "",
      }));

      setPresensiData(transformedPresensi);
    } catch (err: any) {
      console.error("Fetch presensi error:", err);
    }
  };

  useEffect(() => {
    if (status === "loading") return;
    if (!session) {
      setError("Unauthorized: Silakan login terlebih dahulu.");
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        const siswaRes = await fetch("/api/data-siswa");
        if (siswaRes.ok) {
          const siswaRaw = await siswaRes.json();
          const siswa =
            Array.isArray(siswaRaw) && siswaRaw.length > 0
              ? siswaRaw[0]
              : Array.isArray(siswaRaw)
                ? null
                : siswaRaw;

          if (siswa) {
            setSiswaData({
              nama: session.user?.name || "",
              nis: siswa.userId || siswa.id?.toString() || "",
              kelas: siswa.kelas || "",
              tempatPKL: siswa.tempatPKL || "",
            });
          }
        }
        await fetchPresensiHariIni();
      } catch (err: any) {
        console.error("Fetch error:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [session, status]);

  const totalPages = Math.ceil(presensiData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = presensiData.slice(startIndex, endIndex);

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      setAbsenForm((prev) => ({
        ...prev,
        lokasi: "Mengambil titik lokasi...",
      }));
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const lokasi = `${latitude}, ${longitude}`;
          setAbsenForm((prev) => ({ ...prev, lokasi }));
        },
        (error) => {
          console.error("Error GPS:", error);
          alert(
            "Gagal mendapatkan lokasi. Pastikan GPS aktif dan browser diizinkan.",
          );
          setAbsenForm((prev) => ({ ...prev, lokasi: "" }));
        },
        { enableHighAccuracy: true },
      );
    } else {
      alert("Browser tidak mendukung Geolocation.");
    }
  };

  const handleAbsenSubmit = async () => {
    let isValid = true;
    if (
      absenForm.status === "Hadir" &&
      (!absenForm.foto || !absenForm.lokasi)
    ) {
      alert("Wajib isi Foto & Lokasi untuk Hadir!");
      isValid = false;
    } else if (
      absenForm.status === "Pulang" &&
      (!absenForm.kegiatan || !absenForm.foto || !absenForm.lokasi)
    ) {
      alert("Wajib isi Kegiatan, Foto & Lokasi untuk Pulang!");
      isValid = false;
    } else if (
      absenForm.status === "Izin" &&
      (!absenForm.catatan || !absenForm.bukti)
    ) {
      alert("Wajib isi Catatan & Bukti Surat untuk Izin!");
      isValid = false;
    } else if (absenForm.status === "Libur" && !absenForm.catatan) {
      alert("Wajib isi Catatan untuk Libur!");
      isValid = false;
    }

    if (!isValid) return;

    const formData = new FormData();
    formData.append("tipe", "absen");
    formData.append("status", absenForm.status);
    formData.append("keterangan", absenForm.catatan || "");
    if (absenForm.kegiatan) formData.append("kegiatan", absenForm.kegiatan);
    if (absenForm.foto) formData.append("foto", absenForm.foto);
    if (absenForm.lokasi) formData.append("lokasi", absenForm.lokasi);
    if (absenForm.waktuLokasi) formData.append("waktu", absenForm.waktuLokasi);
    if (absenForm.bukti) formData.append("bukti", absenForm.bukti);
    if (absenForm.tandaTangan)
      formData.append("tandaTangan", absenForm.tandaTangan);

    try {
      const response = await fetch("/api/absensi", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Gagal menyimpan absensi");
      }

      await fetchPresensiHariIni();

      alert("Absen berhasil tersimpan!");
      setShowAbsenModal(false);

      setAbsenForm({
        status: "Hadir",
        kegiatan: "",
        foto: null,
        lokasi: "",
        waktuLokasi: new Date().toLocaleTimeString(),
        alasan: "Izin",
        catatan: "",
        bukti: null,
        tandaTangan: null,
      });
    } catch (err: any) {
      console.error(err);
      alert("Terjadi kesalahan: " + err.message);
    }
  };

  const handlePrevious = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const getKeterangan = (status: string, catatan: string) => {
    if (catatan) return catatan;
    return status;
  };

  const openImage = (url: string) => {
    if (url) window.open(url, "_blank");
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <TopBar />
          <main className="flex-1 flex items-center justify-center p-6 sm:p-8 lg:p-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          </main>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <TopBar />
          <main className="flex-1 flex items-center justify-center p-6 sm:p-8 lg:p-12">
            <div className="text-center text-red-600 font-semibold">
              {error}
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar />
        <main className="flex-1 p-6 sm:p-8 lg:p-12 overflow-y-auto w-full">
          <div className="mb-8">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2 flex flex-wrap items-center gap-3">
              <Calendar className="w-10 h-10 sm:w-12 sm:h-12 text-indigo-600 animate-pulse" />
              Absensi
            </h1>
            <p className="text-gray-600 text-sm sm:text-base md:text-lg">
              Lakukan absen setiap hari
            </p>
          </div>

          <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-lg border border-gray-100 mb-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-3 w-full md:w-auto">
                <div className="p-3 bg-indigo-100 rounded-full shrink-0">
                  <Calendar className="w-6 h-6 text-indigo-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm text-gray-500 font-medium">
                    Tanggal Absensi
                  </p>
                  <p className="text-lg sm:text-xl font-bold text-gray-900 truncate">
                    {new Date().toLocaleDateString("id-ID", {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowAbsenModal(true)}
                className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl shadow-lg hover:shadow-xl hover:from-green-700 hover:to-green-800 transition-all duration-200 transform hover:scale-105 whitespace-nowrap"
              >
                <CheckSquare className="w-5 h-5" />
                Absen Harian
              </button>
            </div>
          </div>

          <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-lg mb-8 border border-gray-100">
            <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <CheckSquare className="w-6 h-6 text-green-600" />
              Riwayat Absensi Hari Ini
            </h3>

            <div className="w-full overflow-x-auto">
              <table className="w-full table-auto border-collapse min-w-[800px]">
                <thead>
                  <tr className="bg-gradient-to-r from-indigo-100 to-blue-100">
                    <th className="px-6 py-4 text-left font-semibold text-gray-700 rounded-tl-xl whitespace-nowrap">
                      Tanggal
                    </th>
                    <th className="px-6 py-4 text-left font-semibold text-gray-700 whitespace-nowrap">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left font-semibold text-gray-700 whitespace-nowrap">
                      Waktu
                    </th>
                    <th className="px-6 py-4 text-left font-semibold text-gray-700 whitespace-nowrap">
                      Kegiatan
                    </th>
                    <th className="px-6 py-4 text-left font-semibold text-gray-700 whitespace-nowrap">
                      Lokasi
                    </th>
                    <th className="px-6 py-4 text-center font-semibold text-gray-700 w-24 whitespace-nowrap">
                      Foto
                    </th>
                    <th className="px-6 py-4 text-center font-semibold text-gray-700 w-24 whitespace-nowrap">
                      TTD
                    </th>
                    <th className="px-6 py-4 text-left font-semibold text-gray-700 rounded-tr-xl whitespace-nowrap">
                      Keterangan
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {currentData.length === 0 ? (
                    <tr>
                      <td
                        colSpan={8}
                        className="px-6 py-8 text-center text-gray-500"
                      >
                        Belum ada data absensi untuk hari ini.
                      </td>
                    </tr>
                  ) : (
                    currentData.map((item) => (
                      <tr
                        key={item.id}
                        className="border-b border-gray-100 hover:bg-indigo-50 transition-colors duration-200"
                      >
                        <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                          {item.tanggal}
                        </td>
                        <td className="px-6 py-4 text-gray-700 flex items-center gap-2 whitespace-nowrap">
                          {item.status === "Hadir" && (
                            <CheckSquare className="w-4 h-4 text-green-600" />
                          )}
                          {item.status === "Pulang" && (
                            <Clock className="w-4 h-4 text-blue-500" />
                          )}
                          {item.status === "Terlambat" && (
                            <Clock className="w-4 h-4 text-yellow-500" />
                          )}
                          {(item.status === "Izin" ||
                            item.status === "Sakit") && (
                            <AlertCircle className="w-4 h-4 text-red-500" />
                          )}
                          {item.status === "Libur" && (
                            <Calendar className="w-4 h-4 text-purple-500" />
                          )}
                          {item.status}
                        </td>
                        <td className="px-6 py-4 text-gray-700 whitespace-nowrap">
                          {item.waktu}
                        </td>
                        <td className="px-6 py-4 text-gray-700 min-w-[150px]">
                          {item.kegiatan || "-"}
                        </td>
                        <td className="px-6 py-4 text-gray-700 whitespace-nowrap">
                          {item.lokasi ? (
                            <a
                              href={`https://www.google.com/maps?q=${item.lokasi}`}
                              target="_blank"
                              rel="noreferrer"
                              className="text-blue-600 underline flex items-center gap-1 text-sm"
                            >
                              <MapPin className="w-3 h-3" /> Map
                            </a>
                          ) : (
                            "-"
                          )}
                        </td>

                        <td className="px-6 py-4 text-center">
                          {item.status === "Izin" || item.status === "Sakit" ? (
                            item.bukti ? (
                              <div
                                className="flex justify-center cursor-pointer group"
                                onClick={() => openImage(item.bukti)}
                                title="Klik untuk memperbesar"
                              >
                                <div className="relative w-10 h-10 border rounded overflow-hidden shadow-sm hover:shadow-md transition-all">
                                  <img
                                    src={item.bukti}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                                    alt="Bukti"
                                    onError={(e) => {
                                      (
                                        e.target as HTMLImageElement
                                      ).style.display = "none";
                                    }}
                                  />
                                </div>
                              </div>
                            ) : (
                              "-"
                            )
                          ) : item.foto ? (
                            <div
                              className="flex justify-center cursor-pointer group"
                              onClick={() => openImage(item.foto)}
                              title="Klik untuk memperbesar"
                            >
                              <div className="relative w-10 h-10 border rounded overflow-hidden shadow-sm hover:shadow-md transition-all">
                                <img
                                  src={item.foto}
                                  className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                                  alt="Foto"
                                  onError={(e) => {
                                    (
                                      e.target as HTMLImageElement
                                    ).style.display = "none";
                                  }}
                                />
                              </div>
                            </div>
                          ) : (
                            <div className="flex justify-center text-gray-300">
                              <ImageIcon className="w-5 h-5" />
                            </div>
                          )}
                        </td>

                        <td className="px-6 py-4 text-center">
                          {item.tandaTangan ? (
                            <div
                              className="flex justify-center cursor-pointer group"
                              onClick={() => openImage(item.tandaTangan)}
                              title="Klik untuk memperbesar"
                            >
                              <div className="relative w-12 h-10 border rounded bg-white overflow-hidden shadow-sm hover:shadow-md transition-all">
                                <img
                                  src={item.tandaTangan}
                                  className="w-full h-full object-contain group-hover:scale-110 transition-transform p-1"
                                  alt="TTD"
                                  onError={(e) => {
                                    (
                                      e.target as HTMLImageElement
                                    ).style.display = "none";
                                  }}
                                />
                              </div>
                            </div>
                          ) : (
                            <div className="flex justify-center text-gray-300">
                              <PenTool className="w-5 h-5" />
                            </div>
                          )}
                        </td>

                        <td className="px-6 py-4 text-gray-700 text-sm min-w-[150px]">
                          {getKeterangan(item.status, item.catatan)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {presensiData.length > itemsPerPage && (
              <div className="flex flex-col sm:flex-row justify-between items-center mt-4 gap-4 sm:gap-0">
                <p className="text-sm text-gray-600 text-center sm:text-left">
                  Menampilkan {startIndex + 1}-
                  {Math.min(endIndex, presensiData.length)} dari{" "}
                  {presensiData.length}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={handlePrevious}
                    disabled={currentPage === 1}
                    className="px-3 py-1 bg-indigo-500 text-white rounded disabled:bg-gray-300"
                  >
                    Prev
                  </button>
                  <button
                    onClick={handleNext}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 bg-indigo-500 text-white rounded disabled:bg-gray-300"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>

          {showAbsenModal && (
            <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
              <div
                className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
                onClick={() => setShowAbsenModal(false)}
              ></div>

              <div
                className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl mx-0 sm:mx-4 p-6 sm:p-8 relative z-10 animate-fade-scale max-h-[90vh] overflow-y-auto"
                role="dialog"
                aria-modal="true"
              >
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-3">
                    <CheckSquare className="w-8 h-8 text-green-600" />
                    Form Absensi
                  </h3>
                  <button
                    onClick={() => setShowAbsenModal(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <XCircle className="w-8 h-8" />
                  </button>
                </div>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleAbsenSubmit();
                  }}
                  className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 text-gray-800"
                >
                  {["nama", "nis", "kelas", "tempatPKL"].map((field, idx) => (
                    <div className="flex flex-col" key={field}>
                      <label className="mb-1 font-medium text-gray-700 capitalize">
                        {field === "tempatPKL"
                          ? "Tempat PKL"
                          : field.charAt(0).toUpperCase() + field.slice(1)}
                      </label>
                      <input
                        type="text"
                        value={(siswaData as any)[field]}
                        readOnly
                        className="px-4 py-2 rounded-lg bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full"
                      />
                    </div>
                  ))}

                  <div className="flex flex-col md:col-span-2">
                    <label className="mb-1 font-medium text-gray-700">
                      Status Kehadiran
                    </label>
                    <select
                      value={absenForm.status}
                      onChange={(e) =>
                        setAbsenForm({ ...absenForm, status: e.target.value })
                      }
                      className="px-4 py-3 rounded-lg bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full"
                    >
                      <option value="Hadir">Hadir</option>
                      <option value="Pulang">Pulang</option>
                      <option value="Izin">Izin</option>
                      <option value="Libur">Libur</option>
                    </select>
                  </div>

                  {absenForm.status === "Hadir" && (
                    <>
                      <div className="flex flex-col">
                        <label className="mb-1 font-medium flex items-center gap-2">
                          <Camera className="w-4 h-4" /> Foto Selfie/Lokasi
                        </label>
                        <input
                          type="file"
                          accept="image/*"
                          capture="user"
                          onChange={(e) =>
                            setAbsenForm({
                              ...absenForm,
                              foto: e.target.files?.[0] || null,
                            })
                          }
                          className="px-4 py-2 rounded-lg bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full"
                          required
                        />
                      </div>

                      <div className="flex flex-col">
                        <label className="mb-1 font-medium flex items-center gap-2">
                          <MapPin className="w-4 h-4" /> Koordinat GPS
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={absenForm.lokasi}
                            readOnly
                            className="flex-1 px-4 py-2 rounded-lg bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 min-w-0"
                            required
                          />
                          <button
                            type="button"
                            onClick={getCurrentLocation}
                            className="px-3 bg-indigo-600 text-white rounded-lg shrink-0"
                          >
                            <MapPin className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <div className="flex flex-col">
                        <label className="mb-1 font-medium flex items-center gap-2">
                          <ClockIcon className="w-4 h-4" /> Jam
                        </label>
                        <input
                          type="text"
                          value={absenForm.waktuLokasi}
                          readOnly
                          className="px-4 py-2 rounded-lg bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full"
                        />
                      </div>
                    </>
                  )}

                  {absenForm.status === "Pulang" && (
                    <>
                      <div className="flex flex-col md:col-span-2">
                        <label className="mb-1 font-medium">
                          Laporan Kegiatan
                        </label>
                        <textarea
                          value={absenForm.kegiatan}
                          onChange={(e) =>
                            setAbsenForm({
                              ...absenForm,
                              kegiatan: e.target.value,
                            })
                          }
                          className="px-4 py-2 rounded-lg bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full"
                          rows={3}
                          required
                        />
                      </div>

                      <div className="flex flex-col">
                        <label className="mb-1 font-medium flex items-center gap-2">
                          <Camera className="w-4 h-4" /> Foto Kegiatan
                        </label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) =>
                            setAbsenForm({
                              ...absenForm,
                              foto: e.target.files?.[0] || null,
                            })
                          }
                          className="px-4 py-2 rounded-lg bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full"
                          required
                        />
                      </div>

                      <div className="flex flex-col">
                        <label className="mb-1 font-medium flex items-center gap-2">
                          <MapPin className="w-4 h-4" /> GPS Pulang
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={absenForm.lokasi}
                            readOnly
                            className="flex-1 px-4 py-2 rounded-lg bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 min-w-0"
                            required
                          />
                          <button
                            type="button"
                            onClick={getCurrentLocation}
                            className="px-3 bg-indigo-600 text-white rounded-lg shrink-0"
                          >
                            <MapPin className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </>
                  )}

                  {(absenForm.status === "Izin" ||
                    absenForm.status === "Libur") && (
                    <div className="flex flex-col md:col-span-2">
                      <label className="mb-1 font-medium">
                        Alasan/Keterangan
                      </label>
                      <textarea
                        value={absenForm.catatan}
                        onChange={(e) =>
                          setAbsenForm({
                            ...absenForm,
                            catatan: e.target.value,
                          })
                        }
                        className="px-4 py-2 rounded-lg bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full"
                        rows={3}
                        required
                      />
                      {absenForm.status === "Izin" && (
                        <div className="mt-3">
                          <label className="mb-1 font-medium block">
                            Bukti Surat
                          </label>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) =>
                              setAbsenForm({
                                ...absenForm,
                                bukti: e.target.files?.[0] || null,
                              })
                            }
                            className="px-4 py-2 rounded-lg bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full"
                            required
                          />
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex flex-col md:col-span-2">
                    <label className="mb-1 font-medium flex items-center gap-2">
                      <Edit className="w-4 h-4" /> Tanda Tangan (Foto/Scan)
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) =>
                        setAbsenForm({
                          ...absenForm,
                          tandaTangan: e.target.files?.[0] || null,
                        })
                      }
                      className="px-4 py-2 rounded-lg bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full"
                    />
                  </div>

                  <div className="md:col-span-2 flex flex-col-reverse sm:flex-row justify-end gap-4 mt-4">
                    <button
                      type="button"
                      onClick={() => setShowAbsenModal(false)}
                      className="w-full sm:w-auto px-6 py-2 bg-gray-500 text-white rounded-xl hover:bg-gray-600"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      className="w-full sm:w-auto px-6 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 shadow-lg flex items-center justify-center gap-2"
                    >
                      <CheckSquare className="w-5 h-5" /> Kirim Absen
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
