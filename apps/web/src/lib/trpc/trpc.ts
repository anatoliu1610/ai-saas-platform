import { initTRPC, TRPCError } from '@trpc/server';
import superjson from 'superjson';
import { ZodError } from 'zod';
import { Context } from './context';
import { rateLimit } from '@/lib/rate-limit';

const t = initTRPC.context<Context>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

export const router = t.router;
export const createCallerFactory = t.createCallerFactory;

// ============================================
// REUSABLE MIDDLEWARE
// ============================================

/**
 * Rate limiting middleware
 * @param options.limit - Max requests allowed (default: 100)
 * @param options.windowSeconds - Time window in seconds (default: 60)
 */
export const rateLimitMiddleware = t.middleware(async ({ ctx, next, path }) => {
  // Get identifier from user or IP
  const userId = ctx.user?.id;
  const ip = ctx.headers?.get ? ctx.headers.get('x-forwarded-for') : 'anonymous';
  const identifier = userId || ip || 'anonymous';
  const key = `trpc:${identifier}:${path}`;
  
  const result = await rateLimit(key, 100, 60);
  
  if (!result.success) {
    throw new TRPCError({
      code: 'TOO_MANY_REQUESTS',
      message: `Rate limit exceeded. Try again in ${Math.ceil((result.reset - Date.now()) / 1000)} seconds.`,
    });
  }
  
  return next({
    ctx: {
      ...ctx,
      rateLimit: result,
    },
  });
});

/**
 * Protected procedure - requires authentication
 */
export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({ code: 'UNAUTHORIZED' });
  }
  return next({
    ctx: {
      ...ctx,
      user: ctx.user,
    },
  });
});

/**
 * Public procedure - no authentication required
 */
export const publicProcedure = t.procedure;

/**
 * Rate limited public procedure
 */
export const rateLimitedPublicProcedure = t.procedure.use(rateLimitMiddleware);

/**
 * Rate limited protected procedure
 */
export const rateLimitedProtectedProcedure = protectedProcedure.use(rateLimitMiddleware);
