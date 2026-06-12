import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function GET() {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const userId = Number(session.user.id);

    const conversations = await prisma.conversation.findMany({
        where: {
            participants: { some: { userId } },
        },
        include: {
            participants: {
                include: {
                    user: { select: { id: true, name: true, role: true } },
                },
            },
            messages: {
                orderBy: { createdAt: "desc" },
                take: 1,
            },
        },
        orderBy: { updatedAt: "desc" },
    });

    const result = await Promise.all(
        conversations.map(async (conv) => {
            const other = conv.participants.find((p) => p.userId !== userId);
            const myParticipant = conv.participants.find((p) => p.userId === userId);
            const lastReadAt = myParticipant?.lastReadAt;

            const unreadCount = await prisma.chatMessage.count({
                where: {
                    conversationId: conv.id,
                    senderId: { not: userId },
                    isRead: false,
                    ...(lastReadAt ? { createdAt: { gt: lastReadAt } } : {}),
                },
            });

            return {
                id: conv.id,
                otherUser: other?.user ?? null,
                lastMessage: conv.messages[0] ?? null,
                unreadCount,
                updatedAt: conv.updatedAt,
            };
        }),
    );

    return NextResponse.json(result);
}

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const userId = Number(session.user.id);
    const role = session.user.role as string;
    const body = await req.json();
    const targetId = Number(body.targetId);

    if (!targetId) return NextResponse.json({ error: "targetId wajib" }, { status: 400 });

    if (role === "SISWA") {
        return NextResponse.json({ error: "Siswa tidak bisa memulai chat" }, { status: 403 });
    }

    if (role === "GURU") {
        const targetUser = await prisma.user.findUnique({
            where: { id: targetId },
            select: { username: true },
        });
        const isBimbing = await prisma.dataSiswa.findFirst({
            where: {
                guruPembimbing: session.user.name ?? "",
                userId: targetUser?.username ?? "",
            },
        });
        if (!isBimbing) {
            return NextResponse.json(
                { error: "Guru hanya bisa chat ke siswa yang dibimbing" },
                { status: 403 },
            );
        }
    }

    const existing = await prisma.conversation.findFirst({
        where: {
            AND: [
                { participants: { some: { userId } } },
                { participants: { some: { userId: targetId } } },
            ],
        },
    });

    if (existing) return NextResponse.json({ conversationId: existing.id });

    const conv = await prisma.conversation.create({
        data: {
            participants: {
                create: [{ userId }, { userId: targetId }],
            },
        },
    });

    return NextResponse.json({ conversationId: conv.id }, { status: 201 });
}
