"use client";
import { useEffect, useState } from "react";
import Sidebar from "@/components/layout/SidebarAdmin";
import TopBar from "@/components/layout/TopBar";

interface Siswa {
  id: number; userId: string; name: string; email: string;
  kelas: string; jurusan: string; tempatPKL: string;
  noHp: string; alamat: string; isActive: boolean;
}

const EMPTY_FORM = {
  namaLengkap: "", username: "", email: "", password: "",
  kelas: "XII RPL 1", jurusan: "", tempatPKL: "", noHp: "", alamat: "",
};
const KELAS = ["XII PG 1", "XII RPL 1", "XII RPL 2"];

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
  const [hoveredId, setHoveredId] = useState<number | null>(null);

  const loadData = () => {
    setLoading(true);
    fetch("/api/data-siswa")
      .then(r => r.json())
      .then(d => { setList(d.data || []); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { loadData(); }, []);

  const filtered = search
    ? list.filter(s =>
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.userId.toLowerCase().includes(search.toLowerCase()) ||
        s.kelas.toLowerCase().includes(search.toLowerCase())
      )
    : list;

  const openAdd = () => { setEditingId(null); setForm(EMPTY_FORM); setShowForm(true); };
  const openEdit = (s: Siswa) => {
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
      let res: Response;
      if (editingId) {
        res = await fetch(`/api/data-siswa/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ namaLengkap: form.namaLengkap, kelas: form.kelas, jurusan: form.jurusan, tempatPKL: form.tempatPKL, noHp: form.noHp, alamat: form.alamat, ...(form.password ? { password: form.password } : {}) }),
        });
      } else {
        res = await fetch("/api/data-siswa", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
      }
      const json = await res.json();
      if (!res.ok) return alert(json.error || "Gagal menyimpan");
      closeForm();
      loadData();
    } catch { alert("Terjadi kesalahan"); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Hapus siswa ini? Semua data absensinya juga akan dihapus.")) return;
    setDetail(null);
    try {
      const res = await fetch(`/api/data-siswa/${id}`, { method: "DELETE" });
      if (!res.ok) { const j = await res.json(); return alert(j.error); }
      loadData();
    } catch { alert("Gagal menghapus"); }
  };

  // styles
  const page: React.CSSProperties = { display: "flex", height: "100vh", background: "#00182E", overflow: "hidden" };
  const main: React.CSSProperties = { flex: 1, overflowY: "auto", padding: "28px 32px", background: "#00182E" };
  const card = (id: number): React.CSSProperties => ({
    position: "relative", background: hoveredId === id ? "#01305e" : "#012444",
    borderRadius: "16px", padding: "20px", cursor: "pointer",
    border: hoveredId === id ? "1px solid rgba(172,236,0,0.35)" : "1px solid rgba(255,255,255,0.07)",
    transition: "all 0.18s",
    transform: hoveredId === id ? "translateY(-3px)" : "none",
    boxShadow: hoveredId === id ? "0 10px 32px rgba(0,0,0,0.4)" : "none",
  });
  const avatar: React.CSSProperties = { width: 52, height: 52, borderRadius: "50%", background: "#013FF6", color: "white", fontWeight: 700, fontSize: 17, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 };
  const badge = (active: boolean): React.CSSProperties => ({ display: "inline-block", padding: "2px 8px", borderRadius: 6, fontSize: 11, fontWeight: 600, background: active ? "rgba(172,236,0,0.15)" : "rgba(255,255,255,0.08)", color: active ? "#ACEC00" : "rgba(255,255,255,0.4)" });
  const kelasBadge: React.CSSProperties = { display: "inline-block", padding: "2px 8px", borderRadius: 6, fontSize: 11, fontWeight: 600, background: "rgba(1,63,246,0.2)", color: "#6ca3ff" };
  const inputStyle: React.CSSProperties = { width: "100%", padding: "10px 12px", border: "1.5px solid #e5e7eb", borderRadius: "10px", fontSize: 14, outline: "none", boxSizing: "border-box", color: "#111827" };

  return (
    <div style={page}>
      <Sidebar />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, overflow: "hidden" }}>
        <TopBar />
        <main style={main}>

          {/* Header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28 }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                <span style={{ display: "block", width: 4, height: 28, background: "#ACEC00", borderRadius: 4 }} />
                <h1 style={{ color: "white", fontSize: 24, fontWeight: 800, margin: 0 }}>Data Siswa PKL</h1>
              </div>
              <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 13, marginLeft: 14 }}>
                {loading ? "Memuat..." : `${list.length} siswa terdaftar`}
              </p>
            </div>
            <button onClick={openAdd} style={{ background: "#ACEC00", color: "#00182E", padding: "10px 20px", borderRadius: 10, fontWeight: 700, border: "none", cursor: "pointer", fontSize: 14, flexShrink: 0 }}>
              + Tambah Siswa
            </button>
          </div>

          {/* Stats */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 24 }}>
            {[
              { label: "Total Siswa", value: list.length, color: "#ACEC00" },
              { label: "Total Kelas", value: new Set(list.map(s => s.kelas)).size, color: "#013FF6" },
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

          {/* Loading skeleton */}
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
              <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 15, marginBottom: 8 }}>{search ? "Tidak ada hasil" : "Belum ada data siswa"}</p>
              {!search && <button onClick={openAdd} style={{ background: "#ACEC00", color: "#00182E", padding: "9px 20px", borderRadius: 9, fontWeight: 700, border: "none", cursor: "pointer", fontSize: 13 }}>+ Tambah Siswa</button>}
            </div>
          )}

          {/* Card grid */}
          {!loading && filtered.length > 0 && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
              {filtered.map(s => (
                <div key={s.id} style={card(s.id)}
                  onClick={() => setDetail(s)}
                  onMouseEnter={() => setHoveredId(s.id)}
                  onMouseLeave={() => setHoveredId(null)}>
                  <div style={{ display: "flex", gap: 14, alignItems: "flex-start", marginBottom: 14 }}>
                    <div style={avatar}>{initials(s.name)}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ color: "white", fontWeight: 700, fontSize: 15, margin: "0 0 4px 0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.name}</p>
                      <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 12, margin: 0, fontFamily: "monospace" }}>{s.userId}</p>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 }}>
                    <span style={kelasBadge}>{s.kelas}</span>
                    {s.jurusan && <span style={{ ...kelasBadge, background: "rgba(172,236,0,0.1)", color: "#ACEC00" }}>{s.jurusan}</span>}
                    <span style={badge(s.isActive)}>{s.isActive ? "Aktif" : "Nonaktif"}</span>
                  </div>
                  {s.tempatPKL && <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 11, margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>📍 {s.tempatPKL}</p>}
                  {/* Hover actions */}
                  {hoveredId === s.id && (
                    <div style={{ position: "absolute", top: 12, right: 12, display: "flex", gap: 6 }} onClick={e => e.stopPropagation()}>
                      <button onClick={() => openEdit(s)} style={{ background: "rgba(1,63,246,0.2)", border: "1px solid rgba(1,63,246,0.4)", color: "#6ca3ff", borderRadius: 8, padding: "4px 10px", fontSize: 12, cursor: "pointer", fontWeight: 600 }}>Edit</button>
                      <button onClick={() => handleDelete(s.id)} style={{ background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.3)", color: "#f87171", borderRadius: 8, padding: "4px 10px", fontSize: 12, cursor: "pointer", fontWeight: 600 }}>Hapus</button>
                    </div>
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
            {/* Avatar + name */}
            <div style={{ display: "flex", gap: 16, alignItems: "center", marginBottom: 20, paddingBottom: 20, borderBottom: "1px solid #f3f4f6" }}>
              <div style={{ width: 60, height: 60, borderRadius: "50%", background: "#013FF6", color: "white", fontWeight: 700, fontSize: 20, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                {initials(detail.name)}
              </div>
              <div>
                <h2 style={{ color: "#00182E", fontWeight: 800, fontSize: 18, margin: "0 0 4px 0" }}>{detail.name}</h2>
                <p style={{ color: "#013FF6", fontSize: 12, margin: 0, fontFamily: "monospace" }}>{detail.userId}</p>
              </div>
            </div>
            {/* Fields */}
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
              <button onClick={() => openEdit(detail)} style={{ background: "#013FF6", color: "white", padding: "9px 20px", borderRadius: 9, border: "none", cursor: "pointer", fontWeight: 600, fontSize: 13 }}>Edit</button>
              <button onClick={() => handleDelete(detail.id)} style={{ background: "#fee2e2", color: "#dc2626", padding: "9px 20px", borderRadius: 9, border: "none", cursor: "pointer", fontWeight: 600, fontSize: 13 }}>Hapus</button>
              <button onClick={() => setDetail(null)} style={{ background: "#f3f4f6", color: "#6b7280", padding: "9px 20px", borderRadius: 9, border: "none", cursor: "pointer", fontSize: 13 }}>Tutup</button>
            </div>
          </div>
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50, padding: 16 }}
          onClick={closeForm}>
          <div style={{ background: "white", borderRadius: 20, padding: 28, maxWidth: 560, width: "100%", maxHeight: "90vh", overflowY: "auto", boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}
            onClick={e => e.stopPropagation()}>
            <h2 style={{ color: "#00182E", fontWeight: 700, fontSize: 18, margin: "0 0 20px 0" }}>
              {editingId ? "Edit Data Siswa" : "Tambah Siswa Baru"}
            </h2>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              {[
                { label: "Nama Lengkap *", key: "namaLengkap", type: "text", placeholder: "Nama lengkap siswa", disabled: false, colSpan: 2 },
                { label: "NIS (Username) *", key: "username", type: "text", placeholder: "NIS siswa", disabled: !!editingId, colSpan: 1 },
                { label: "Email *", key: "email", type: "email", placeholder: "email@siswa.sch.id", disabled: !!editingId, colSpan: 1 },
                { label: editingId ? "Password (kosongkan jika tidak ubah)" : "Password *", key: "password", type: "password", placeholder: "••••••••", disabled: false, colSpan: 2 },
              ].map(f => (
                <div key={f.key} style={{ gridColumn: f.colSpan === 2 ? "1/-1" : undefined }}>
                  <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#6b7280", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.5px" }}>{f.label}</label>
                  <input type={f.type} value={(form as any)[f.key]} disabled={f.disabled}
                    onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                    placeholder={f.placeholder}
                    style={{ ...inputStyle, opacity: f.disabled ? 0.5 : 1 }} />
                </div>
              ))}
              <div>
                <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#6b7280", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.5px" }}>Kelas *</label>
                <select value={form.kelas} onChange={e => setForm({ ...form, kelas: e.target.value })} style={{ ...inputStyle }}>
                  {KELAS.map(k => <option key={k} value={k}>{k}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#6b7280", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.5px" }}>Jurusan</label>
                <input type="text" value={form.jurusan} onChange={e => setForm({ ...form, jurusan: e.target.value })} placeholder="Jurusan siswa" style={inputStyle} />
              </div>
              <div>
                <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#6b7280", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.5px" }}>Tempat PKL</label>
                <input type="text" value={form.tempatPKL} onChange={e => setForm({ ...form, tempatPKL: e.target.value })} placeholder="Nama tempat PKL" style={inputStyle} />
              </div>
              <div>
                <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#6b7280", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.5px" }}>No HP</label>
                <input type="text" value={form.noHp} onChange={e => setForm({ ...form, noHp: e.target.value })} placeholder="08xxxxxxxxxx" style={inputStyle} />
              </div>
              <div style={{ gridColumn: "1/-1" }}>
                <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#6b7280", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.5px" }}>Alamat</label>
                <textarea value={form.alamat} onChange={e => setForm({ ...form, alamat: e.target.value })} placeholder="Alamat lengkap" rows={3}
                  style={{ ...inputStyle, resize: "vertical" }} />
              </div>
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 20 }}>
              <button onClick={handleSubmit} disabled={submitting}
                style={{ background: "#ACEC00", color: "#00182E", padding: "10px 24px", borderRadius: 10, fontWeight: 700, border: "none", cursor: "pointer", fontSize: 14 }}>
                {submitting ? "Menyimpan..." : editingId ? "Simpan" : "Tambahkan"}
              </button>
              <button onClick={closeForm} style={{ background: "#f3f4f6", color: "#6b7280", padding: "10px 20px", borderRadius: 10, border: "none", cursor: "pointer", fontSize: 14 }}>Batal</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
