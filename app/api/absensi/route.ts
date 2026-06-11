import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { cachedQuery, cache } from "@/lib/cache";
import { checkAbsenLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";
function jsonError(msg: string, status: number) {
    return NextResponse.json({ error: msg }, { status });
}

function parseDate(str: string | null): Date | null {
    if (!str) return null;
    const d = new Date(str);
    return isNaN(d.getTime()) ? null : d;
}

const absensiSelect = {
    id: true,
    userId: true,
    tanggal: true,
    tipe: true,
    status: true,
    keterangan: true,
    kegiatan: true,
    foto: true,
    lokasi: true,
    waktu: true,
    bukti: true,
    tandaTangan: true,
    createdAt: true,
    updatedAt: true,
} as const;
export async function GET(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session?.user) return jsonError("Unauthorized", 401);

    const user = session.user as any;
    const role = (user.role as string).toUpperCase();
    const userId = user.id as string;
    const { searchParams } = req.nextUrl;

    const startDate = parseDate(searchParams.get("startDate"));
    const endDate = parseDate(searchParams.get("endDate"));
    const kelasFilter = searchParams.get("kelas") ?? undefined;
    const tipeFilter = searchParams.get("tipe") ?? undefined;

    const dateFilter =
        startDate && endDate
            ? {
                tanggal: {
                    gte: new Date(new Date(startDate).setHours(0, 0, 0, 0)),
                    lte: new Date(new Date(endDate).setHours(23, 59, 59, 999)),
                },
            }
            : {};

    const tipeWhere = tipeFilter ? { tipe: tipeFilter } : {};

    try {
        if (role === "SISWA") {
            const userData = await cachedQuery(
                `user:username:${userId}`,
                300,
                () =>
                    prisma.user.findUnique({
                        where: { id: Number(userId) },
                        select: { username: true, name: true },
                    })
            );

            if (!userData?.username) return NextResponse.json([], { status: 200 });

            const absensiList = await prisma.absensi.findMany({
                where: {
                    userId: userData.username,
                    ...dateFilter,
                    ...tipeWhere,
                },
                select: {
                    ...absensiSelect,
                    dataSiswa: { select: { kelas: true, tempatPKL: true } },
                },
                orderBy: { tanggal: "desc" },
                take: 100,
            });

            return NextResponse.json(
                absensiList.map((item) => ({
                    id: item.id,
                    userId: item.userId,
                    siswa: userData.name ?? item.userId,
                    kelas: item.dataSiswa?.kelas ?? "-",
                    tempatPKL: item.dataSiswa?.tempatPKL ?? "-",
                    tanggal: item.tanggal,
                    tipe: item.tipe,
                    status: item.status,
                    keterangan: item.keterangan,
                    kegiatan: item.kegiatan,
                    foto: item.foto,
                    lokasi: item.lokasi,
                    waktu: item.waktu,
                    bukti: item.bukti,
                    tandaTangan: item.tandaTangan,
                    createdAt: item.createdAt,
                    updatedAt: item.updatedAt,
                }))
            );
        }
        if (role === "GURU") {
            const guruUser = await prisma.user.findUnique({
                where: { id: Number(userId) },
                select: { name: true, username: true },
            });
            const guruSearchVals = [guruUser?.name, guruUser?.username].filter(Boolean) as string[];
            const guruWhere = guruSearchVals.length > 0
                ? { OR: guruSearchVals.map(v => ({ guruPembimbing: { contains: v, mode: "insensitive" as const } })) }
                : { guruPembimbing: "" };

            const siswaBimbingan = await cachedQuery(
                `guru:siswa:${userId}`,
                120,
                () =>
                    prisma.dataSiswa.findMany({
                        where: {
                            ...guruWhere,
                            ...(kelasFilter ? { kelas: kelasFilter } : {}),
                        },
                        select: { userId: true, kelas: true, tempatPKL: true },
                    })
            );

            if (siswaBimbingan.length === 0) return NextResponse.json([]);

            const nismList = siswaBimbingan.map((s) => s.userId);

            const absensiList = await prisma.absensi.findMany({
                where: {
                    userId: { in: nismList },
                    ...dateFilter,
                    ...tipeWhere,
                },
                select: absensiSelect,
                orderBy: { tanggal: "desc" },
                take: 500,
            });

            const siswaMap = Object.fromEntries(
                siswaBimbingan.map((s) => [s.userId, s])
            );

            const usernames = [...new Set(absensiList.map((a) => a.userId))];
            const users = await cachedQuery(
                `users:batch:${usernames.sort().join(",")}`,
                120,
                () =>
                    prisma.user.findMany({
                        where: { username: { in: usernames } },
                        select: { username: true, name: true },
                    })
            );
            const nameMap = Object.fromEntries(
                users.map((u) => [u.username ?? "", u.name ?? u.username ?? "-"])
            );

            return NextResponse.json(
                absensiList.map((item) => ({
                    id: item.id,
                    userId: item.userId,
                    siswa: nameMap[item.userId] ?? item.userId,
                    kelas: siswaMap[item.userId]?.kelas ?? "-",
                    tempatPKL: siswaMap[item.userId]?.tempatPKL ?? "-",
                    tanggal: item.tanggal,
                    tipe: item.tipe,
                    status: item.status,
                    keterangan: item.keterangan,
                    kegiatan: item.kegiatan,
                    foto: item.foto,
                    lokasi: item.lokasi,
                    waktu: item.waktu,
                    bukti: item.bukti,
                    tandaTangan: item.tandaTangan,
                    createdAt: item.createdAt,
                    updatedAt: item.updatedAt,
                }))
            );
        }
        if (role === "ADMIN") {
            const where: any = { ...dateFilter, ...tipeWhere };

            if (kelasFilter) {
                const kelasNIS = await cachedQuery(
                    `kelas:nis:${kelasFilter}`,
                    120,
                    () =>
                        prisma.dataSiswa.findMany({
                            where: { kelas: kelasFilter },
                            select: { userId: true },
                        })
                );
                where.userId = { in: kelasNIS.map((k) => k.userId) };
            }

            const absensiList = await prisma.absensi.findMany({
                where,
                select: {
                    ...absensiSelect,
                    dataSiswa: {
                        select: { kelas: true, tempatPKL: true, guruPembimbing: true },
                    },
                },
                orderBy: { tanggal: "desc" },
                take: 1000,
            });

            const nismList = [...new Set(absensiList.map((a) => a.userId))];
            const userList = await cachedQuery(
                `admin:names:${nismList.sort().join(",")}`,
                60,
                () =>
                    prisma.user.findMany({
                        where: { username: { in: nismList } },
                        select: { username: true, name: true },
                    })
            );
            const nameMap = Object.fromEntries(
                userList.map((u) => [u.username ?? "", u.name ?? u.username ?? "-"])
            );

            return NextResponse.json(
                absensiList.map((item) => ({
                    id: item.id,
                    userId: item.userId,
                    siswa: nameMap[item.userId] ?? item.userId,
                    kelas: item.dataSiswa?.kelas ?? "-",
                    tempatPKL: item.dataSiswa?.tempatPKL ?? "-",
                    guruPembimbing: item.dataSiswa?.guruPembimbing ?? "-",
                    tanggal: item.tanggal,
                    tipe: item.tipe,
                    status: item.status,
                    keterangan: item.keterangan,
                    kegiatan: item.kegiatan,
                    foto: item.foto,
                    lokasi: item.lokasi,
                    waktu: item.waktu,
                    bukti: item.bukti,
                    tandaTangan: item.tandaTangan,
                    createdAt: item.createdAt,
                    updatedAt: item.updatedAt,
                }))
            );
        }

        return jsonError("Role tidak dikenali", 403);
    } catch (err) {
        console.error("[GET /api/absensi]", err);
        return jsonError("Terjadi kesalahan server", 500);
    }
}

