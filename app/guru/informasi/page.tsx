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
  const [hoveredId, setHoveredId] = useState<number | null>(null);

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
    <div style={{ display: "flex", height: "100vh", background: "#00182E", overflow: "hidden" }}>
      <Sidebar />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, overflow: "hidden" }}>
        <TopBar />
        <main style={{ flex: 1, overflowY: "auto", padding: "28px 32px", background: "#00182E" }}>

          {/* Header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "28px" }}>
            <div>
              <h1 style={{ color: "#ACEC00", fontSize: "26px", fontWeight: 800, margin: 0, letterSpacing: "-0.3px" }}>
                Informasi PKL
              </h1>
              <p style={{ color: "rgba(255,255,255,0.45)", fontSize: "13px", marginTop: "6px", marginBottom: 0 }}>
                {loading ? "Memuat..." : `${list.length} informasi`}
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
            <p style={{ color: "rgba(255,255,255,0.5)", textAlign: "center", marginTop: "80px", fontSize: "14px" }}>Memuat...</p>
          )}

          {!loading && list.length === 0 && (
            <div style={{ textAlign: "center", marginTop: "80px" }}>
              <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "16px", marginBottom: "8px" }}>Belum ada informasi</p>
              <p style={{ color: "rgba(255,255,255,0.3)", fontSize: "13px", marginBottom: "20px" }}>Klik &quot;Tulis Informasi&quot; untuk memulai.</p>
              <button onClick={openCreate} style={{ background: "#ACEC00", color: "#00182E", padding: "8px 20px", borderRadius: "8px", fontWeight: 700, border: "none", cursor: "pointer", fontSize: "13px" }}>
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
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px" }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
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
                    <div style={{ flexShrink: 0 }} onClick={e => e.stopPropagation()}>
                      <button
                        onClick={() => openEdit(item)}
                        style={{ background: "transparent", border: "1px solid #ddd", borderRadius: "8px", padding: "5px 12px", cursor: "pointer", color: "#013FF6", fontSize: "12px", fontWeight: 600 }}
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

      {/* Detail Modal */}
      {selected && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50, padding: "16px" }}>
          <div style={{ background: "white", borderRadius: "16px", padding: "28px", maxWidth: "600px", width: "100%", maxHeight: "80vh", overflowY: "auto" }}>
            <h2 style={{ color: "#00182E", fontWeight: 800, fontSize: "20px", margin: "0 0 8px 0" }}>{selected.judul}</h2>
            <p style={{ color: "#999", fontSize: "12px", margin: "0 0 20px 0" }}>
              {selected.pembuat} · {new Date(selected.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
            </p>
            <p style={{ color: "#333", lineHeight: 1.7, whiteSpace: "pre-wrap", margin: 0, fontSize: "14px" }}>{selected.konten}</p>
            <div style={{ display: "flex", gap: "8px", marginTop: "24px" }}>
              <button onClick={() => openEdit(selected)} style={{ background: "#013FF6", color: "white", padding: "8px 20px", borderRadius: "8px", border: "none", cursor: "pointer", fontWeight: 600, fontSize: "13px" }}>
                Edit
              </button>
              <button onClick={() => setSelected(null)} style={{ background: "#f0f0f0", color: "#555", padding: "8px 20px", borderRadius: "8px", border: "none", cursor: "pointer", fontSize: "13px" }}>
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50, padding: "16px" }}>
          <div style={{ background: "white", borderRadius: "16px", padding: "28px", maxWidth: "500px", width: "100%" }}>
            <h2 style={{ color: "#00182E", fontWeight: 700, margin: "0 0 20px 0", fontSize: "18px" }}>
              {editingId ? "Edit Informasi" : "Tulis Informasi Baru"}
            </h2>
            <div style={{ marginBottom: "14px" }}>
              <label style={{ display: "block", fontSize: "11px", fontWeight: 700, color: "#666", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                Judul
              </label>
              <input
                value={judul}
                onChange={e => setJudul(e.target.value)}
                placeholder="Judul informasi..."
                style={{ width: "100%", padding: "10px 12px", border: "1.5px solid #e0e0e0", borderRadius: "8px", fontSize: "14px", outline: "none", boxSizing: "border-box" }}
              />
            </div>
            <div style={{ marginBottom: "20px" }}>
              <label style={{ display: "block", fontSize: "11px", fontWeight: 700, color: "#666", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                Konten
              </label>
              <textarea
                value={konten}
                onChange={e => setKonten(e.target.value)}
                placeholder="Tulis konten informasi..."
                rows={6}
                style={{ width: "100%", padding: "10px 12px", border: "1.5px solid #e0e0e0", borderRadius: "8px", fontSize: "14px", outline: "none", resize: "vertical", boxSizing: "border-box" }}
              />
            </div>
            <div style={{ display: "flex", gap: "8px" }}>
              <button
                onClick={handleSubmit}
                disabled={!judul.trim() || !konten.trim()}
                style={{ background: "#ACEC00", color: "#00182E", padding: "10px 24px", borderRadius: "8px", fontWeight: 700, border: "none", cursor: "pointer", fontSize: "14px" }}
              >
                {editingId ? "Simpan" : "Publikasikan"}
              </button>
              <button
                onClick={closeForm}
                style={{ background: "#f0f0f0", color: "#555", padding: "10px 20px", borderRadius: "8px", border: "none", cursor: "pointer", fontSize: "14px" }}
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
