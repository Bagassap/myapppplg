import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = Number(session.user.id);

    try {
        const body = await req.json().catch(() => ({}));
        const messageIds: number[] = Array.isArray(body.messageIds) ? body.messageIds : [];

        const where = messageIds.length > 0
            ? { id: { in: messageIds }, receiverId: userId, isRead: false }
            : { receiverId: userId, isRead: false };

        const { count } = await prisma.chatMessage.updateMany({
            where,
            data: { isRead: true, readAt: new Date() },
        });

        return NextResponse.json({ success: true, updated: count });
    } catch (error) {
        console.error("[CHAT PATCH READ]", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}