import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
    request: Request,
    props: { params: Promise<{ id: string }> }
) {
    const params = await props.params;
    try {
        const id = parseInt(params.id);
        const item = await prisma.informasi.findUnique({
            where: { id },
            include: { komentar: { orderBy: { createdAt: "asc" } } },
        });

        if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });

        prisma.informasi.update({ where: { id }, data: { viewCount: { increment: 1 } } }).catch(() => {});

        return NextResponse.json(item);
    } catch {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function PUT(
    request: Request,
    props: { params: Promise<{ id: string }> }
) {
    const params = await props.params;
    try {
        const session = await getServerSession(authOptions);
        if (!session || !["ADMIN", "GURU"].includes(session.user.role)) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const id = parseInt(params.id);
        const body = await request.json();
        const { judul, isi, tanggal, kategori, tipe, tempatPKL, target, isPinned } = body;

        const item = await prisma.informasi.update({
            where: { id },
            data: {
                ...(judul !== undefined && { judul }),
                ...(isi !== undefined && { isi }),
                ...(tanggal !== undefined && { tanggal }),
                ...(kategori !== undefined && { kategori }),
                ...(tipe !== undefined && { tipe }),
                ...(tempatPKL !== undefined && { tempatPKL }),
                ...(target !== undefined && { target }),
                ...(isPinned !== undefined && { isPinned }),
            },
        });

        return NextResponse.json(item);
    } catch {
        return NextResponse.json({ error: "Gagal update informasi" }, { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    props: { params: Promise<{ id: string }> }
) {
    const params = await props.params;
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const id = parseInt(params.id);
        await prisma.informasi.delete({ where: { id } });
        return NextResponse.json({ success: true });
    } catch {
        return NextResponse.json({ error: "Gagal menghapus informasi" }, { status: 500 });
    }
}
