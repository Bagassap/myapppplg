"use client";
import { useEffect, useState } from "react";
import Sidebar from "@/components/layout/SidebarSiswa";
import TopBar from "@/components/layout/TopBar";

interface Siswa {
  id: number; userId: string; name: string; email: string;
  kelas: string; jurusan: string; tempatPKL: string;
  guruPembimbing: string; noHp: string; alamat: string; isActive: boolean;
}

function initials(name: string) {
  return name.split(" ").slice(0, 2).map(w => w[0]).join("").toUpperCase() || "?";
}

export default function SiswaDataSiswa() {
  const [profile, setProfile] = useState<Siswa | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ noHp: "", alamat: "", password: "" });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch("/api/data-siswa")
      .then(r => r.json())
      .then(d => {
        const p = d.data?.[0] ?? null;
        setProfile(p);
        if (p) setForm({ noHp: p.noHp || "", alamat: p.alamat || "", password: "" });
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    if (!profile) return;
    setSubmitting(true);
    try {
      const body: any = { noHp: form.noHp, alamat: form.alamat };
      if (form.password.trim()) body.password = form.password;
      const res = await fetch(`/api/data-siswa/${profile.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (!res.ok) return alert(json.error || "Gagal menyimpan");
      setProfile(prev => prev ? { ...prev, noHp: form.noHp, alamat: form.alamat } : prev);
      setEditing(false);
      setForm(f => ({ ...f, password: "" }));
    } catch { alert("Terjadi kesalahan"); }
    finally { setSubmitting(false); }
  };

  const inputStyle: React.CSSProperties = { width: "100%", padding: "11px 14px", border: "1.5px solid rgba(255,255,255,0.2)", borderRadius: 10, background: "rgba(255,255,255,0.07)", color: "white", fontSize: 14, outline: "none", boxSizing: "border-box" };

  return (
    <div style={{ display: "flex", height: "100vh", background: "#00182E", overflow: "hidden" }}>
      <Sidebar />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, overflow: "hidden" }}>
        <TopBar />
        <main style={{ flex: 1, overflowY: "auto", padding: "28px 32px", background: "#00182E" }}>

          {/* Header */}
          <div style={{ marginBottom: 28 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
              <span style={{ display: "block", width: 4, height: 28, background: "#ACEC00", borderRadius: 4 }} />
              <h1 style={{ color: "white", fontSize: 24, fontWeight: 800, margin: 0 }}>Profil Saya</h1>
            </div>
            <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 13, marginLeft: 14 }}>Data diri dan informasi PKL</p>
          </div>

          {/* Loading skeleton */}
          {loading && (
            <div style={{ maxWidth: 600, background: "#012444", borderRadius: 20, padding: 32, border: "1px solid rgba(255,255,255,0.07)" }}>
              <div style={{ display: "flex", gap: 20, alignItems: "center", marginBottom: 28, paddingBottom: 24, borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
                <div style={{ width: 80, height: 80, borderRadius: "50%", background: "rgba(255,255,255,0.08)" }} />
                <div style={{ flex: 1 }}>
                  <div style={{ height: 20, background: "rgba(255,255,255,0.08)", borderRadius: 8, width: "60%", marginBottom: 10 }} />
                  <div style={{ height: 14, background: "rgba(255,255,255,0.05)", borderRadius: 8, width: "40%" }} />
                </div>
              </div>
              {[1,2,3,4].map(i => <div key={i} style={{ height: 14, background: "rgba(255,255,255,0.05)", borderRadius: 8, marginBottom: 14, width: i % 2 === 0 ? "70%" : "90%" }} />)}
            </div>
          )}

          {/* No data */}
          {!loading && !profile && (
            <div style={{ maxWidth: 600, textAlign: "center", paddingTop: 80 }}>
              <div style={{ width: 64, height: 64, background: "#012444", borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", fontSize: 28 }}>👤</div>
              <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 15 }}>Data profil belum tersedia.</p>
              <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 13 }}>Hubungi admin atau guru pembimbing kamu.</p>
            </div>
          )}

          {/* Profile card */}
          {!loading && profile && (
            <div style={{ maxWidth: 640 }}>
              {/* Main card */}
              <div style={{ background: "#012444", borderRadius: 20, padding: 28, border: "1px solid rgba(255,255,255,0.07)", marginBottom: 16 }}>
                {/* Avatar + name */}
                <div style={{ display: "flex", gap: 20, alignItems: "center", marginBottom: 24, paddingBottom: 20, borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
                  <div style={{ width: 80, height: 80, borderRadius: "50%", background: "#013FF6", color: "white", fontWeight: 800, fontSize: 28, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: "0 4px 16px rgba(1,63,246,0.4)" }}>
                    {initials(profile.name)}
                  </div>
                  <div>
                    <h2 style={{ color: "white", fontWeight: 800, fontSize: 22, margin: "0 0 6px 0" }}>{profile.name}</h2>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      <span style={{ display: "inline-block", padding: "3px 10px", borderRadius: 6, fontSize: 11, fontWeight: 700, background: "rgba(1,63,246,0.2)", color: "#6ca3ff" }}>{profile.kelas}</span>
                      {profile.jurusan && <span style={{ display: "inline-block", padding: "3px 10px", borderRadius: 6, fontSize: 11, fontWeight: 700, background: "rgba(172,236,0,0.1)", color: "#ACEC00" }}>{profile.jurusan}</span>}
                      <span style={{ display: "inline-block", padding: "3px 10px", borderRadius: 6, fontSize: 11, fontWeight: 700, background: profile.isActive ? "rgba(172,236,0,0.15)" : "rgba(255,255,255,0.08)", color: profile.isActive ? "#ACEC00" : "rgba(255,255,255,0.4)" }}>
                        {profile.isActive ? "Aktif" : "Nonaktif"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Info grid */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
                  {[
                    { label: "NIS", value: profile.userId, icon: "🪪" },
                    { label: "Email", value: profile.email, icon: "✉️" },
                    { label: "Tempat PKL", value: profile.tempatPKL || "Belum diisi", icon: "🏢" },
                    { label: "Guru Pembimbing", value: profile.guruPembimbing || "Belum ditugaskan", icon: "👨‍🏫" },
                  ].map(f => (
                    <div key={f.label} style={{ background: "rgba(255,255,255,0.04)", borderRadius: 12, padding: "12px 16px", border: "1px solid rgba(255,255,255,0.06)" }}>
                      <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px", margin: "0 0 6px 0" }}>{f.icon} {f.label}</p>
                      <p style={{ color: f.value.startsWith("Belum") ? "rgba(255,255,255,0.3)" : "white", fontSize: 13, fontWeight: 600, margin: 0 }}>{f.value}</p>
                    </div>
                  ))}

                  {/* No HP - editable */}
                  <div style={{ background: "rgba(255,255,255,0.04)", borderRadius: 12, padding: "12px 16px", border: editing ? "1px solid rgba(172,236,0,0.3)" : "1px solid rgba(255,255,255,0.06)" }}>
                    <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px", margin: "0 0 6px 0" }}>📱 No HP</p>
                    {editing ? (
                      <input type="text" value={form.noHp} onChange={e => setForm({ ...form, noHp: e.target.value })} placeholder="08xxxxxxxxxx" style={{ ...inputStyle, padding: "6px 10px", fontSize: 13 }} />
                    ) : (
                      <p style={{ color: profile.noHp ? "white" : "rgba(255,255,255,0.3)", fontSize: 13, fontWeight: 600, margin: 0 }}>{profile.noHp || "Belum diisi"}</p>
                    )}
                  </div>

                  {/* Alamat - editable, spans full */}
                  <div style={{ background: "rgba(255,255,255,0.04)", borderRadius: 12, padding: "12px 16px", border: editing ? "1px solid rgba(172,236,0,0.3)" : "1px solid rgba(255,255,255,0.06)", gridColumn: "1/-1" }}>
                    <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px", margin: "0 0 6px 0" }}>📍 Alamat</p>
                    {editing ? (
                      <textarea value={form.alamat} onChange={e => setForm({ ...form, alamat: e.target.value })} placeholder="Alamat lengkap..." rows={3}
                        style={{ ...inputStyle, resize: "vertical", fontSize: 13 }} />
                    ) : (
                      <p style={{ color: profile.alamat ? "white" : "rgba(255,255,255,0.3)", fontSize: 13, fontWeight: 600, margin: 0, lineHeight: 1.6 }}>{profile.alamat || "Belum diisi"}</p>
                    )}
                  </div>

                  {/* Password — only when editing */}
                  {editing && (
                    <div style={{ background: "rgba(255,255,255,0.04)", borderRadius: 12, padding: "12px 16px", border: "1px solid rgba(172,236,0,0.3)", gridColumn: "1/-1" }}>
                      <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px", margin: "0 0 6px 0" }}>🔑 Ganti Password (opsional)</p>
                      <input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder="Kosongkan jika tidak ingin ganti" style={{ ...inputStyle, padding: "6px 10px", fontSize: 13 }} />
                    </div>
                  )}
                </div>

                {/* Action buttons */}
                <div style={{ display: "flex", gap: 10 }}>
                  {editing ? (
                    <>
                      <button onClick={handleSave} disabled={submitting}
                        style={{ background: "#ACEC00", color: "#00182E", padding: "10px 24px", borderRadius: 10, fontWeight: 700, border: "none", cursor: "pointer", fontSize: 14 }}>
                        {submitting ? "Menyimpan..." : "Simpan"}
                      </button>
                      <button onClick={() => { setEditing(false); setForm({ noHp: profile.noHp || "", alamat: profile.alamat || "", password: "" }); }}
                        style={{ background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.7)", padding: "10px 20px", borderRadius: 10, border: "none", cursor: "pointer", fontSize: 14 }}>
                        Batal
                      </button>
                    </>
                  ) : (
                    <button onClick={() => setEditing(true)}
                      style={{ background: "#013FF6", color: "white", padding: "10px 24px", borderRadius: 10, fontWeight: 700, border: "none", cursor: "pointer", fontSize: 14 }}>
                      ✏️ Edit Profil
                    </button>
                  )}
                </div>
              </div>

              {/* Read-only notice */}
              <p style={{ color: "rgba(255,255,255,0.25)", fontSize: 12, textAlign: "center" }}>
                NIS, email, kelas, dan tempat PKL hanya dapat diubah oleh admin.
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
