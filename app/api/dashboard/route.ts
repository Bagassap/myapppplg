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

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = session.user as UserSession;
    const { role, email } = user;

    // SETUP TANGGAL (HARI INI)
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    // SETUP BULAN (BULAN INI)
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    const endOfMonth = new Date(
        startOfMonth.getFullYear(),
        startOfMonth.getMonth() + 1,
        0
    );

    const userRole = role ? role.toUpperCase() : "";

    console.log(`\n=== DEBUG DASHBOARD (${userRole}) ===`);
    console.log(`User: ${email}`);
    console.log(`Filter Hari Ini: ${startOfDay.toISOString()} s/d ${endOfDay.toISOString()}`);

    try {
        // ==========================================
        // LOGIC ADMIN
        // ==========================================
        if (userRole === "ADMIN") {
            const totalSiswa = await prisma.dataSiswa.count();

            const absensiHariIni = await prisma.absensi.findMany({
                where: { tanggal: { gte: startOfDay, lte: endOfDay } },
            });

            console.log(`[ADMIN] Total Siswa: ${totalSiswa}`);
            console.log(`[ADMIN] Absensi Hari Ini: ${absensiHariIni.length} data`);

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
                    (a) => a.userId === s.userId && a.status.toLowerCase() === "hadir"
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

        // ==========================================
        // LOGIC GURU
        // ==========================================
        if (userRole === "GURU") {
            const guruUser = await prisma.user.findUnique({
                where: { email: email || "" },
                select: { name: true, username: true }
            });

            console.log("[GURU] Data Akun:", guruUser);

            if (!guruUser || !guruUser.name) {
                console.log("[GURU] Gagal: Nama guru tidak ditemukan di tabel User.");
                return NextResponse.json({
                    cards: { totalSiswa: 0, hadirHariIni: 0, tidakHadir: 0, persentaseKehadiran: 0 },
                    table: []
                });
            }

            const searchConditions: any[] = [
                { guruPembimbing: { contains: guruUser.name, mode: "insensitive" } }
            ];
            if (guruUser.username) {
                searchConditions.push({ guruPembimbing: { contains: guruUser.username, mode: "insensitive" } });
            }

            const siswaBimbingan = await prisma.dataSiswa.findMany({
                where: { OR: searchConditions },
                select: { userId: true, kelas: true, guruPembimbing: true },
            });

            console.log(`[GURU] Siswa Bimbingan Ditemukan: ${siswaBimbingan.length}`);
            if (siswaBimbingan.length > 0) {
                console.log(`[GURU] Sample Siswa: ID=${siswaBimbingan[0].userId}, Pembimbing=${siswaBimbingan[0].guruPembimbing}`);
            }

            const totalSiswa = siswaBimbingan.length;

            if (totalSiswa === 0) {
                return NextResponse.json({
                    cards: { totalSiswa: 0, hadirHariIni: 0, tidakHadir: 0, persentaseKehadiran: 0 },
                    table: []
                });
            }

            const listUserIdString = siswaBimbingan.map((s) => s.userId);

            // Cek Absensi Hari Ini
            const absensiHariIni = await prisma.absensi.findMany({
                where: {
                    userId: { in: listUserIdString },
                    tanggal: { gte: startOfDay, lte: endOfDay },
                },
            });

            console.log(`[GURU] Absensi Siswa Bimbingan (HARI INI): ${absensiHariIni.length} data`);

            // DEBUG: Cek Absensi SEMUA WAKTU (untuk memastikan data ada tapi terfilter tanggal)
            const cekAbsensiAllTime = await prisma.absensi.count({
                where: { userId: { in: listUserIdString } }
            });
            console.log(`[GURU] Absensi Siswa Bimbingan (TOTAL SELURUH WAKTU): ${cekAbsensiAllTime} data`);


            const hadirCount = absensiHariIni.filter(
                (a) => a.status.toLowerCase() === "hadir"
            ).length;

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
                    (a) => a.userId === s.userId && a.status.toLowerCase() === "hadir"
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

        // ==========================================
        // LOGIC SISWA
        // ==========================================
        if (userRole === "SISWA") {
            const userData = await prisma.user.findUnique({
                where: { email: email || "" },
                select: { username: true }
            });

            console.log("[SISWA] Data Akun:", userData);

            if (!userData || !userData.username) {
                console.log("[SISWA] Gagal: Username (NIS/NISN) tidak ditemukan di tabel User.");
                return NextResponse.json({
                    cards: { totalHariBulanIni: 0, hadirBulanIni: 0, tidakHadirBulanIni: 0, persentaseKehadiran: 0 },
                });
            }

            // Cek Absensi Bulan Ini
            const absensiBulanIni = await prisma.absensi.findMany({
                where: {
                    userId: userData.username,
                    tanggal: { gte: startOfMonth, lte: endOfMonth },
                },
            });

            console.log(`[SISWA] Absensi Bulan Ini: ${absensiBulanIni.length} data`);

            // DEBUG: Cek Absensi ALL TIME
            const cekAbsensiAllTime = await prisma.absensi.count({
                where: { userId: userData.username }
            });
            console.log(`[SISWA] Absensi Total Seluruh Waktu: ${cekAbsensiAllTime} data`);


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