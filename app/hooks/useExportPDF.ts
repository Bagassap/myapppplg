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
            const drawGlobalHeader = (sy: number): number => {
                doc.setFillColor(...colorIndigo);
                doc.rect(0, 0, pageW, 32, "F");

                doc.setTextColor(255, 255, 255);
                doc.setFontSize(16);
                doc.setFont("helvetica", "bold");
                doc.text(title, margin, 14);

                doc.setFontSize(9);
                doc.setFont("helvetica", "normal");
                doc.text(
                    `Dicetak: ${new Date().toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                    })}   |   Total Data: ${data.length} record`,
                    margin,
                    22
                );

                return sy;
            };

            const drawSummaryBoxes = (
                hadir: number,
                izin: number,
                lainnya: number,
                startY: number
            ): number => {
                const boxW = (contentW - 8) / 3;
                const boxes = [
                    { label: "Hadir", val: hadir, color: colorGreen },
                    { label: "Izin", val: izin, color: colorYellow },
                    { label: "Lainnya", val: lainnya, color: colorGray },
                ];

                boxes.forEach((box, i) => {
                    const bx = margin + i * (boxW + 4);
                    doc.setFillColor(...colorLight);
                    doc.roundedRect(bx, startY, boxW, 18, 2, 2, "F");
                    doc.setDrawColor(...colorBorder);
                    doc.setLineWidth(0.3);
                    doc.roundedRect(bx, startY, boxW, 18, 2, 2, "S");

                    doc.setTextColor(...box.color);
                    doc.setFontSize(18);
                    doc.setFont("helvetica", "bold");
                    doc.text(String(box.val), bx + boxW / 2, startY + 11, { align: "center" });

                    doc.setTextColor(...colorGray);
                    doc.setFontSize(8);
                    doc.setFont("helvetica", "normal");
                    doc.text(box.label, bx + boxW / 2, startY + 16, { align: "center" });
                });

                return startY + 24;
            };

            const drawStudentHeader = (siswa: string, tempatPKL: string, startY: number): number => {
                doc.setFillColor(...colorIndigo);
                doc.roundedRect(margin, startY, contentW, 10, 2, 2, "F");
                doc.setTextColor(255, 255, 255);
                doc.setFontSize(10);
                doc.setFont("helvetica", "bold");
                doc.text(`${siswa}  —  ${tempatPKL}`, margin + 4, startY + 7);
                return startY + 14;
            };

            const cols = [
                { label: "Tanggal", w: 28 },
                { label: "Status", w: 22 },
                { label: "Waktu", w: 22 },
                { label: "Keterangan", w: 48 },
                { label: "Lokasi", w: 28 },
                { label: "Foto", w: 22 },
                { label: "TTD", w: 22 },
            ];

            const drawTableHeader = (startY: number): number => {
                doc.setFillColor(...colorLight);
                doc.rect(margin, startY, contentW, 8, "F");
                doc.setDrawColor(...colorBorder);
                doc.setLineWidth(0.2);
                doc.rect(margin, startY, contentW, 8, "S");

                doc.setTextColor(...colorText);
                doc.setFontSize(8);
                doc.setFont("helvetica", "bold");
                let cx = margin + 2;
                cols.forEach((col) => {
                    doc.text(col.label, cx, startY + 5.5);
                    cx += col.w;
                });
                return startY + 8;
            };

            const hadir = data.filter((d) => d.status === "Hadir").length;
            const izin = data.filter((d) => d.status === "Izin").length;
            const tidakHadir = data.filter(
                (d) => d.status !== "Hadir" && d.status !== "Izin"
            ).length;

            drawGlobalHeader(0);
            let sy = 38;
            sy = drawSummaryBoxes(hadir, izin, tidakHadir, sy);

            const grouped: Record<string, AbsensiRow[]> = {};
            data.forEach((row) => {
                if (!grouped[row.siswa]) grouped[row.siswa] = [];
                grouped[row.siswa].push(row);
            });

            let isFirstStudent = true;

            for (const [siswa, rows] of Object.entries(grouped)) {
                if (!isFirstStudent) {
                    doc.addPage();
                    sy = margin;
                } else {
                    if (sy > pageH - 60) {
                        doc.addPage();
                        sy = margin;
                    }
                }
                isFirstStudent = false;

                sy = drawStudentHeader(siswa, rows[0].tempatPKL, sy);

                sy = drawTableHeader(sy);

                for (const row of rows) {
                    const rowH = 28;

                    if (sy + rowH > pageH - margin) {
                        doc.addPage();
                        sy = margin;

                        sy = drawStudentHeader(
                            `${siswa} (lanjutan)`,
                            rows[0].tempatPKL,
                            sy
                        );
                        sy = drawTableHeader(sy);
                    }

                    doc.setFillColor(255, 255, 255);
                    doc.rect(margin, sy, contentW, rowH, "F");
                    doc.setDrawColor(...colorBorder);
                    doc.setLineWidth(0.15);
                    doc.rect(margin, sy, contentW, rowH, "S");

                    const statusColor: [number, number, number] =
                        row.status === "Hadir"
                            ? colorGreen
                            : row.status === "Izin"
                                ? colorYellow
                                : colorGray;

                    doc.setFontSize(7.5);
                    doc.setFont("helvetica", "normal");
                    doc.setTextColor(...colorText);

                    let cx = margin + 2;

                    doc.text(row.tanggal || "-", cx, sy + 6);
                    cx += cols[0].w;

                    doc.setTextColor(...statusColor);
                    doc.setFont("helvetica", "bold");
                    doc.text(row.status || "-", cx, sy + 6);
                    doc.setFont("helvetica", "normal");
                    doc.setTextColor(...colorText);
                    cx += cols[1].w;

                    doc.text(row.waktu || "-", cx, sy + 6);
                    cx += cols[2].w;

                    const ket =
                        [row.catatan, row.kegiatan].filter(Boolean).join(" | ") || "-";
                    const ketLines = doc.splitTextToSize(ket, cols[3].w - 2);
                    doc.text(ketLines.slice(0, 3), cx, sy + 6);
                    cx += cols[3].w;

                    doc.text(row.lokasi ? "Ada (GPS)" : "-", cx, sy + 6);
                    cx += cols[4].w;
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

            const totalPages = (doc.internal as any).getNumberOfPages();
            for (let i = 1; i <= totalPages; i++) {
                doc.setPage(i);
                doc.setDrawColor(...colorBorder);
                doc.setLineWidth(0.3);
                doc.line(margin, pageH - 12, pageW - margin, pageH - 12);
                doc.setFontSize(7.5);
                doc.setTextColor(...colorGray);
                doc.text(
                    "Sistem Presensi Online PKL — PPLG Nusa",
                    margin,
                    pageH - 7
                );
                doc.text(
                    `Halaman ${i} / ${totalPages}`,
                    pageW - margin,
                    pageH - 7,
                    { align: "right" }
                );
            }

            const tempatPKL = data[0]?.tempatPKL ?? "";
            const slug = tempatPKL
                .trim()
                .replace(/[^a-zA-Z0-9\s]/g, "")
                .replace(/\s+/g, "-");
            const fileName = slug
                ? `Laporan-Absen-${slug}.pdf`
                : `Laporan-Absensi-${new Date().toISOString().split("T")[0]}.pdf`;

            try {
                const pdfData = doc.output("datauristring");
                const link = document.createElement("a");
                link.href = pdfData;
                link.download = fileName;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            } catch {
                doc.save(fileName);
            }

        } catch (err) {
            console.error("Export PDF error:", err);
            alert(
                "Gagal membuat PDF. Pastikan library jsPDF sudah terinstall.\n\nnpm install jspdf"
            );
        } finally {
            setExporting(false);
        }
    }, []);

    return { exportPDF, exporting };
}
