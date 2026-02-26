import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { prisma } from "@/lib/prisma";
import { authOptions } from "../auth/[...nextauth]/route";

export const dynamic = "force-dynamic";

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
        // ─────────────────────────────────────────────────────────────
        // ADMIN
        // ─────────────────────────────────────────────────────────────
        if (userRole === "ADMIN") {
            // Bangun filter tanggal
            let tanggalWhere: any = {};
            if (tanggalFilter) {
                const start = new Date(tanggalFilter);
                start.setHours(0, 0, 0, 0);
                const end = new Date(tanggalFilter);
                end.setHours(23, 59, 59, 999);
                tanggalWhere = { gte: start, lte: end };
            } else {
                // Default: hari ini
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const todayEnd = new Date();
                todayEnd.setHours(23, 59, 59, 999);
                tanggalWhere = { gte: today, lte: todayEnd };
            }

            // Filter kelas (lewat relasi dataSiswa)
            let siswaWhere: any = {};
            if (kelasFilter) siswaWhere.kelas = kelasFilter;

            // Total siswa (sesuai filter kelas)
            const totalSiswa = await prisma.dataSiswa.count({
                where: siswaWhere,
            });

            // Ambil userId siswa yang sesuai filter kelas
            const siswaDiKelas = await prisma.dataSiswa.findMany({
                where: siswaWhere,
                select: { userId: true },
            });
            const userIds = siswaDiKelas.map((s) => s.userId);

            // Absensi hadir hari ini (atau tanggal filter)
            const hadirCount = await prisma.absensi.count({
                where: {
                    userId: userIds.length > 0 ? { in: userIds } : undefined,
                    tanggal: tanggalWhere,
                    status: "Hadir",
                    tipe: "masuk",
                },
            });

            const tidakHadir = totalSiswa - hadirCount;
            const persentaseKehadiran =
                totalSiswa > 0
                    ? Math.round((hadirCount / totalSiswa) * 100)
                    : 0;

            // Tabel: laporan per kelas
            const semuaKelas = await prisma.dataSiswa.groupBy({
                by: ["kelas"],
                where: siswaWhere,
                _count: { userId: true },
            });

            const tableData = await Promise.all(
                semuaKelas.map(async (k) => {
                    const siswaKelas = await prisma.dataSiswa.findMany({
                        where: { kelas: k.kelas },
                        select: { userId: true },
                    });
                    const ids = siswaKelas.map((s) => s.userId);

                    const hadirKelas = await prisma.absensi.count({
                        where: {
                            userId: { in: ids },
                            tanggal: tanggalWhere,
                            status: "Hadir",
                            tipe: "masuk",
                        },
                    });

                    const totalKelas = k._count.userId;
                    const persen =
                        totalKelas > 0
                            ? Math.round((hadirKelas / totalKelas) * 100)
                            : 0;

                    return {
                        kelas: k.kelas,
                        hadir: hadirKelas,
                        total: totalKelas,
                        persentase: persen,
                    };
                })
            );

            return NextResponse.json({
                cards: {
                    totalSiswa,
                    hadirHariIni: hadirCount,
                    tidakHadir,
                    persentaseKehadiran,
                },
                table: tableData,
            });
        }

        // ─────────────────────────────────────────────────────────────
        // GURU
        // ─────────────────────────────────────────────────────────────
        if (userRole === "GURU") {
            // Cari siswa bimbingan guru ini
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
                searchConditions.push({
                    guruPembimbing: { contains: guruUser.username, mode: "insensitive" },
                });
            }

            let siswaBimbingan = await prisma.dataSiswa.findMany({
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
                    cards: { totalSiswaPKL: 0, hadirHariIni: 0, tidakHadir: 0, persentaseKehadiran: 0 },
                    table: [],
                });
            }

            // Filter tanggal
            let tanggalWhere: any = {};
            if (tanggalFilter) {
                const start = new Date(tanggalFilter);
                start.setHours(0, 0, 0, 0);
                const end = new Date(tanggalFilter);
                end.setHours(23, 59, 59, 999);
                tanggalWhere = { gte: start, lte: end };
            } else {
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const todayEnd = new Date();
                todayEnd.setHours(23, 59, 59, 999);
                tanggalWhere = { gte: today, lte: todayEnd };
            }

            const hadirHariIni = await prisma.absensi.count({
                where: {
                    userId: { in: studentIds },
                    tanggal: tanggalWhere,
                    status: "Hadir",
                    tipe: "masuk",
                },
            });

            const tidakHadir = totalSiswaPKL - hadirHariIni;
            const persentaseKehadiran =
                totalSiswaPKL > 0
                    ? Math.round((hadirHariIni / totalSiswaPKL) * 100)
                    : 0;

            // Ambil nama siswa untuk tabel
            const users = await prisma.user.findMany({
                where: { username: { in: studentIds } },
                select: { username: true, name: true },
            });
            const userMap = new Map(users.map((u) => [u.username, u.name]));

            // Hitung total hari absensi per siswa (bulan ini jika tidak ada filter)
            let rangeForTotal: any = {};
            if (tanggalFilter) {
                const start = new Date(tanggalFilter);
                start.setHours(0, 0, 0, 0);
                const end = new Date(tanggalFilter);
                end.setHours(23, 59, 59, 999);
                rangeForTotal = { gte: start, lte: end };
            } else {
                const now = new Date();
                const startBulan = new Date(now.getFullYear(), now.getMonth(), 1);
                const endBulan = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
                rangeForTotal = { gte: startBulan, lte: endBulan };
            }

            const tableData = await Promise.all(
                siswaBimbingan.map(async (s) => {
                    const hadirSiswa = await prisma.absensi.count({
                        where: {
                            userId: s.userId,
                            tanggal: rangeForTotal,
                            status: "Hadir",
                            tipe: "masuk",
                        },
                    });
                    const totalHari = await prisma.absensi.count({
                        where: {
                            userId: s.userId,
                            tanggal: rangeForTotal,
                            tipe: "masuk",
                        },
                    });

                    return {
                        tempatPKL: s.tempatPKL || "-",
                        siswa: userMap.get(s.userId) || s.userId,
                        hadir: hadirSiswa,
                        totalHari,
                    };
                })
            );

            return NextResponse.json({
                cards: {
                    totalSiswaPKL,
                    hadirHariIni,
                    tidakHadir,
                    persentaseKehadiran,
                },
                table: tableData,
            });
        }

        // ─────────────────────────────────────────────────────────────
        // SISWA
        // ─────────────────────────────────────────────────────────────
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
                        tidakHadirBulanIni: 0,
                        persentaseKehadiran: 0,
                    },
                });
            }

            // Range: bulan ini
            const now = new Date();
            const startBulan = new Date(now.getFullYear(), now.getMonth(), 1);
            startBulan.setHours(0, 0, 0, 0);
            const endBulan = new Date(now.getFullYear(), now.getMonth() + 1, 0);
            endBulan.setHours(23, 59, 59, 999);

            const totalHariBulanIni = await prisma.absensi.count({
                where: {
                    userId: userData.username,
                    tanggal: { gte: startBulan, lte: endBulan },
                    tipe: "masuk",
                },
            });

            const hadirBulanIni = await prisma.absensi.count({
                where: {
                    userId: userData.username,
                    tanggal: { gte: startBulan, lte: endBulan },
                    status: "Hadir",
                    tipe: "masuk",
                },
            });

            const tidakHadirBulanIni = totalHariBulanIni - hadirBulanIni;
            const persentaseKehadiran =
                totalHariBulanIni > 0
                    ? Math.round((hadirBulanIni / totalHariBulanIni) * 100)
                    : 0;

            return NextResponse.json({
                cards: {
                    totalHariBulanIni,
                    hadirBulanIni,
                    tidakHadirBulanIni,
                    persentaseKehadiran,
                },
            });
        }

        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    } catch (error) {
        console.error("Dashboard GET error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
