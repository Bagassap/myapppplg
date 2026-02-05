import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { nama, isi, tanggal, informasiId } = body;

        if (!isi || !nama || !informasiId) {
            return NextResponse.json(
                { error: "Nama, Isi, dan ID Informasi wajib diisi" },
                { status: 400 }
            );
        }

        const newComment = await prisma.komentar.create({
            data: {
                informasiId: parseInt(informasiId),
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