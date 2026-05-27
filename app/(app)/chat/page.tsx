import { getCurrentUser } from '@/lib/user';
import { prisma } from '@/lib/prisma';
import ChatInterface from '@/components/chat-interface';

export default async function ChatPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const history = await prisma.aiChatMessage.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'asc' },
    take: 20,
  });

  const initialMessages = history.map((m) => ({
    id: m.id,
    role: m.role as 'user' | 'assistant',
    content: m.content,
  }));

  return <ChatInterface initialMessages={initialMessages} />;
}
