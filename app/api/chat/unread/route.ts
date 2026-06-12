import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function GET() {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ count: 0 });

    const userId = Number(session.user.id);

    const participants = await prisma.conversationParticipant.findMany({
        where: { userId },
        select: { conversationId: true, lastReadAt: true },
    });

    let total = 0;
    for (const p of participants) {
        const count = await prisma.chatMessage.count({
            where: {
                conversationId: p.conversationId,
                senderId: { not: userId },
                createdAt: p.lastReadAt ? { gt: p.lastReadAt } : undefined,
            },
        });
        total += count;
    }

    return NextResponse.json({ count: total });
}
