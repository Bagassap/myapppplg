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
    const today = new Date();
    today.setHours(23, 59, 59, 999);

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
            tipe: "masuk",
        },
        select: { tanggal: true, status: true },
    });

    const trendData = days.map(({ label, start, end }) => {
        const dayRecords = absensi.filter(
            (a) => a.tanggal >= start && a.tanggal <= end
        );
        const hadir = dayRecords.filter((a) => a.status === "Hadir").length;
        const absen = dayRecords.filter(
            (a) => a.status !== "Hadir" || !a.status
        ).length;
        return { day: label, hadir, absen };
    });

    return trendData;
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

        if (userRole === "ADMIN") {
            const tanggalWhere = buildTanggalWhere(tanggalFilter);
            const siswaWhere: any = kelasFilter ? { kelas: kelasFilter } : {};

            const semuaSiswa = await prisma.dataSiswa.findMany({
                where: siswaWhere,
                select: { userId: true, kelas: true },
            });

            const totalSiswa = semuaSiswa.length;
            const allUserIds = semuaSiswa.map((s) => s.userId);

            const absensiHariIni = await prisma.absensi.findMany({
                where: {
                    userId: { in: allUserIds },
                    tanggal: tanggalWhere,
                    tipe: "masuk",
                },
                select: { userId: true, status: true },
            });

            const statusMap = new Map<string, string>();
            absensiHariIni.forEach((a) => {
                statusMap.set(a.userId, a.status);
            });

            let hadirCount = 0;
            let izinCount = 0;
            let alfaCount = 0;

            allUserIds.forEach((id) => {
                const status = statusMap.get(id);
                if (!status) {
                    alfaCount++;
                } else if (status === "Hadir") {
                    hadirCount++;
                } else if (status === "Izin" || status === "Sakit") {
                    izinCount++;
                } else {
                    alfaCount++;
                }
            });

            const persentaseKehadiran =
                totalSiswa > 0 ? Math.round((hadirCount / totalSiswa) * 100) : 0;

            const kelasSiswaMap = new Map<string, string[]>();
            semuaSiswa.forEach((s) => {
                if (!kelasSiswaMap.has(s.kelas)) kelasSiswaMap.set(s.kelas, []);
                kelasSiswaMap.get(s.kelas)!.push(s.userId);
            });

            const tableData = Array.from(kelasSiswaMap.entries()).map(([kelas, ids]) => {
                let hadirKelas = 0;
                let izinKelas = 0;
                let alfaKelas = 0;

                ids.forEach((id) => {
                    const st = statusMap.get(id);
                    if (!st) {
                        alfaKelas++;
                    } else if (st === "Hadir") {
                        hadirKelas++;
                    } else if (st === "Izin" || st === "Sakit") {
                        izinKelas++;
                    } else {
                        alfaKelas++;
                    }
                });

                const totalKelas = ids.length;
                return {
                    kelas,
                    hadir: hadirKelas,
                    izin: izinKelas,
                    tidakHadir: alfaKelas,
                    total: totalKelas,
                    persentase: totalKelas > 0 ? Math.round((hadirKelas / totalKelas) * 100) : 0,
                };
            });

            const trend = await buildTrendData(allUserIds);

            return NextResponse.json({
                cards: {
                    totalSiswa,
                    hadirHariIni: hadirCount,
                    izin: izinCount,
                    tidakHadir: alfaCount,
                    persentaseKehadiran,
                },
                table: tableData,
                trend,
            });
        }


        if (userRole === "GURU") {
            const guruUser = await prisma.user.findUnique({
                where: { email: userEmail },
                select: { name: true, username: true },
            });

            if (!guruUser?.name) {
                return NextResponse.json({
                    cards: {
                        totalSiswaPKL: 0,
                        hadirHariIni: 0,
                        izin: 0,
                        tidakHadir: 0,
                        persentaseKehadiran: 0,
                    },
                    table: [],
                });
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
                where: {
                    OR: searchConditions,
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
            const startBulan = new Date(now.getFullYear(), now.getMonth(), 1);
            startBulan.setHours(0, 0, 0, 0);
            const endBulan = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

            const [absensiHariIniGuru, hadirBulanData, totalBulanData, users] =
                await Promise.all([
                    prisma.absensi.findMany({
                        where: {
                            userId: { in: studentIds },
                            tanggal: tanggalWhere,
                            tipe: "masuk",
                        },
                        select: { userId: true, status: true },
                    }),
                    prisma.absensi.groupBy({
                        by: ["userId"],
                        where: {
                            userId: { in: studentIds },
                            tanggal: { gte: startBulan, lte: endBulan },
                            status: "Hadir",
                            tipe: "masuk",
                        },
                        _count: { userId: true },
                    }),
                    prisma.absensi.groupBy({
                        by: ["userId"],
                        where: {
                            userId: { in: studentIds },
                            tanggal: { gte: startBulan, lte: endBulan },
                            tipe: "masuk",
                        },
                        _count: { userId: true },
                    }),
                    prisma.user.findMany({
                        where: {
                            OR: [
                                { username: { in: studentIds } },
                                { email: { in: studentIds } },
                            ],
                        },
                        select: { username: true, email: true, name: true },
                    }),
                ]);

            const userMap = new Map<string, string>();
            users.forEach((u) => {
                if (u.username) userMap.set(u.username, u.name ?? u.username);
                if (u.email) userMap.set(u.email, u.name ?? u.email);
            });

            const statusMapGuru = new Map<string, string>();
            absensiHariIniGuru.forEach((a) => statusMapGuru.set(a.userId, a.status));

            let hadirHariIni = 0;
            let izinHariIni = 0;
            let tidakHadir = 0;

            studentIds.forEach((id) => {
                const st = statusMapGuru.get(id);
                if (st === "Hadir") {
                    hadirHariIni++;
                } else if (st === "Izin" || st === "Sakit") {
                    izinHariIni++;
                } else {
                    tidakHadir++;
                }
            });

            const persentaseKehadiran =
                totalSiswaPKL > 0 ? Math.round((hadirHariIni / totalSiswaPKL) * 100) : 0;

            const hadirMap = new Map(hadirBulanData.map((h) => [h.userId, h._count.userId]));
            const totalMap = new Map(totalBulanData.map((t) => [t.userId, t._count.userId]));

            const tableData = siswaBimbingan.map((s) => {
                const hadirBulan = hadirMap.get(s.userId) ?? 0;
                const totalBulan = totalMap.get(s.userId) ?? 0;
                return {
                    tempatPKL: s.tempatPKL || "-",
                    siswa: userMap.get(s.userId) || s.userId,
                    hadir: hadirBulan,
                    totalHari: totalBulan,
                    tidakHadir: Math.max(0, totalBulan - hadirBulan),
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
                select: { username: true },
            });

            if (!userData?.username) {
                return NextResponse.json({
                    cards: {
                        totalHariBulanIni: 0,
                        hadirBulanIni: 0,
                        izinBulanIni: 0,
                        tidakHadirBulanIni: 0,
                        persentaseKehadiran: 0,
                        sudahAbsenHariIni: false,
                    },
                });
            }

            const now = new Date();
            const startBulan = new Date(now.getFullYear(), now.getMonth(), 1);
            startBulan.setHours(0, 0, 0, 0);
            const endBulan = new Date(now.getFullYear(), now.getMonth() + 1, 0);
            endBulan.setHours(23, 59, 59, 999);

            const todayStart = new Date();
            todayStart.setHours(0, 0, 0, 0);
            const todayEnd = new Date();
            todayEnd.setHours(23, 59, 59, 999);

            const [totalHariBulanIni, hadirBulanIni, izinBulanIni, absenHariIni] =
                await Promise.all([
                    prisma.absensi.count({
                        where: {
                            userId: userData.username,
                            tanggal: { gte: startBulan, lte: endBulan },
                            tipe: "masuk",
                        },
                    }),
                    prisma.absensi.count({
                        where: {
                            userId: userData.username,
                            tanggal: { gte: startBulan, lte: endBulan },
                            status: "Hadir",
                            tipe: "masuk",
                        },
                    }),

                    prisma.absensi.count({
                        where: {
                            userId: userData.username,
                            tanggal: { gte: startBulan, lte: endBulan },
                            status: { in: ["Izin", "Sakit"] },
                            tipe: "masuk",
                        },
                    }),
                    prisma.absensi.count({
                        where: {
                            userId: userData.username,
                            tanggal: { gte: todayStart, lte: todayEnd },
                            tipe: "masuk",
                        },
                    }),
                ]);


            const tidakHadirBulanIni = Math.max(0, totalHariBulanIni - hadirBulanIni - izinBulanIni);
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
                },
            });
        }

        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    } catch (error) {
        console.error("Dashboard GET error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}