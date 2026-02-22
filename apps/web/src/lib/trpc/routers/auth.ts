import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { router, publicProcedure, protectedProcedure } from '../trpc';
import { db } from '@/lib/db';
import { 
  hashPassword, 
  verifyPassword, 
  generateToken, 
  setSessionCookie, 
  removeSessionCookie 
} from '@/lib/auth';

export const authRouter = router({
  // ============================================
  // PUBLIC PROCEDURES
  // ============================================

  register: publicProcedure
    .input(
      z.object({
        email: z.string().email('Invalid email address'),
        password: z.string().min(8, 'Password must be at least 8 characters'),
        name: z.string().min(1, 'Name is required').optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { email, password, name } = input;

      // Check if user exists
      const existingUser = await db.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'User already exists',
        });
      }

      // Hash password and create user
      const passwordHash = await hashPassword(password);
      
      const user = await db.user.create({
        data: {
          email,
          passwordHash,
          name: name || email.split('@')[0],
        },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          createdAt: true,
        },
      });

      // Generate token and set cookie
      const token = generateToken({
        userId: user.id,
        email: user.email,
        role: user.role,
      });

      await setSessionCookie(token);

      return {
        user,
        message: 'Account created successfully',
      };
    }),

  login: publicProcedure
    .input(
      z.object({
        email: z.string().email('Invalid email address'),
        password: z.string().min(1, 'Password is required'),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { email, password } = input;

      // Find user
      const user = await db.user.findUnique({
        where: { email },
      });

      if (!user) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Invalid email or password',
        });
      }

      // Verify password
      const isValid = await verifyPassword(password, user.passwordHash);
      
      if (!isValid) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Invalid email or password',
        });
      }

      // Generate token and set cookie
      const token = generateToken({
        userId: user.id,
        email: user.email,
        role: user.role,
      });

      await setSessionCookie(token);

      return {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
        message: 'Logged in successfully',
      };
    }),

  logout: publicProcedure.mutation(async () => {
    await removeSessionCookie();
    return { message: 'Logged out successfully' };
  }),

  // ============================================
  // PROTECTED PROCEDURES
  // ============================================

  me: protectedProcedure.query(async ({ ctx }) => {
    const user = await db.user.findUnique({
      where: { id: ctx.user.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        image: true,
        createdAt: true,
        _count: {
          select: {
            conversations: true,
            apiKeys: true,
          },
        },
      },
    });

    return user;
  }),

  updateProfile: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1).optional(),
        image: z.string().url().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const user = await db.user.update({
        where: { id: ctx.user.id },
        data: input,
        select: {
          id: true,
          email: true,
          name: true,
          image: true,
        },
      });

      return user;
    }),

  changePassword: protectedProcedure
    .input(
      z.object({
        currentPassword: z.string().min(1),
        newPassword: z.string().min(8),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const user = await db.user.findUnique({
        where: { id: ctx.user.id },
      });

      if (!user) {
        throw new TRPCError({ code: 'NOT_FOUND' });
      }

      const isValid = await verifyPassword(input.currentPassword, user.passwordHash);
      
      if (!isValid) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Current password is incorrect',
        });
      }

      const passwordHash = await hashPassword(input.newPassword);
      
      await db.user.update({
        where: { id: ctx.user.id },
        data: { passwordHash },
      });

      return { message: 'Password changed successfully' };
    }),
});
