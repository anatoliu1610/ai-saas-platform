import { TRPCError, initTRPC } from '@trpc/server';
import superjson from 'superjson';
import { ZodError } from 'zod';
import { Context } from './context';

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
// ERROR HELPERS
// ============================================

/**
 * Create a not found error
 */
export function notFound(message = 'Resource not found') {
  return new TRPCError({
    code: 'NOT_FOUND',
    message,
  });
}

/**
 * Create a bad request error
 */
export function badRequest(message = 'Bad request') {
  return new TRPCError({
    code: 'BAD_REQUEST',
    message,
  });
}

/**
 * Create an unauthorized error
 */
export function unauthorized(message = 'Unauthorized') {
  return new TRPCError({
    code: 'UNAUTHORIZED',
    message,
  });
}

/**
 * Create a forbidden error
 */
export function forbidden(message = 'Forbidden') {
  return new TRPCError({
    code: 'FORBIDDEN',
    message,
  });
}

/**
 * Create an internal server error
 */
export function internalError(message = 'Internal server error') {
  return new TRPCError({
    code: 'INTERNAL_SERVER_ERROR',
    message,
  });
}

/**
 * Create a conflict error
 */
export function conflict(message = 'Resource already exists') {
  return new TRPCError({
    code: 'CONFLICT',
    message,
  });
}

/**
 * Create a too many requests error
 */
export function tooManyRequests(message = 'Rate limit exceeded') {
  return new TRPCError({
    code: 'TOO_MANY_REQUESTS',
    message,
  });
}

// ============================================
// REUSABLE MIDDLEWARE
// ============================================

/**
 * Rate limiting middleware
 */
export const rateLimitMiddleware = t.middleware(async ({ ctx, next, path }) => {
  const { rateLimit } = await import('@/lib/rate-limit');
  
  const userId = ctx.user?.id;
  const ip = ctx.headers?.get ? ctx.headers.get('x-forwarded-for') : 'anonymous';
  const identifier = userId || ip || 'anonymous';
  const key = `trpc:${identifier}:${path}`;
  
  const result = await rateLimit(key, 100, 60);
  
  if (!result.success) {
    throw tooManyRequests(`Rate limit exceeded. Try again in ${Math.ceil((result.reset - Date.now()) / 1000)} seconds.`);
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
    throw unauthorized();
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
