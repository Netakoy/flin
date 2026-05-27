import { streamText, convertToModelMessages, UIMessage } from 'ai';
import { openai } from '@ai-sdk/openai';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { buildChatContext } from '@/lib/ai';
import { USER_COOKIE } from '@/lib/constants';

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json();

  const cookieStore = await cookies();
  const userId = cookieStore.get(USER_COOKIE)?.value;
  if (!userId) return new Response('Unauthorized', { status: 401 });

  const context = await buildChatContext(userId);

  const result = await streamText({
    model: openai('gpt-4o'),
    system: `Ты ФЛИН — семейный финансовый помощник. Отвечай коротко, конкретно, с цифрами. Без канцелярита и морализаторства. Говори по-русски.

Текущие данные бюджета:
${context}`,
    messages: await convertToModelMessages(messages),
    onFinish: async ({ text }) => {
      const lastUserMessage = [...messages].reverse().find((m) => m.role === 'user');
      if (lastUserMessage) {
        const userText = lastUserMessage.parts
          .filter((p) => p.type === 'text')
          .map((p) => (p as { type: 'text'; text: string }).text)
          .join('');
        await prisma.aiChatMessage.createMany({
          data: [
            { role: 'user', content: userText, userId },
            { role: 'assistant', content: text, userId },
          ],
        });
      }
    },
  });

  return result.toUIMessageStreamResponse();
}
