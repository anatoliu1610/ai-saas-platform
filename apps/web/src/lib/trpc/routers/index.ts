import { router } from '../trpc';
import { authRouter } from './auth';
import { conversationRouter } from './conversation';
import { messageRouter } from './message';

export const appRouter = router({
  auth: authRouter,
  conversation: conversationRouter,
  message: messageRouter,
});

export type AppRouter = typeof appRouter;
