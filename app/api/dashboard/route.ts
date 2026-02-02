import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "../auth/[...nextauth]/route";

interface UserSession {
    name?: string | null;
    email?: string | null;
    image?: string | null;
    role: string;
    id: number | string;
}

export async function GET(request: Request) {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = session.user as UserSession;
    const { role, name, id: sessionUserId } = user;
    const userIdString = String(sessionUserId);

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    const endOfMonth = new Date(startOfMonth.getFullYear(), startOfMonth.getMonth() + 1, 0);

    try {
        if (role === "ADMIN") {
            const totalSiswa = await prisma.dataSiswa.count();

            const absensiHariIni = await prisma.absensi.findMany({
                where: { tanggal: { gte: startOfDay, lte: endOfDay } }
            });

            const hadirCount = absensiHariIni.filter(a => a.status.toLowerCase() === "hadir").length;
            const tidakHadirCount = totalSiswa - hadirCount;
            const persentase = totalSiswa > 0 ? ((hadirCount / totalSiswa) * 100).toFixed(1) : 0;

            const dataSiswaAll = await prisma.dataSiswa.findMany({
                select: { kelas: true, userId: true }
            });

            const mapKelas = new Map();

            dataSiswaAll.forEach(s => {
                if (!mapKelas.has(s.kelas)) {
                    mapKelas.set(s.kelas, { kelas: s.kelas, total: 0, hadir: 0 });
                }
                const stats = mapKelas.get(s.kelas);
                stats.total += 1;

                const isHadir = absensiHariIni.some(a => a.userId === s.userId && a.status.toLowerCase() === "hadir");
                if (isHadir) stats.hadir += 1;
            });

            const tableData = Array.from(mapKelas.values()).map((item: any) => ({
                kelas: item.kelas,
                hadir: item.hadir,
                total: item.total,
                persentase: item.total > 0 ? ((item.hadir / item.total) * 100).toFixed(1) : 0
            }));

            return NextResponse.json({
                cards: {
                    totalSiswa: totalSiswa,
                    hadirHariIni: hadirCount,
                    tidakHadir: tidakHadirCount,
                    persentaseKehadiran: persentase
                },
                table: tableData
            });
        }

        if (role === "GURU") {
            const siswaBimbingan = await prisma.dataSiswa.findMany({
                where: { guruPembimbing: name },
            });

            const totalSiswaPKL = siswaBimbingan.length;
            const listUserIdString = siswaBimbingan.map(s => s.userId);

            const listUserIdInt = listUserIdString
                .map(id => parseInt(id))
                .filter(id => !isNaN(id));

            const usersSiswa = await prisma.user.findMany({
                where: {
                    id: { in: listUserIdInt }
                },
                select: { id: true, name: true }
            });

            const userMap = new Map();
            usersSiswa.forEach(u => userMap.set(String(u.id), u.name));

            const absensiHariIni = await prisma.absensi.findMany({
                where: {
                    userId: { in: listUserIdString },
                    tanggal: { gte: startOfDay, lte: endOfDay }
                }
            });

            const hadirCount = absensiHariIni.filter(a => a.status.toLowerCase() === "hadir").length;
            const tidakHadirCount = totalSiswaPKL - hadirCount;
            const persentase = totalSiswaPKL > 0 ? ((hadirCount / totalSiswaPKL) * 100).toFixed(1) : 0;

            const tableData = await Promise.all(siswaBimbingan.map(async (s) => {
                const totalHadirSiswa = await prisma.absensi.count({
                    where: { userId: s.userId, status: 'Hadir' }
                });
                const totalHariKerja = await prisma.absensi.count({
                    where: { userId: s.userId }
                });

                const namaSiswa = userMap.get(s.userId) || "Siswa";

                return {
                    tempatPKL: s.tempatPKL || "-",
                    siswa: namaSiswa,
                    hadir: totalHadirSiswa,
                    totalHari: totalHariKerja
                };
            }));

            return NextResponse.json({
                cards: {
                    totalSiswaPKL: totalSiswaPKL,
                    hadirHariIni: hadirCount,
                    tidakHadir: tidakHadirCount,
                    persentaseKehadiran: persentase
                },
                table: tableData
            });
        }

        if (role === "SISWA") {
            const absensiBulanIni = await prisma.absensi.findMany({
                where: {
                    userId: userIdString,
                    tanggal: { gte: startOfMonth, lte: endOfMonth }
                }
            });

            const totalHariBulanIni = absensiBulanIni.length;
            const hadirBulanIni = absensiBulanIni.filter(a => a.status.toLowerCase() === "hadir").length;
            const tidakHadirBulanIni = totalHariBulanIni - hadirBulanIni;
            const persentase = totalHariBulanIni > 0 ? ((hadirBulanIni / totalHariBulanIni) * 100).toFixed(1) : 0;

            return NextResponse.json({
                cards: {
                    totalHariBulanIni,
                    hadirBulanIni,
                    tidakHadirBulanIni,
                    persentaseKehadiran: persentase
                }
            });
        }

        return NextResponse.json({ error: "Role unknown" }, { status: 403 });

    } catch (error) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}