'use client';

import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { cn } from '@/lib/utils';
import { Bot, User, Copy, Check } from 'lucide-react';
import { useState } from 'react';

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
  initial: { opacity: 0, y: 10, scale: 0.95 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: -5 },
};

function formatTime(date: Date): string {
  return new Date(date).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user';
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      variants={messageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className={cn(
        'flex gap-3 max-w-[90%] sm:max-w-[85%]',
        isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'
      )}
    >
      {/* Avatar */}
      <div
        className={cn(
          'flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center',
          isUser
            ? 'bg-gradient-to-br from-primary to-indigo-600 text-white'
            : 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white'
        )}
      >
        {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
      </div>

      {/* Message Content */}
      <div className="flex flex-col gap-1">
        <div
          className={cn(
            'rounded-2xl px-4 py-3 shadow-sm overflow-hidden',
            isUser
              ? 'bg-gradient-to-br from-primary to-indigo-600 text-primary-foreground rounded-br-md'
              : 'bg-muted/80 backdrop-blur-sm text-foreground rounded-bl-md'
          )}
        >
          {isUser ? (
            <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
          ) : (
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <ReactMarkdown 
                remarkPlugins={[remarkGfm]}
                components={{
                  code({ className, children, ...props }) {
                    const match = /language-(\w+)/.exec(className || '');
                    const isInline = !match;
                    
                    if (isInline) {
                      return (
                        <code 
                          className="px-1.5 py-0.5 rounded bg-black/10 dark:bg-white/10 text-xs font-mono" 
                          {...props}
                        >
                          {children}
                        </code>
                      );
                    }
                    
                    return (
                      <code className={className} {...props}>
                        {children}
                      </code>
                    );
                  },
                  pre({ children }) {
                    return (
                      <pre className="p-3 rounded-lg bg-black/5 dark:bg-white/5 overflow-x-auto text-xs my-2">
                        {children}
                      </pre>
                    );
                  },
                  p({ children }) {
                    return <p className="mb-2 last:mb-0 leading-relaxed">{children}</p>;
                  },
                  ul({ children }) {
                    return <ul className="list-disc list-inside my-2 space-y-1">{children}</ul>;
                  },
                  ol({ children }) {
                    return <ol className="list-decimal list-inside my-2 space-y-1">{children}</ol>;
                  },
                  li({ children }) {
                    return <li>{children}</li>;
                  },
                  a({ href, children }) {
                    return (
                      <a 
                        href={href} 
                        className="text-primary underline hover:opacity-80"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {children}
                      </a>
                    );
                  },
                  blockquote({ children }) {
                    return (
                      <blockquote className="border-l-2 border-current pl-3 italic my-2 opacity-80">
                        {children}
                      </blockquote>
                    );
                  },
                }}
              >
                {message.content}
              </ReactMarkdown>
            </div>
          )}
        </div>

        {/* Footer with time and actions */}
        <div className={cn('flex items-center gap-2 mt-1', isUser ? 'justify-end' : 'justify-start')}>
          {!isUser && (
            <button
              onClick={handleCopy}
              className="p-1 rounded hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
              title="Copy"
            >
              {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
            </button>
          )}
          {message.createdAt && (
            <span className={cn('text-xs opacity-50', isUser ? 'text-right' : 'text-left')}>
              {formatTime(message.createdAt)}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}
