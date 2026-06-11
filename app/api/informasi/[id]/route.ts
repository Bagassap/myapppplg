import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PUT(
    request: Request,
    props: { params: Promise<{ id: string }> }
) {
    const params = await props.params;
    try {
        const session = await getServerSession(authOptions);
        if (!session || !["ADMIN", "GURU"].includes(session.user.role)) {
            return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
        }

        const id = parseInt(params.id);
        const { judul, konten } = await request.json();

        const item = await prisma.informasi.update({
            where: { id },
            data: {
                ...(judul !== undefined && { judul: judul.trim() }),
                ...(konten !== undefined && { konten: konten.trim() }),
            },
            select: { id: true, judul: true, konten: true, pembuat: true, createdAt: true },
        });

        return NextResponse.json({ success: true, data: item });
    } catch {
        return NextResponse.json({ success: false, error: "Gagal update" }, { status: 500 });
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
            return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
        }

        const id = parseInt(params.id);
        await prisma.informasi.delete({ where: { id } });
        return NextResponse.json({ success: true });
    } catch {
        return NextResponse.json({ success: false, error: "Gagal hapus" }, { status: 500 });
    }
}
