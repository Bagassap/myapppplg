import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "../../auth/[...nextauth]/route";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = session.user as any;
    const { role, email } = user;
    const userRole = role ? role.toUpperCase() : "";

    try {
        let kelasOption: any[] = [];
        let tempatPKLOption: any[] = [];
        let tanggalOption: string[] = [];

        if (userRole === "ADMIN") {
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
        else if (userRole === "GURU") {
            const guruUser = await prisma.user.findUnique({
                where: { email: email || "" },
                select: { name: true, username: true }
            });

            if (guruUser && guruUser.name) {
                const searchConditions: any[] = [
                    { guruPembimbing: { contains: guruUser.name, mode: "insensitive" } }
                ];
                if (guruUser.username) {
                    searchConditions.push({ guruPembimbing: { contains: guruUser.username, mode: "insensitive" } });
                }

                const siswaBimbingan = await prisma.dataSiswa.findMany({
                    where: { OR: searchConditions },
                    select: { userId: true, tempatPKL: true }
                });

                const distinctPKL = [...new Set(siswaBimbingan.map(s => s.tempatPKL).filter(Boolean))];
                tempatPKLOption = distinctPKL.sort().map(pkl => ({
                    id: pkl,
                    label: pkl
                }));

                const siswaIds = siswaBimbingan.map(s => s.userId);

                if (siswaIds.length > 0) {
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
            }
        }

        return NextResponse.json({
            kelas: kelasOption,
            tempatPKL: tempatPKLOption,
            tanggal: tanggalOption
        });

    } catch (error) {
        return NextResponse.json({
            kelas: [],
            tempatPKL: [],
            tanggal: []
        });
    }
}