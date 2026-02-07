import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "../auth/[...nextauth]/route";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
        return NextResponse.json({
            cards: { totalSiswa: 0, totalSiswaPKL: 0, hadirHariIni: 0, tidakHadir: 0, persentaseKehadiran: 0 },
            table: []
        });
    }

    const user = session.user as any;
    const { role, email } = user;
    const userRole = role ? role.toUpperCase() : "";

    const { searchParams } = new URL(request.url);
    const filterKelas = searchParams.get("kelas");
    const filterTempatPKL = searchParams.get("tempatPKL");
    const filterTanggal = searchParams.get("tanggal");

    let startFilterDate = new Date();
    let endFilterDate = new Date();

    if (filterTanggal && filterTanggal !== "Semua Periode") {
        const targetDate = new Date(filterTanggal);
        if (!isNaN(targetDate.getTime())) {
            startFilterDate = new Date(targetDate);
            startFilterDate.setHours(0, 0, 0, 0);

            endFilterDate = new Date(targetDate);
            endFilterDate.setHours(23, 59, 59, 999);
        }
    } else {
        startFilterDate.setHours(0, 0, 0, 0);
        endFilterDate.setHours(23, 59, 59, 999);
    }

    try {
        if (userRole === "ADMIN") {
            const whereSiswa: any = {};
            if (filterKelas && filterKelas !== "Semua Kelas") {
                whereSiswa.kelas = filterKelas;
            }

            const filteredSiswa = await prisma.dataSiswa.findMany({
                where: whereSiswa,
                select: { userId: true, kelas: true }
            });

            const totalSiswa = filteredSiswa.length;
            const listUserId = filteredSiswa.map(s => s.userId);

            const absensiFiltered = await prisma.absensi.findMany({
                where: {
                    userId: { in: listUserId },
                    tanggal: { gte: startFilterDate, lte: endFilterDate }
                }
            });

            const hadirCount = absensiFiltered.filter((a) => a.status.toLowerCase() === "hadir").length;
            const tidakHadirCount = totalSiswa - hadirCount;
            const persentase = totalSiswa > 0 ? ((hadirCount / totalSiswa) * 100).toFixed(1) : 0;

            const mapKelas = new Map();

            filteredSiswa.forEach((s) => {
                if (!mapKelas.has(s.kelas)) {
                    mapKelas.set(s.kelas, { kelas: s.kelas, total: 0, hadir: 0 });
                }
                const stats = mapKelas.get(s.kelas);
                stats.total += 1;

                const isHadir = absensiFiltered.some((a) => a.userId === s.userId && a.status.toLowerCase() === "hadir");
                if (isHadir) stats.hadir += 1;
            });

            const tableData = Array.from(mapKelas.values()).map((item: any) => ({
                kelas: item.kelas,
                hadir: item.hadir,
                total: item.total,
                persentase: item.total > 0 ? ((item.hadir / item.total) * 100).toFixed(1) : 0,
            }));

            tableData.sort((a, b) => a.kelas.localeCompare(b.kelas));

            return NextResponse.json({
                cards: {
                    totalSiswa: totalSiswa,
                    hadirHariIni: hadirCount,
                    tidakHadir: tidakHadirCount,
                    persentaseKehadiran: persentase,
                },
                table: tableData,
            });
        }

        if (userRole === "GURU") {
            const guruUser = await prisma.user.findUnique({
                where: { email: email || "" },
                select: { name: true, username: true }
            });

            if (!guruUser?.name) {
                return NextResponse.json({
                    cards: { totalSiswaPKL: 0, hadirHariIni: 0, tidakHadir: 0, persentaseKehadiran: 0 },
                    table: []
                });
            }

            const searchConditions: any[] = [{ guruPembimbing: { contains: guruUser.name, mode: "insensitive" } }];
            if (guruUser.username) {
                searchConditions.push({ guruPembimbing: { contains: guruUser.username, mode: "insensitive" } });
            }

            const whereSiswa: any = { OR: searchConditions };

            if (filterTempatPKL && filterTempatPKL !== "Semua Tempat PKL") {
                whereSiswa.tempatPKL = filterTempatPKL;
            }

            const siswaBimbingan = await prisma.dataSiswa.findMany({
                where: whereSiswa,
                select: { userId: true, tempatPKL: true },
            });

            const totalSiswa = siswaBimbingan.length;
            const listUserIdString = siswaBimbingan.map((s) => s.userId);

            const absensiFiltered = await prisma.absensi.findMany({
                where: {
                    userId: { in: listUserIdString },
                    tanggal: { gte: startFilterDate, lte: endFilterDate }
                },
            });

            const hadirCount = absensiFiltered.filter((a) => a.status.toLowerCase() === "hadir").length;
            const tidakHadirCount = totalSiswa - hadirCount;
            const persentase = totalSiswa > 0 ? ((hadirCount / totalSiswa) * 100).toFixed(1) : 0;

            const usersSiswa = await prisma.user.findMany({
                where: { username: { in: listUserIdString } },
                select: { username: true, name: true }
            });
            const mapNama = new Map(usersSiswa.map(u => [u.username, u.name]));

            const tableData = siswaBimbingan.map(siswa => {
                const absenSiswa = absensiFiltered.filter(a => a.userId === siswa.userId);

                return {
                    tempatPKL: siswa.tempatPKL || "Belum ditentukan",
                    siswa: mapNama.get(siswa.userId) || siswa.userId,
                    hadir: absenSiswa.filter(a => a.status.toLowerCase() === 'hadir').length,
                    totalHari: absenSiswa.length
                };
            });

            return NextResponse.json({
                cards: {
                    totalSiswaPKL: totalSiswa,
                    hadirHariIni: hadirCount,
                    tidakHadir: tidakHadirCount,
                    persentaseKehadiran: persentase,
                },
                table: tableData,
            });
        }

        if (userRole === "SISWA") {
            const startOfMonth = new Date();
            startOfMonth.setDate(1);
            startOfMonth.setHours(0, 0, 0, 0);
            const endOfMonth = new Date(startOfMonth.getFullYear(), startOfMonth.getMonth() + 1, 0);

            const userData = await prisma.user.findUnique({
                where: { email: email || "" },
                select: { username: true }
            });

            if (!userData?.username) {
                return NextResponse.json({ cards: { totalHariBulanIni: 0, hadirBulanIni: 0, tidakHadirBulanIni: 0, persentaseKehadiran: 0 } });
            }

            const absensiBulanIni = await prisma.absensi.findMany({
                where: { userId: userData.username, tanggal: { gte: startOfMonth, lte: endOfMonth } },
            });

            const totalHariBulanIni = absensiBulanIni.length;
            const hadirBulanIni = absensiBulanIni.filter((a) => a.status.toLowerCase() === "hadir").length;
            const tidakHadirBulanIni = totalHariBulanIni - hadirBulanIni;
            const persentase = totalHariBulanIni > 0 ? ((hadirBulanIni / totalHariBulanIni) * 100).toFixed(1) : 0;

            return NextResponse.json({
                cards: {
                    totalHariBulanIni,
                    hadirBulanIni,
                    tidakHadirBulanIni,
                    persentaseKehadiran: persentase,
                },
            });
        }

        return NextResponse.json({ error: "Role unknown" }, { status: 403 });
    } catch (error) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}