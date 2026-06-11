"use client";
import { useEffect, useState } from "react";
import Sidebar from "@/components/layout/SidebarAdmin";
import TopBar from "@/components/layout/TopBar";

interface Siswa {
  id: number; userId: string; name: string; email: string;
  kelas: string; jurusan: string; tempatPKL: string;
  noHp: string; alamat: string; isActive: boolean;
}

const KELAS = ["XII PG 1", "XII RPL 1", "XII RPL 2"];
const EMPTY_FORM = { namaLengkap: "", username: "", email: "", password: "", kelas: "XII RPL 1", jurusan: "", tempatPKL: "", noHp: "", alamat: "" };

function initials(name: string) {
  return name.split(" ").slice(0, 2).map(w => w[0]).join("").toUpperCase() || "?";
}

export default function AdminDataSiswa() {
  const [list, setList] = useState<Siswa[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [detail, setDetail] = useState<Siswa | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);

  const loadData = () => {
    setLoading(true);
    fetch("/api/data-siswa").then(r => r.json())
      .then(d => { setList(d.data || []); setLoading(false); })
      .catch(() => setLoading(false));
  };
  useEffect(() => { loadData(); }, []);

  const filtered = search
    ? list.filter(s =>
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.userId.toLowerCase().includes(search.toLowerCase()) ||
        s.kelas.toLowerCase().includes(search.toLowerCase()))
    : list;

  const openAdd = () => { setEditingId(null); setForm(EMPTY_FORM); setShowForm(true); };
  const openEdit = (s: Siswa, e: React.MouseEvent) => {
    e.stopPropagation();
    setDetail(null);
    setEditingId(s.id);
    setForm({ namaLengkap: s.name, username: s.userId, email: s.email, password: "", kelas: s.kelas, jurusan: s.jurusan, tempatPKL: s.tempatPKL, noHp: s.noHp, alamat: s.alamat });
    setShowForm(true);
  };
  const closeForm = () => { setShowForm(false); setEditingId(null); setForm(EMPTY_FORM); };

  const handleSubmit = async () => {
    if (!form.namaLengkap.trim() || !form.kelas.trim()) return alert("Nama dan kelas wajib diisi!");
    if (!editingId && (!form.username.trim() || !form.email.trim() || !form.password.trim())) return alert("NIS, email, dan password wajib untuk siswa baru!");
    setSubmitting(true);
    try {
      const res = editingId
        ? await fetch(`/api/data-siswa/${editingId}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ namaLengkap: form.namaLengkap, kelas: form.kelas, jurusan: form.jurusan, tempatPKL: form.tempatPKL, noHp: form.noHp, alamat: form.alamat, ...(form.password ? { password: form.password } : {}) }) })
        : await fetch("/api/data-siswa", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const json = await res.json();
      if (!res.ok) return alert(json.error || "Gagal menyimpan");
      closeForm();
      loadData();
    } catch { alert("Terjadi kesalahan"); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Hapus siswa ini? Semua data absensinya juga akan dihapus.")) return;
    setDetail(null);
    try {
      const res = await fetch(`/api/data-siswa/${id}`, { method: "DELETE" });
      if (!res.ok) { const j = await res.json(); return alert(j.error); }
      loadData();
    } catch { alert("Gagal menghapus"); }
  };

  const inp: React.CSSProperties = { width: "100%", padding: "9px 12px", border: "1.5px solid #e5e7eb", borderRadius: 8, fontSize: 13, outline: "none", boxSizing: "border-box", color: "#111827" };
  const thStyle: React.CSSProperties = { padding: "13px 14px", color: "white", fontWeight: 700, textAlign: "left", fontSize: 12, letterSpacing: "0.3px", whiteSpace: "nowrap" };

  return (
    <div style={{ display: "flex", height: "100vh", background: "#f9fafb", overflow: "hidden" }}>
      <Sidebar />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, overflow: "hidden" }}>
        <TopBar />
        <main style={{ flex: 1, overflowY: "auto", padding: "28px 32px", background: "#f9fafb" }}>

          {/* Header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                <span style={{ display: "block", width: 4, height: 26, background: "#ACEC00", borderRadius: 4 }} />
                <h1 style={{ color: "#00182E", fontSize: 22, fontWeight: 800, margin: 0 }}>Data Siswa PKL</h1>
              </div>
              <p style={{ color: "#6b7280", fontSize: 13, marginLeft: 14 }}>
                {loading ? "Memuat..." : `${list.length} siswa terdaftar`}
              </p>
            </div>
            <button onClick={openAdd}
              style={{ background: "#00182E", color: "white", padding: "9px 18px", borderRadius: 9, fontWeight: 700, border: "none", cursor: "pointer", fontSize: 13, flexShrink: 0 }}>
              + Tambah Siswa
            </button>
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
                    <th style={thStyle}>Status</th>
                    <th style={{ ...thStyle, textAlign: "center", width: 90 }}>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {loading && Array.from({ length: 6 }).map((_, i) => (
                    <tr key={i} style={{ background: i % 2 === 0 ? "white" : "#fafafa", borderTop: "1px solid #f3f4f6" }}>
                      {[40, 200, 80, 80, 90, 60, 70].map((w, c) => (
                        <td key={c} style={{ padding: "12px 14px" }}>
                          <div style={{ height: 12, background: "#f3f4f6", borderRadius: 6, width: w }} />
                        </td>
                      ))}
                    </tr>
                  ))}

                  {!loading && filtered.length === 0 && (
                    <tr>
                      <td colSpan={7} style={{ padding: "56px 0", textAlign: "center" }}>
                        <div style={{ color: "#9ca3af", fontSize: 14 }}>
                          {search ? `Tidak ada hasil untuk "${search}"` : "Belum ada data siswa"}
                        </div>
                        {!search && (
                          <button onClick={openAdd}
                            style={{ marginTop: 12, background: "#00182E", color: "white", padding: "8px 18px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600 }}>
                            + Tambah Siswa
                          </button>
                        )}
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
                      <td style={{ padding: "11px 14px" }}>
                        <span style={{ background: s.isActive ? "rgba(172,236,0,0.18)" : "#f3f4f6", color: s.isActive ? "#3a7d00" : "#9ca3af", padding: "2px 8px", borderRadius: 5, fontSize: 11, fontWeight: 700 }}>
                          {s.isActive ? "Aktif" : "Nonaktif"}
                        </span>
                      </td>
                      <td style={{ padding: "11px 14px", textAlign: "center" }}>
                        <div style={{ display: "flex", gap: 6, justifyContent: "center" }} onClick={e => e.stopPropagation()}>
                          <button onClick={e => openEdit(s, e)} title="Edit"
                            style={{ width: 30, height: 30, border: "1.5px solid #e5e7eb", borderRadius: 7, background: "white", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13 }}>
                            ✏️
                          </button>
                          <button onClick={e => handleDelete(s.id, e)} title="Hapus"
                            style={{ width: 30, height: 30, border: "1.5px solid #fca5a5", borderRadius: 7, background: "#fff5f5", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13 }}>
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {!loading && filtered.length > 0 && (
            <p style={{ color: "#9ca3af", fontSize: 12, marginTop: 10 }}>
              Menampilkan {filtered.length} dari {list.length} siswa
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
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={e => openEdit(detail, e)}
                style={{ background: "#013FF6", color: "white", padding: "9px 20px", borderRadius: 9, border: "none", cursor: "pointer", fontWeight: 600, fontSize: 13 }}>Edit</button>
              <button onClick={e => handleDelete(detail.id, e)}
                style={{ background: "#fee2e2", color: "#dc2626", padding: "9px 20px", borderRadius: 9, border: "none", cursor: "pointer", fontWeight: 600, fontSize: 13 }}>Hapus</button>
              <button onClick={() => setDetail(null)}
                style={{ background: "#f3f4f6", color: "#6b7280", padding: "9px 20px", borderRadius: 9, border: "none", cursor: "pointer", fontSize: 13 }}>Tutup</button>
            </div>
          </div>
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50, padding: 16 }}
          onClick={closeForm}>
          <div style={{ background: "white", borderRadius: 20, padding: 28, maxWidth: 540, width: "100%", maxHeight: "90vh", overflowY: "auto", boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}
            onClick={e => e.stopPropagation()}>
            <h2 style={{ color: "#00182E", fontWeight: 700, fontSize: 18, margin: "0 0 20px 0" }}>
              {editingId ? "Edit Data Siswa" : "Tambah Siswa Baru"}
            </h2>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              {[
                { label: "Nama Lengkap *", key: "namaLengkap", type: "text", placeholder: "Nama lengkap siswa", disabled: false, span2: true },
                { label: "NIS (Username) *", key: "username", type: "text", placeholder: "NIS siswa", disabled: !!editingId, span2: false },
                { label: "Email *", key: "email", type: "email", placeholder: "email@siswa.sch.id", disabled: !!editingId, span2: false },
                { label: editingId ? "Password (kosongkan jika tidak ubah)" : "Password *", key: "password", type: "password", placeholder: "••••••••", disabled: false, span2: true },
              ].map(f => (
                <div key={f.key} style={{ gridColumn: f.span2 ? "1/-1" : undefined }}>
                  <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#6b7280", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.5px" }}>{f.label}</label>
                  <input type={f.type} value={(form as any)[f.key]}
                    disabled={f.disabled}
                    onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                    placeholder={f.placeholder}
                    style={{ ...inp, opacity: f.disabled ? 0.5 : 1 }} />
                </div>
              ))}
              <div>
                <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#6b7280", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.5px" }}>Kelas *</label>
                <select value={form.kelas} onChange={e => setForm({ ...form, kelas: e.target.value })} style={inp}>
                  {KELAS.map(k => <option key={k} value={k}>{k}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#6b7280", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.5px" }}>Jurusan</label>
                <input type="text" value={form.jurusan} onChange={e => setForm({ ...form, jurusan: e.target.value })} placeholder="Jurusan siswa" style={inp} />
              </div>
              <div>
                <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#6b7280", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.5px" }}>Tempat PKL</label>
                <input type="text" value={form.tempatPKL} onChange={e => setForm({ ...form, tempatPKL: e.target.value })} placeholder="Nama tempat PKL" style={inp} />
              </div>
              <div>
                <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#6b7280", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.5px" }}>No HP</label>
                <input type="text" value={form.noHp} onChange={e => setForm({ ...form, noHp: e.target.value })} placeholder="08xxxxxxxxxx" style={inp} />
              </div>
              <div style={{ gridColumn: "1/-1" }}>
                <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#6b7280", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.5px" }}>Alamat</label>
                <textarea value={form.alamat} onChange={e => setForm({ ...form, alamat: e.target.value })} placeholder="Alamat lengkap" rows={3} style={{ ...inp, resize: "vertical" }} />
              </div>
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 20 }}>
              <button onClick={handleSubmit} disabled={submitting}
                style={{ background: "#00182E", color: "white", padding: "10px 24px", borderRadius: 9, fontWeight: 700, border: "none", cursor: "pointer", fontSize: 13 }}>
                {submitting ? "Menyimpan..." : editingId ? "Simpan" : "Tambahkan"}
              </button>
              <button onClick={closeForm}
                style={{ background: "#f3f4f6", color: "#6b7280", padding: "10px 20px", borderRadius: 9, border: "none", cursor: "pointer", fontSize: 13 }}>Batal</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
