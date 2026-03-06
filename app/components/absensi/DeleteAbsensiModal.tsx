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
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const STATUS_COLOR: Record<string, string> = {
    Hadir: "text-emerald-600",
    Izin: "text-amber-600",
    Sakit: "text-orange-600",
    Alfa: "text-red-600",
    Pulang: "text-sky-600",
  };

  return (
    <>
      {/* Trigger button */}
      <button
        onClick={() => {
          setOpen(true);
          setError(null);
        }}
        className="flex items-center gap-1.5 px-2.5 py-1.5 bg-red-50 /20 hover:bg-red-100 /30 text-red-600 rounded-lg text-xs font-semibold transition-colors border border-red-200 "
        title="Hapus data absensi"
      >
        <Trash2 className="w-3 h-3" />
        <span className="hidden sm:inline">Hapus</span>
      </button>

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => !loading && setOpen(false)}
          />
          <div
            className="relative bg-white w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden"
            style={{ animation: "scaleIn .2s cubic-bezier(0.34,1.56,0.64,1)" }}
          >
            {/* Header */}
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 bg-red-100 rounded-lg">
                  <AlertTriangle className="w-4 h-4 text-red-600" />
                </div>
                <h3 className="font-semibold text-gray-800 ">Hapus Absensi</h3>
              </div>
              <button
                onClick={() => !loading && setOpen(false)}
                className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-4 h-4 text-gray-400" />
              </button>
            </div>

            {/* Body */}
            <div className="px-5 py-5">
              <p className="text-sm text-gray-500 mb-4">
                Data berikut akan dihapus secara permanen:
              </p>

              {/* Info card */}
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-4 space-y-2.5">
                {[
                  {
                    label: "Siswa",
                    val: namaSiswa,
                    cls: "font-semibold text-gray-800 ",
                  },
                  { label: "Tanggal", val: tanggal, cls: "text-gray-600 " },
                  {
                    label: "Status",
                    val: status,
                    cls: `font-semibold ${STATUS_COLOR[status] ?? "text-gray-600 "}`,
                  },
                  {
                    label: "ID",
                    val: `#${absensiId}`,
                    cls: "font-mono text-xs text-gray-400 ",
                  },
                ].map((r) => (
                  <div
                    key={r.label}
                    className="flex items-center justify-between gap-4"
                  >
                    <span className="text-xs text-gray-400 font-medium">
                      {r.label}
                    </span>
                    <span className={`text-sm text-right ${r.cls}`}>
                      {r.val}
                    </span>
                  </div>
                ))}
              </div>

              <p className="text-xs text-red-500 font-medium mb-5 flex items-center gap-1.5">
                <AlertTriangle className="w-3 h-3 shrink-0" /> Tindakan ini
                tidak dapat dibatalkan.
              </p>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 text-xs px-3 py-2.5 rounded-xl mb-4 font-medium">
                  {error}
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => setOpen(false)}
                  disabled={loading}
                  className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition-colors text-sm font-medium disabled:opacity-50"
                >
                  Batal
                </button>
                <button
                  onClick={handleDelete}
                  disabled={loading}
                  className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl transition-colors text-sm font-semibold disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Menghapus…
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4" /> Hapus
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
          <style>{`@keyframes scaleIn { from{opacity:0;transform:scale(0.92) translateY(10px)} to{opacity:1;transform:scale(1) translateY(0)} }`}</style>
        </div>
      )}
    </>
  );
}
