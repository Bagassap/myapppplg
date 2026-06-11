"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Sidebar from "@/components/layout/SidebarSiswa";
import TopBar from "@/components/layout/TopBar";

interface Informasi {
  id: number;
  judul: string;
  konten: string;
  createdAt: string;
  pembuat: string;
}

const clamp2: React.CSSProperties = {
  overflow: "hidden",
  display: "-webkit-box",
  WebkitLineClamp: 2,
  WebkitBoxOrient: "vertical",
};

export default function SiswaInformasiPage() {
  useSession();
  const [list, setList] = useState<Informasi[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Informasi | null>(null);
  const [hoveredId, setHoveredId] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/informasi")
      .then(r => r.json())
      .then(d => { setList(d.data || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div style={{ display: "flex", height: "100vh", background: "#00182E", overflow: "hidden" }}>
      <Sidebar />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, overflow: "hidden" }}>
        <TopBar />
        <main style={{ flex: 1, overflowY: "auto", padding: "28px 32px", background: "#00182E" }}>

          {/* Header */}
          <div style={{ marginBottom: "28px" }}>
            <h1 style={{ color: "#ACEC00", fontSize: "26px", fontWeight: 800, margin: 0, letterSpacing: "-0.3px" }}>
              Informasi PKL
            </h1>
            <p style={{ color: "rgba(255,255,255,0.45)", fontSize: "13px", marginTop: "6px", marginBottom: 0 }}>
              {loading ? "Memuat..." : `${list.length} informasi`}
            </p>
          </div>

          {loading && (
            <p style={{ color: "rgba(255,255,255,0.5)", textAlign: "center", marginTop: "80px", fontSize: "14px" }}>Memuat...</p>
          )}

          {!loading && list.length === 0 && (
            <div style={{ textAlign: "center", marginTop: "80px" }}>
              <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "16px", marginBottom: "8px" }}>Belum ada informasi</p>
              <p style={{ color: "rgba(255,255,255,0.3)", fontSize: "13px" }}>Informasi dari guru atau admin akan muncul di sini.</p>
            </div>
          )}

          {!loading && list.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px", maxWidth: "768px" }}>
              {list.map(item => (
                <div
                  key={item.id}
                  onClick={() => setSelected(item)}
                  onMouseEnter={() => setHoveredId(item.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  style={{
                    background: "white",
                    borderRadius: "14px",
                    padding: "18px 20px 18px 22px",
                    borderLeft: "4px solid #ACEC00",
                    cursor: "pointer",
                    transform: hoveredId === item.id ? "translateY(-2px)" : "none",
                    boxShadow: hoveredId === item.id ? "0 8px 24px rgba(0,0,0,0.2)" : "0 1px 4px rgba(0,0,0,0.08)",
                    transition: "transform 0.15s, box-shadow 0.15s",
                  }}
                >
                  <h2 style={{ color: "#00182E", fontWeight: 700, fontSize: "15px", margin: "0 0 6px 0", lineHeight: "1.4" }}>
                    {item.judul}
                  </h2>
                  <p style={{ ...clamp2, color: "#555", fontSize: "13px", margin: "0 0 10px 0", lineHeight: "1.5" }}>
                    {item.konten}
                  </p>
                  <p style={{ color: "#999", fontSize: "12px", margin: 0 }}>
                    {item.pembuat} · {new Date(item.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                  </p>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Detail Modal */}
      {selected && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50, padding: "16px" }}>
          <div style={{ background: "white", borderRadius: "16px", padding: "28px", maxWidth: "600px", width: "100%", maxHeight: "80vh", overflowY: "auto" }}>
            <h2 style={{ color: "#00182E", fontWeight: 800, fontSize: "20px", margin: "0 0 8px 0" }}>{selected.judul}</h2>
            <p style={{ color: "#999", fontSize: "12px", margin: "0 0 20px 0" }}>
              {selected.pembuat} · {new Date(selected.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
            </p>
            <p style={{ color: "#333", lineHeight: 1.7, whiteSpace: "pre-wrap", margin: 0, fontSize: "14px" }}>{selected.konten}</p>
            <div style={{ marginTop: "24px" }}>
              <button onClick={() => setSelected(null)} style={{ background: "#00182E", color: "#ACEC00", padding: "8px 24px", borderRadius: "8px", border: "none", cursor: "pointer", fontWeight: 600, fontSize: "13px" }}>
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
