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
    fetch("/api/data-siswa").then(r => r.json())
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

  const inp: React.CSSProperties = { width: "100%", padding: "9px 12px", border: "1.5px solid #e5e7eb", borderRadius: 8, fontSize: 13, outline: "none", boxSizing: "border-box", color: "#111827" };

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
              <h1 style={{ color: "#00182E", fontSize: 22, fontWeight: 800, margin: 0 }}>Profil Saya</h1>
            </div>
            <p style={{ color: "#6b7280", fontSize: 13, marginLeft: 14 }}>Data diri dan informasi PKL</p>
          </div>

          {/* Loading skeleton */}
          {loading && (
            <div style={{ maxWidth: 680, background: "white", borderRadius: 16, padding: 28, border: "1px solid #e5e7eb", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
              <div style={{ display: "flex", gap: 20, alignItems: "center", marginBottom: 28, paddingBottom: 24, borderBottom: "1px solid #f3f4f6" }}>
                <div style={{ width: 80, height: 80, borderRadius: "50%", background: "#f3f4f6" }} />
                <div style={{ flex: 1 }}>
                  <div style={{ height: 20, background: "#f3f4f6", borderRadius: 8, width: "55%", marginBottom: 10 }} />
                  <div style={{ height: 14, background: "#f3f4f6", borderRadius: 8, width: "35%" }} />
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                {[1,2,3,4].map(i => <div key={i} style={{ height: 64, background: "#f3f4f6", borderRadius: 10 }} />)}
              </div>
            </div>
          )}

          {/* No profile */}
          {!loading && !profile && (
            <div style={{ maxWidth: 680, background: "white", borderRadius: 16, padding: "56px 28px", textAlign: "center", border: "1px solid #e5e7eb" }}>
              <div style={{ width: 56, height: 56, background: "#f3f4f6", borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", fontSize: 24 }}>👤</div>
              <p style={{ color: "#374151", fontSize: 15, fontWeight: 600, marginBottom: 6 }}>Data profil belum tersedia</p>
              <p style={{ color: "#9ca3af", fontSize: 13 }}>Hubungi admin atau guru pembimbing kamu.</p>
            </div>
          )}

          {/* Profile card */}
          {!loading && profile && (
            <div style={{ maxWidth: 680 }}>
              <div style={{ background: "white", borderRadius: 16, border: "1px solid #e5e7eb", overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>

                {/* Top banner + avatar */}
                <div style={{ background: "#00182E", padding: "24px 28px 0", position: "relative" }}>
                  <div style={{ display: "flex", alignItems: "flex-end", gap: 20, paddingBottom: 20 }}>
                    <div style={{ width: 80, height: 80, borderRadius: "50%", background: "#013FF6", color: "white", fontWeight: 800, fontSize: 26, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, border: "4px solid white", boxShadow: "0 4px 16px rgba(0,0,0,0.3)" }}>
                      {initials(profile.name)}
                    </div>
                    <div style={{ paddingBottom: 4 }}>
                      <h2 style={{ color: "white", fontWeight: 800, fontSize: 20, margin: "0 0 6px 0" }}>{profile.name}</h2>
                      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                        <span style={{ background: "rgba(1,63,246,0.35)", color: "#93c5fd", padding: "2px 10px", borderRadius: 5, fontSize: 11, fontWeight: 700 }}>{profile.kelas}</span>
                        {profile.jurusan && <span style={{ background: "rgba(172,236,0,0.2)", color: "#ACEC00", padding: "2px 10px", borderRadius: 5, fontSize: 11, fontWeight: 700 }}>{profile.jurusan}</span>}
                        <span style={{ background: profile.isActive ? "rgba(172,236,0,0.2)" : "rgba(255,255,255,0.1)", color: profile.isActive ? "#ACEC00" : "rgba(255,255,255,0.5)", padding: "2px 10px", borderRadius: 5, fontSize: 11, fontWeight: 700 }}>
                          {profile.isActive ? "Aktif" : "Nonaktif"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Info grid */}
                <div style={{ padding: 24 }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
                    {[
                      { label: "NIS", value: profile.userId, icon: "🪪", mono: true },
                      { label: "Email", value: profile.email, icon: "✉️", mono: false },
                      { label: "Tempat PKL", value: profile.tempatPKL || "Belum diisi", icon: "🏢", mono: false },
                      { label: "Guru Pembimbing", value: profile.guruPembimbing || "Belum ditugaskan", icon: "👨‍🏫", mono: false },
                    ].map(f => (
                      <div key={f.label} style={{ background: "#f9fafb", borderRadius: 10, padding: "12px 16px", border: "1px solid #f3f4f6" }}>
                        <p style={{ color: "#9ca3af", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px", margin: "0 0 5px 0" }}>{f.icon} {f.label}</p>
                        <p style={{ color: f.value.startsWith("Belum") ? "#d1d5db" : "#111827", fontSize: 13, fontWeight: 600, margin: 0, fontFamily: f.mono ? "monospace" : "inherit" }}>{f.value}</p>
                      </div>
                    ))}

                    {/* No HP — editable */}
                    <div style={{ background: "#f9fafb", borderRadius: 10, padding: "12px 16px", border: editing ? "1.5px solid #ACEC00" : "1px solid #f3f4f6" }}>
                      <p style={{ color: "#9ca3af", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px", margin: "0 0 5px 0" }}>📱 No HP <span style={{ color: "#ACEC00", fontSize: 9 }}>{editing ? "✎ Edit" : ""}</span></p>
                      {editing ? (
                        <input type="text" value={form.noHp} onChange={e => setForm({ ...form, noHp: e.target.value })} placeholder="08xxxxxxxxxx"
                          style={{ ...inp, padding: "0", fontSize: 13, border: "none", background: "transparent" }} />
                      ) : (
                        <p style={{ color: profile.noHp ? "#111827" : "#d1d5db", fontSize: 13, fontWeight: 600, margin: 0 }}>{profile.noHp || "Belum diisi"}</p>
                      )}
                    </div>

                    {/* Alamat — editable, full width */}
                    <div style={{ background: "#f9fafb", borderRadius: 10, padding: "12px 16px", border: editing ? "1.5px solid #ACEC00" : "1px solid #f3f4f6", gridColumn: "1/-1" }}>
                      <p style={{ color: "#9ca3af", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px", margin: "0 0 5px 0" }}>📍 Alamat <span style={{ color: "#ACEC00", fontSize: 9 }}>{editing ? "✎ Edit" : ""}</span></p>
                      {editing ? (
                        <textarea value={form.alamat} onChange={e => setForm({ ...form, alamat: e.target.value })} placeholder="Alamat lengkap..." rows={2}
                          style={{ width: "100%", border: "none", background: "transparent", fontSize: 13, fontWeight: 600, color: "#111827", resize: "none", outline: "none", fontFamily: "inherit" }} />
                      ) : (
                        <p style={{ color: profile.alamat ? "#111827" : "#d1d5db", fontSize: 13, fontWeight: 600, margin: 0, lineHeight: 1.6 }}>{profile.alamat || "Belum diisi"}</p>
                      )}
                    </div>

                    {/* Password — only when editing */}
                    {editing && (
                      <div style={{ background: "#f9fafb", borderRadius: 10, padding: "12px 16px", border: "1.5px solid #ACEC00", gridColumn: "1/-1" }}>
                        <p style={{ color: "#9ca3af", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px", margin: "0 0 5px 0" }}>🔑 Ganti Password (opsional)</p>
                        <input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder="Kosongkan jika tidak ingin ganti"
                          style={{ width: "100%", border: "none", background: "transparent", fontSize: 13, color: "#111827", outline: "none" }} />
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div style={{ display: "flex", gap: 8, paddingTop: 8, borderTop: "1px solid #f3f4f6" }}>
                    {editing ? (
                      <>
                        <button onClick={handleSave} disabled={submitting}
                          style={{ background: "#00182E", color: "white", padding: "9px 22px", borderRadius: 9, fontWeight: 700, border: "none", cursor: "pointer", fontSize: 13 }}>
                          {submitting ? "Menyimpan..." : "Simpan Perubahan"}
                        </button>
                        <button onClick={() => { setEditing(false); setForm({ noHp: profile.noHp || "", alamat: profile.alamat || "", password: "" }); }}
                          style={{ background: "#f3f4f6", color: "#6b7280", padding: "9px 18px", borderRadius: 9, border: "none", cursor: "pointer", fontSize: 13 }}>
                          Batal
                        </button>
                      </>
                    ) : (
                      <button onClick={() => setEditing(true)}
                        style={{ background: "#013FF6", color: "white", padding: "9px 22px", borderRadius: 9, fontWeight: 700, border: "none", cursor: "pointer", fontSize: 13 }}>
                        ✏️ Edit Profil
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <p style={{ color: "#d1d5db", fontSize: 12, textAlign: "center", marginTop: 12 }}>
                NIS, email, kelas, dan tempat PKL hanya dapat diubah oleh admin.
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
