import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = Number(session.user.id);
  const { conversationId } = await req.json();
  const convId = Number(conversationId);

  if (!convId) return NextResponse.json({ error: "conversationId wajib" }, { status: 400 });

  const participant = await prisma.conversationParticipant.findUnique({
    where: { conversationId_userId: { conversationId: convId, userId } },
  });
  if (!participant) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  await Promise.all([
    prisma.conversationParticipant.update({
      where: { conversationId_userId: { conversationId: convId, userId } },
      data: { lastReadAt: new Date() },
    }),
    prisma.chatMessage.updateMany({
      where: { conversationId: convId, senderId: { not: userId }, isRead: false },
      data: { isRead: true, readAt: new Date() },
    }),
  ]);

  return NextResponse.json({ success: true });
}
