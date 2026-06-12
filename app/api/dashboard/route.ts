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

async function buildTrendData(allUserIds: string[]) {
    const DAY_LABELS = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
    const totalSiswa = allUserIds.length;

    const days: { label: string; start: Date; end: Date }[] = [];
    for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const start = new Date(d);
        start.setHours(0, 0, 0, 0);
        const end = new Date(d);
        end.setHours(23, 59, 59, 999);
        days.push({ label: DAY_LABELS[d.getDay()], start, end });
    }

    const windowStart = days[0].start;
    const windowEnd = days[days.length - 1].end;

    const absensi = await prisma.absensi.findMany({
        where: {
            userId: { in: allUserIds },
            tanggal: { gte: windowStart, lte: windowEnd },
            tipe: { in: ["masuk", "absen"] },
        },
        select: { tanggal: true, status: true },
    });

    return days.map(({ label, start, end }) => {
        const dayRecords = absensi.filter(
            (a) => a.tanggal >= start && a.tanggal <= end
        );
        const hadir = dayRecords.filter((a) => a.status === "Hadir").length;
        const absen = totalSiswa - hadir;
        return { day: label, hadir, absen };
    });
}

function hitungStatus(userIds: string[], statusMap: Map<string, string>) {
    let hadir = 0;
    let izin = 0;
    let alfa = 0;
    userIds.forEach((id) => {
        const st = statusMap.get(id);
        if (st === "Hadir") hadir++;
        else if (st === "Izin" || st === "Sakit") izin++;
        else alfa++;
    });
    return { hadir, izin, alfa };
}

