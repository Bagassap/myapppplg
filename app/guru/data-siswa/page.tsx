"use client";
import { useEffect, useState } from "react";
import Sidebar from "@/components/layout/SidebarGuru";
import TopBar from "@/components/layout/TopBar";

interface Siswa {
  id: number; userId: string; name: string; email: string;
  kelas: string; jurusan: string; tempatPKL: string;
  guruPembimbing: string; noHp: string; alamat: string; isActive: boolean;
}

function initials(name: string) {
  return name.split(" ").slice(0, 2).map(w => w[0]).join("").toUpperCase() || "?";
}

export default function GuruDataSiswa() {
  const [list, setList] = useState<Siswa[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [detail, setDetail] = useState<Siswa | null>(null);
  const [hoveredId, setHoveredId] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/data-siswa")
      .then(r => r.json())
      .then(d => { setList(d.data || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const filtered = search
    ? list.filter(s =>
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.userId.toLowerCase().includes(search.toLowerCase()) ||
        s.kelas.toLowerCase().includes(search.toLowerCase())
      )
    : list;

  const cardStyle = (id: number): React.CSSProperties => ({
    position: "relative", background: hoveredId === id ? "#01305e" : "#012444",
    borderRadius: "16px", padding: "20px", cursor: "pointer",
    border: hoveredId === id ? "1px solid rgba(172,236,0,0.35)" : "1px solid rgba(255,255,255,0.07)",
    transition: "all 0.18s",
    transform: hoveredId === id ? "translateY(-3px)" : "none",
    boxShadow: hoveredId === id ? "0 10px 32px rgba(0,0,0,0.4)" : "none",
  });

  return (
    <div style={{ display: "flex", height: "100vh", background: "#00182E", overflow: "hidden" }}>
      <Sidebar />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, overflow: "hidden" }}>
        <TopBar />
        <main style={{ flex: 1, overflowY: "auto", padding: "28px 32px", background: "#00182E" }}>

          {/* Header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28 }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                <span style={{ display: "block", width: 4, height: 28, background: "#ACEC00", borderRadius: 4 }} />
                <h1 style={{ color: "white", fontSize: 24, fontWeight: 800, margin: 0 }}>Siswa Bimbingan</h1>
              </div>
              <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 13, marginLeft: 14 }}>
                {loading ? "Memuat..." : `${list.length} siswa bimbingan`}
              </p>
            </div>
          </div>

          {/* Stats */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 24 }}>
            {[
              { label: "Total Siswa", value: list.length, color: "#ACEC00" },
              { label: "Kelas", value: new Set(list.map(s => s.kelas)).size, color: "#013FF6" },
              { label: "Aktif", value: list.filter(s => s.isActive).length, color: "#ACEC00" },
            ].map(s => (
              <div key={s.label} style={{ background: "#012444", borderRadius: 14, padding: "16px 20px", border: "1px solid rgba(255,255,255,0.07)" }}>
                <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 12, margin: "0 0 6px 0" }}>{s.label}</p>
                <p style={{ color: s.color, fontSize: 28, fontWeight: 800, margin: 0 }}>{s.value}</p>
              </div>
            ))}
          </div>

          {/* Search */}
          <div style={{ marginBottom: 20 }}>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="🔍  Cari nama, NIS, atau kelas..."
              style={{ width: "100%", maxWidth: 420, padding: "10px 16px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.06)", color: "white", fontSize: 14, outline: "none", boxSizing: "border-box" }}
            />
          </div>

          {/* Loading */}
          {loading && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
              {[1,2,3,4,5,6].map(i => (
                <div key={i} style={{ background: "#012444", borderRadius: 16, padding: 20, border: "1px solid rgba(255,255,255,0.07)" }}>
                  <div style={{ display: "flex", gap: 14, alignItems: "center", marginBottom: 16 }}>
                    <div style={{ width: 52, height: 52, borderRadius: "50%", background: "rgba(255,255,255,0.08)" }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ height: 14, background: "rgba(255,255,255,0.08)", borderRadius: 6, marginBottom: 8, width: "70%" }} />
                      <div style={{ height: 11, background: "rgba(255,255,255,0.05)", borderRadius: 6, width: "50%" }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Empty */}
          {!loading && filtered.length === 0 && (
            <div style={{ textAlign: "center", paddingTop: 80 }}>
              <div style={{ width: 64, height: 64, background: "#012444", borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", fontSize: 28 }}>👥</div>
              <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 15 }}>
                {search ? "Tidak ada hasil" : "Belum ada siswa bimbingan"}
              </p>
              {!search && <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 13 }}>Hubungi admin untuk mengatur penugasan.</p>}
            </div>
          )}

          {/* Cards */}
          {!loading && filtered.length > 0 && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
              {filtered.map(s => (
                <div key={s.id} style={cardStyle(s.id)}
                  onClick={() => setDetail(s)}
                  onMouseEnter={() => setHoveredId(s.id)}
                  onMouseLeave={() => setHoveredId(null)}>
                  <div style={{ display: "flex", gap: 14, alignItems: "flex-start", marginBottom: 14 }}>
                    <div style={{ width: 52, height: 52, borderRadius: "50%", background: "#013FF6", color: "white", fontWeight: 700, fontSize: 17, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      {initials(s.name)}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ color: "white", fontWeight: 700, fontSize: 15, margin: "0 0 4px 0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.name}</p>
                      <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 12, margin: 0, fontFamily: "monospace" }}>{s.userId}</p>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 }}>
                    <span style={{ display: "inline-block", padding: "2px 8px", borderRadius: 6, fontSize: 11, fontWeight: 600, background: "rgba(1,63,246,0.2)", color: "#6ca3ff" }}>{s.kelas}</span>
                    {s.jurusan && <span style={{ display: "inline-block", padding: "2px 8px", borderRadius: 6, fontSize: 11, fontWeight: 600, background: "rgba(172,236,0,0.1)", color: "#ACEC00" }}>{s.jurusan}</span>}
                    <span style={{ display: "inline-block", padding: "2px 8px", borderRadius: 6, fontSize: 11, fontWeight: 600, background: s.isActive ? "rgba(172,236,0,0.15)" : "rgba(255,255,255,0.08)", color: s.isActive ? "#ACEC00" : "rgba(255,255,255,0.4)" }}>
                      {s.isActive ? "Aktif" : "Nonaktif"}
                    </span>
                  </div>
                  {s.tempatPKL && (
                    <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 11, margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      📍 {s.tempatPKL}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Detail Modal */}
      {detail && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50, padding: 16 }}
          onClick={() => setDetail(null)}>
          <div style={{ background: "white", borderRadius: 20, padding: 28, maxWidth: 480, width: "100%", maxHeight: "88vh", overflowY: "auto", boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}
            onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", gap: 16, alignItems: "center", marginBottom: 20, paddingBottom: 20, borderBottom: "1px solid #f3f4f6" }}>
              <div style={{ width: 60, height: 60, borderRadius: "50%", background: "#013FF6", color: "white", fontWeight: 700, fontSize: 20, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                {initials(detail.name)}
              </div>
              <div>
                <h2 style={{ color: "#00182E", fontWeight: 800, fontSize: 18, margin: "0 0 4px 0" }}>{detail.name}</h2>
                <p style={{ color: "#013FF6", fontSize: 12, margin: 0, fontFamily: "monospace" }}>{detail.userId}</p>
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 24 }}>
              {[
                { label: "Kelas", value: detail.kelas },
                { label: "Jurusan", value: detail.jurusan || "—" },
                { label: "Email", value: detail.email },
                { label: "No HP", value: detail.noHp || "—" },
                { label: "Tempat PKL", value: detail.tempatPKL || "—" },
                { label: "Status", value: detail.isActive ? "Aktif" : "Nonaktif" },
              ].map(f => (
                <div key={f.label} style={{ background: "#f9fafb", borderRadius: 10, padding: "10px 14px" }}>
                  <p style={{ color: "#9ca3af", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px", margin: "0 0 4px 0" }}>{f.label}</p>
                  <p style={{ color: "#111827", fontSize: 13, fontWeight: 600, margin: 0 }}>{f.value}</p>
                </div>
              ))}
              {detail.alamat && (
                <div style={{ background: "#f9fafb", borderRadius: 10, padding: "10px 14px", gridColumn: "1/-1" }}>
                  <p style={{ color: "#9ca3af", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px", margin: "0 0 4px 0" }}>Alamat</p>
                  <p style={{ color: "#111827", fontSize: 13, fontWeight: 600, margin: 0 }}>{detail.alamat}</p>
                </div>
              )}
            </div>
            <button onClick={() => setDetail(null)} style={{ background: "#00182E", color: "#ACEC00", padding: "9px 24px", borderRadius: 9, border: "none", cursor: "pointer", fontWeight: 700, fontSize: 13 }}>
              Tutup
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
