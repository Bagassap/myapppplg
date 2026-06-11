"use client";
import { useEffect, useState } from "react";
import Sidebar from "@/components/layout/SidebarGuru";
import TopBar from "@/components/layout/TopBar";

interface Siswa {
  id: number; userId: string; name: string; email: string;
  kelas: string; jurusan: string; tempatPKL: string;
  guruPembimbing: string; noHp: string; alamat: string; isActive: boolean;
}

const PAGE_SIZE = 10;

function initials(name: string) {
  return name.split(" ").slice(0, 2).map(w => w[0]).join("").toUpperCase() || "?";
}

function groupByKelas(list: Siswa[]): { kelas: string; siswa: Siswa[] }[] {
  const map: Record<string, Siswa[]> = {};
  list.forEach(s => {
    if (!map[s.kelas]) map[s.kelas] = [];
    map[s.kelas].push(s);
  });
  return Object.keys(map).sort().map(kelas => ({ kelas, siswa: map[kelas] }));
}

interface KelasTableProps {
  kelas: string;
  siswa: Siswa[];
  onDetail: (s: Siswa) => void;
  page: number;
  setPage: (p: number) => void;
}

function KelasTable({ kelas, siswa, onDetail, page, setPage }: KelasTableProps) {
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);
  const totalPages = Math.ceil(siswa.length / PAGE_SIZE);
  const paginated = siswa.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const startNo = (page - 1) * PAGE_SIZE;

  const thS: React.CSSProperties = { padding: "11px 14px", color: "var(--t3)", fontWeight: 700, textAlign: "left", fontSize: 12, letterSpacing: "0.3px", whiteSpace: "nowrap", background: "var(--th)" };

  return (
    <div style={{ background: "var(--surface)", borderRadius: 16, border: "1px solid var(--bd)", overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
      {/* Class header */}
      <div style={{ background: "#00182E", padding: "13px 18px", display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ fontSize: 16 }}>📚</span>
        <span style={{ color: "white", fontWeight: 700, fontSize: 14 }}>Kelas {kelas}</span>
        <span style={{ background: "#ACEC00", color: "#00182E", fontSize: 11, fontWeight: 800, padding: "2px 9px", borderRadius: 20, marginLeft: 4 }}>
          {siswa.length} Siswa
        </span>
        {totalPages > 1 && (
          <span style={{ color: "rgba(255,255,255,0.45)", fontSize: 11, marginLeft: "auto" }}>
            Hal. {page}/{totalPages}
          </span>
        )}
      </div>

      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr style={{ borderBottom: "2px solid var(--bd)" }}>
              <th style={{ ...thS, textAlign: "center", width: 48 }}>No</th>
              <th style={thS}>Nama Siswa</th>
              <th style={thS}>NIS</th>
              <th style={thS}>Jurusan</th>
              <th style={thS}>Tempat PKL</th>
              <th style={thS}>Status</th>
            </tr>
          </thead>
          <tbody>
            {paginated.map((s, idx) => (
              <tr key={s.id}
                onClick={() => onDetail(s)}
                onMouseEnter={() => setHoveredRow(s.id)}
                onMouseLeave={() => setHoveredRow(null)}
                style={{ background: hoveredRow === s.id ? "var(--hover)" : idx % 2 === 0 ? "var(--surface)" : "var(--surface-alt)", cursor: "pointer", borderTop: "1px solid var(--bd2)", transition: "background 0.1s" }}>
                <td style={{ padding: "10px 14px", textAlign: "center", color: "var(--t4)", fontSize: 12 }}>{startNo + idx + 1}</td>
                <td style={{ padding: "10px 14px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#013FF6", color: "white", fontWeight: 700, fontSize: 11, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      {initials(s.name)}
                    </div>
                    <div>
                      <p style={{ margin: 0, fontWeight: 600, color: "var(--t1)", fontSize: 13 }}>{s.name}</p>
                      <p style={{ margin: 0, fontSize: 11, color: "var(--t4)" }}>{s.email}</p>
                    </div>
                  </div>
                </td>
                <td style={{ padding: "10px 14px", color: "var(--t2)", fontFamily: "monospace", fontSize: 12 }}>{s.userId}</td>
                <td style={{ padding: "10px 14px", color: "var(--t3)", fontSize: 12 }}>{s.jurusan || "—"}</td>
                <td style={{ padding: "10px 14px", color: "var(--t3)", fontSize: 12, maxWidth: 150, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.tempatPKL || "—"}</td>
                <td style={{ padding: "10px 14px" }}>
                  <span style={{ background: s.isActive ? "rgba(172,236,0,0.18)" : "var(--sk)", color: s.isActive ? "#3a7d00" : "var(--t4)", padding: "2px 8px", borderRadius: 5, fontSize: 11, fontWeight: 700 }}>
                    {s.isActive ? "Aktif" : "Nonaktif"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ padding: "10px 16px", borderTop: "1px solid var(--bd2)", display: "flex", gap: 6, alignItems: "center", justifyContent: "flex-end" }}>
          <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1}
            style={{ padding: "4px 12px", borderRadius: 7, border: "1.5px solid var(--bd)", background: "var(--surface)", fontSize: 12, cursor: page === 1 ? "default" : "pointer", color: page === 1 ? "#d1d5db" : "var(--t2)", fontWeight: 600 }}>
            ← Prev
          </button>
          {Array.from({ length: totalPages }).map((_, i) => (
            <button key={i} onClick={() => setPage(i + 1)}
              style={{ width: 28, height: 28, borderRadius: 7, border: page === i + 1 ? "none" : "1.5px solid var(--bd)", background: page === i + 1 ? "#00182E" : "var(--surface)", color: page === i + 1 ? "white" : "var(--t2)", fontSize: 12, cursor: "pointer", fontWeight: 600 }}>
              {i + 1}
            </button>
          ))}
          <button onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page === totalPages}
            style={{ padding: "4px 12px", borderRadius: 7, border: "1.5px solid var(--bd)", background: "var(--surface)", fontSize: 12, cursor: page === totalPages ? "default" : "pointer", color: page === totalPages ? "#d1d5db" : "var(--t2)", fontWeight: 600 }}>
            Next →
          </button>
        </div>
      )}
    </div>
  );
}

export default function GuruDataSiswa() {
  const [list, setList] = useState<Siswa[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [detail, setDetail] = useState<Siswa | null>(null);
  const [pages, setPages] = useState<Record<string, number>>({});
  const [hoveredSearch, setHoveredSearch] = useState<number | null>(null);
  const [searchPage, setSearchPage] = useState(1);

  useEffect(() => {
    fetch("/api/data-siswa").then(r => r.json())
      .then(d => { setList(d.data || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);
  useEffect(() => { setSearchPage(1); }, [search]);

  const getPage = (kelas: string) => pages[kelas] ?? 1;
  const setKelasPage = (kelas: string, p: number) => setPages(prev => ({ ...prev, [kelas]: p }));

  const groups = groupByKelas(list);

  const searchFiltered = search.trim()
    ? list.filter(s =>
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.userId.toLowerCase().includes(search.toLowerCase()) ||
        s.kelas.toLowerCase().includes(search.toLowerCase()))
    : [];
  const searchTotalPages = Math.ceil(searchFiltered.length / PAGE_SIZE);
  const searchPaginated = searchFiltered.slice((searchPage - 1) * PAGE_SIZE, searchPage * PAGE_SIZE);

  const thS: React.CSSProperties = { padding: "11px 14px", color: "white", fontWeight: 700, textAlign: "left", fontSize: 12, letterSpacing: "0.3px", whiteSpace: "nowrap", background: "#00182E" };

  return (
    <div style={{ display: "flex", height: "100vh", background: "var(--bg)", overflow: "hidden" }}>
      <Sidebar />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, overflow: "hidden" }}>
        <TopBar />
        <main style={{ flex: 1, overflowY: "auto", padding: "28px 32px", background: "var(--bg)" }}>

          {/* Header */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
              <span style={{ display: "block", width: 4, height: 32, background: "#ACEC00", borderRadius: 2, flexShrink: 0 }} />
              <span style={{ fontSize: 22, lineHeight: 1 }}>👥</span>
              <h1 style={{ color: "var(--text-primary)", fontSize: 28, fontWeight: 700, margin: 0, letterSpacing: "-0.3px" }}>Siswa Bimbingan</h1>
            </div>
            <p style={{ color: "var(--text-secondary)", fontSize: 13, paddingLeft: 16 }}>
              {loading ? "Memuat..." : `${list.length} siswa · ${groups.length} kelas`}
            </p>
          </div>

          {/* Search */}
          <div style={{ marginBottom: 24 }}>
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="🔍  Cari nama, NIS, atau kelas... (kosongkan untuk tampilan per kelas)"
              style={{ width: "100%", maxWidth: 480, padding: "9px 14px", borderRadius: 9, border: "1.5px solid var(--bd)", background: "var(--inp)", fontSize: 13, outline: "none", boxSizing: "border-box", color: "var(--t1)" }} />
          </div>

          {/* Loading */}
          {loading && (
            <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
              {[1, 2].map(g => (
                <div key={g} style={{ background: "var(--surface)", borderRadius: 16, border: "1px solid var(--bd)", overflow: "hidden" }}>
                  <div style={{ background: "#00182E", padding: "13px 18px", height: 44 }} />
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} style={{ padding: "12px 18px", display: "flex", gap: 16, borderTop: "1px solid var(--bd2)", background: i % 2 === 0 ? "var(--surface)" : "var(--surface-alt)" }}>
                      <div style={{ height: 12, background: "var(--sk)", borderRadius: 6, width: 30 }} />
                      <div style={{ height: 12, background: "var(--sk)", borderRadius: 6, flex: 1 }} />
                      <div style={{ height: 12, background: "var(--sk)", borderRadius: 6, width: 80 }} />
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}

          {/* Search mode — flat table */}
          {!loading && search.trim() && (
            <div>
              <p style={{ color: "var(--t3)", fontSize: 13, marginBottom: 12 }}>
                {searchFiltered.length > 0 ? `${searchFiltered.length} hasil untuk "${search}"` : `Tidak ada hasil untuk "${search}"`}
              </p>
              {searchFiltered.length > 0 && (
                <div style={{ background: "var(--surface)", borderRadius: 16, border: "1px solid var(--bd)", overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
                  <div style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                      <thead>
                        <tr>
                          <th style={{ ...thS, textAlign: "center", width: 48 }}>No</th>
                          <th style={thS}>Nama Siswa</th>
                          <th style={thS}>NIS</th>
                          <th style={thS}>Kelas</th>
                          <th style={thS}>Jurusan</th>
                          <th style={thS}>Tempat PKL</th>
                          <th style={thS}>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {searchPaginated.map((s, idx) => (
                          <tr key={s.id}
                            onClick={() => setDetail(s)}
                            onMouseEnter={() => setHoveredSearch(s.id)}
                            onMouseLeave={() => setHoveredSearch(null)}
                            style={{ background: hoveredSearch === s.id ? "var(--hover)" : idx % 2 === 0 ? "var(--surface)" : "var(--surface-alt)", cursor: "pointer", borderTop: "1px solid var(--bd2)", transition: "background 0.1s" }}>
                            <td style={{ padding: "10px 14px", textAlign: "center", color: "var(--t4)", fontSize: 12 }}>{(searchPage - 1) * PAGE_SIZE + idx + 1}</td>
                            <td style={{ padding: "10px 14px" }}>
                              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#013FF6", color: "white", fontWeight: 700, fontSize: 11, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                  {initials(s.name)}
                                </div>
                                <div>
                                  <p style={{ margin: 0, fontWeight: 600, color: "var(--t1)", fontSize: 13 }}>{s.name}</p>
                                  <p style={{ margin: 0, fontSize: 11, color: "var(--t4)" }}>{s.email}</p>
                                </div>
                              </div>
                            </td>
                            <td style={{ padding: "10px 14px", color: "var(--t2)", fontFamily: "monospace", fontSize: 12 }}>{s.userId}</td>
                            <td style={{ padding: "10px 14px" }}>
                              <span style={{ background: "rgba(1,63,246,0.09)", color: "#013FF6", padding: "2px 8px", borderRadius: 5, fontSize: 11, fontWeight: 600 }}>{s.kelas}</span>
                            </td>
                            <td style={{ padding: "10px 14px", color: "var(--t3)", fontSize: 12 }}>{s.jurusan || "—"}</td>
                            <td style={{ padding: "10px 14px", color: "var(--t3)", fontSize: 12, maxWidth: 150, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.tempatPKL || "—"}</td>
                            <td style={{ padding: "10px 14px" }}>
                              <span style={{ background: s.isActive ? "rgba(172,236,0,0.18)" : "var(--sk)", color: s.isActive ? "#3a7d00" : "var(--t4)", padding: "2px 8px", borderRadius: 5, fontSize: 11, fontWeight: 700 }}>
                                {s.isActive ? "Aktif" : "Nonaktif"}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {searchTotalPages > 1 && (
                    <div style={{ padding: "10px 16px", borderTop: "1px solid var(--bd2)", display: "flex", gap: 6, alignItems: "center", justifyContent: "flex-end" }}>
                      <button onClick={() => setSearchPage(p => Math.max(1, p - 1))} disabled={searchPage === 1}
                        style={{ padding: "4px 12px", borderRadius: 7, border: "1.5px solid var(--bd)", background: "var(--surface)", fontSize: 12, cursor: searchPage === 1 ? "default" : "pointer", color: searchPage === 1 ? "#d1d5db" : "var(--t2)", fontWeight: 600 }}>← Prev</button>
                      {Array.from({ length: searchTotalPages }).map((_, i) => (
                        <button key={i} onClick={() => setSearchPage(i + 1)}
                          style={{ width: 28, height: 28, borderRadius: 7, border: searchPage === i + 1 ? "none" : "1.5px solid var(--bd)", background: searchPage === i + 1 ? "#00182E" : "var(--surface)", color: searchPage === i + 1 ? "white" : "var(--t2)", fontSize: 12, cursor: "pointer", fontWeight: 600 }}>
                          {i + 1}
                        </button>
                      ))}
                      <button onClick={() => setSearchPage(p => Math.min(searchTotalPages, p + 1))} disabled={searchPage === searchTotalPages}
                        style={{ padding: "4px 12px", borderRadius: 7, border: "1.5px solid var(--bd)", background: "var(--surface)", fontSize: 12, cursor: searchPage === searchTotalPages ? "default" : "pointer", color: searchPage === searchTotalPages ? "#d1d5db" : "var(--t2)", fontWeight: 600 }}>Next →</button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Grouped mode */}
          {!loading && !search.trim() && (
            <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
              {groups.length === 0 && (
                <div style={{ background: "var(--surface)", borderRadius: 16, border: "1px solid var(--bd)", padding: "56px 0", textAlign: "center", color: "var(--t4)", fontSize: 14 }}>
                  Belum ada siswa bimbingan
                </div>
              )}
              {groups.map(({ kelas, siswa }) => (
                <KelasTable
                  key={kelas}
                  kelas={kelas}
                  siswa={siswa}
                  onDetail={setDetail}
                  page={getPage(kelas)}
                  setPage={p => setKelasPage(kelas, p)}
                />
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Detail Modal */}
      {detail && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50, padding: 16 }}
          onClick={() => setDetail(null)}>
          <div style={{ background: "var(--surface)", borderRadius: 20, padding: 28, maxWidth: 480, width: "100%", maxHeight: "88vh", overflowY: "auto", boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}
            onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", gap: 16, alignItems: "center", marginBottom: 20, paddingBottom: 20, borderBottom: "1px solid var(--bd2)" }}>
              <div style={{ width: 60, height: 60, borderRadius: "50%", background: "#013FF6", color: "white", fontWeight: 800, fontSize: 20, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                {initials(detail.name)}
              </div>
              <div>
                <h2 style={{ color: "var(--t1)", fontWeight: 800, fontSize: 18, margin: "0 0 4px 0" }}>{detail.name}</h2>
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
                <div key={f.label} style={{ background: "var(--field)", borderRadius: 10, padding: "10px 14px" }}>
                  <p style={{ color: "var(--t4)", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px", margin: "0 0 4px 0" }}>{f.label}</p>
                  <p style={{ color: "var(--t1)", fontSize: 13, fontWeight: 600, margin: 0 }}>{f.value}</p>
                </div>
              ))}
              {detail.alamat && (
                <div style={{ background: "var(--field)", borderRadius: 10, padding: "10px 14px", gridColumn: "1/-1" }}>
                  <p style={{ color: "var(--t4)", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px", margin: "0 0 4px 0" }}>Alamat</p>
                  <p style={{ color: "var(--t1)", fontSize: 13, fontWeight: 600, margin: 0 }}>{detail.alamat}</p>
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
