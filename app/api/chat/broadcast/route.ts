import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (session.user.role !== "ADMIN") return NextResponse.json({ error: "Hanya admin" }, { status: 403 });

    const userId = Number(session.user.id);
    const body = await req.json();
    const content = String(body.content ?? "").trim();

    if (!content) return NextResponse.json({ error: "Pesan tidak boleh kosong" }, { status: 400 });

    const siswa = await prisma.user.findMany({
        where: { role: "SISWA" },
        select: { id: true },
    });

    if (siswa.length === 0) return NextResponse.json({ sent: 0, total: 0 });

    let sent = 0;

    for (const s of siswa) {
        try {

            let conv = await prisma.conversation.findFirst({
                where: {
                    AND: [
                        { participants: { some: { userId } } },
                        { participants: { some: { userId: s.id } } },
                    ],
                },
            });

            if (!conv) {
                conv = await prisma.conversation.create({
                    data: {
                        participants: {
                            create: [{ userId }, { userId: s.id }],
                        },
                    },
                });
            }

            await prisma.$transaction([
                prisma.chatMessage.create({
                    data: { conversationId: conv.id, senderId: userId, content },
                }),
                prisma.conversation.update({
                    where: { id: conv.id },
                    data: { updatedAt: new Date() },
                }),
            ]);

            sent++;
        } catch {
        }
    }

    return NextResponse.json({ sent, total: siswa.length });
}
