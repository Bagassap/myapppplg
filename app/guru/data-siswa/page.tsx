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
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/data-siswa").then(r => r.json())
      .then(d => { setList(d.data || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const filtered = search
    ? list.filter(s =>
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.userId.toLowerCase().includes(search.toLowerCase()) ||
        s.kelas.toLowerCase().includes(search.toLowerCase()))
    : list;

  const thStyle: React.CSSProperties = { padding: "13px 14px", color: "white", fontWeight: 700, textAlign: "left", fontSize: 12, letterSpacing: "0.3px", whiteSpace: "nowrap" };

  return (
    <div style={{ display: "flex", height: "100vh", background: "#f9fafb", overflow: "hidden" }}>
      <Sidebar />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, overflow: "hidden" }}>
        <TopBar />
        <main style={{ flex: 1, overflowY: "auto", padding: "28px 32px", background: "#f9fafb" }}>

          {/* Header */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
              <span style={{ display: "block", width: 4, height: 26, background: "#ACEC00", borderRadius: 4 }} />
              <h1 style={{ color: "#00182E", fontSize: 22, fontWeight: 800, margin: 0 }}>Siswa Bimbingan</h1>
            </div>
            <p style={{ color: "#6b7280", fontSize: 13, marginLeft: 14 }}>
              {loading ? "Memuat..." : `${list.length} siswa bimbingan`}
            </p>
          </div>

          {/* Search */}
          <div style={{ marginBottom: 16 }}>
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="🔍  Cari nama, NIS, atau kelas..."
              style={{ width: "100%", maxWidth: 380, padding: "9px 14px", borderRadius: 9, border: "1.5px solid #e5e7eb", background: "white", fontSize: 13, outline: "none", boxSizing: "border-box", color: "#111827" }} />
          </div>

          {/* Table */}
          <div style={{ background: "white", borderRadius: 16, border: "1px solid #e5e7eb", overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr style={{ background: "#00182E" }}>
                    <th style={{ ...thStyle, textAlign: "center", width: 48 }}>No</th>
                    <th style={thStyle}>Nama Siswa</th>
                    <th style={thStyle}>NIS</th>
                    <th style={thStyle}>Kelas</th>
                    <th style={thStyle}>Jurusan</th>
                    <th style={thStyle}>Tempat PKL</th>
                    <th style={thStyle}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {loading && Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} style={{ background: i % 2 === 0 ? "white" : "#fafafa", borderTop: "1px solid #f3f4f6" }}>
                      {[40, 200, 80, 80, 90, 120, 60].map((w, c) => (
                        <td key={c} style={{ padding: "12px 14px" }}>
                          <div style={{ height: 12, background: "#f3f4f6", borderRadius: 6, width: w }} />
                        </td>
                      ))}
                    </tr>
                  ))}

                  {!loading && filtered.length === 0 && (
                    <tr>
                      <td colSpan={7} style={{ padding: "56px 0", textAlign: "center", color: "#9ca3af", fontSize: 14 }}>
                        {search ? `Tidak ada hasil untuk "${search}"` : "Belum ada siswa bimbingan"}
                      </td>
                    </tr>
                  )}

                  {!loading && filtered.map((s, idx) => (
                    <tr key={s.id}
                      onClick={() => setDetail(s)}
                      onMouseEnter={() => setHoveredRow(s.id)}
                      onMouseLeave={() => setHoveredRow(null)}
                      style={{ background: hoveredRow === s.id ? "rgba(172,236,0,0.08)" : idx % 2 === 0 ? "white" : "#fafafa", cursor: "pointer", borderTop: "1px solid #f3f4f6", transition: "background 0.1s" }}>
                      <td style={{ padding: "11px 14px", textAlign: "center", color: "#9ca3af", fontSize: 12 }}>{idx + 1}</td>
                      <td style={{ padding: "11px 14px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <div style={{ width: 34, height: 34, borderRadius: "50%", background: "#013FF6", color: "white", fontWeight: 700, fontSize: 12, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                            {initials(s.name)}
                          </div>
                          <div>
                            <p style={{ margin: 0, fontWeight: 600, color: "#111827", fontSize: 13 }}>{s.name}</p>
                            <p style={{ margin: 0, fontSize: 11, color: "#9ca3af" }}>{s.email}</p>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: "11px 14px", color: "#374151", fontFamily: "monospace", fontSize: 12 }}>{s.userId}</td>
                      <td style={{ padding: "11px 14px" }}>
                        <span style={{ background: "rgba(1,63,246,0.09)", color: "#013FF6", padding: "2px 8px", borderRadius: 5, fontSize: 11, fontWeight: 600 }}>{s.kelas}</span>
                      </td>
                      <td style={{ padding: "11px 14px", color: "#6b7280", fontSize: 12 }}>{s.jurusan || "—"}</td>
                      <td style={{ padding: "11px 14px", color: "#6b7280", fontSize: 12, maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.tempatPKL || "—"}</td>
                      <td style={{ padding: "11px 14px" }}>
                        <span style={{ background: s.isActive ? "rgba(172,236,0,0.18)" : "#f3f4f6", color: s.isActive ? "#3a7d00" : "#9ca3af", padding: "2px 8px", borderRadius: 5, fontSize: 11, fontWeight: 700 }}>
                          {s.isActive ? "Aktif" : "Nonaktif"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {!loading && filtered.length > 0 && (
            <p style={{ color: "#9ca3af", fontSize: 12, marginTop: 10 }}>
              Klik baris untuk lihat detail • Menampilkan {filtered.length} dari {list.length} siswa
            </p>
          )}
        </main>
      </div>

      {/* Detail Modal */}
      {detail && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50, padding: 16 }}
          onClick={() => setDetail(null)}>
          <div style={{ background: "white", borderRadius: 20, padding: 28, maxWidth: 480, width: "100%", maxHeight: "88vh", overflowY: "auto", boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}
            onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", gap: 16, alignItems: "center", marginBottom: 20, paddingBottom: 20, borderBottom: "1px solid #f3f4f6" }}>
              <div style={{ width: 60, height: 60, borderRadius: "50%", background: "#013FF6", color: "white", fontWeight: 800, fontSize: 20, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
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
            <button onClick={() => setDetail(null)}
              style={{ background: "#00182E", color: "white", padding: "9px 24px", borderRadius: 9, border: "none", cursor: "pointer", fontWeight: 700, fontSize: 13 }}>
              Tutup
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
