'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Bot, User } from 'lucide-react';

interface Message {
  id: string;
  role: string;
  content: string;
  createdAt?: Date;
}

interface ChatMessageProps {
  message: Message;
}

const messageVariants = {
  initial: { 
    opacity: 0, 
    y: 10,
    scale: 0.95,
  },
  animate: { 
    opacity: 1, 
    y: 0,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 400,
      damping: 30,
    },
  },
  exit: {
    opacity: 0,
    y: -5,
    transition: {
      duration: 0.15,
    },
  },
};

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user';

  return (
    <motion.div
      variants={messageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className={cn(
        'flex gap-3 max-w-[85%]',
        isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'
      )}
    >
      <div
        className={cn(
          'flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center',
          isUser
            ? 'bg-primary text-primary-foreground'
            : 'bg-muted text-muted-foreground'
        )}
      >
        {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
      </div>
      <div
        className={cn(
          'rounded-2xl px-4 py-3 shadow-sm',
          isUser
            ? 'bg-primary text-primary-foreground rounded-br-md'
            : 'bg-muted text-foreground rounded-bl-md'
        )}
      >
        <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
        {message.createdAt && (
          <p className={cn(
            'text-xs mt-2 opacity-60',
            isUser ? 'text-right' : 'text-left'
          )}>
            {formatTime(message.createdAt)}
          </p>
        )}
      </div>
    </motion.div>
  );
}

function formatTime(date: Date): string {
  return new Date(date).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });
}
