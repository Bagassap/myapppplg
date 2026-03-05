// components/absensi/DeleteAbsensiModal.tsx
"use client";

import { useState } from "react";
import { Trash2, X, AlertTriangle, Loader2 } from "lucide-react";

interface Props {
  absensiId: number;
  namaSiswa: string;
  tanggal: string;
  status: string;
  onSuccess: (deletedId: number) => void;
}

export default function DeleteAbsensiModal({
  absensiId,
  namaSiswa,
  tanggal,
  status,
  onSuccess,
}: Props) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/absensi/${absensiId}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Gagal menghapus");
      setOpen(false);
      onSuccess(absensiId);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Tombol hapus di tabel */}
      <button
        onClick={() => {
          setOpen(true);
          setError(null);
        }}
        className="flex items-center gap-1 px-3 py-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-xs sm:text-sm font-medium"
        title="Hapus data absensi"
      >
        <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
        <span className="hidden sm:inline">Hapus</span>
      </button>

      {/* Modal konfirmasi */}
      {open && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => !loading && setOpen(false)}
          />

          <div
            className="relative bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden"
            style={{ animation: "scaleIn 0.2s cubic-bezier(0.34,1.56,0.64,1)" }}
          >
            {/* Header merah */}
            <div className="bg-red-500 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-1.5 bg-white/20 rounded-lg">
                  <AlertTriangle className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-bold text-white text-lg">
                  Hapus Data Absensi
                </h3>
              </div>
              <button
                onClick={() => !loading && setOpen(false)}
                className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            {/* Body */}
            <div className="px-6 py-5">
              <p className="text-gray-600 text-sm mb-4">
                Anda akan menghapus data absensi berikut secara permanen:
              </p>

              {/* Info card */}
              <div className="bg-red-50 border border-red-100 rounded-xl p-4 mb-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 font-medium">Siswa</span>
                  <span className="text-gray-900 font-semibold">
                    {namaSiswa}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 font-medium">Tanggal</span>
                  <span className="text-gray-900">{tanggal}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 font-medium">Status</span>
                  <span
                    className={`font-semibold ${status === "Hadir" ? "text-green-600" : status === "Izin" ? "text-yellow-600" : "text-gray-600"}`}
                  >
                    {status}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 font-medium">ID</span>
                  <span className="text-gray-400 font-mono text-xs">
                    #{absensiId}
                  </span>
                </div>
              </div>

              <p className="text-xs text-red-500 font-medium mb-5">
                ⚠️ Tindakan ini tidak dapat dibatalkan.
              </p>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-2.5 rounded-xl mb-4">
                  {error}
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={() => setOpen(false)}
                  disabled={loading}
                  className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors text-sm font-medium disabled:opacity-50"
                >
                  Batal
                </button>
                <button
                  onClick={handleDelete}
                  disabled={loading}
                  className="flex-1 px-4 py-2.5 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors text-sm font-medium disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Menghapus...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4" /> Ya, Hapus
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          <style>{`
            @keyframes scaleIn {
              from { opacity: 0; transform: scale(0.92) translateY(12px); }
              to   { opacity: 1; transform: scale(1) translateY(0); }
            }
          `}</style>
        </div>
      )}
    </>
  );
}
