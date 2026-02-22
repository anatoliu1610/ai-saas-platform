import { z } from 'zod';
import { router, protectedProcedure, rateLimitedProtectedProcedure } from '../trpc';
import { db } from '@/lib/db';

// Mock AI response - in production, integrate with OpenAI/Anthropic/Ollama
async function generateAIResponse(messages: { role: string; content: string }[]): Promise<string> {
  // Simulate AI processing
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const lastMessage = messages[messages.length - 1]?.content || '';
  
  // Simple mock response
  return `I received your message: "${lastMessage}". This is a mock AI response. In production, integrate with OpenAI, Anthropic, or Ollama for real AI responses.`;
}

export const messageRouter = router({
  // Send message and get streaming response (rate limited)
  send: rateLimitedProtectedProcedure
    .input(
      z.object({
        conversationId: z.string(),
        content: z.string().min(1).max(10000),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user) {
        throw new Error('Unauthorized');
      }
      
      // Verify conversation ownership
      const conversation = await db.conversation.findFirst({
        where: {
          id: input.conversationId,
          userId: ctx.user.id,
        },
      });

      if (!conversation) {
        throw new Error('Conversation not found');
      }

      // Save user message
      const userMessage = await db.message.create({
        data: {
          conversationId: input.conversationId,
          role: 'user',
          content: input.content,
        },
      });

      // Get conversation history for context
      const history = await db.message.findMany({
        where: { conversationId: input.conversationId },
        orderBy: { createdAt: 'asc' },
        select: { role: true, content: true },
      });

      const messagesForAI = [
        ...history.map(m => ({ role: m.role, content: m.content })),
        { role: 'user', content: input.content },
      ];

      // Generate AI response
      const aiResponse = await generateAIResponse(messagesForAI);

      // Save AI response
      const assistantMessage = await db.message.create({
        data: {
          conversationId: input.conversationId,
          role: 'assistant',
          content: aiResponse,
          tokens: aiResponse.split(' ').length,
        },
      });

      // Update conversation timestamp
      await db.conversation.update({
        where: { id: input.conversationId },
        data: { updatedAt: new Date() },
      });

      return {
        userMessage,
        assistantMessage,
      };
    }),

  // Delete message
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Find message and verify ownership through conversation
      const message = await db.message.findUnique({
        where: { id: input.id },
        include: {
          conversation: true,
        },
      });

      if (!message || message.conversation.userId !== ctx.user.id) {
        throw new Error('Message not found');
      }

      await db.message.delete({
        where: { id: input.id },
      });

      return { message: 'Message deleted' };
    }),
});
