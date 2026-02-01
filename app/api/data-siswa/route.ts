import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";
import { prisma } from '../../../lib/prisma';

export async function GET(req: NextRequest) {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = session.user as {
        id?: string;
        role?: string;
        name?: string;
        username?: string;
    };
    const role = user.role;
    const userId = user.id;
    if (!userId || !role) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const kelasFilter = searchParams.get("kelas");

    let whereFilter: any = {};
    if (kelasFilter && kelasFilter !== "Semua Kelas") {
        whereFilter.kelas = kelasFilter;
    }

    try {
        let siswaData;

        if (role === "ADMIN") {
            // Role ADMIN: ambil semua data sesuai kelas filter
            siswaData = await prisma.dataSiswa.findMany({ where: whereFilter });
        } else if (role === "GURU") {
            // Role GURU: ambil user guru dulu berdasarkan id session
            const guruUser = await prisma.user.findUnique({
                where: { id: Number(userId) },
                select: { username: true, name: true },
            });

            const guruName = guruUser?.username || guruUser?.name || "";

            siswaData = await prisma.dataSiswa.findMany({
                where: {
                    ...whereFilter,
                    guruPembimbing: {
                        equals: guruName,
                        mode: "insensitive", // agar tidak case sensitive
                    },
                },
            });
        } else if (role === "SISWA") {
            // Role SISWA: ambil username siswa dulu berdasarkan id session
            const siswaUser = await prisma.user.findUnique({
                where: { id: Number(userId) },
                select: { username: true },
            });

            if (!siswaUser?.username) {
                return NextResponse.json({ error: "Data siswa tidak ditemukan" }, { status: 404 });
            }

            // Cari data siswa dengan userId = username
            const siswa = await prisma.dataSiswa.findFirst({
                where: { userId: siswaUser.username },
            });

            siswaData = siswa ? [siswa] : [];
        } else {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        if (!siswaData || siswaData.length === 0) return NextResponse.json([]);

        // Ambil semua userId (username) dari data siswa
        const userIds = siswaData.map(item => item.userId);

        // Ambil data user sesuai userId (username)
        const users = await prisma.user.findMany({
            where: { username: { in: userIds } },
            select: { username: true, name: true },
        });

        // Buat map username ke nama
        const userIdToNameMap = new Map<string, string>();
        users.forEach(u => {
            if (u.username) {
                userIdToNameMap.set(u.username, u.name ?? "");
            }
        });

        // Gabungkan data siswa dengan nama user
        const dataWithName = siswaData.map(item => ({
            id: item.id,
            userId: item.userId,
            name: userIdToNameMap.get(item.userId) || "",
            kelas: item.kelas,
            tempatPKL: item.tempatPKL,
            guruPembimbing: item.guruPembimbing,
        }));

        return NextResponse.json(dataWithName);
    } catch (error) {
        console.error("GET /api/data-siswa error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}