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

    if (userRole !== "ADMIN") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const kelasFilter = searchParams.get("kelas");
    const tanggalFilter = searchParams.get("tanggal");

    try {
        // Filter tanggal
        let tanggalWhere: any = {};
        if (tanggalFilter) {
            const start = new Date(tanggalFilter);
            start.setHours(0, 0, 0, 0);
            const end = new Date(tanggalFilter);
            end.setHours(23, 59, 59, 999);
            tanggalWhere = { gte: start, lte: end };
        } else {
            const now = new Date();
            const startBulan = new Date(now.getFullYear(), now.getMonth(), 1);
            const endBulan = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
            tanggalWhere = { gte: startBulan, lte: endBulan };
        }

        // Ambil data absensi dengan relasi dataSiswa
        const absensiList = await prisma.absensi.findMany({
            where: {
                tanggal: tanggalWhere,
                ...(kelasFilter
                    ? { dataSiswa: { kelas: kelasFilter } }
                    : {}),
            },
            include: { dataSiswa: true },
            orderBy: { tanggal: "desc" },
        });

        // Ambil nama siswa
        const userIds = [...new Set(absensiList.map((a) => a.userId))];
        const users = await prisma.user.findMany({
            where: { username: { in: userIds } },
            select: { username: true, name: true },
        });
        const userMap = new Map(users.map((u) => [u.username, u.name]));

        // Build CSV
        const headers = ["Tanggal", "Nama Siswa", "Kelas", "Tempat PKL", "Status", "Waktu", "Keterangan"];
        const rows = absensiList.map((a) => [
            `"${a.tanggal.toLocaleDateString("id-ID")}"`,
            `"${userMap.get(a.userId) || a.userId}"`,
            `"${a.dataSiswa?.kelas || "-"}"`,
            `"${a.dataSiswa?.tempatPKL || "-"}"`,
            `"${a.status}"`,
            `"${a.waktu || "-"}"`,
            `"${(a.keterangan || "").replace(/"/g, '""')}"`,
        ].join(","));

        const csv = [headers.join(","), ...rows].join("\n");
        const filename = `Laporan_Dashboard_${new Date().toISOString().split("T")[0]}.csv`;

        return new NextResponse(csv, {
            status: 200,
            headers: {
                "Content-Type": "text/csv; charset=utf-8",
                "Content-Disposition": `attachment; filename="${filename}"`,
            },
        });
    } catch (error) {
        console.error("Dashboard export error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
