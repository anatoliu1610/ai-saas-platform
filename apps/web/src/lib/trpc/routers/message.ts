import { z } from 'zod';
import { router, protectedProcedure, rateLimitedProtectedProcedure, notFound } from '../trpc';
import { db } from '@/lib/db';
import { generateAIResponse } from '@/lib/ai';

export const messageRouter = router({
  // Send message and get AI response (rate limited)
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
        throw notFound('Conversation not found');
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
        take: 20, // Limit context to last 20 messages
        select: { role: true, content: true },
      });

      const messagesForAI = [
        { role: 'system' as const, content: 'You are a helpful AI assistant. Keep responses concise and helpful.' },
        ...history.map(m => ({ role: m.role as 'user' | 'assistant', content: m.content })),
        { role: 'user' as const, content: input.content },
      ];

      // Generate AI response
      let aiResponse: string;
      let tokens: number;
      let model: string;
      
      try {
        const response = await generateAIResponse(messagesForAI);
        aiResponse = response.content;
        tokens = response.tokens;
        model = response.model;
      } catch (error) {
        // Fallback to mock response if AI fails
        aiResponse = `I received your message: "${input.content}". Note: AI service is not configured. Set OPENAI_API_KEY or OLLAMA_URL in your environment to enable real AI responses.`;
        tokens = Math.ceil(aiResponse.split(' ').length * 1.3);
        model = 'mock';
      }

      // Save AI response
      const assistantMessage = await db.message.create({
        data: {
          conversationId: input.conversationId,
          role: 'assistant',
          content: aiResponse,
          tokens,
          metadata: { model },
        },
      });

      // Update conversation timestamp and title if first message
      const messageCount = await db.message.count({
        where: { conversationId: input.conversationId },
      });
      
      const updateData: any = { updatedAt: new Date() };
      
      // Auto-generate title from first user message
      if (messageCount === 2) { // First user + first AI response
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

  // Delete message
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
