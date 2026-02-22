import { z } from 'zod';
import { router, protectedProcedure, rateLimitedProtectedProcedure, notFound } from '../trpc';
import { db } from '@/lib/db';
import { generateAIResponse } from '@/lib/ai';

export const messageRouter = router({
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
      
      const conversation = await db.conversation.findFirst({
        where: {
          id: input.conversationId,
          userId: ctx.user.id,
        },
      });

      if (!conversation) {
        throw notFound('Conversation not found');
      }

      const userMessage = await db.message.create({
        data: {
          conversationId: input.conversationId,
          role: 'user',
          content: input.content,
        },
      });

      const history = await db.message.findMany({
        where: { conversationId: input.conversationId },
        orderBy: { createdAt: 'asc' },
        take: 20,
        select: { role: true, content: true },
      });

      const messagesForAI = [
        { role: 'system' as const, content: 'You are a helpful AI assistant. Keep responses concise and helpful.' },
        ...history.map(m => ({ role: m.role as 'user' | 'assistant', content: m.content })),
        { role: 'user' as const, content: input.content },
      ];

      let aiResponse: string;
      let tokens: number;
      let model: string;
      
      try {
        const response = await generateAIResponse(messagesForAI);
        aiResponse = response.content;
        tokens = response.tokens;
        model = response.model;
      } catch (error) {
        aiResponse = `I received your message: "${input.content}". Note: AI service is not configured. Set OPENAI_API_KEY or OLLAMA_URL in your environment to enable real AI responses.`;
        tokens = Math.ceil(aiResponse.split(' ').length * 1.3);
        model = 'mock';
      }

      const assistantMessage = await db.message.create({
        data: {
          conversationId: input.conversationId,
          role: 'assistant',
          content: aiResponse,
          tokens,
          metadata: { model },
        },
      });

      const messageCount = await db.message.count({
        where: { conversationId: input.conversationId },
      });
      
      const updateData: any = { updatedAt: new Date() };
      
      if (messageCount === 2) {
        updateData.title = input.content.slice(0, 50) + (input.content.length > 50 ? '...' : '');
      }

      await db.conversation.update({
        where: { id: input.conversationId },
        data: updateData,
      });

      return {
        userMessage,
        assistantMessage,
      };
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const message = await db.message.findUnique({
        where: { id: input.id },
        include: {
          conversation: true,
        },
      });

      if (!message || message.conversation.userId !== ctx.user.id) {
        throw notFound('Message not found');
      }

      await db.message.delete({
        where: { id: input.id },
      });

      return { message: 'Message deleted' };
    }),
});
