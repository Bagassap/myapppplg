import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = Number(session.user.id);
    const role = session.user.role;

    try {
        if (role === "SISWA") {
            const messages = await prisma.chatMessage.findMany({
                where: { receiverId: userId },
                orderBy: { createdAt: "asc" },
            });
            return NextResponse.json(messages);
        } else {
            const messages = await prisma.chatMessage.findMany({
                where: { senderId: userId },
                orderBy: { createdAt: "asc" },
            });
            return NextResponse.json(messages);
        }
    } catch (error) {
        console.error("[CHAT GET]", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const role = session.user.role;
    if (role === "SISWA") {
        return NextResponse.json({ error: "Siswa tidak dapat mengirim pesan" }, { status: 403 });
    }

    try {
        const body = await req.json();
        const receiverId = Number(body.receiverId);
        const content = String(body.content ?? "").trim();

        if (!receiverId || !content) {
            return NextResponse.json({ error: "receiverId dan content wajib diisi" }, { status: 400 });
        }

        const receiver = await prisma.user.findFirst({
            where: { id: receiverId, role: "SISWA" },
            select: { id: true },
        });
        if (!receiver) {
            return NextResponse.json({ error: "Siswa penerima tidak ditemukan" }, { status: 404 });
        }

        const message = await prisma.chatMessage.create({
            data: {
                senderId: Number(session.user.id),
                receiverId,
                senderName: session.user.name ?? "Admin",
                senderRole: role,
                isRead: false,
            },
        });

        return NextResponse.json(message, { status: 201 });
    } catch (error) {
        console.error("[CHAT POST]", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}