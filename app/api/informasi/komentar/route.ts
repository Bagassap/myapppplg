import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const informasiId = parseInt(params.id);
        const body = await request.json();
        const { nama, isi, tanggal } = body;

        if (!isi || !nama) {
            return NextResponse.json(
                { error: "Nama dan Isi komentar wajib diisi" },
                { status: 400 }
            );
        }

        const newComment = await prisma.komentar.create({
            data: {
                informasiId,
                nama,
                isi,
                tanggal: tanggal || new Date().toISOString().split("T")[0],
            },
        });

        return NextResponse.json(newComment, { status: 201 });
    } catch (error) {
        return NextResponse.json(
            { error: "Gagal mengirim komentar" },
            { status: 500 }
        );
    }
}