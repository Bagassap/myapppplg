import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { prisma } from '@/lib/prisma';
import { uploadFile } from '@/lib/upload';
import { authOptions } from '../auth/[...nextauth]/route';

export async function GET(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user)
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const exportCsv = searchParams.get('export') === 'csv';
    const userRole = (session.user as any).role;

    if (userRole !== 'GURU' && userRole !== 'ADMIN' && userRole !== 'SISWA') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (exportCsv && userRole === 'SISWA') {
        return NextResponse.json({ error: 'Siswa tidak memiliki akses unduh laporan' }, { status: 403 });
    }

    try {
        let whereClause: any = {};

        // --- PERBAIKAN UTAMA DI SINI ---
        if (startDate && endDate) {
            const start = new Date(startDate);
            const end = new Date(endDate);

            // Set start ke awal hari (00:00:00)
            start.setHours(0, 0, 0, 0);

            // Set end ke AKHIR HARI (23:59:59)
            // Agar data absensi jam berapapun hari itu tetap masuk
            end.setHours(23, 59, 59, 999);

            whereClause.tanggal = { gte: start, lte: end };
        }
        // -------------------------------

        if (userRole === 'GURU') {
            const teacherName = (session.user as any).name;
            const nameParts = teacherName.split(' ');
            const firstName = nameParts[0];

            const myStudents = await prisma.dataSiswa.findMany({
                where: {
                    OR: [
                        {
                            guruPembimbing: {
                                equals: teacherName,
                                mode: 'insensitive',
                            },
                        },
                        {
                            guruPembimbing: {
                                contains: firstName,
                                mode: 'insensitive',
                            },
                        },
                    ]
                },
                select: { userId: true },
            });

            const studentIds = myStudents.map((s) => s.userId);
            whereClause.userId = { in: studentIds };

        } else if (userRole === 'SISWA') {
            const user = await prisma.user.findUnique({
                where: { email: (session.user as any).email },
                select: { username: true },
            });
            if (!user || !user.username) {
                return NextResponse.json({ error: 'Data user tidak ditemukan' }, { status: 400 });
            }
            whereClause.userId = user.username;
        }

        const absensi = await prisma.absensi.findMany({
            where: whereClause,
            include: { dataSiswa: true },
            orderBy: { tanggal: 'desc' },
        });

        const absensiWithNames = await Promise.all(
            absensi.map(async (item) => {
                const user = await prisma.user.findUnique({
                    where: { username: item.userId },
                    select: { name: true },
                });
                return {
                    ...item,
                    siswaName: user?.name || 'Tidak Diketahui',
                };
            })
        );

        if (exportCsv) {
            const csvHeaders =
                'Tanggal,Siswa,NIS,Tempat PKL,Status,Waktu,Catatan,Kegiatan,Lokasi,Foto,Bukti\n';

            const csvRows = absensiWithNames
                .map((item) => {
                    const tanggal = new Date(item.tanggal).toLocaleDateString('id-ID');
                    const siswa = item.siswaName.replace(/,/g, ' ');
                    const nis = item.userId;
                    const tempatPKL = (item.dataSiswa?.tempatPKL || 'Tidak Diketahui').replace(/,/g, ' ');
                    const status = item.status;
                    const waktu = item.waktu || '-';
                    const catatan = (item.keterangan || '-').replace(/\n/g, ' ').replace(/,/g, ';');
                    const kegiatan = (item.kegiatan || '-').replace(/\n/g, ' ').replace(/,/g, ';');
                    const lokasi = item.lokasi ? `http://googleusercontent.com/maps.google.com/?q=${item.lokasi}` : '-';
                    const foto = item.foto || '-';
                    const bukti = item.bukti || '-';

                    return `${tanggal},"${siswa}","${nis}","${tempatPKL}",${status},"${waktu}","${catatan}","${kegiatan}","${lokasi}","${foto}","${bukti}"\n`;
                })
                .join('');

            const csvContent = csvHeaders + csvRows;

            return new Response(csvContent, {
                headers: {
                    'Content-Type': 'text/csv',
                    'Content-Disposition': `attachment; filename="Laporan_Absensi_${userRole}_${new Date().getTime()}.csv"`,
                },
            });
        }

        return NextResponse.json(absensiWithNames);

    } catch (error) {
        console.error('Error fetching absensi:', error);
        return NextResponse.json({ error: 'Failed to fetch absensi' }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user)
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const userRole = (session.user as any).role;
    if (userRole !== 'SISWA')
        return NextResponse.json({ error: 'Hanya siswa yang dapat melakukan absensi' }, { status: 403 });

    const formData = await req.formData();
    const userEmail = (session.user as any).email;

    const status = formData.get('status') as string;
    const kegiatan = formData.get('kegiatan') as string;
    const catatan = formData.get('keterangan') as string;
    const foto = formData.get('foto') as File;
    const lokasi = formData.get('lokasi') as string;
    const waktu = formData.get('waktu') as string;
    const bukti = formData.get('bukti') as File;
    const tandaTangan = formData.get('tandaTangan') as File;

    const user = await prisma.user.findUnique({
        where: { email: userEmail },
        select: { username: true },
    });
    if (!user || !user.username)
        return NextResponse.json({ error: 'Data user tidak ditemukan' }, { status: 400 });

    const dataSiswa = await prisma.dataSiswa.findUnique({ where: { userId: user.username } });
    if (!dataSiswa)
        return NextResponse.json({ error: 'Data profil siswa belum lengkap' }, { status: 400 });

    const userId = user.username;

    if (status === 'Hadir' && (!foto || !lokasi)) {
        return NextResponse.json({ error: 'Foto & Lokasi wajib untuk absen Hadir' }, { status: 400 });
    }
    if (status === 'Pulang' && (!kegiatan || !foto || !lokasi)) {
        return NextResponse.json({ error: 'Kegiatan, Foto & Lokasi wajib untuk absen Pulang' }, { status: 400 });
    }
    if (status === 'Izin' && (!catatan || !bukti)) {
        return NextResponse.json({ error: 'Catatan & Bukti Surat wajib untuk Izin' }, { status: 400 });
    }
    if (status === 'Libur' && !catatan) {
        return NextResponse.json({ error: 'Catatan wajib diisi untuk Libur' }, { status: 400 });
    }

    let fotoUrl = null;
    let buktiUrl = null;
    let tandaTanganUrl = null;

    try {
        if (foto) fotoUrl = await uploadFile(foto);
        if (bukti) buktiUrl = await uploadFile(bukti);
        if (tandaTangan) tandaTanganUrl = await uploadFile(tandaTangan);
    } catch (uploadError: any) {
        console.error('Upload error:', uploadError);
        return NextResponse.json({ error: 'Gagal mengupload gambar' }, { status: 500 });
    }

    let tipe = 'masuk';
    if (status === 'Pulang') tipe = 'keluar';

    try {
        const absensi = await prisma.absensi.create({
            data: {
                userId,
                tanggal: new Date(),
                tipe,
                status,
                keterangan: catatan || '',
                kegiatan: kegiatan || '',
                foto: fotoUrl,
                lokasi: lokasi || '',
                waktu: waktu || '',
                bukti: buktiUrl,
                tandaTangan: tandaTanganUrl,
            },
        });
        return NextResponse.json(absensi);
    } catch (error: any) {
        console.error('Prisma create error:', error);
        if (error.code === 'P2002')
            return NextResponse.json(
                { error: 'Anda sudah melakukan absensi ini hari ini' },
                { status: 400 }
            );
        return NextResponse.json({ error: 'Gagal menyimpan absensi' }, { status: 500 });
    }
}