import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { prisma } from '@/lib/prisma';
import { uploadFile } from '@/lib/upload';
import { authOptions } from '../../auth/[...nextauth]/route';

export async function GET(req: NextRequest, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const absensi = await prisma.absensi.findUnique({
            where: { id: parseInt(params.id) },
            include: {
                dataSiswa: {
                    select: {
                        kelas: true,
                        tempatPKL: true
                    }
                }
            }
        });

        if (!absensi) return NextResponse.json({ error: 'Not found' }, { status: 404 });

        const userRole = (session.user as any).role;
        if (userRole === 'SISWA') {
            const user = await prisma.user.findUnique({ where: { email: (session.user as any).email } });
            if (absensi.userId !== user?.username) {
                return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
            }
        }

        let namaSiswa = 'Siswa Tidak Dikenal';
        if (absensi.userId) {
            const user = await prisma.user.findUnique({
                where: { username: absensi.userId },
                select: { name: true }
            });
            if (user?.name) namaSiswa = user.name;
        }

        return NextResponse.json({
            id: absensi.id,
            siswa: namaSiswa,
            kelas: absensi.dataSiswa?.kelas || '-',
            tempatPKL: absensi.dataSiswa?.tempatPKL || '-',
            tanggal: absensi.tanggal,
            status: absensi.status,
            waktu: absensi.waktu,
            kegiatan: absensi.kegiatan,
            keterangan: absensi.keterangan,
            lokasi: absensi.lokasi,
            foto: absensi.foto || null,
            tandaTangan: absensi.tandaTangan || null,
            bukti: absensi.bukti || null
        });

    } catch (error) {
        return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
    }
}

export async function PUT(req: NextRequest, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const session = await getServerSession(authOptions);

    if (!session || (session.user as any).role === 'SISWA') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    try {
        const formData = await req.formData();
        const id = parseInt(params.id);

        const existing = await prisma.absensi.findUnique({ where: { id } });
        if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });

        const fotoFile = formData.get('foto');
        const ttdFile = formData.get('tandaTangan');

        let fotoUrl = existing.foto;
        let ttdUrl = existing.tandaTangan;

        if (fotoFile && typeof fotoFile !== 'string') fotoUrl = await uploadFile(fotoFile as File);
        if (ttdFile && typeof ttdFile !== 'string') ttdUrl = await uploadFile(ttdFile as File);

        const updated = await prisma.absensi.update({
            where: { id },
            data: {
                status: formData.get('status') as string,
                kegiatan: formData.get('kegiatan') as string,
                keterangan: formData.get('keterangan') as string,
                waktu: formData.get('waktu') as string,
                foto: fotoUrl,
                tandaTangan: ttdUrl
            }
        });

        return NextResponse.json(updated);

    } catch (error) {
        return NextResponse.json({ error: 'Update Failed' }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== 'ADMIN') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    try {
        await prisma.absensi.delete({ where: { id: parseInt(params.id) } });
        return NextResponse.json({ message: 'Deleted' });
    } catch (error) {
        return NextResponse.json({ error: 'Delete Failed' }, { status: 500 });
    }
}