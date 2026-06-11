import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

  const userId = Number(session.user.id);

  // ─── Chat: pesan belum dibaca per conversation ────────────────────────────
  const participants = await prisma.conversationParticipant.findMany({
    where: { userId },
    select: { conversationId: true, lastReadAt: true },
  });

  const chatNotifs: object[] = [];
  for (const p of participants) {
    const where = {
      conversationId: p.conversationId,
      senderId: { not: userId },
      isRead: false,
      ...(p.lastReadAt ? { createdAt: { gt: p.lastReadAt } } : {}),
    };
    const [latest, count] = await Promise.all([
      prisma.chatMessage.findFirst({
        where,
        orderBy: { createdAt: "desc" },
        include: { sender: { select: { name: true } } },
      }),
      prisma.chatMessage.count({ where }),
    ]);
    if (latest && count > 0) {
      chatNotifs.push({
        id: `chat-${p.conversationId}`,
        type: "chat",
        title: latest.sender.name ?? "Pesan baru",
        body: count > 1 ? `${count} pesan belum dibaca` : latest.content,
        isRead: false,
        createdAt: latest.createdAt.toISOString(),
        conversationId: p.conversationId,
      });
    }
  }

  // ─── Informasi: 7 hari terakhir ───────────────────────────────────────────
  const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const infos = await prisma.informasi.findMany({
    where: { createdAt: { gte: since } },
    orderBy: { createdAt: "desc" },
    take: 10,
    select: { id: true, judul: true, konten: true, createdAt: true },
  });

  const infoNotifs = infos.map((i) => ({
    id: `informasi-${i.id}`,
    type: "informasi",
    title: i.judul,
    body: i.konten.replace(/<[^>]+>/g, "").slice(0, 80),
    isRead: false,
    createdAt: i.createdAt.toISOString(),
    informasiId: i.id,
  }));

  const data = [...chatNotifs, ...infoNotifs].sort(
    (a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  return NextResponse.json({ success: true, data });
}
