import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { PrismaClient } from "@prisma/client";
import { authOptions } from "../../auth/[...nextauth]/route";

const prisma = new PrismaClient();

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
    const { role, name } = user;

    const { searchParams } = new URL(request.url);

    const kelasParam = searchParams.get('kelas');
    const tanggalParam = searchParams.get('tanggal');
    const statusParam = searchParams.get('status');

    try {
        let whereClause: any = {};

        if (tanggalParam) {
            const start = new Date(tanggalParam);
            start.setHours(0, 0, 0, 0);
            const end = new Date(tanggalParam);
            end.setHours(23, 59, 59, 999);
            whereClause.tanggal = { gte: start, lte: end };
        }

        if (statusParam) {
            whereClause.status = statusParam;
        }

        let siswaFilter: any = {};

        if (role === "GURU") {
            siswaFilter.guruPembimbing = name;
        }

        if (kelasParam) {
            siswaFilter.kelas = kelasParam;
        }

        if (Object.keys(siswaFilter).length > 0) {
            whereClause.dataSiswa = siswaFilter;
        }

        const data = await prisma.absensi.findMany({
            where: whereClause,
            include: {
                dataSiswa: {
                    select: {
                        kelas: true,
                        guruPembimbing: true
                    }
                }
            },
            orderBy: {
                tanggal: 'desc'
            }
        });

        const header = "Tanggal,User ID,Kelas,Guru Pembimbing,Status,Waktu\n";
        const csvRows = data.map(row => {
            const tgl = row.tanggal.toISOString().split('T')[0];
            const uid = row.userId;
            const kls = row.dataSiswa?.kelas || "-";
            const guru = row.dataSiswa?.guruPembimbing || "-";
            const sts = row.status;
            const wkt = row.waktu || "-";

            return `${tgl},${uid},${kls},"${guru}",${sts},${wkt}`;
        });

        const csvContent = header + csvRows.join("\n");

        return new NextResponse(csvContent, {
            status: 200,
            headers: {
                'Content-Type': 'text/csv',
                'Content-Disposition': `attachment; filename="laporan_absensi_${role}.csv"`
            }
        });

    } catch (error) {
        return NextResponse.json({ error: "Export failed" }, { status: 500 });
    }
}