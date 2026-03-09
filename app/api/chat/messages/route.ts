import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const userId = Number(session.user.id);
    const convId = Number(req.nextUrl.searchParams.get("conversationId"));
    if (!convId) return NextResponse.json({ error: "conversationId wajib" }, { status: 400 });

    const participant = await prisma.conversationParticipant.findUnique({
        where: { conversationId_userId: { conversationId: convId, userId } },
    });
    if (!participant) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const messages = await prisma.chatMessage.findMany({
        where: { conversationId: convId },
        include: { sender: { select: { id: true, name: true, role: true } } },
        orderBy: { createdAt: "asc" },
    });

    await prisma.conversationParticipant.update({
        where: { conversationId_userId: { conversationId: convId, userId } },
        data: { lastReadAt: new Date() },
    });

    await prisma.chatMessage.updateMany({
        where: {
            conversationId: convId,
            senderId: { not: userId },
            isRead: false,
        },
        data: { isRead: true, readAt: new Date() },
    });

    return NextResponse.json(messages);
}

export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const userId = Number(session.user.id);
    const body = await req.json();
    const convId = Number(body.conversationId);
    const content = String(body.content ?? "").trim();

    if (!convId || !content) {
        return NextResponse.json({ error: "conversationId dan content wajib" }, { status: 400 });
    }

    const participant = await prisma.conversationParticipant.findUnique({
        where: { conversationId_userId: { conversationId: convId, userId } },
    });
    if (!participant) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const [message] = await prisma.$transaction([
        prisma.chatMessage.create({
            data: { conversationId: convId, senderId: userId, content },
            include: { sender: { select: { id: true, name: true, role: true } } },
        }),
        prisma.conversation.update({
            where: { id: convId },
            data: { updatedAt: new Date() },
        }),
    ]);

    return NextResponse.json(message, { status: 201 });
}