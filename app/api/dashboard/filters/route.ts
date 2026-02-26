import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { prisma } from "@/lib/prisma";
import { authOptions } from "../../auth/[...nextauth]/route";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = session.user as any;
    const userRole = user.role ? user.role.toUpperCase() : "";
    const userEmail = user.email;

    try {
        // Ambil daftar tanggal unik dari absensi (30 hari terakhir)
        const tiga0HariLalu = new Date();
        tiga0HariLalu.setDate(tiga0HariLalu.getDate() - 30);

        const absensiList = await prisma.absensi.findMany({
            where: { tanggal: { gte: tiga0HariLalu } },
            select: { tanggal: true },
            distinct: ["tanggal"],
            orderBy: { tanggal: "desc" },
        });

        // Format tanggal menjadi YYYY-MM-DD (string unik per hari)
        const tanggalSet = new Set<string>();
        absensiList.forEach((a) => {
            const dateStr = a.tanggal.toISOString().split("T")[0];
            tanggalSet.add(dateStr);
        });
        const tanggal = Array.from(tanggalSet).sort((a, b) => b.localeCompare(a));

        // ── ADMIN: kembalikan daftar kelas ──
        if (userRole === "ADMIN") {
            const kelasRows = await prisma.dataSiswa.groupBy({
                by: ["kelas"],
                orderBy: { kelas: "asc" },
            });

            const kelas = kelasRows.map((k) => ({
                id: k.kelas,
                label: k.kelas,
            }));

            return NextResponse.json({ kelas, tanggal });
        }

        // ── GURU: kembalikan daftar tempat PKL dari siswa bimbingannya ──
        if (userRole === "GURU") {
            const guruUser = await prisma.user.findUnique({
                where: { email: userEmail },
                select: { name: true, username: true },
            });

            if (!guruUser?.name) {
                return NextResponse.json({ tempatPKL: [], tanggal });
            }

            const searchConditions: any[] = [
                { guruPembimbing: { contains: guruUser.name, mode: "insensitive" } },
            ];
            if (guruUser.username) {
                searchConditions.push({
                    guruPembimbing: { contains: guruUser.username, mode: "insensitive" },
                });
            }

            const siswaBimbingan = await prisma.dataSiswa.findMany({
                where: { OR: searchConditions },
                select: { tempatPKL: true },
                distinct: ["tempatPKL"],
            });

            const tempatPKL = siswaBimbingan
                .filter((s) => s.tempatPKL)
                .map((s) => ({
                    id: s.tempatPKL as string,
                    label: s.tempatPKL as string,
                }));

            return NextResponse.json({ tempatPKL, tanggal });
        }

        return NextResponse.json({ tanggal });
    } catch (error) {
        console.error("Dashboard filters error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