export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session?.user) return jsonError("Unauthorized", 401);

    const user = session.user as any;
    const userId = user.id as string;
    const role = (user.role as string).toUpperCase();

    if (role !== "SISWA") return jsonError("Hanya siswa yang bisa absen", 403);
    const rateCheck = checkAbsenLimit(userId);
    if (!rateCheck.allowed) {
        return NextResponse.json(
            {
                error: "Terlalu cepat. Tunggu beberapa detik sebelum absen lagi.",
                resetIn: Math.ceil(rateCheck.resetIn / 1000),
            },
            {
                status: 429,
                headers: { "Retry-After": String(Math.ceil(rateCheck.resetIn / 1000)) },
            }
        );
    }

    try {
        let body: any;
        const contentType = req.headers.get("content-type") ?? "";

        if (contentType.includes("application/json")) {
            body = await req.json();
        } else if (contentType.includes("multipart/form-data") || contentType.includes("application/x-www-form-urlencoded")) {
            const formData = await req.formData();
            body = Object.fromEntries(formData.entries());
        } else {
            const text = await req.text();
            try {
                body = JSON.parse(text);
            } catch {
                return jsonError("Format request tidak valid", 400);
            }
        }

        const {
            status, tipe, keterangan, kegiatan,
            foto, lokasi, waktu, bukti, tandaTangan, tanggal,
        } = body;

        if (!status) return jsonError("Status absen wajib diisi", 400);
        if (!tipe) return jsonError("Tipe absen wajib diisi", 400);
        const userData = await cachedQuery(
            `user:username:${userId}`,
            300,
            () =>
                prisma.user.findUnique({
                    where: { id: Number(userId) },
                    select: { username: true, name: true },
                })
        );

        if (!userData?.username) return jsonError("Data siswa tidak ditemukan", 404);

        const nis = userData.username;
        const tglAbsen = tanggal ? new Date(tanggal) : new Date();
        tglAbsen.setHours(0, 0, 0, 0);
        const tglEnd = new Date(tglAbsen);
        tglEnd.setHours(23, 59, 59, 999);
        const existing = await prisma.absensi.findFirst({
            where: {
                userId: nis,
                tipe,
                tanggal: { gte: tglAbsen, lte: tglEnd },
            },
            select: { id: true },
        });

        let result;

        if (existing) {
            result = await prisma.absensi.update({
                where: { id: existing.id },
                data: {
                    status: status ?? undefined,
                    keterangan: keterangan ?? undefined,
                    kegiatan: kegiatan ?? undefined,
                    foto: foto ?? undefined,
                    lokasi: lokasi ?? undefined,
                    waktu: waktu ?? undefined,
                    bukti: bukti ?? undefined,
                    tandaTangan: tandaTangan ?? undefined,
                },
            });
        } else {
            result = await prisma.absensi.create({
                data: {
                    userId: nis,
                    tanggal: tglAbsen,
                    tipe,
                    status,
                    keterangan: keterangan ?? null,
                    kegiatan: kegiatan ?? null,
                    foto: foto ?? null,
                    lokasi: lokasi ?? null,
                    waktu: waktu ?? null,
                    bukti: bukti ?? null,
                    tandaTangan: tandaTangan ?? null,
                },
            });
        }

        cache.invalidate(`user:absensi:${nis}`);

        return NextResponse.json(result, { status: existing ? 200 : 201 });
    } catch (err: any) {
        console.error("[POST /api/absensi]", err);

        if (err?.code === "P2002") {
            return jsonError("Anda sudah absen untuk tipe ini hari ini.", 409);
        }

        return jsonError("Gagal menyimpan absensi", 500);
    }
}