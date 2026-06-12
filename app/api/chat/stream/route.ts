import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return new Response("Unauthorized", { status: 401 });
  }

  const userId = Number(session.user.id);
  const convId = Number(req.nextUrl.searchParams.get("conversationId"));

  if (!convId) {
    return new Response("conversationId wajib", { status: 400 });
  }

  const participant = await prisma.conversationParticipant.findUnique({
    where: { conversationId_userId: { conversationId: convId, userId } },
  });
  if (!participant) {
    return new Response("Forbidden", { status: 403 });
  }

  const encoder = new TextEncoder();
  let intervalId: NodeJS.Timeout;

  const stream = new ReadableStream({
    start(controller) {
      const send = async () => {
        try {
          const messages = await prisma.chatMessage.findMany({
            where: { conversationId: convId },
            include: { sender: { select: { id: true, name: true, role: true } } },
            orderBy: { createdAt: "asc" },
          });
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(messages)}\n\n`));
        } catch {

        }
      };

      send();
      intervalId = setInterval(send, 1500);
    },
    cancel() {
      clearInterval(intervalId);
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      "Connection": "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
