import { FetchCreateContextFnOptions } from '@trpc/server/adapters/fetch';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/db';

export async function createContext(opts: FetchCreateContextFnOptions) {
  const user = await getCurrentUser();

  return {
    db,
    user: user ? { ...user, role: user.role as string } : null,
    headers: opts?.req?.headers,
  };
}

export type Context = Awaited<ReturnType<typeof createContext>>;
