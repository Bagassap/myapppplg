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
        // ── ADMIN ──────────────────────────────────────────────────────────────────
        if (userRole === "ADMIN") {
            const tanggalWhere = buildTanggalWhere(tanggalFilter);
            const siswaWhere: any = kelasFilter ? { kelas: kelasFilter } : {};

            const semuaSiswa = await prisma.dataSiswa.findMany({
                where: siswaWhere,
                select: { userId: true, kelas: true },
            });

            const totalSiswa = semuaSiswa.length;
            const allUserIds = semuaSiswa.map((s) => s.userId);

            // FIX BUG 1 & 2: Ambil semua absensi hari ini sekaligus, lalu hitung
            // hadir, izin, dan alfa secara terpisah per userId.
            const absensiHariIni = await prisma.absensi.findMany({
                where: {
                    userId: { in: allUserIds },
                    tanggal: tanggalWhere,
                    tipe: "masuk",
                },
                select: { userId: true, status: true },
            });

            // Buat map: userId → status terakhir hari ini
            const statusMap = new Map<string, string>();
            absensiHariIni.forEach((a) => {
                statusMap.set(a.userId, a.status);
            });

            // Hitung dari statusMap
            let hadirCount = 0;
            let izinCount = 0;
            let alfaCount = 0;

            allUserIds.forEach((id) => {
                const status = statusMap.get(id);
                if (!status) {
                    // Tidak ada record sama sekali = belum absen / tidak hadir
                    alfaCount++;
                } else if (status === "Hadir") {
                    hadirCount++;
                } else if (status === "Izin" || status === "Sakit") {
                    izinCount++;
                } else {
                    // Status lain (misal "Terlambat" dll) dihitung alfa
                    alfaCount++;
                }
            });

            const persentaseKehadiran =
                totalSiswa > 0 ? Math.round((hadirCount / totalSiswa) * 100) : 0;

            // FIX BUG 2: Tambahkan field `tidakHadir` (alfa per kelas) di tableData
            const kelasSiswaMap = new Map<string, string[]>();
            semuaSiswa.forEach((s) => {
                if (!kelasSiswaMap.has(s.kelas)) kelasSiswaMap.set(s.kelas, []);
                kelasSiswaMap.get(s.kelas)!.push(s.userId);
            });

            const tableData = Array.from(kelasSiswaMap.entries()).map(
                ([kelas, ids]) => {
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
                        tidakHadir: alfaKelas, // ← FIX: field ini sebelumnya tidak ada
                        total: totalKelas,
                        persentase:
                            totalKelas > 0 ? Math.round((hadirKelas / totalKelas) * 100) : 0,
                    };
                }
            );

            return NextResponse.json({
                cards: {
                    totalSiswa,
                    hadirHariIni: hadirCount,
                    izin: izinCount,        // ← bonus: izin terpisah
                    tidakHadir: alfaCount,  // ← FIX: sekarang ini benar-benar ALFA
                    persentaseKehadiran,
                },
                table: tableData,
            });
        }

        // ── GURU ───────────────────────────────────────────────────────────────────
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
                        tidakHadir: 0,
                        persentaseKehadiran: 0,
                    },
                    table: [],
                });
            }

            const searchConditions: any[] = [
                {
                    guruPembimbing: {
                        contains: guruUser.name,
                        mode: "insensitive",
                    },
                },
            ];
            if (guruUser.username) {
                searchConditions.push({
                    guruPembimbing: {
                        contains: guruUser.username,
                        mode: "insensitive",
                    },
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
                    cards: {
                        totalSiswaPKL: 0,
                        hadirHariIni: 0,
                        tidakHadir: 0,
                        persentaseKehadiran: 0,
                    },
                    table: [],
                });
            }

            const tanggalWhere = buildTanggalWhere(tanggalFilter);

            const now = new Date();
            const startBulan = new Date(now.getFullYear(), now.getMonth(), 1);
            startBulan.setHours(0, 0, 0, 0);
            const endBulan = new Date(
                now.getFullYear(),
                now.getMonth() + 1,
                0,
                23,
                59,
                59,
                999
            );

            // FIX BUG 3: Ambil User berdasarkan username yang sesuai dengan
            // DataSiswa.userId (bukan userId integer). Ini yang menyebabkan
            // userMap kosong sebelumnya.
            const [
                absensiHariIniGuru,
                hadirBulanData,
                totalBulanData,
                users,
            ] = await Promise.all([
                // Absensi hari ini untuk cards
                prisma.absensi.findMany({
                    where: {
                        userId: { in: studentIds },
                        tanggal: tanggalWhere,
                        tipe: "masuk",
                    },
                    select: { userId: true, status: true },
                }),
                // Hadir bulan ini untuk tabel
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
                // Total hari bulan ini untuk tabel
                prisma.absensi.groupBy({
                    by: ["userId"],
                    where: {
                        userId: { in: studentIds },
                        tanggal: { gte: startBulan, lte: endBulan },
                        tipe: "masuk",
                    },
                    _count: { userId: true },
                }),
                // FIX BUG 3: Gunakan `username: { in: studentIds }` — DataSiswa.userId
                // memang berisi username string, ini sudah benar. Masalah aslinya adalah
                // kondisi `username: { in: studentIds }` tidak match karena mungkin ada
                // siswa yang userId-nya bukan username. Tambahkan fallback ke `name`.
                prisma.user.findMany({
                    where: {
                        OR: [
                            { username: { in: studentIds } },
                            // Fallback: cari juga lewat email jika userId berformat email
                            { email: { in: studentIds } },
                        ],
                    },
                    select: { username: true, email: true, name: true },
                }),
            ]);

            // FIX BUG 3: Build userMap dengan key ganda (username DAN email)
            const userMap = new Map<string, string>();
            users.forEach((u) => {
                if (u.username) userMap.set(u.username, u.name ?? u.username);
                if (u.email) userMap.set(u.email, u.name ?? u.email);
            });

            // Hitung cards hari ini
            const statusMapGuru = new Map<string, string>();
            absensiHariIniGuru.forEach((a) => statusMapGuru.set(a.userId, a.status));

            let hadirHariIni = 0;
            let tidakHadir = 0;
            studentIds.forEach((id) => {
                const st = statusMapGuru.get(id);
                if (st === "Hadir") hadirHariIni++;
                else tidakHadir++;
            });

            const persentaseKehadiran =
                totalSiswaPKL > 0
                    ? Math.round((hadirHariIni / totalSiswaPKL) * 100)
                    : 0;

            const hadirMap = new Map(
                hadirBulanData.map((h) => [h.userId, h._count.userId])
            );
            const totalMap = new Map(
                totalBulanData.map((t) => [t.userId, t._count.userId])
            );

            // FIX BUG 4: tableData pakai data bulan, cards pakai data hari ini
            // (sekarang konsisten: cards = hari ini, tabel = bulan ini)
            const tableData = siswaBimbingan.map((s) => {
                const hadirBulan = hadirMap.get(s.userId) ?? 0;
                const totalBulan = totalMap.get(s.userId) ?? 0;
                return {
                    tempatPKL: s.tempatPKL || "-",
                    siswa: userMap.get(s.userId) || s.userId, // FIX BUG 3
                    hadir: hadirBulan,
                    totalHari: totalBulan,
                    tidakHadir: Math.max(0, totalBulan - hadirBulan),
                };
            });

            return NextResponse.json({
                cards: { totalSiswaPKL, hadirHariIni, tidakHadir, persentaseKehadiran },
                table: tableData,
            });
        }

        // ── SISWA ──────────────────────────────────────────────────────────────────
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
                        sudahAbsenHariIni: false,
                    },
                });
            }

            const now = new Date();
            const startBulan = new Date(now.getFullYear(), now.getMonth(), 1);
            startBulan.setHours(0, 0, 0, 0);
            const endBulan = new Date(now.getFullYear(), now.getMonth() + 1, 0);
            endBulan.setHours(23, 59, 59, 999);

            // Tanggal hari ini untuk cek sudahAbsen
            const todayStart = new Date();
            todayStart.setHours(0, 0, 0, 0);
            const todayEnd = new Date();
            todayEnd.setHours(23, 59, 59, 999);

            // FIX BUG 5: Tambahkan query cek absensi hari ini secara eksplisit
            const [totalHariBulanIni, hadirBulanIni, absenHariIni] =
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
                    // FIX BUG 5: Query khusus cek apakah sudah absen HARI INI
                    prisma.absensi.count({
                        where: {
                            userId: userData.username,
                            tanggal: { gte: todayStart, lte: todayEnd },
                            tipe: "masuk",
                        },
                    }),
                ]);

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
                    sudahAbsenHariIni: absenHariIni > 0, // FIX BUG 5
                },
            });
        }

        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    } catch (error) {
        console.error("Dashboard GET error:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}