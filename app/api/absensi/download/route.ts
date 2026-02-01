import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { prisma } from '@/lib/prisma';
import { createObjectCsvStringifier } from 'csv-writer';
import { authOptions } from '../../auth/[...nextauth]/route'; // Path relatif (karena di subfolder)

export async function GET(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // Validasi: Hanya GURU dan ADMIN yang bisa download
    const userRole = (session.user as any).role;
    if (userRole !== 'GURU' && userRole !== 'ADMIN') {
        return NextResponse.json({ error: 'Download laporan hanya untuk guru dan admin' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    let whereClause: any = {};
    if (startDate && endDate) {
        whereClause.tanggal = { gte: new Date(startDate), lte: new Date(endDate) };
    }

    if (userRole === 'GURU') {
        whereClause.dataSiswa = { guruPembimbing: session.user.name };
    } else if (userRole === 'SISWA') {
        whereClause.userId = (session.user as any).email;
    }

    try {
        const absensi = await prisma.absensi.findMany({
            where: whereClause,
            include: {
                dataSiswa: true,  // Tetap include dataSiswa
            },
            orderBy: { tanggal: 'desc' },
        });

        // Fetch nama user secara terpisah (karena tidak ada relasi langsung)
        const records = await Promise.all(
            absensi.map(async (item) => {
                const user = await prisma.user.findUnique({
                    where: { email: item.userId },
                    select: { name: true },
                });
                return {
                    nama: user?.name || 'N/A',
                    kelas: item.dataSiswa?.kelas || 'N/A',
                    tanggal: item.tanggal.toDateString(),
                    tipe: item.tipe,
                    status: item.status,
                    keterangan: item.keterangan || 'N/A',
                };
            })
        );

        // Generate CSV
        const csvStringifier = createObjectCsvStringifier({
            header: [
                { id: 'nama', title: 'Nama' },
                { id: 'kelas', title: 'Kelas' },
                { id: 'tanggal', title: 'Tanggal' },
                { id: 'tipe', title: 'Tipe' },
                { id: 'status', title: 'Status' },
                { id: 'keterangan', title: 'Keterangan' },
            ],
        });

        const csvContent = csvStringifier.getHeaderString() + csvStringifier.stringifyRecords(records);

        return new NextResponse(csvContent, {
            headers: {
                'Content-Type': 'text/csv',
                'Content-Disposition': 'attachment; filename=laporan-absensi.csv',
            },
        });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to generate report' }, { status: 500 });
    }
}