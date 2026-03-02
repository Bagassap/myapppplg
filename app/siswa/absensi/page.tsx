"use client";

import Sidebar from "@/components/layout/SidebarSiswa";
import TopBar from "@/components/layout/TopBar";
import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import dynamic from "next/dynamic";

const SignatureCanvas = dynamic(() => import("react-signature-canvas"), {
  ssr: false,
  loading: () => (
    <div className="h-40 w-full bg-gray-100 rounded-xl animate-pulse flex items-center justify-center text-gray-400 text-sm">
      Memuat area tanda tangan...
    </div>
  ),
}) as React.ComponentType<any>;

import {
  Calendar,
  CheckSquare,
  Clock as ClockIcon,
  MapPin,
  Camera,
  Edit,
  XCircle,
  Loader2,
  PenTool,
  Trash2,
  FileText,
  UploadCloud,
  User,
  Hash,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Image as ImageIcon,
  X,
} from "lucide-react";

export default function SiswaAbsensi() {
  const { data: session, status } = useSession();
  const [showAbsenModal, setShowAbsenModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [presensiData, setPresensiData] = useState<any[]>([]);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewType, setPreviewType] = useState<"foto" | "ttd">("foto");
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [gpsLoading, setGpsLoading] = useState(false);

  const sigCanvas = useRef<any>(null);

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
    catatan: "",
    bukti: null as File | null,
    tandaTangan: null as string | null,
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
        { cache: "no-store", headers: { Pragma: "no-cache" } },
      );
      if (!presensiRes.ok) throw new Error("Gagal memuat data presensi.");
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
              nama: siswa.name || session.user?.name || "",
              nis: siswa.userId || siswa.id?.toString() || "",
              kelas: siswa.kelas || "",
              tempatPKL: siswa.tempatPKL || "",
            });
          }
        }
        await fetchPresensiHariIni();
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [session, status]);

  const getCurrentLocation = () => {
    setGpsError(null);

    if (!navigator.geolocation) {
      setGpsError(
        "Browser tidak mendukung GPS. Gunakan Safari atau Chrome terbaru.",
      );
      return;
    }

    setGpsLoading(true);
    setAbsenForm((prev) => ({ ...prev, lokasi: "" }));

    const onSuccess = (position: GeolocationPosition) => {
      const { latitude, longitude } = position.coords;
      setAbsenForm((prev) => ({
        ...prev,
        lokasi: `${latitude}, ${longitude}`,
      }));
      setGpsError(null);
      setGpsLoading(false);
    };

    const onError = (error: GeolocationPositionError) => {
      setAbsenForm((prev) => ({ ...prev, lokasi: "" }));
      setGpsLoading(false);
      if (error.code === 1) {
        setGpsError(
          "Akses lokasi ditolak. Di iPhone: Pengaturan > Safari > Lokasi > Izinkan Saat Menggunakan. Lalu muat ulang halaman.",
        );
      } else if (error.code === 3) {
        setGpsError(
          "Waktu habis. Pastikan GPS aktif dan sinyal baik, lalu coba lagi.",
        );
      } else {
        setGpsError(
          "GPS tidak tersedia. Pastikan Location Services aktif di Pengaturan iPhone.",
        );
      }
    };

    const tryLowAccuracy = () => {
      navigator.geolocation.getCurrentPosition(onSuccess, onError, {
        enableHighAccuracy: false,
        timeout: 15000,
        maximumAge: 60000,
      });
    };

    navigator.geolocation.getCurrentPosition(
      onSuccess,
      (error) => {
        if (error.code === 3 || error.code === 2) {
          tryLowAccuracy();
        } else {
          onError(error);
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
    );
  };

  const clearSignature = () => sigCanvas.current?.clear();
  const isStatusIzinOrSakit = ["Izin", "Sakit"].includes(absenForm.status);
  const isStatusPulang = absenForm.status === "Pulang";

  const openPreview = (url: string, type: "foto" | "ttd") => {
    if (!url) return;
    setPreviewUrl(url);
    setPreviewType(type);
  };

  const handleAbsenSubmit = async () => {
    if (sigCanvas.current?.isEmpty()) {
      alert("⚠️ Tanda Tangan wajib digambar!");
      return;
    }
    if (!absenForm.lokasi) {
      alert("Lokasi/GPS wajib diambil.");
      return;
    }
    if (!absenForm.foto) {
      alert("Foto Selfie/Lokasi wajib diupload untuk verifikasi.");
      return;
    }
    const textContent = isStatusPulang ? absenForm.kegiatan : absenForm.catatan;
    if (!textContent && absenForm.status !== "Hadir") {
      alert("Mohon isi keterangan/kegiatan.");
      return;
    }

    setIsSubmitting(true);
    const formData = new FormData();
    formData.append("tipe", "absen");
    formData.append("status", absenForm.status);
    formData.append("waktu", absenForm.waktuLokasi);
    formData.append("lokasi", absenForm.lokasi);
    formData.append("keterangan", absenForm.catatan || "");
    formData.append("kegiatan", absenForm.kegiatan || "");
    if (absenForm.foto) formData.append("foto", absenForm.foto);
    if (absenForm.bukti) formData.append("bukti", absenForm.bukti);
    const signatureDataURL = sigCanvas.current
      .getTrimmedCanvas()
      .toDataURL("image/png");
    formData.append("tandaTangan", signatureDataURL);

    try {
      const response = await fetch("/api/absensi", {
        method: "POST",
        body: formData,
      });
      if (!response.ok) throw new Error(await response.text());
      await fetchPresensiHariIni();
      alert("✅ Absensi Berhasil Disimpan!");
      setShowAbsenModal(false);
      clearSignature();
      setAbsenForm({
        status: "Hadir",
        kegiatan: "",
        foto: null,
        lokasi: "",
        waktuLokasi: new Date().toLocaleTimeString(),
        catatan: "",
        bukti: null,
        tandaTangan: null,
      });
    } catch (err: any) {
      alert("Gagal: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePrevious = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };
  const handleNext = () => {
    if (currentPage < Math.ceil(presensiData.length / itemsPerPage))
      setCurrentPage(currentPage + 1);
  };

  if (loading)
    return (
      <div className="flex h-screen bg-gray-50 items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  if (error)
    return (
      <div className="flex h-screen bg-gray-50 items-center justify-center text-red-600 font-bold">
        {error}
      </div>
    );

  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentData = presensiData.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar />
        <main className="flex-1 p-6 sm:p-8 lg:p-12 overflow-y-auto w-full">
          <div className="mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
              <Calendar className="w-10 h-10 text-indigo-600" /> Absensi
            </h1>
            <p className="text-gray-600">
              Lakukan absen setiap hari dengan konsisten.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow border border-gray-100 mb-8 flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-500 font-medium">
                Tanggal Hari Ini
              </p>
              <p className="text-xl font-bold text-gray-900">
                {new Date().toLocaleDateString("id-ID", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>
            <button
              onClick={() => setShowAbsenModal(true)}
              className="px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl shadow hover:scale-105 transition-transform flex items-center gap-2"
            >
              <CheckSquare className="w-5 h-5" /> Isi Absensi
            </button>
          </div>

          <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl border border-gray-200 overflow-hidden mb-8">
            <div className="p-4 sm:p-8 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-lg sm:text-2xl font-bold text-gray-900 flex items-center gap-2">
                <ClockIcon className="w-5 h-5 sm:w-7 sm:h-7 text-indigo-600" />
                Riwayat Hari Ini
              </h3>
            </div>

            <div className="w-full overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300">
              <table className="w-full table-auto min-w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="px-2 py-3 sm:px-6 sm:py-4 text-left font-semibold text-gray-700 rounded-tl-xl text-xs sm:text-base">
                      Status
                    </th>
                    <th className="px-2 py-3 sm:px-6 sm:py-4 text-left font-semibold text-gray-700 text-xs sm:text-base">
                      Waktu
                    </th>
                    <th className="px-2 py-3 sm:px-6 sm:py-4 text-left font-semibold text-gray-700 text-xs sm:text-base hidden sm:table-cell">
                      Lokasi
                    </th>
                    <th className="px-2 py-3 sm:px-6 sm:py-4 text-center font-semibold text-gray-700 text-xs sm:text-base">
                      Foto
                    </th>
                    <th className="px-2 py-3 sm:px-6 sm:py-4 text-center font-semibold text-gray-700 text-xs sm:text-base">
                      TTD
                    </th>
                    <th className="px-2 py-3 sm:px-6 sm:py-4 text-left font-semibold text-gray-700 rounded-tr-xl text-xs sm:text-base hidden md:table-cell">
                      Keterangan
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {currentData.length === 0 ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="py-12 text-center text-gray-500 text-sm sm:text-base"
                      >
                        Belum ada data.
                      </td>
                    </tr>
                  ) : (
                    currentData.map((item) => (
                      <tr
                        key={item.id}
                        className="border-b border-gray-100 hover:bg-indigo-50 transition-colors"
                      >
                        <td className="px-2 py-3 sm:px-6 sm:py-4 text-xs sm:text-base">
                          <div className="flex items-center gap-1 sm:gap-2">
                            {item.status === "Hadir" && (
                              <CheckSquare className="w-3 h-3 sm:w-4 sm:h-4 text-green-600 shrink-0" />
                            )}
                            <span
                              className={`px-2 py-1 rounded text-xs font-semibold ${item.status === "Hadir" ? "bg-green-100 text-green-800" : item.status === "Pulang" ? "bg-blue-100 text-blue-800" : item.status === "Izin" ? "bg-yellow-100 text-yellow-800" : "bg-gray-100 text-gray-800"}`}
                            >
                              {item.status}
                            </span>
                          </div>
                        </td>
                        <td className="px-2 py-3 sm:px-6 sm:py-4 text-gray-700 text-xs sm:text-base whitespace-nowrap">
                          {item.waktu}
                        </td>
                        <td className="px-2 py-3 sm:px-6 sm:py-4 text-gray-700 text-xs sm:text-base hidden sm:table-cell">
                          {item.lokasi ? (
                            <a
                              href={`https://www.google.com/maps?q=${item.lokasi}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline flex items-center gap-1"
                            >
                              <MapPin className="w-3 h-3" /> Map
                            </a>
                          ) : (
                            "-"
                          )}
                        </td>
                        <td className="px-2 py-3 sm:px-6 sm:py-4 text-center">
                          {item.foto ? (
                            <div
                              className="flex justify-center cursor-pointer group"
                              onClick={() => openPreview(item.foto, "foto")}
                              title="Klik untuk memperbesar"
                            >
                              <div className="relative w-10 h-10 sm:w-12 sm:h-12 border rounded overflow-hidden shadow-sm hover:shadow-md transition-all">
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
                              <Camera className="w-5 h-5" />
                            </div>
                          )}
                        </td>
                        <td className="px-2 py-3 sm:px-6 sm:py-4 text-center">
                          {item.tandaTangan ? (
                            <div
                              className="flex justify-center cursor-pointer group"
                              onClick={() =>
                                openPreview(item.tandaTangan, "ttd")
                              }
                              title="Klik untuk memperbesar"
                            >
                              <div className="relative w-10 h-10 sm:w-12 sm:h-12 border rounded bg-white overflow-hidden shadow-sm hover:shadow-md transition-all">
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
                        <td className="px-2 py-3 sm:px-6 sm:py-4 text-gray-700 text-xs sm:text-base hidden md:table-cell">
                          {item.catatan || item.kegiatan || "-"}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="p-4 sm:p-8 bg-gray-50 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-xs sm:text-sm text-gray-600 font-medium">
                Menampilkan {presensiData.length === 0 ? 0 : startIndex + 1}–
                {Math.min(startIndex + itemsPerPage, presensiData.length)} dari{" "}
                {presensiData.length}
              </p>
              <div className="flex gap-2 w-full sm:w-auto">
                <button
                  disabled={currentPage === 1}
                  onClick={handlePrevious}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-1 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm disabled:opacity-50"
                >
                  <ChevronLeft className="w-4 h-4" /> Prev
                </button>
                <button
                  disabled={
                    currentPage >= Math.ceil(presensiData.length / itemsPerPage)
                  }
                  onClick={handleNext}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-1 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm disabled:opacity-50"
                >
                  Next <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {showAbsenModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div
                className="fixed inset-0 bg-black/60 backdrop-blur-sm"
                onClick={() => !isSubmitting && setShowAbsenModal(false)}
              ></div>
              <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl relative z-10 animate-fade-scale overflow-hidden flex flex-col max-h-[90vh]">
                <div className="p-6 border-b flex justify-between items-center bg-gray-50">
                  <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <Edit className="w-5 h-5 text-indigo-600" /> Form Absensi
                  </h3>
                  <button
                    onClick={() => setShowAbsenModal(false)}
                    disabled={isSubmitting}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XCircle className="w-8 h-8" />
                  </button>
                </div>
                <div className="p-6 overflow-y-auto">
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleAbsenSubmit();
                    }}
                    className="space-y-5"
                  >
                    <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4">
                      <h4 className="text-sm font-semibold text-indigo-700 mb-3 flex items-center gap-2">
                        <User className="w-4 h-4" /> Data Diri
                      </h4>
                      <div className="grid grid-cols-2 gap-3">
                        {[
                          {
                            label: "Nama",
                            icon: <User className="w-3 h-3" />,
                            val: siswaData.nama,
                          },
                          {
                            label: "NIS",
                            icon: <Hash className="w-3 h-3" />,
                            val: siswaData.nis,
                          },
                          {
                            label: "Kelas",
                            icon: <BookOpen className="w-3 h-3" />,
                            val: siswaData.kelas,
                          },
                          {
                            label: "Tempat PKL",
                            icon: <MapPin className="w-3 h-3" />,
                            val: siswaData.tempatPKL,
                          },
                        ].map((f) => (
                          <div key={f.label} className="flex flex-col gap-1">
                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide flex items-center gap-1">
                              {f.icon} {f.label}
                            </label>
                            <input
                              type="text"
                              value={f.val || "-"}
                              disabled
                              readOnly
                              className="px-3 py-2 rounded-lg border border-gray-200 bg-gray-100 text-gray-700 text-sm cursor-not-allowed"
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Status Kehadiran
                      </label>
                      <select
                        value={absenForm.status}
                        onChange={(e) =>
                          setAbsenForm((prev) => ({
                            ...prev,
                            status: e.target.value,
                          }))
                        }
                        disabled={isSubmitting}
                        className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                      >
                        <option value="Hadir">Hadir</option>
                        <option value="Pulang">Pulang</option>
                        <option value="Izin">Izin</option>
                        <option value="Sakit">Sakit</option>
                        <option value="Libur">Libur</option>
                      </select>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1">
                          <ClockIcon className="w-4 h-4" /> Waktu
                        </label>
                        <input
                          type="text"
                          value={absenForm.waktuLokasi}
                          readOnly
                          className="w-full px-4 py-2.5 rounded-xl bg-gray-100 text-gray-600 cursor-not-allowed"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1">
                          <MapPin className="w-4 h-4" /> Lokasi (GPS){" "}
                          <span className="text-red-500">*</span>
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={absenForm.lokasi}
                            readOnly
                            placeholder="Koordinat..."
                            className="w-full px-4 py-2.5 rounded-xl bg-gray-100 text-gray-600 text-sm"
                          />
                          <button
                            type="button"
                            onClick={getCurrentLocation}
                            disabled={isSubmitting || gpsLoading}
                            className="px-3 bg-indigo-100 text-indigo-700 rounded-xl hover:bg-indigo-200 transition-colors flex items-center justify-center min-w-[44px]"
                          >
                            {gpsLoading ? (
                              <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                              <MapPin className="w-5 h-5" />
                            )}
                          </button>
                        </div>
                        {gpsError && (
                          <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 leading-relaxed">
                            ⚠️ {gpsError}
                          </div>
                        )}
                        {absenForm.lokasi && !gpsError && !gpsLoading && (
                          <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-xl text-xs text-green-700 flex items-center gap-1">
                            ✅ Lokasi berhasil diambil
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1">
                        <Camera className="w-4 h-4" /> Foto Selfie / Lokasi{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="file"
                        accept="image/*"
                        capture="user"
                        disabled={isSubmitting}
                        onChange={(e) => {
                          const file = e.target.files?.[0] || null;
                          setAbsenForm((prev) => ({ ...prev, foto: file }));
                        }}
                        className="w-full px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Wajib ambil foto selfie terbaru.
                      </p>
                    </div>

                    {isStatusIzinOrSakit && (
                      <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-100">
                        <label className="text-sm font-semibold text-yellow-800 mb-2 flex items-center gap-1">
                          <UploadCloud className="w-4 h-4" /> Upload Surat Bukti
                          (Dokter/Ortu)
                        </label>
                        <input
                          type="file"
                          accept="image/*,.pdf"
                          disabled={isSubmitting}
                          onChange={(e) => {
                            const file = e.target.files?.[0] || null;
                            setAbsenForm((prev) => ({ ...prev, bukti: file }));
                          }}
                          className="w-full text-sm text-yellow-700"
                        />
                      </div>
                    )}

                    <div>
                      <label className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1">
                        <FileText className="w-4 h-4" />{" "}
                        {isStatusPulang ? "Laporan Kegiatan" : "Keterangan"}
                      </label>
                      <textarea
                        rows={3}
                        disabled={isSubmitting}
                        placeholder={
                          isStatusPulang
                            ? "Apa yang Anda kerjakan hari ini?"
                            : "Tambahkan catatan..."
                        }
                        value={
                          isStatusPulang
                            ? absenForm.kegiatan
                            : absenForm.catatan
                        }
                        onChange={(e) => {
                          const val = e.target.value;
                          if (isStatusPulang) {
                            setAbsenForm((prev) => ({
                              ...prev,
                              kegiatan: val,
                              catatan: "",
                            }));
                          } else {
                            setAbsenForm((prev) => ({
                              ...prev,
                              catatan: val,
                              kegiatan: "",
                            }));
                          }
                        }}
                        className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <label className="text-sm font-semibold text-gray-700 flex items-center gap-1">
                          <PenTool className="w-4 h-4" /> Tanda Tangan{" "}
                          <span className="text-red-500">*</span>
                        </label>
                        <button
                          type="button"
                          onClick={clearSignature}
                          className="text-xs text-red-500 flex items-center gap-1 hover:text-red-700 font-medium px-2 py-1 rounded hover:bg-red-50 transition-colors"
                        >
                          <Trash2 className="w-3 h-3" /> Hapus / Ulangi
                        </button>
                      </div>
                      <div className="border-2 border-dashed border-gray-300 rounded-xl overflow-hidden bg-gray-50 hover:bg-gray-100 transition-colors cursor-crosshair touch-none">
                        <SignatureCanvas
                          ref={sigCanvas}
                          penColor="black"
                          velocityFilterWeight={0.7}
                          canvasProps={{
                            className: "w-full h-40 block",
                            style: { width: "100%", height: "160px" },
                          }}
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        *Gambar tanda tangan Anda pada kotak di atas.
                      </p>
                    </div>

                    <div className="pt-4 flex gap-3">
                      <button
                        type="button"
                        onClick={() => setShowAbsenModal(false)}
                        disabled={isSubmitting}
                        className="flex-1 py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-colors"
                      >
                        Batal
                      </button>
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="flex-1 py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 flex justify-center items-center gap-2"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin" />{" "}
                            Mengirim...
                          </>
                        ) : (
                          "Kirim Data"
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {previewUrl && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center"
          style={{ animation: "fadeIn 0.2s ease" }}
          onClick={() => setPreviewUrl(null)}
        >
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(135deg, rgba(15,23,42,0.95) 0%, rgba(30,27,75,0.95) 100%)",
              backdropFilter: "blur(20px)",
            }}
          />
          <div
            className="absolute top-0 left-0 w-96 h-96 rounded-full opacity-10"
            style={{
              background: "radial-gradient(circle, #6366f1, transparent)",
              filter: "blur(60px)",
              transform: "translate(-30%, -30%)",
            }}
          />
          <div
            className="absolute bottom-0 right-0 w-96 h-96 rounded-full opacity-10"
            style={{
              background: "radial-gradient(circle, #8b5cf6, transparent)",
              filter: "blur(60px)",
              transform: "translate(30%, 30%)",
            }}
          />
          <div
            className="relative w-full mx-4 flex flex-col items-center"
            style={{
              maxWidth: previewType === "ttd" ? "480px" : "720px",
              animation: "scaleIn 0.25s cubic-bezier(0.34,1.56,0.64,1)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-4 self-start">
              <div
                className="flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold tracking-widest uppercase"
                style={{
                  background: "rgba(99,102,241,0.2)",
                  border: "1px solid rgba(99,102,241,0.4)",
                  color: "#a5b4fc",
                }}
              >
                {previewType === "ttd" ? (
                  <PenTool className="w-3 h-3" />
                ) : (
                  <ImageIcon className="w-3 h-3" />
                )}
                {previewType === "ttd" ? "Tanda Tangan" : "Foto Absensi"}
              </div>
            </div>
            <div
              className="w-full rounded-2xl overflow-hidden relative"
              style={{
                background:
                  previewType === "ttd"
                    ? "rgba(255,255,255,0.98)"
                    : "transparent",
                boxShadow:
                  "0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.08)",
                padding: previewType === "ttd" ? "32px" : "0",
              }}
            >
              {previewType !== "ttd" && (
                <div
                  className="absolute inset-0 rounded-2xl"
                  style={{
                    background:
                      "linear-gradient(to bottom, transparent 60%, rgba(15,23,42,0.8))",
                    zIndex: 1,
                    pointerEvents: "none",
                  }}
                />
              )}
              <img
                src={previewUrl}
                alt={previewType === "foto" ? "Foto Absensi" : "Tanda Tangan"}
                className="w-full block"
                style={{
                  maxHeight: previewType === "ttd" ? "200px" : "70vh",
                  objectFit: previewType === "ttd" ? "contain" : "cover",
                  borderRadius: previewType === "ttd" ? "0" : "16px",
                }}
              />
            </div>
            <div className="flex items-center justify-between w-full mt-4 px-1">
              <p className="text-xs" style={{ color: "rgba(165,180,252,0.6)" }}>
                Klik di luar untuk menutup
              </p>
              <button
                onClick={() => setPreviewUrl(null)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all"
                style={{
                  background: "rgba(255,255,255,0.08)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  color: "rgba(255,255,255,0.8)",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = "rgba(255,255,255,0.15)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "rgba(255,255,255,0.08)")
                }
              >
                <X className="w-4 h-4" /> Tutup
              </button>
            </div>
          </div>
          <style>{`
            @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
            @keyframes scaleIn { from { opacity: 0; transform: scale(0.92) translateY(12px); } to { opacity: 1; transform: scale(1) translateY(0); } }
          `}</style>
        </div>
      )}
    </div>
  );
}
