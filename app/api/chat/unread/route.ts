import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return NextResponse.json({ count: 0 });
    }

    if (session.user.role !== "SISWA") {
        return NextResponse.json({ count: 0 });
    }

    try {
        const count = await prisma.chatMessage.count({
            where: {
                receiverId: Number(session.user.id),
                isRead: false,
            },
        });
        return NextResponse.json({ count });
    } catch (error) {
        console.error("[CHAT UNREAD]", error);
        return NextResponse.json({ count: 0 });
    }
}