import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const informasiId = parseInt(params.id);
        const body = await request.json();
        const { judul, deskripsi } = body;

        if (!judul || !deskripsi) {
            return NextResponse.json(
                { error: "Judul dan Deskripsi laporan wajib diisi" },
                { status: 400 }
            );
        }

        const laporan = await prisma.laporanMasalah.create({
            data: {
                informasiId,
                judul,
                deskripsi,
            },
        });

        return NextResponse.json(laporan, { status: 201 });
    } catch (error) {
        return NextResponse.json(
            { error: "Gagal mengirim laporan" },
            { status: 500 }
        );
    }
}