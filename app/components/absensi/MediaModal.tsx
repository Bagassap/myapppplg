"use client";
import { X, MapPin, Image as ImageIcon, PenTool, ExternalLink } from "lucide-react";

interface MediaModalProps {
  type: "foto" | "ttd" | "lokasi";
  data: string;
  onClose: () => void;
}

export default function MediaModal({ type, data, onClose }: MediaModalProps) {
  const mapsUrl = `https://www.google.com/maps?q=${encodeURIComponent(data)}`;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      onClick={onClose}
      style={{ animation: "mmFadeIn .15s ease" }}
    >
      <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md" />
      <div
        className="relative max-w-2xl w-full flex flex-col"
        onClick={(e) => e.stopPropagation()}
        style={{ animation: "mmScaleIn .2s cubic-bezier(0.34,1.56,0.64,1)" }}
      >
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
            {type === "ttd" ? (
              <PenTool className="w-3 h-3" />
            ) : type === "lokasi" ? (
              <MapPin className="w-3 h-3" />
            ) : (
              <ImageIcon className="w-3 h-3" />
            )}
            {type === "ttd" ? "Tanda Tangan" : type === "lokasi" ? "Lokasi GPS" : "Foto Absensi"}
          </span>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-xl transition-colors"
          >
            <X className="w-4 h-4 text-[#ACEC00]" />
          </button>
        </div>

        {type === "lokasi" ? (
          <div className="rounded-2xl shadow-2xl overflow-hidden bg-[#012444] border border-[#1e3a5f] p-6">
            <div className="flex items-start gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-[#013FF6]/20 flex items-center justify-center shrink-0 mt-0.5">
                <MapPin className="w-5 h-5 text-[#013FF6]" />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-1">Koordinat GPS</p>
                <p className="font-mono text-sm font-bold text-white break-all">{data}</p>
              </div>
            </div>
            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-3 bg-[#013FF6] hover:bg-[#0030c8] text-white rounded-xl font-semibold text-sm transition-colors shadow-md"
            >
              <ExternalLink className="w-4 h-4" /> Buka di Google Maps
            </a>
          </div>
        ) : (
          <div
            className={`rounded-2xl overflow-hidden shadow-2xl ${type === "ttd" ? "bg-white p-8" : ""}`}
          >
            <img
              src={data}
              alt={type === "ttd" ? "Tanda Tangan" : "Foto Absensi"}
              className="w-full block"
              style={{
                maxHeight: "72vh",
                objectFit: type === "ttd" ? "contain" : "cover",
                borderRadius: type === "ttd" ? 0 : 16,
              }}
            />
          </div>
        )}

        <p className="text-center text-xs text-gray-500 mt-3">Klik di luar untuk menutup</p>
      </div>
      <style>{`
        @keyframes mmFadeIn { from { opacity:0 } to { opacity:1 } }
        @keyframes mmScaleIn { from { opacity:0; transform:scale(0.94) translateY(8px) } to { opacity:1; transform:scale(1) translateY(0) } }
      `}</style>
    </div>
  );
}
