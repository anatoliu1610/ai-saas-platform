import { z } from 'zod';
import { router, protectedProcedure } from '../trpc';
import { db } from '@/lib/db';

export const conversationRouter = router({
  // List all conversations
  list: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(50),
        cursor: z.string().optional(),
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      const limit = input?.limit ?? 50;
      const cursor = input?.cursor;

      const conversations = await db.conversation.findMany({
        where: {
          userId: ctx.user.id,
          isArchive: false,
        },
        take: limit + 1,
        cursor: cursor ? { id: cursor } : undefined,
        orderBy: { updatedAt: 'desc' },
        select: {
          id: true,
          title: true,
          model: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: { messages: true },
          },
        },
      });

      let nextCursor: string | undefined = undefined;
      
      if (conversations.length > limit) {
        const nextItem = conversations.pop();
        nextCursor = nextItem?.id;
      }

      return {
        conversations,
        nextCursor,
      };
    }),

  // Get single conversation with messages
  byId: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const conversation = await db.conversation.findFirst({
        where: {
          id: input.id,
          userId: ctx.user.id,
        },
        include: {
          messages: {
            orderBy: { createdAt: 'asc' },
            select: {
              id: true,
              role: true,
              content: true,
              tokens: true,
              createdAt: true,
            },
          },
        },
      });

      if (!conversation) {
        throw new Error('Conversation not found');
      }

      return conversation;
    }),

  // Create new conversation
  create: protectedProcedure
    .input(
      z.object({
        title: z.string().default('New Conversation'),
        model: z.string().default('gpt-4'),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const conversation = await db.conversation.create({
        data: {
          userId: ctx.user.id,
          title: input.title,
          model: input.model,
        },
      });

      return conversation;
    }),

  // Update conversation
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        title: z.string().optional(),
        model: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;

      // Verify ownership
      const existing = await db.conversation.findFirst({
        where: { id, userId: ctx.user.id },
      });

      if (!existing) {
        throw new Error('Conversation not found');
      }

      const conversation = await db.conversation.update({
        where: { id },
        data,
      });

      return conversation;
    }),

  // Delete conversation
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Verify ownership
      const existing = await db.conversation.findFirst({
        where: { id: input.id, userId: ctx.user.id },
      });

      if (!existing) {
        throw new Error('Conversation not found');
      }

      await db.conversation.delete({
        where: { id: input.id },
      });

      return { message: 'Conversation deleted' };
    }),

  // Archive conversation
  archive: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await db.conversation.update({
        where: { id: input.id, userId: ctx.user.id },
        data: { isArchive: true },
      });

      return { message: 'Conversation archived' };
    }),
});
