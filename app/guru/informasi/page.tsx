"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Sidebar from "@/components/layout/SidebarGuru";
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

export default function GuruInformasiPage() {
  useSession();
  const [list, setList] = useState<Informasi[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Informasi | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [judul, setJudul] = useState("");
  const [konten, setKonten] = useState("");

  const loadData = () => {
    setLoading(true);
    fetch("/api/informasi")
      .then(r => r.json())
      .then(d => { setList(d.data || []); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { loadData(); }, []);

  const openCreate = () => { setEditingId(null); setJudul(""); setKonten(""); setShowForm(true); };
  const openEdit = (item: Informasi) => {
    setSelected(null);
    setEditingId(item.id);
    setJudul(item.judul);
    setKonten(item.konten);
    setShowForm(true);
  };
  const closeForm = () => { setShowForm(false); setEditingId(null); setJudul(""); setKonten(""); };

  const handleSubmit = async () => {
    if (!judul.trim() || !konten.trim()) return;
    const url = editingId ? `/api/informasi/${editingId}` : "/api/informasi";
    const method = editingId ? "PUT" : "POST";
    await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ judul, konten }),
    });
    closeForm();
    loadData();
  };

  return (
    <div style={{ display: "flex", height: "100vh", background: "var(--bg)", overflow: "hidden" }}>
      <Sidebar />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, overflow: "hidden" }}>
        <TopBar />
        <main style={{ flex: 1, overflowY: "auto", padding: "28px 32px", background: "var(--bg)" }}>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "28px" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
                <span style={{ display: "block", width: 4, height: 32, background: "#ACEC00", borderRadius: 2, flexShrink: 0 }} />
                <span style={{ fontSize: 22, lineHeight: 1 }}>📢</span>
                <h1 style={{ color: "var(--text-primary)", fontSize: 28, fontWeight: 700, margin: 0, letterSpacing: "-0.3px" }}>
                  Informasi PKL
                </h1>
              </div>
              <p style={{ color: "var(--text-secondary)", fontSize: "13px", marginLeft: "14px" }}>
                {loading ? "Memuat data..." : `${list.length} informasi dipublikasikan`}
              </p>
            </div>
            <button
              onClick={openCreate}
              style={{ background: "#ACEC00", color: "#00182E", padding: "10px 20px", borderRadius: "10px", fontWeight: 700, border: "none", cursor: "pointer", fontSize: "14px", whiteSpace: "nowrap", flexShrink: 0 }}
            >
              + Tulis Informasi
            </button>
          </div>

          {loading && (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px", maxWidth: "768px" }}>
              {[1, 2, 3].map(i => (
                <div key={i} style={{ background: "var(--surface)", borderRadius: "16px", padding: "20px", border: "1px solid var(--bd)" }}>
                  <div style={{ background: "var(--sk)", borderRadius: "8px", height: "16px", width: "60%", marginBottom: "10px" }} />
                  <div style={{ background: "var(--sk)", borderRadius: "8px", height: "12px", width: "90%", marginBottom: "6px" }} />
                  <div style={{ background: "var(--sk)", borderRadius: "8px", height: "12px", width: "70%" }} />
                </div>
              ))}
            </div>
          )}

          {!loading && list.length === 0 && (
            <div style={{ textAlign: "center", marginTop: "80px" }}>
              <div style={{ width: "56px", height: "56px", background: "#00182E", borderRadius: "14px", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", fontSize: "24px" }}>
                📢
              </div>
              <p style={{ color: "var(--t2)", fontSize: "16px", fontWeight: 600, marginBottom: "6px" }}>Belum ada informasi</p>
              <p style={{ color: "var(--t4)", fontSize: "13px", marginBottom: "20px" }}>Klik &quot;Tulis Informasi&quot; untuk memulai.</p>
              <button onClick={openCreate} style={{ background: "#ACEC00", color: "#00182E", padding: "9px 20px", borderRadius: "9px", fontWeight: 700, border: "none", cursor: "pointer", fontSize: "13px" }}>
                + Tulis Sekarang
              </button>
            </div>
          )}

          {!loading && list.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px", maxWidth: "768px" }}>
              {list.map(item => (
                <div
                  key={item.id}
                  onClick={() => setSelected(item)}
                  style={{
                    background: "var(--surface)",
                    borderRadius: "16px",
                    padding: "18px 20px 18px 0",
                    border: "1px solid var(--bd)",
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
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px", paddingLeft: "20px" }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h2 style={{ color: "var(--t1)", fontWeight: 700, fontSize: "15px", margin: "0 0 6px 0", lineHeight: "1.4" }}>
                        {item.judul}
                      </h2>
                      <p style={{ ...clamp2, color: "var(--t3)", fontSize: "13px", margin: "0 0 10px 0", lineHeight: "1.5" }}>
                        {item.konten}
                      </p>
                      <p style={{ color: "#013FF6", fontSize: "12px", margin: 0, fontWeight: 500 }}>
                        {item.pembuat} · {new Date(item.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                      </p>
                    </div>
                    <div style={{ flexShrink: 0, paddingRight: "4px" }} onClick={e => e.stopPropagation()}>
                      <button
                        onClick={() => openEdit(item)}
                        style={{ background: "transparent", border: "1px solid var(--bd)", borderRadius: "8px", padding: "5px 12px", cursor: "pointer", color: "#013FF6", fontSize: "12px", fontWeight: 600 }}
                      >
                        Edit
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      {selected && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50, padding: "16px" }}
          onClick={() => setSelected(null)}>
          <div style={{ background: "var(--surface)", borderRadius: "20px", padding: "28px", maxWidth: "620px", width: "100%", maxHeight: "80vh", overflowY: "auto", boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}
            onClick={e => e.stopPropagation()}>
            <div style={{ borderLeft: "4px solid #ACEC00", paddingLeft: "14px", marginBottom: "20px" }}>
              <h2 style={{ color: "var(--t1)", fontWeight: 800, fontSize: "20px", margin: "0 0 6px 0" }}>{selected.judul}</h2>
              <p style={{ color: "#013FF6", fontSize: "12px", margin: 0, fontWeight: 500 }}>
                {selected.pembuat} · {new Date(selected.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
              </p>
            </div>
            <p style={{ color: "var(--t2)", lineHeight: 1.7, whiteSpace: "pre-wrap", margin: "0 0 24px 0", fontSize: "14px" }}>{selected.konten}</p>
            <div style={{ display: "flex", gap: "8px", borderTop: "1px solid var(--bd2)", paddingTop: "20px" }}>
              <button onClick={() => openEdit(selected)} style={{ background: "#013FF6", color: "white", padding: "8px 20px", borderRadius: "9px", border: "none", cursor: "pointer", fontWeight: 600, fontSize: "13px" }}>
                Edit
              </button>
              <button onClick={() => setSelected(null)} style={{ background: "var(--sk)", color: "var(--t3)", padding: "8px 20px", borderRadius: "9px", border: "none", cursor: "pointer", fontSize: "13px" }}>
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {showForm && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50, padding: "16px" }}
          onClick={closeForm}>
          <div style={{ background: "var(--surface)", borderRadius: "20px", padding: "28px", maxWidth: "500px", width: "100%", boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}
            onClick={e => e.stopPropagation()}>
            <h2 style={{ color: "var(--t1)", fontWeight: 700, margin: "0 0 20px 0", fontSize: "18px" }}>
              {editingId ? "Edit Informasi" : "Tulis Informasi Baru"}
            </h2>
            <div style={{ marginBottom: "14px" }}>
              <label style={{ display: "block", fontSize: "11px", fontWeight: 700, color: "var(--t3)", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                Judul
              </label>
              <input
                value={judul}
                onChange={e => setJudul(e.target.value)}
                placeholder="Judul informasi..."
                style={{ width: "100%", padding: "10px 12px", border: "1.5px solid var(--bd)", borderRadius: "10px", fontSize: "14px", outline: "none", boxSizing: "border-box", color: "var(--t1)", background: "var(--inp)" }}
              />
            </div>
            <div style={{ marginBottom: "20px" }}>
              <label style={{ display: "block", fontSize: "11px", fontWeight: 700, color: "var(--t3)", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                Konten
              </label>
              <textarea
                value={konten}
                onChange={e => setKonten(e.target.value)}
                placeholder="Tulis konten informasi..."
                rows={6}
                style={{ width: "100%", padding: "10px 12px", border: "1.5px solid var(--bd)", borderRadius: "10px", fontSize: "14px", outline: "none", resize: "vertical", boxSizing: "border-box", color: "var(--t1)", background: "var(--inp)" }}
              />
            </div>
            <div style={{ display: "flex", gap: "8px" }}>
              <button
                onClick={handleSubmit}
                disabled={!judul.trim() || !konten.trim()}
                style={{ background: "#ACEC00", color: "#00182E", padding: "10px 24px", borderRadius: "10px", fontWeight: 700, border: "none", cursor: "pointer", fontSize: "14px" }}
              >
                {editingId ? "Simpan" : "Publikasikan"}
              </button>
              <button
                onClick={closeForm}
                style={{ background: "var(--sk)", color: "var(--t3)", padding: "10px 20px", borderRadius: "10px", border: "none", cursor: "pointer", fontSize: "14px" }}
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
