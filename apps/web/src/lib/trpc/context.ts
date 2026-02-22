import { CreateNextContextOptions } from '@trpc/server/adapters/next';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/db';

export async function createContext(opts?: CreateNextContextOptions) {
  const user = await getCurrentUser();

  return {
    db,
    user: user ? { ...user, role: user.role as string } : null,
  };
}

export type Context = Awaited<ReturnType<typeof createContext>>;
