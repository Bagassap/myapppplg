import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Helper untuk mengambil ID dari params
// Next.js 13+ App Router syntax
export async function PUT(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const id = parseInt(params.id);
        const body = await request.json();
        const { judul, isi, tanggal, tipe, tempatPKL } = body;

        const updatedData = await prisma.informasi.update({
            where: { id },
            data: {
                judul,
                isi,
                tanggal,
                tipe,
                tempatPKL,
            },
        });

        return NextResponse.json(updatedData);
    } catch (error) {
        return NextResponse.json(
            { error: "Gagal update informasi" },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const id = parseInt(params.id);

        await prisma.informasi.delete({
            where: { id },
        });

        return NextResponse.json({ message: "Informasi berhasil dihapus" });
    } catch (error) {
        return NextResponse.json(
            { error: "Gagal menghapus informasi" },
            { status: 500 }
        );
    }
}