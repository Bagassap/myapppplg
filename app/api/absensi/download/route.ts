import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { prisma } from '@/lib/prisma';
import { authOptions } from '../../auth/[...nextauth]/route';

export async function GET(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const userRole = (session.user as any).role;

    let whereClause: any = {};

    if (startDate && endDate) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        whereClause.tanggal = { gte: start, lte: end };
    }

    try {
        if (userRole === 'SISWA') {
            const user = await prisma.user.findUnique({ where: { email: (session.user as any).email } });
            if (!user?.username) return NextResponse.json({ error: 'User not found' }, { status: 404 });
            whereClause.userId = user.username;
        } else if (userRole === 'GURU') {
            const teacherName = (session.user as any).name;
            const myStudents = await prisma.dataSiswa.findMany({
                where: { guruPembimbing: { contains: teacherName, mode: 'insensitive' } },
                select: { userId: true }
            });
            whereClause.userId = { in: myStudents.map(s => s.userId) };
        }

        const absensiList = await prisma.absensi.findMany({
            where: whereClause,
            include: {
                dataSiswa: {
                    select: {
                        kelas: true,
                        tempatPKL: true
                    }
                }
            },
            orderBy: { tanggal: 'desc' },
        });

        const header = ['Tanggal,Nama Siswa,NIS/Username,Kelas,Tempat PKL,Status,Waktu,Catatan,Kegiatan,Lokasi'];

        const rows = await Promise.all(absensiList.map(async (item) => {
            let namaSiswa = 'Unknown';
            if (item.userId) {
                const user = await prisma.user.findUnique({
                    where: { username: item.userId },
                    select: { name: true }
                });
                if (user?.name) namaSiswa = user.name;
            }

            return [
                `"${new Date(item.tanggal).toLocaleDateString('id-ID')}"`,
                `"${namaSiswa}"`,
                `"${item.userId}"`,
                `"${item.dataSiswa?.kelas || '-'}"`,
                `"${item.dataSiswa?.tempatPKL || '-'}"`,
                `"${item.status}"`,
                `"${item.waktu || '-'}"`,
                `"${(item.keterangan || '').replace(/"/g, '""')}"`,
                `"${(item.kegiatan || '').replace(/"/g, '""')}"`,
                `"${item.lokasi || '-'}"`
            ].join(',');
        }));

        const csvContent = header.concat(rows).join('\n');

        return new NextResponse(csvContent, {
            headers: {
                'Content-Type': 'text/csv',
                'Content-Disposition': `attachment; filename="Laporan_Absensi_${new Date().toISOString().split('T')[0]}.csv"`,
            },
        });

    } catch (error) {
        return NextResponse.json({ error: 'Download Failed' }, { status: 500 });
    }
}