export async function GET(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = session.user as any;
    const userRole = (user.role ?? "").toUpperCase();
    const userEmail = user.email as string;

    const { searchParams } = new URL(req.url);
    const kelasFilter = searchParams.get("kelas");
    const tanggalFilter = searchParams.get("tanggal");
    const tempatPKLFilter = searchParams.get("tempatPKL");

    try {

        if (userRole === "ADMIN") {
            const siswaWhere: any = kelasFilter ? { kelas: kelasFilter } : {};

            const semuaSiswa = await prisma.dataSiswa.findMany({
                where: siswaWhere,
                select: { userId: true, kelas: true },
            });

            const totalSiswa = semuaSiswa.length;
            const allUserIds = semuaSiswa.map((s) => s.userId);

            const tanggalWhere = buildTanggalWhere(tanggalFilter);

            const absensiHariIni = await prisma.absensi.findMany({
                where: {
                    userId: { in: allUserIds },
                    tanggal: tanggalWhere,
                    tipe: { in: ["masuk", "absen"] },
                },
                select: { userId: true, status: true },
            });

            const statusMap = new Map<string, string>();
            absensiHariIni.forEach((a) => statusMap.set(a.userId, a.status));

            const { hadir: hadirCount, izin: izinCount, alfa: alfaCount } =
                hitungStatus(allUserIds, statusMap);

            const persentaseKehadiran =
                totalSiswa > 0 ? Math.round((hadirCount / totalSiswa) * 100) : 0;

            const kelasSiswaMap = new Map<string, string[]>();
            semuaSiswa.forEach((s) => {
                if (!kelasSiswaMap.has(s.kelas)) kelasSiswaMap.set(s.kelas, []);
                kelasSiswaMap.get(s.kelas)!.push(s.userId);
            });

            const tableData = Array.from(kelasSiswaMap.entries())
                .map(([kelas, ids]) => {
                    const { hadir: hadirKelas, izin: izinKelas, alfa: alfaKelas } =
                        hitungStatus(ids, statusMap);
                    const totalKelas = ids.length;
                    return {
                        kelas,
                        hadir: hadirKelas,
                        izin: izinKelas,
                        tidakHadir: alfaKelas,
                        total: totalKelas,
                        persentase:
                            totalKelas > 0
                                ? Math.round((hadirKelas / totalKelas) * 100)
                                : 0,
                    };
                })
                .sort((a, b) => b.persentase - a.persentase);

            const trend =
                allUserIds.length > 0 ? await buildTrendData(allUserIds) : [];

            const totalGuru = await prisma.user.count({
                where: { role: "GURU" as any },
            });

            const absensiTerbaruRaw = await prisma.absensi.findMany({
                where: { tanggal: tanggalWhere, tipe: { in: ["masuk", "absen"] } },
                orderBy: { createdAt: "desc" },
                take: 10,
                select: { userId: true, status: true, waktu: true, createdAt: true },
            });
            const terbaruIds = [...new Set(absensiTerbaruRaw.map((a) => a.userId))];
            const terbaruUsers = await prisma.user.findMany({
                where: { username: { in: terbaruIds } },
                select: { username: true, name: true },
            });
            const terbaruUserMap = new Map<string, string>();
            terbaruUsers.forEach((u) => {
                if (u.username) terbaruUserMap.set(u.username, u.name ?? u.username);
            });
            const absensiTerbaru = absensiTerbaruRaw.map((a) => ({
                nama: terbaruUserMap.get(a.userId) ?? a.userId,
                status: a.status,
                waktu: a.waktu ?? null,
                createdAt: a.createdAt.toISOString(),
            }));

            return NextResponse.json({
                cards: {
                    totalSiswa,
                    totalGuru,
                    hadirHariIni: hadirCount,
                    izin: izinCount,
                    tidakHadir: alfaCount,
                    persentaseKehadiran,
                },
                table: tableData,
                trend,
                absensiTerbaru,
            });
        }

        if (userRole === "GURU") {
            const guruUser = await prisma.user.findUnique({
                where: { email: userEmail },
                select: { name: true, username: true },
            });

            if (!guruUser) {
                return NextResponse.json({
                    cards: { totalSiswaPKL: 0, hadirHariIni: 0, izin: 0, tidakHadir: 0, persentaseKehadiran: 0 },
                    table: [],
                });
            }

            const searchValues = [guruUser.name, guruUser.username].filter(
                (v): v is string => !!v
            );

            if (searchValues.length === 0) {
                return NextResponse.json({
                    cards: { totalSiswaPKL: 0, hadirHariIni: 0, izin: 0, tidakHadir: 0, persentaseKehadiran: 0 },
                    table: [],
                });
            }

            const orConditions = searchValues.map((v) => ({
                guruPembimbing: { contains: v, mode: "insensitive" as const },
            }));

            const siswaBimbingan = await prisma.dataSiswa.findMany({
                where: {
                    OR: orConditions,
                    ...(tempatPKLFilter ? { tempatPKL: tempatPKLFilter } : {}),
                },
                select: { userId: true, tempatPKL: true },
            });

            const studentIds = siswaBimbingan.map((s) => s.userId);
            const totalSiswaPKL = studentIds.length;

            if (totalSiswaPKL === 0) {
                return NextResponse.json({
                    cards: { totalSiswaPKL: 0, hadirHariIni: 0, izin: 0, tidakHadir: 0, persentaseKehadiran: 0 },
                    table: [],
                });
            }

            const tanggalWhere = buildTanggalWhere(tanggalFilter);
            const now = new Date();
            const startBulan = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
            const endBulan = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
            const [absensiHariIni, absensiPerSiswaRaw, users] = await Promise.all([
                prisma.absensi.findMany({
                    where: {
                        userId: { in: studentIds },
                        tanggal: tanggalWhere,
                        tipe: { in: ["masuk", "absen"] },
                    },
                    select: { userId: true, status: true },
                }),
                prisma.absensi.findMany({
                    where: {
                        userId: { in: studentIds },
                        tanggal: { gte: startBulan, lte: endBulan },
                        tipe: { in: ["masuk", "absen"] },
                    },
                    select: { userId: true, status: true },
                }),
                prisma.user.findMany({
                    where: { username: { in: studentIds } },
                    select: { username: true, name: true },
                }),
            ]);

            const userMap = new Map<string, string>();
            users.forEach((u) => {
                if (u.username) userMap.set(u.username, u.name ?? u.username);
            });

            const statusMapToday = new Map<string, string>();
            absensiHariIni.forEach((a) => statusMapToday.set(a.userId, a.status));

            const { hadir: hadirHariIni, izin: izinHariIni, alfa: tidakHadir } =
                hitungStatus(studentIds, statusMapToday);

            const persentaseKehadiran =
                totalSiswaPKL > 0
                    ? Math.round((hadirHariIni / totalSiswaPKL) * 100)
                    : 0;

            type MonthlyEntry = { hadir: number; izin: number; alfa: number; total: number };
            const monthlyByUser = new Map<string, MonthlyEntry>();
            studentIds.forEach((id) =>
                monthlyByUser.set(id, { hadir: 0, izin: 0, alfa: 0, total: 0 })
            );

            absensiPerSiswaRaw.forEach((a) => {
                const entry = monthlyByUser.get(a.userId);
                if (!entry) return;
                entry.total++;
                if (a.status === "Hadir") entry.hadir++;
                else if (a.status === "Izin" || a.status === "Sakit") entry.izin++;
                else entry.alfa++;
            });

            const tableData = siswaBimbingan.map((s) => {
                const m = monthlyByUser.get(s.userId) ?? { hadir: 0, izin: 0, alfa: 0, total: 0 };
                return {
                    siswa: userMap.get(s.userId) ?? s.userId,
                    tempatPKL: s.tempatPKL ?? "-",
                    hadir: m.hadir,
                    izin: m.izin,
                    tidakHadir: m.alfa,
                    totalHari: m.total,
                    persentase: m.total > 0 ? Math.round((m.hadir / m.total) * 100) : 0,
                };
            });

            return NextResponse.json({
                cards: {
                    totalSiswaPKL,
                    hadirHariIni,
                    izin: izinHariIni,
                    tidakHadir,
                    persentaseKehadiran,
                },
                table: tableData,
            });
        }

        if (userRole === "SISWA") {
            const userData = await prisma.user.findUnique({
                where: { email: userEmail },
                select: { username: true, name: true },
            });

            if (!userData?.username) {
                console.warn(
                    `[Dashboard SISWA] User ${userEmail} tidak memiliki username. ` +
                    `Pastikan field username diisi saat registrasi.`
                );
                return NextResponse.json({
                    cards: {
                        totalHariBulanIni: 0,
                        hadirBulanIni: 0,
                        izinBulanIni: 0,
                        tidakHadirBulanIni: 0,
                        persentaseKehadiran: 0,
                        sudahAbsenHariIni: false,
                        namaSiswa: userData?.name ?? null,
                        error: "username_null",
                    },
                });
            }

            const now = new Date();
            const startBulan = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
            const endBulan = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
            const todayStart = new Date();
            todayStart.setHours(0, 0, 0, 0);
            const todayEnd = new Date();
            todayEnd.setHours(23, 59, 59, 999);

            const [bulananRecords, absenHariIni] = await Promise.all([
                prisma.absensi.findMany({
                    where: {
                        userId: userData.username,
                        tanggal: { gte: startBulan, lte: endBulan },
                        tipe: { in: ["masuk", "absen"] },
                    },
                    select: { status: true },
                }),
                prisma.absensi.count({
                    where: {
                        userId: userData.username,
                        tanggal: { gte: todayStart, lte: todayEnd },
                        tipe: { in: ["masuk", "absen"] },
                    },
                }),
            ]);

            const totalHariBulanIni = bulananRecords.length;
            const hadirBulanIni = bulananRecords.filter((r) => r.status === "Hadir").length;
            const izinBulanIni = bulananRecords.filter(
                (r) => r.status === "Izin" || r.status === "Sakit"
            ).length;
            const tidakHadirBulanIni = Math.max(
                0,
                totalHariBulanIni - hadirBulanIni - izinBulanIni
            );
            const persentaseKehadiran =
                totalHariBulanIni > 0
                    ? Math.round((hadirBulanIni / totalHariBulanIni) * 100)
                    : 0;

            return NextResponse.json({
                cards: {
                    totalHariBulanIni,
                    hadirBulanIni,
                    izinBulanIni,
                    tidakHadirBulanIni,
                    persentaseKehadiran,
                    sudahAbsenHariIni: absenHariIni > 0,
                    namaSiswa: userData.name,
                },
            });
        }

        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    } catch (error) {
        console.error("[Dashboard API Error]", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
