import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { prisma } from '@/lib/prisma';
import { uploadFile } from '@/lib/upload';
import { authOptions } from '../../auth/[...nextauth]/route'; // Path relatif (karena di subfolder)

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = params;
    try {
        const absensi = await prisma.absensi.findUnique({
            where: { id: parseInt(id) },
            include: { dataSiswa: true },
        });
        if (!absensi) return NextResponse.json({ error: 'Absensi not found' }, { status: 404 });

        if ((session.user as any).role === 'SISWA' && absensi.userId !== (session.user as any).id.toString()) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        return NextResponse.json(absensi);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch absensi' }, { status: 500 });
    }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || (session.user as any).role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const { id } = params;
    const formData = await req.formData();
    const status = formData.get('status') as string;
    const kegiatan = formData.get('kegiatan') as string;
    const keterangan = formData.get('keterangan') as string;
    const foto = formData.get('foto') as File;
    const lokasi = formData.get('lokasi') as string;
    const waktu = formData.get('waktu') as string;
    const bukti = formData.get('bukti') as File;
    const tandaTangan = formData.get('tandaTangan') as File;

    let fotoUrl = null;
    let buktiUrl = null;
    let tandaTanganUrl = null;
    if (foto) fotoUrl = await uploadFile(foto);
    if (bukti) buktiUrl = await uploadFile(bukti);
    if (tandaTangan) tandaTanganUrl = await uploadFile(tandaTangan);

    try {
        const updatedAbsensi = await prisma.absensi.update({
            where: { id: parseInt(id) },
            data: {
                status,
                kegiatan,
                keterangan,
                foto: fotoUrl,
                lokasi,
                waktu,
                bukti: buktiUrl,
                tandaTangan: tandaTanganUrl,
            },
        });
        return NextResponse.json(updatedAbsensi);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to update absensi' }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || (session.user as any).role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const { id } = params;
    try {
        await prisma.absensi.delete({
            where: { id: parseInt(id) },
        });
        return NextResponse.json({ message: 'Absensi deleted' });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete absensi' }, { status: 500 });
    }
}