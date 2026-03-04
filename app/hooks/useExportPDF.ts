import { useCallback, useState } from "react";

export interface AbsensiRow {
    tanggal: string;
    siswa: string;
    tempatPKL: string;
    status: string;
    waktu: string;
    catatan: string;
    kegiatan: string;
    lokasi: string;
    foto: string;
    tandaTangan: string;
}

async function loadImageAsBase64(url: string): Promise<string | null> {
    if (!url) return null;
    try {
        const res = await fetch(url);
        const blob = await res.blob();
        return await new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.onerror = () => resolve(null);
            reader.readAsDataURL(blob);
        });
    } catch {
        return null;
    }
}

export function useExportPDF() {
    const [exporting, setExporting] = useState(false);

    const exportPDF = useCallback(async (
        data: AbsensiRow[],
        title: string = "Laporan Absensi PKL"
    ) => {
        if (data.length === 0) {
            alert("Tidak ada data untuk diekspor.");
            return;
        }

        setExporting(true);

        try {
            const jsPDFModule = await import("jspdf");
            const jsPDF = jsPDFModule.default ?? (jsPDFModule as any).jsPDF;

            const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
            const pageW = doc.internal.pageSize.getWidth();
            const pageH = doc.internal.pageSize.getHeight();
            const margin = 14;
            const contentW = pageW - margin * 2;

            const colorIndigo: [number, number, number] = [67, 56, 202];
            const colorGray: [number, number, number] = [107, 114, 128];
            const colorLight: [number, number, number] = [243, 244, 246];
            const colorBorder: [number, number, number] = [209, 213, 219];
            const colorText: [number, number, number] = [17, 24, 39];
            const colorGreen: [number, number, number] = [22, 163, 74];
            const colorYellow: [number, number, number] = [217, 119, 6];

            // ── HEADER ──────────────────────────────────────────────────
            doc.setFillColor(...colorIndigo);
            doc.rect(0, 0, pageW, 32, "F");

            doc.setTextColor(255, 255, 255);
            doc.setFontSize(16);
            doc.setFont("helvetica", "bold");
            doc.text(title, margin, 14);

            doc.setFontSize(9);
            doc.setFont("helvetica", "normal");
            doc.text(`Dicetak: ${new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}   |   Total Data: ${data.length} record`, margin, 22);

            // ── SUMMARY BOX ─────────────────────────────────────────────
            const hadir = data.filter(d => d.status === "Hadir").length;
            const izin = data.filter(d => d.status === "Izin").length;
            const tidakHadir = data.filter(d => d.status !== "Hadir" && d.status !== "Izin").length;

            let sy = 38;
            const boxW = (contentW - 8) / 3;
            const boxes = [
                { label: "Hadir", val: hadir, color: colorGreen },
                { label: "Izin", val: izin, color: colorYellow },
                { label: "Lainnya", val: tidakHadir, color: colorGray },
            ];

            boxes.forEach((box, i) => {
                const bx = margin + i * (boxW + 4);
                doc.setFillColor(...colorLight);
                doc.roundedRect(bx, sy, boxW, 18, 2, 2, "F");
                doc.setDrawColor(...colorBorder);
                doc.setLineWidth(0.3);
                doc.roundedRect(bx, sy, boxW, 18, 2, 2, "S");

                doc.setTextColor(...box.color);
                doc.setFontSize(18);
                doc.setFont("helvetica", "bold");
                doc.text(String(box.val), bx + boxW / 2, sy + 11, { align: "center" });

                doc.setTextColor(...colorGray);
                doc.setFontSize(8);
                doc.setFont("helvetica", "normal");
                doc.text(box.label, bx + boxW / 2, sy + 16, { align: "center" });
            });

            sy += 24;

            // ── PER SISWA SECTIONS ───────────────────────────────────────
            // Group by siswa
            const grouped: Record<string, AbsensiRow[]> = {};
            data.forEach(row => {
                if (!grouped[row.siswa]) grouped[row.siswa] = [];
                grouped[row.siswa].push(row);
            });

            for (const [siswa, rows] of Object.entries(grouped)) {
                if (sy > pageH - 60) {
                    doc.addPage();
                    sy = margin;
                }

                // ── Siswa header ─────────────────────────────────────────
                doc.setFillColor(...colorIndigo);
                doc.roundedRect(margin, sy, contentW, 10, 2, 2, "F");
                doc.setTextColor(255, 255, 255);
                doc.setFontSize(10);
                doc.setFont("helvetica", "bold");
                doc.text(`${siswa}  —  ${rows[0].tempatPKL}`, margin + 4, sy + 7);
                sy += 14;

                // ── Table header ─────────────────────────────────────────
                const cols = [
                    { label: "Tanggal", w: 28 },
                    { label: "Status", w: 22 },
                    { label: "Waktu", w: 22 },
                    { label: "Keterangan", w: 48 },
                    { label: "Lokasi", w: 28 },
                    { label: "Foto", w: 22 },
                    { label: "TTD", w: 22 },
                ];

                doc.setFillColor(...colorLight);
                doc.rect(margin, sy, contentW, 8, "F");
                doc.setDrawColor(...colorBorder);
                doc.setLineWidth(0.2);
                doc.rect(margin, sy, contentW, 8, "S");

                doc.setTextColor(...colorText);
                doc.setFontSize(8);
                doc.setFont("helvetica", "bold");
                let cx = margin + 2;
                cols.forEach(col => {
                    doc.text(col.label, cx, sy + 5.5);
                    cx += col.w;
                });
                sy += 8;

                // ── Table rows ───────────────────────────────────────────
                for (const row of rows) {
                    const rowH = 28;

                    if (sy + rowH > pageH - margin) {
                        doc.addPage();
                        sy = margin;
                    }

                    // Row background
                    doc.setFillColor(255, 255, 255);
                    doc.rect(margin, sy, contentW, rowH, "F");
                    doc.setDrawColor(...colorBorder);
                    doc.setLineWidth(0.15);
                    doc.rect(margin, sy, contentW, rowH, "S");

                    // Status badge color
                    const statusColor: [number, number, number] =
                        row.status === "Hadir" ? colorGreen :
                            row.status === "Izin" ? colorYellow : colorGray;

                    doc.setFontSize(7.5);
                    doc.setFont("helvetica", "normal");
                    doc.setTextColor(...colorText);

                    cx = margin + 2;

                    // Tanggal
                    doc.text(row.tanggal || "-", cx, sy + 6);
                    cx += cols[0].w;

                    // Status
                    doc.setTextColor(...statusColor);
                    doc.setFont("helvetica", "bold");
                    doc.text(row.status || "-", cx, sy + 6);
                    doc.setFont("helvetica", "normal");
                    doc.setTextColor(...colorText);
                    cx += cols[1].w;

                    // Waktu
                    doc.text(row.waktu || "-", cx, sy + 6);
                    cx += cols[2].w;

                    // Keterangan (catatan + kegiatan)
                    const ket = [row.catatan, row.kegiatan].filter(Boolean).join(" | ") || "-";
                    const ketLines = doc.splitTextToSize(ket, cols[3].w - 2);
                    doc.text(ketLines.slice(0, 3), cx, sy + 6);
                    cx += cols[3].w;

                    // Lokasi
                    const lokasiText = row.lokasi ? "Ada (GPS)" : "-";
                    doc.text(lokasiText, cx, sy + 6);
                    cx += cols[4].w;

                    // Foto
                    if (row.foto) {
                        try {
                            const b64 = await loadImageAsBase64(row.foto);
                            if (b64) {
                                doc.addImage(b64, "JPEG", cx, sy + 2, 18, 22, undefined, "FAST");
                            } else {
                                doc.setTextColor(...colorGray);
                                doc.text("N/A", cx + 6, sy + 14);
                            }
                        } catch {
                            doc.setTextColor(...colorGray);
                            doc.text("N/A", cx + 6, sy + 14);
                        }
                    } else {
                        doc.setTextColor(...colorGray);
                        doc.text("-", cx + 8, sy + 14);
                    }
                    doc.setTextColor(...colorText);
                    cx += cols[5].w;

                    // TTD
                    if (row.tandaTangan) {
                        try {
                            const b64 = await loadImageAsBase64(row.tandaTangan);
                            if (b64) {
                                doc.setFillColor(255, 255, 255);
                                doc.rect(cx, sy + 2, 18, 22, "F");
                                doc.addImage(b64, "PNG", cx, sy + 2, 18, 22, undefined, "FAST");
                            } else {
                                doc.setTextColor(...colorGray);
                                doc.text("N/A", cx + 4, sy + 14);
                            }
                        } catch {
                            doc.setTextColor(...colorGray);
                            doc.text("N/A", cx + 4, sy + 14);
                        }
                    } else {
                        doc.setTextColor(...colorGray);
                        doc.text("-", cx + 8, sy + 14);
                    }
                    doc.setTextColor(...colorText);

                    sy += rowH;
                }

                sy += 8;
            }

            // ── FOOTER setiap halaman ────────────────────────────────────
            const totalPages = (doc.internal as any).getNumberOfPages();
            for (let i = 1; i <= totalPages; i++) {
                doc.setPage(i);
                doc.setDrawColor(...colorBorder);
                doc.setLineWidth(0.3);
                doc.line(margin, pageH - 12, pageW - margin, pageH - 12);
                doc.setFontSize(7.5);
                doc.setTextColor(...colorGray);
                doc.text("Sistem Presensi Online PKL — PPLG Nusa", margin, pageH - 7);
                doc.text(`Halaman ${i} / ${totalPages}`, pageW - margin, pageH - 7, { align: "right" });
            }

            const fileName = `Laporan_Absensi_${new Date().toISOString().split("T")[0]}.pdf`;
            doc.save(fileName);

        } catch (err) {
            console.error("Export PDF error:", err);
            alert("Gagal membuat PDF. Pastikan library jsPDF sudah terinstall.\n\nnpm install jspdf");
        } finally {
            setExporting(false);
        }
    }, []);

    return { exportPDF, exporting };
}