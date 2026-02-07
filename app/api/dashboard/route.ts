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

export const dynamic = "force-dynamic"; // Pastikan tidak di-cache statis

export async function GET(request: Request) {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = session.user as UserSession;
    const { role, name, id: sessionUserId } = user;
    const userIdString = String(sessionUserId);

    // Setup Date Range (Start & End of Day)
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    // Setup Month Range
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    const endOfMonth = new Date(
        startOfMonth.getFullYear(),
        startOfMonth.getMonth() + 1,
        0
    );

    const userRole = role.toUpperCase();

    try {
        // === LOGIC ADMIN ===
        if (userRole === "ADMIN") {
            const totalSiswa = await prisma.dataSiswa.count();

            const absensiHariIni = await prisma.absensi.findMany({
                where: { tanggal: { gte: startOfDay, lte: endOfDay } },
            });

            const hadirCount = absensiHariIni.filter(
                (a) => a.status.toLowerCase() === "hadir"
            ).length;
            const tidakHadirCount = totalSiswa - hadirCount;
            const persentase =
                totalSiswa > 0 ? ((hadirCount / totalSiswa) * 100).toFixed(1) : 0;

            const dataSiswaAll = await prisma.dataSiswa.findMany({
                select: { kelas: true, userId: true },
            });

            const mapKelas = new Map();

            dataSiswaAll.forEach((s) => {
                if (!mapKelas.has(s.kelas)) {
                    mapKelas.set(s.kelas, { kelas: s.kelas, total: 0, hadir: 0 });
                }
                const stats = mapKelas.get(s.kelas);
                stats.total += 1;

                const isHadir = absensiHariIni.some(
                    (a) =>
                        a.userId === s.userId && a.status.toLowerCase() === "hadir"
                );
                if (isHadir) stats.hadir += 1;
            });

            const tableData = Array.from(mapKelas.values()).map((item: any) => ({
                kelas: item.kelas,
                hadir: item.hadir,
                total: item.total,
                persentase:
                    item.total > 0
                        ? ((item.hadir / item.total) * 100).toFixed(1)
                        : 0,
            }));

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

        // === LOGIC GURU (PERBAIKAN) ===
        if (userRole === "GURU") {
            // Pastikan nama guru ada
            if (!name) {
                return NextResponse.json({
                    cards: { totalSiswa: 0, hadirHariIni: 0, tidakHadir: 0, persentaseKehadiran: 0 },
                    table: []
                });
            }

            // Cari siswa yang dibimbing oleh guru ini
            const siswaBimbingan = await prisma.dataSiswa.findMany({
                where: {
                    guruPembimbing: {
                        contains: name,
                        mode: "insensitive",
                    },
                },
                select: { userId: true, kelas: true },
            });

            const totalSiswa = siswaBimbingan.length;

            // Jika tidak ada siswa bimbingan, return data kosong
            if (totalSiswa === 0) {
                return NextResponse.json({
                    cards: { totalSiswa: 0, hadirHariIni: 0, tidakHadir: 0, persentaseKehadiran: 0 },
                    table: []
                });
            }

            const listUserIdString = siswaBimbingan.map((s) => s.userId);

            // Ambil absensi HANYA untuk siswa bimbingan
            const absensiHariIni = await prisma.absensi.findMany({
                where: {
                    userId: { in: listUserIdString },
                    tanggal: { gte: startOfDay, lte: endOfDay },
                },
            });

            const hadirCount = absensiHariIni.filter(
                (a) => a.status.toLowerCase() === "hadir"
            ).length;

            // Hitung tidak hadir (Total Siswa Bimbingan - Yang Hadir)
            const tidakHadirCount = totalSiswa - hadirCount;
            const persentase =
                totalSiswa > 0 ? ((hadirCount / totalSiswa) * 100).toFixed(1) : 0;

            const mapKelas = new Map();

            siswaBimbingan.forEach((s) => {
                if (!mapKelas.has(s.kelas)) {
                    mapKelas.set(s.kelas, { kelas: s.kelas, total: 0, hadir: 0 });
                }
                const stats = mapKelas.get(s.kelas);
                stats.total += 1;

                const isHadir = absensiHariIni.some(
                    (a) =>
                        a.userId === s.userId && a.status.toLowerCase() === "hadir"
                );
                if (isHadir) stats.hadir += 1;
            });

            const tableData = Array.from(mapKelas.values()).map((item: any) => ({
                kelas: item.kelas,
                hadir: item.hadir,
                total: item.total,
                persentase:
                    item.total > 0
                        ? ((item.hadir / item.total) * 100).toFixed(1)
                        : 0,
            }));

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

        // === LOGIC SISWA ===
        if (userRole === "SISWA") {
            const absensiBulanIni = await prisma.absensi.findMany({
                where: {
                    userId: userIdString,
                    tanggal: { gte: startOfMonth, lte: endOfMonth },
                },
            });

            const totalHariBulanIni = absensiBulanIni.length;
            const hadirBulanIni = absensiBulanIni.filter(
                (a) => a.status.toLowerCase() === "hadir"
            ).length;
            const tidakHadirBulanIni = totalHariBulanIni - hadirBulanIni;
            const persentase =
                totalHariBulanIni > 0
                    ? ((hadirBulanIni / totalHariBulanIni) * 100).toFixed(1)
                    : 0;

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
        console.error("Dashboard API Error:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}