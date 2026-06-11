import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function PUT(req: NextRequest, props: { params: Promise<{ id: string }> }) {
    const { id } = await props.params;
    const session = await getServerSession(authOptions);
    if (!session?.user || !["ADMIN", "SISWA"].includes((session.user as any).role)) {
        return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    try {
        const siswa = await prisma.dataSiswa.findUnique({ where: { id: Number(id) } });
        if (!siswa) return NextResponse.json({ success: false, error: "Data tidak ditemukan" }, { status: 404 });

        const user = await prisma.user.findFirst({ where: { username: siswa.userId } });
        if (!user) return NextResponse.json({ success: false, error: "User tidak ditemukan" }, { status: 404 });

        const body = await req.json();
        const { namaLengkap, kelas, jurusan, tempatPKL, noHp, alamat, password, isActive } = body;

        const userUpdate: any = {};
        if (namaLengkap?.trim()) userUpdate.name = namaLengkap.trim();
        if (password?.trim()) userUpdate.password = await bcrypt.hash(password.trim(), 10);
        if (Object.keys(userUpdate).length) {
            await prisma.user.update({ where: { id: user.id }, data: userUpdate });
        }

        const siswaUpdate: any = {};
        if (kelas?.trim()) siswaUpdate.kelas = kelas.trim();
        if (jurusan !== undefined) siswaUpdate.jurusan = jurusan || null;
        if (tempatPKL !== undefined) siswaUpdate.tempatPKL = tempatPKL || null;
        if (noHp !== undefined) siswaUpdate.noHp = noHp || null;
        if (alamat !== undefined) siswaUpdate.alamat = alamat || null;
        if (isActive !== undefined) siswaUpdate.isActive = Boolean(isActive);

        const updated = await prisma.dataSiswa.update({ where: { id: Number(id) }, data: siswaUpdate });

        return NextResponse.json({
            success: true,
            data: {
                id: updated.id,
                userId: updated.userId,
                name: namaLengkap?.trim() ?? user.name ?? "",
                email: user.email,
                kelas: updated.kelas,
                jurusan: updated.jurusan ?? "",
                tempatPKL: updated.tempatPKL ?? "",
                noHp: updated.noHp ?? "",
                alamat: updated.alamat ?? "",
                isActive: updated.isActive,
            },
        });
    } catch (e) {
        console.error("PUT /api/data-siswa/[id]", e);
        return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest, props: { params: Promise<{ id: string }> }) {
    const { id } = await props.params;
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user as any).role !== "ADMIN") {
        return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    try {
        const siswa = await prisma.dataSiswa.findUnique({ where: { id: Number(id) } });
        if (!siswa) return NextResponse.json({ success: false, error: "Data tidak ditemukan" }, { status: 404 });

        await prisma.absensi.deleteMany({ where: { userId: siswa.userId } });
        await prisma.dataSiswa.delete({ where: { id: Number(id) } });

        const user = await prisma.user.findFirst({ where: { username: siswa.userId } });
        if (user) await prisma.user.delete({ where: { id: user.id } });

        return NextResponse.json({ success: true });
    } catch (e) {
        console.error("DELETE /api/data-siswa/[id]", e);
        return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
    }
}
