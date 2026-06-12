"use client";

interface MediaModalProps {
  type: "foto" | "ttd" | "lokasi";
  data: string;
  onClose: () => void;
  meta?: { nama?: string; tanggal?: string; waktu?: string };
}

function parseCoords(str: string): { lat: number; lng: number } | null {
  const parts = str.split(",").map((s) => s.trim());
  if (parts.length < 2) return null;
  const lat = parseFloat(parts[0]);
  const lng = parseFloat(parts[1]);
  if (isNaN(lat) || isNaN(lng)) return null;
  return { lat, lng };
}

function InfoChip({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p style={{ color: "#64748b", fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px", margin: "0 0 2px" }}>{label}</p>
      <p style={{ color: "#fff", fontSize: 12, fontWeight: 600, margin: 0 }}>{value}</p>
    </div>
  );
}

const ICON: Record<string, string> = { foto: "📷", ttd: "✍️", lokasi: "📍" };
const LABEL: Record<string, string> = { foto: "Foto Absensi", ttd: "Tanda Tangan", lokasi: "Lokasi GPS" };

export default function MediaModal({ type, data, onClose, meta }: MediaModalProps) {
  const mapsUrl = `https://www.google.com/maps?q=${encodeURIComponent(data)}`;
  const coords = type === "lokasi" ? parseCoords(data) : null;
  const embedUrl = coords
    ? `https://maps.google.com/maps?q=${coords.lat},${coords.lng}&z=15&output=embed&hl=id`
    : null;

  const maxW = type === "lokasi" ? 480 : 680;

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 100,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
        background: "rgba(0,0,0,0.85)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        animation: "mmFadeIn .15s ease",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position: "relative",
          maxWidth: maxW,
          width: "100%",
          borderRadius: 20,
          overflow: "hidden",
          background: "var(--bg-card, #fff)",
          boxShadow: "0 32px 80px rgba(0,0,0,0.7)",
          animation: "mmScaleIn .2s cubic-bezier(0.34,1.56,0.64,1)",
        }}
      >

        <div
          style={{
            background: "#00182E",
            padding: "16px 24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderRadius: "20px 20px 0 0",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 20, lineHeight: 1 }}>{ICON[type]}</span>
            <span style={{ color: "#ACEC00", fontWeight: 700, fontSize: 14, letterSpacing: "0.3px" }}>
              {LABEL[type]}
            </span>
          </div>
          <button
            onClick={onClose}
            style={{
              width: 32,
              height: 32,
              borderRadius: "50%",
              background: "#ACEC00",
              color: "#00182E",
              border: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 900,
              fontSize: 15,
              lineHeight: 1,
              flexShrink: 0,
            }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.transform = "scale(1.1)")}
            onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.transform = "scale(1)")}
          >
            ✕
          </button>
        </div>

        {type === "foto" && (
          <>
            <div style={{ background: "#000", lineHeight: 0 }}>
              <img
                src={data}
                alt="Foto Absensi"
                style={{ width: "100%", maxHeight: "70vh", objectFit: "contain", display: "block" }}
              />
            </div>
            {(meta?.nama || meta?.tanggal || meta?.waktu) && (
              <div
                style={{
                  background: "#00182E",
                  padding: "12px 24px",
                  display: "flex",
                  gap: 24,
                  flexWrap: "wrap",
                  borderTop: "1px solid #1e3a5f",
                }}
              >
                {meta?.nama && <InfoChip label="Siswa" value={meta.nama} />}
                {meta?.tanggal && <InfoChip label="Tanggal" value={meta.tanggal} />}
                {meta?.waktu && <InfoChip label="Waktu" value={meta.waktu} />}
              </div>
            )}
            <div
              style={{
                background: "#00182E",
                padding: "12px 24px",
                display: "flex",
                justifyContent: "flex-end",
                borderTop: "1px solid #1e3a5f",
              }}
            >
              <a
                href={data}
                download="foto-absensi.jpg"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "8px 20px",
                  borderRadius: 10,
                  border: "1.5px solid #ACEC00",
                  color: "#ACEC00",
                  fontSize: 12,
                  fontWeight: 700,
                  textDecoration: "none",
                  background: "transparent",
                  cursor: "pointer",
                }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLAnchorElement).style.background = "rgba(172,236,0,0.1)")}
                onMouseLeave={(e) => ((e.currentTarget as HTMLAnchorElement).style.background = "transparent")}
              >
                ⬇ Download Foto
              </a>
            </div>
          </>
        )}

        {type === "ttd" && (
          <>
            <div
              style={{
                background: "#fff",
                padding: 24,
                textAlign: "center",
                border: "2px solid #ACEC00",
                borderTop: 0,
                borderLeft: 0,
                borderRight: 0,
              }}
            >
              <img
                src={data}
                alt="Tanda Tangan"
                style={{ maxHeight: 300, maxWidth: "100%", objectFit: "contain", display: "inline-block" }}
              />
              <p
                style={{
                  color: "#013FF6",
                  fontSize: 11,
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "1px",
                  marginTop: 16,
                  marginBottom: 0,
                }}
              >
                Tanda Tangan Siswa
              </p>
            </div>
            <div
              style={{
                background: "#00182E",
                padding: "12px 24px",
                display: "flex",
                justifyContent: "flex-end",
              }}
            >
              <a
                href={data}
                download="tanda-tangan.png"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "8px 20px",
                  borderRadius: 10,
                  border: "1.5px solid #ACEC00",
                  color: "#ACEC00",
                  fontSize: 12,
                  fontWeight: 700,
                  textDecoration: "none",
                  background: "transparent",
                  cursor: "pointer",
                }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLAnchorElement).style.background = "rgba(172,236,0,0.1)")}
                onMouseLeave={(e) => ((e.currentTarget as HTMLAnchorElement).style.background = "transparent")}
              >
                ⬇ Download TTD
              </a>
            </div>
          </>
        )}

        {type === "lokasi" && (
          <div style={{ background: "var(--bg-card, #fff)", padding: 24 }}>
            <div
              style={{
                background: "#00182E",
                borderRadius: 14,
                padding: "14px 18px",
                marginBottom: 16,
                display: "flex",
                alignItems: "flex-start",
                gap: 12,
              }}
            >
              <span style={{ fontSize: 24, lineHeight: 1, marginTop: 2, flexShrink: 0 }}>📍</span>
              <div style={{ minWidth: 0 }}>
                <p
                  style={{
                    color: "#94a3b8",
                    fontSize: 9,
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "1px",
                    margin: "0 0 4px",
                  }}
                >
                  Koordinat GPS
                </p>
                <p
                  style={{
                    color: "#fff",
                    fontFamily: "monospace",
                    fontSize: 13,
                    fontWeight: 700,
                    margin: 0,
                    wordBreak: "break-all",
                  }}
                >
                  {data}
                </p>
              </div>
            </div>

            {embedUrl && (
              <div
                style={{
                  borderRadius: 14,
                  overflow: "hidden",
                  marginBottom: 16,
                  border: "1.5px solid #1e3a5f",
                }}
              >
                <iframe
                  src={embedUrl}
                  width="100%"
                  height="200"
                  style={{ display: "block", border: "none" }}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Peta Lokasi"
                />
              </div>
            )}

            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                width: "100%",
                padding: "12px",
                borderRadius: 12,
                background: "#013FF6",
                color: "#fff",
                fontWeight: 700,
                fontSize: 13,
                textDecoration: "none",
                boxSizing: "border-box",
              }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLAnchorElement).style.background = "#0030c8")}
              onMouseLeave={(e) => ((e.currentTarget as HTMLAnchorElement).style.background = "#013FF6")}
            >
              🗺️ Buka di Google Maps
            </a>
          </div>
        )}
      </div>

      <style>{`
        @keyframes mmFadeIn  { from { opacity:0 }                                    to { opacity:1 } }
        @keyframes mmScaleIn { from { opacity:0; transform:scale(0.9) translateY(16px) } to { opacity:1; transform:scale(1) translateY(0) } }
      `}</style>
    </div>
  );
}
