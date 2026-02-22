import { inferAsyncReturnType } from '@trpc/server';
import { FetchCreateContextFnOptions } from '@trpc/server/adapters/fetch';
import { db } from '@/lib/db';
import { getCurrentUser, TokenPayload } from '@/lib/auth';
import { ZodError } from 'zod';

export async function createContext(opts?: FetchCreateContextFnOptions) {
  const user = await getCurrentUser();

  return {
    db,
    user,
    headers: opts?.req.headers,
  };
}

export type Context = inferAsyncReturnType<typeof createContext>;

export const createTRPCContext = async (opts: { headers: Headers }) => {
  return createContext({
    req: new Request('http://localhost:3000', {
      headers: opts.headers,
    }),
  });
};
