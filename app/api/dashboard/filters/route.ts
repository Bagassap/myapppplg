import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "../../auth/[...nextauth]/route";

interface UserSession {
    role: string;
    name?: string | null;
}

export async function GET(request: Request) {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = session.user as UserSession;
    const { role, name } = user;

    try {
        let kelasOption: any[] = [];
        let tempatPKLOption: any[] = [];
        let tanggalOption: string[] = [];

        const statusOption = [
            { value: "Hadir", label: "Hadir" },
            { value: "Tidak Hadir", label: "Tidak Hadir" },
        ];

        if (role === "ADMIN") {
            const distinctKelas = await prisma.dataSiswa.findMany({
                distinct: ['kelas'],
                select: { kelas: true },
                orderBy: { kelas: 'asc' }
            });

            kelasOption = distinctKelas.map(k => ({
                id: k.kelas,
                label: k.kelas
            }));

            const rawTanggal = await prisma.absensi.findMany({
                select: { tanggal: true },
                orderBy: { tanggal: 'desc' },
                take: 100
            });

            const uniqueDates = new Set(
                rawTanggal.map(t => t.tanggal.toISOString().split('T')[0])
            );

            tanggalOption = Array.from(uniqueDates);
        }
        else if (role === "GURU") {
            const distinctPKL = await prisma.dataSiswa.findMany({
                where: { guruPembimbing: name },
                distinct: ['tempatPKL'],
                select: { tempatPKL: true },
                orderBy: { tempatPKL: 'asc' }
            });

            tempatPKLOption = distinctPKL
                .filter(p => p.tempatPKL !== null)
                .map(p => ({
                    id: p.tempatPKL,
                    label: p.tempatPKL
                }));

            const siswaBimbingan = await prisma.dataSiswa.findMany({
                where: { guruPembimbing: name },
                select: { userId: true }
            });

            const siswaIds = siswaBimbingan.map(s => s.userId);

            const rawTanggalGuru = await prisma.absensi.findMany({
                where: { userId: { in: siswaIds } },
                select: { tanggal: true },
                orderBy: { tanggal: 'desc' },
                take: 100
            });

            const uniqueDatesGuru = new Set(
                rawTanggalGuru.map(t => t.tanggal.toISOString().split('T')[0])
            );

            tanggalOption = Array.from(uniqueDatesGuru);
        }

        return NextResponse.json({
            kelas: kelasOption,
            tempatPKL: tempatPKLOption,
            tanggal: tanggalOption,
            status: statusOption
        });

    } catch (error) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}