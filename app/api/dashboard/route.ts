import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { prisma } from "@/lib/prisma";
import { authOptions } from "../auth/[...nextauth]/route";

export const dynamic = "force-dynamic";

function buildTanggalWhere(tanggalFilter?: string | null) {
    if (tanggalFilter) {
        const start = new Date(tanggalFilter);
        start.setHours(0, 0, 0, 0);
        const end = new Date(tanggalFilter);
        end.setHours(23, 59, 59, 999);
        return { gte: start, lte: end };
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);
    return { gte: today, lte: todayEnd };
}

export async function GET(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = session.user as any;
    const userRole = user.role ? user.role.toUpperCase() : "";
    const userEmail = user.email;

    const { searchParams } = new URL(req.url);
    const kelasFilter = searchParams.get("kelas");
    const tanggalFilter = searchParams.get("tanggal");
    const tempatPKLFilter = searchParams.get("tempatPKL");

    try {
        // ── ADMIN ──
        if (userRole === "ADMIN") {
            const tanggalWhere = buildTanggalWhere(tanggalFilter);
            const siswaWhere: any = kelasFilter ? { kelas: kelasFilter } : {};
            const semuaSiswa = await prisma.dataSiswa.findMany({
                where: siswaWhere,
                select: { userId: true, kelas: true },
            });

            const totalSiswa = semuaSiswa.length;
            const allUserIds = semuaSiswa.map(s => s.userId);

            const hadirData = await prisma.absensi.groupBy({
                by: ['userId'],
                where: {
                    userId: { in: allUserIds },
                    tanggal: tanggalWhere,
                    status: "Hadir",
                    tipe: "masuk",
                },
                _count: { userId: true },
            });

            const hadirSet = new Set(hadirData.map(h => h.userId));
            const hadirCount = hadirSet.size;
            const tidakHadir = totalSiswa - hadirCount;
            const persentaseKehadiran = totalSiswa > 0 ? Math.round((hadirCount / totalSiswa) * 100) : 0;

            const kelasSiswaMap = new Map<string, string[]>();
            semuaSiswa.forEach(s => {
                if (!kelasSiswaMap.has(s.kelas)) kelasSiswaMap.set(s.kelas, []);
                kelasSiswaMap.get(s.kelas)!.push(s.userId);
            });

            const tableData = Array.from(kelasSiswaMap.entries()).map(([kelas, ids]) => {
                const hadirKelas = ids.filter(id => hadirSet.has(id)).length;
                const totalKelas = ids.length;
                return {
                    kelas,
                    hadir: hadirKelas,
                    total: totalKelas,
                    persentase: totalKelas > 0 ? Math.round((hadirKelas / totalKelas) * 100) : 0,
                };
            });

            return NextResponse.json({
                cards: { totalSiswa, hadirHariIni: hadirCount, tidakHadir, persentaseKehadiran },
                table: tableData,
            });
        }

        // ── GURU ───
        if (userRole === "GURU") {
            const guruUser = await prisma.user.findUnique({
                where: { email: userEmail },
                select: { name: true, username: true },
            });

            if (!guruUser?.name) {
                return NextResponse.json({
                    cards: { totalSiswaPKL: 0, hadirHariIni: 0, tidakHadir: 0, persentaseKehadiran: 0 },
                    table: [],
                });
            }

            const searchConditions: any[] = [
                { guruPembimbing: { contains: guruUser.name, mode: "insensitive" } },
            ];
            if (guruUser.username) {
                searchConditions.push({ guruPembimbing: { contains: guruUser.username, mode: "insensitive" } });
            }

            const siswaBimbingan = await prisma.dataSiswa.findMany({
                where: {
                    OR: searchConditions,
                    ...(tempatPKLFilter ? { tempatPKL: tempatPKLFilter } : {}),
                },
                select: { userId: true, tempatPKL: true },
            });

            const studentIds = siswaBimbingan.map(s => s.userId);
            const totalSiswaPKL = studentIds.length;

            if (totalSiswaPKL === 0) {
                return NextResponse.json({
                    cards: { totalSiswaPKL: 0, hadirHariIni: 0, tidakHadir: 0, persentaseKehadiran: 0 },
                    table: [],
                });
            }

            const tanggalWhere = buildTanggalWhere(tanggalFilter);

            const now = new Date();
            const rangeForTotal = tanggalFilter
                ? tanggalWhere
                : { gte: new Date(now.getFullYear(), now.getMonth(), 1), lte: new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999) };

            const [hadirHariIniData, hadirBulanData, totalBulanData, users] = await Promise.all([
                prisma.absensi.groupBy({
                    by: ['userId'],
                    where: { userId: { in: studentIds }, tanggal: tanggalWhere, status: "Hadir", tipe: "masuk" },
                    _count: { userId: true },
                }),
                prisma.absensi.groupBy({
                    by: ['userId'],
                    where: { userId: { in: studentIds }, tanggal: rangeForTotal, status: "Hadir", tipe: "masuk" },
                    _count: { userId: true },
                }),
                prisma.absensi.groupBy({
                    by: ['userId'],
                    where: { userId: { in: studentIds }, tanggal: rangeForTotal, tipe: "masuk" },
                    _count: { userId: true },
                }),
                prisma.user.findMany({
                    where: { username: { in: studentIds } },
                    select: { username: true, name: true },
                }),
            ]);

            const hadirHariIni = hadirHariIniData.length;
            const tidakHadir = totalSiswaPKL - hadirHariIni;
            const persentaseKehadiran = totalSiswaPKL > 0 ? Math.round((hadirHariIni / totalSiswaPKL) * 100) : 0;

            const userMap = new Map(users.map(u => [u.username, u.name]));
            const hadirMap = new Map(hadirBulanData.map(h => [h.userId, h._count.userId]));
            const totalMap = new Map(totalBulanData.map(t => [t.userId, t._count.userId]));

            const tableData = siswaBimbingan.map(s => ({
                tempatPKL: s.tempatPKL || "-",
                siswa: userMap.get(s.userId) || s.userId,
                hadir: hadirMap.get(s.userId) || 0,
                totalHari: totalMap.get(s.userId) || 0,
            }));

            return NextResponse.json({
                cards: { totalSiswaPKL, hadirHariIni, tidakHadir, persentaseKehadiran },
                table: tableData,
            });
        }

        // ── SISWA ───
        if (userRole === "SISWA") {
            const userData = await prisma.user.findUnique({
                where: { email: userEmail },
                select: { username: true },
            });

            if (!userData?.username) {
                return NextResponse.json({
                    cards: { totalHariBulanIni: 0, hadirBulanIni: 0, tidakHadirBulanIni: 0, persentaseKehadiran: 0 },
                });
            }

            const now = new Date();
            const startBulan = new Date(now.getFullYear(), now.getMonth(), 1);
            startBulan.setHours(0, 0, 0, 0);
            const endBulan = new Date(now.getFullYear(), now.getMonth() + 1, 0);
            endBulan.setHours(23, 59, 59, 999);

            // FIX: 2 query paralel, bukan serial
            const [totalHariBulanIni, hadirBulanIni] = await Promise.all([
                prisma.absensi.count({
                    where: { userId: userData.username, tanggal: { gte: startBulan, lte: endBulan }, tipe: "masuk" },
                }),
                prisma.absensi.count({
                    where: { userId: userData.username, tanggal: { gte: startBulan, lte: endBulan }, status: "Hadir", tipe: "masuk" },
                }),
            ]);

            const tidakHadirBulanIni = totalHariBulanIni - hadirBulanIni;
            const persentaseKehadiran = totalHariBulanIni > 0 ? Math.round((hadirBulanIni / totalHariBulanIni) * 100) : 0;

            return NextResponse.json({
                cards: { totalHariBulanIni, hadirBulanIni, tidakHadirBulanIni, persentaseKehadiran },
            });
        }

        return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    } catch (error) {
        console.error("Dashboard GET error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}