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

  useEffect(() => {
    fetch("/api/informasi")
      .then(r => r.json())
      .then(d => { setList(d.data || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div style={{ display: "flex", height: "100vh", background: "#f9fafb", overflow: "hidden" }}>
      <Sidebar />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, overflow: "hidden" }}>
        <TopBar />
        <main style={{ flex: 1, overflowY: "auto", padding: "28px 32px", background: "#f9fafb" }}>

          {/* Header */}
          <div style={{ marginBottom: "28px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
              <span style={{ display: "block", width: "4px", height: "24px", background: "#013FF6", borderRadius: "4px" }} />
              <h1 style={{ color: "#111827", fontSize: "22px", fontWeight: 700, margin: 0, letterSpacing: "-0.3px" }}>
                Informasi PKL
              </h1>
            </div>
            <p style={{ color: "#6b7280", fontSize: "13px", marginLeft: "14px" }}>
              {loading ? "Memuat data..." : `${list.length} informasi tersedia`}
            </p>
          </div>

          {/* Loading */}
          {loading && (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px", maxWidth: "768px" }}>
              {[1, 2, 3].map(i => (
                <div key={i} style={{ background: "white", borderRadius: "16px", padding: "20px", border: "1px solid #e5e7eb" }}>
                  <div style={{ background: "#f3f4f6", borderRadius: "8px", height: "16px", width: "60%", marginBottom: "10px" }} />
                  <div style={{ background: "#f3f4f6", borderRadius: "8px", height: "12px", width: "90%", marginBottom: "6px" }} />
                  <div style={{ background: "#f3f4f6", borderRadius: "8px", height: "12px", width: "70%" }} />
                </div>
              ))}
            </div>
          )}

          {/* Empty */}
          {!loading && list.length === 0 && (
            <div style={{ textAlign: "center", marginTop: "80px" }}>
              <div style={{ width: "56px", height: "56px", background: "#00182E", borderRadius: "14px", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", fontSize: "24px" }}>
                📢
              </div>
              <p style={{ color: "#374151", fontSize: "16px", fontWeight: 600, marginBottom: "6px" }}>Belum ada informasi</p>
              <p style={{ color: "#9ca3af", fontSize: "13px" }}>Informasi dari guru atau admin akan muncul di sini.</p>
            </div>
          )}

          {/* Card List */}
          {!loading && list.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px", maxWidth: "768px" }}>
              {list.map(item => (
                <div
                  key={item.id}
                  onClick={() => setSelected(item)}
                  style={{
                    background: "white",
                    borderRadius: "16px",
                    padding: "18px 20px 18px 0",
                    border: "1px solid #e5e7eb",
                    borderLeftWidth: "4px",
                    borderLeftColor: "#ACEC00",
                    cursor: "pointer",
                    boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
                    transition: "box-shadow 0.15s, transform 0.15s",
                  }}
                  onMouseEnter={e => {
                    const el = e.currentTarget as HTMLDivElement;
                    el.style.boxShadow = "0 6px 20px rgba(0,0,0,0.12)";
                    el.style.transform = "translateY(-2px)";
                  }}
                  onMouseLeave={e => {
                    const el = e.currentTarget as HTMLDivElement;
                    el.style.boxShadow = "0 1px 4px rgba(0,0,0,0.06)";
                    el.style.transform = "none";
                  }}
                >
                  <div style={{ paddingLeft: "20px" }}>
                    <h2 style={{ color: "#111827", fontWeight: 700, fontSize: "15px", margin: "0 0 6px 0", lineHeight: "1.4" }}>
                      {item.judul}
                    </h2>
                    <p style={{ ...clamp2, color: "#6b7280", fontSize: "13px", margin: "0 0 10px 0", lineHeight: "1.5" }}>
                      {item.konten}
                    </p>
                    <p style={{ color: "#013FF6", fontSize: "12px", margin: 0, fontWeight: 500 }}>
                      {item.pembuat} · {new Date(item.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Detail Modal */}
      {selected && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50, padding: "16px" }}
          onClick={() => setSelected(null)}>
          <div style={{ background: "white", borderRadius: "20px", padding: "28px", maxWidth: "620px", width: "100%", maxHeight: "80vh", overflowY: "auto", boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}
            onClick={e => e.stopPropagation()}>
            <div style={{ borderLeft: "4px solid #ACEC00", paddingLeft: "14px", marginBottom: "20px" }}>
              <h2 style={{ color: "#111827", fontWeight: 800, fontSize: "20px", margin: "0 0 6px 0" }}>{selected.judul}</h2>
              <p style={{ color: "#013FF6", fontSize: "12px", margin: 0, fontWeight: 500 }}>
                {selected.pembuat} · {new Date(selected.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
              </p>
            </div>
            <p style={{ color: "#374151", lineHeight: 1.7, whiteSpace: "pre-wrap", margin: "0 0 24px 0", fontSize: "14px" }}>{selected.konten}</p>
            <div style={{ borderTop: "1px solid #f3f4f6", paddingTop: "20px" }}>
              <button onClick={() => setSelected(null)} style={{ background: "#00182E", color: "#ACEC00", padding: "9px 24px", borderRadius: "9px", border: "none", cursor: "pointer", fontWeight: 600, fontSize: "13px" }}>
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
