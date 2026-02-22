'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useAutoAnimate } from '@formkit/auto-animate/react';
import { trpc } from '@/lib/trpc/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton, ConversationSkeleton } from '@/components/ui/skeleton';
import { ChatMessage } from '@/components/features/chat-message';
import { Plus, MessageSquare, Trash2, LogOut, Settings, User, Send, Bot } from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  
  const { data: user, isLoading: userLoading } = trpc.auth.me.useQuery();
  const { data: conversations, isLoading: conversationsLoading, refetch } = trpc.conversation.list.useQuery();
  
  const createConversation = trpc.conversation.create.useMutation({
    onSuccess: (data) => {
      refetch();
      setSelectedConversation(data.id);
    },
  });
  
  const deleteConversation = trpc.conversation.delete.useMutation({
    onSuccess: () => refetch(),
  });

  const logout = trpc.auth.logout.useMutation({
    onSuccess: () => router.push('/login'),
  });

  const handleNewChat = () => {
    createConversation.mutate({ title: 'New Conversation' });
  };

  if (userLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    router.push('/login');
    return null;
  }

  return (
    <div className="flex h-dvh bg-background">
      {/* Sidebar */}
      <aside className="w-72 border-r bg-card flex flex-col">
        {/* New Chat Button */}
        <div className="p-4">
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button 
              onClick={handleNewChat} 
              className="w-full" 
              disabled={createConversation.isPending}
            >
              <Plus className="mr-2 h-4 w-4" />
              New Chat
            </Button>
          </motion.div>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto px-2">
          <AnimatePresence mode="popLayout">
            {conversationsLoading ? (
              <ConversationSkeleton />
            ) : conversations?.conversations.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center p-4"
              >
                <MessageSquare className="h-8 w-8 mx-auto mb-2 text-muted-foreground opacity-50" />
                <p className="text-sm text-muted-foreground">No conversations yet</p>
                <p className="text-xs text-muted-foreground mt-1">Start a new chat!</p>
              </motion.div>
            ) : (
              (conversations?.conversations ?? []).map((conv: any, index: number) => (
                <motion.div
                  key={conv.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  layout
                  className={`group flex items-center justify-between p-3 rounded-lg mb-1 cursor-pointer hover:bg-accent/50 transition-colors ${
                    selectedConversation === conv.id ? 'bg-accent' : ''
                  }`}
                  onClick={() => setSelectedConversation(conv.id)}
                >
                  <div className="flex items-center gap-2 overflow-hidden">
                    <MessageSquare className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                    <span className="truncate text-sm">{conv.title}</span>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteConversation.mutate({ id: conv.id });
                    }}
                    className="opacity-0 group-hover:opacity-100 hover:text-destructive transition-all p-1"
                  >
                    <Trash2 className="h-4 w-4" />
                  </motion.button>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>

        {/* User Menu */}
        <div className="border-t p-4 space-y-3">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="font-medium truncate">{user.name || user.email}</p>
              <p className="text-xs text-muted-foreground truncate">{user.email}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" className="flex-1">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => logout.mutate()}
                className="hover:text-destructive"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </motion.div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        {selectedConversation ? (
          <ChatView 
            conversationId={selectedConversation} 
            onClose={() => setSelectedConversation(null)}
          />
        ) : (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex-1 flex flex-col items-center justify-center text-center p-8"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1, type: 'spring', stiffness: 300 }}
            >
              <div className="h-20 w-20 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
                <Bot className="h-10 w-10 text-primary" />
              </div>
            </motion.div>
            <motion.h2 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-2xl font-semibold mb-2"
            >
              Welcome back!
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-muted-foreground mb-6 max-w-md"
            >
              Select a conversation from the sidebar or start a new chat to get started.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button size="lg" onClick={handleNewChat}>
                <Plus className="mr-2 h-4 w-4" />
                Start New Chat
              </Button>
            </motion.div>
          </motion.div>
        )}
      </main>
    </div>
  );
}

function ChatView({ conversationId, onClose }: { conversationId: string; onClose: () => void }) {
  const [message, setMessage] = useState('');
  const [parentRef] = useAutoAnimate();
  const utils = trpc.useUtils();
  
  const { data: conversation, isLoading } = trpc.conversation.byId.useQuery({ id: conversationId });
  
  const sendMessage = trpc.message.send.useMutation({
    onSuccess: () => {
      setMessage('');
      utils.conversation.byId.invalidate({ id: conversationId });
    },
  });

  const handleSend = () => {
    if (!message.trim()) return;
    sendMessage.mutate({ conversationId, content: message });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Messages */}
      <div 
        ref={parentRef as any}
        className="flex-1 overflow-y-auto p-4 space-y-4"
      >
        {isLoading ? (
          <div className="space-y-4">
            <ChatSkeleton />
          </div>
        ) : conversation?.messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center">
            <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Send a message to start the conversation</p>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {conversation?.messages.map((msg: any) => (
              <ChatMessage key={msg.id} message={msg} />
            ))}
          </AnimatePresence>
        )}
      </div>

      {/* Input */}
      <div className="p-4 border-t bg-card/50 backdrop-blur-sm">
        <div className="flex gap-2 max-w-3xl mx-auto">
          <Input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            className="flex-1 h-12"
            disabled={sendMessage.isPending}
          />
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button 
              size="lg" 
              onClick={handleSend} 
              disabled={!message.trim() || sendMessage.isPending}
              className="h-12 px-6"
            >
              <Send className="h-4 w-4" />
            </Button>
          </motion.div>
        </div>
      </div>
    </>
  );
}

function ChatSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex gap-3">
        <Skeleton className="h-8 w-8 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-1/4" />
          <Skeleton className="h-16 w-full" />
        </div>
      </div>
      <div className="flex gap-3 flex-row-reverse">
        <Skeleton className="h-8 w-8 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-1/4 ml-auto" />
          <Skeleton className="h-20 w-3/4 ml-auto" />
        </div>
      </div>
    </div>
  );
}
