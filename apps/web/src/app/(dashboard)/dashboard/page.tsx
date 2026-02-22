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
import { 
  Plus, MessageSquare, Trash2, LogOut, Settings, User, Send, Bot, 
  Menu, X, ChevronLeft 
} from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
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
    createConversation.mutate({ title: 'New Chat' });
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
    <div className="flex h-dvh bg-background overflow-hidden">
      {/* Sidebar - Desktop */}
      <aside className={`
        hidden md:flex flex-col border-r bg-card transition-all duration-300
        ${sidebarOpen ? 'w-72' : 'w-0 overflow-hidden'}
      `}>
        <SidebarContent 
          conversations={conversations}
          conversationsLoading={conversationsLoading}
          selectedConversation={selectedConversation}
          onSelectConversation={setSelectedConversation}
          onDeleteConversation={(id: string) => deleteConversation.mutate({ id: id })}
          onNewChat={handleNewChat}
          onLogout={() => logout.mutate()}
          user={user}
          isCreating={createConversation.isPending}
        />
      </aside>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40 md:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 25 }}
              className="fixed left-0 top-0 bottom-0 w-72 bg-card z-50 md:hidden"
            >
              <div className="flex justify-end p-4">
                <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(false)}>
                  <X className="h-5 w-5" />
                </Button>
              </div>
              <SidebarContent 
                conversations={conversations}
                conversationsLoading={conversationsLoading}
                selectedConversation={selectedConversation}
                onSelectConversation={(id: string) => {
                  setSelectedConversation(id);
                  setMobileMenuOpen(false);
                }}
                onDeleteConversation={(id: string) => deleteConversation.mutate({ id: id })}
                onNewChat={() => {
                  handleNewChat();
                  setMobileMenuOpen(false);
                }}
                onLogout={() => logout.mutate()}
                user={user}
                isCreating={createConversation.isPending}
              />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header */}
        <header className="md:hidden flex items-center justify-between p-4 border-b bg-card/80 backdrop-blur-sm">
          <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(true)}>
            <Menu className="h-5 w-5" />
          </Button>
          <span className="font-semibold">AI Chat</span>
          <div className="w-9" />
        </header>

        {/* Desktop Toggle */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3 z-10 h-6 w-6 items-center justify-center rounded-full bg-card border shadow-sm hover:bg-muted transition-colors"
        >
          <ChevronLeft className={`h-4 w-4 transition-transform ${!sidebarOpen ? 'rotate-180' : ''}`} />
        </button>

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
              <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-primary/20 to-emerald-500/20 flex items-center justify-center mb-6">
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
              Select a conversation or start a new chat
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Button size="lg" onClick={handleNewChat} className="glow">
                <Plus className="mr-2 h-4 w-4" />
                New Chat
              </Button>
            </motion.div>
          </motion.div>
        )}
      </main>

      {/* Floating New Chat Button - Mobile */}
      <button
        onClick={handleNewChat}
        className="md:hidden fixed right-4 bottom-4 h-14 w-14 rounded-full bg-gradient-to-br from-primary to-indigo-600 text-white shadow-lg glow flex items-center justify-center"
      >
        <Plus className="h-6 w-6" />
      </button>
    </div>
  );
}

// Sidebar Content Component
function SidebarContent({ 
  conversations, 
  conversationsLoading, 
  selectedConversation, 
  onSelectConversation, 
  onDeleteConversation,
  onNewChat,
  onLogout,
  user,
  isCreating 
}: any) {
  const [parentRef] = useAutoAnimate();

  return (
    <>
      {/* New Chat Button */}
      <div className="p-4">
        <Button 
          onClick={onNewChat} 
          className="w-full bg-gradient-to-r from-primary to-indigo-600 hover:opacity-90" 
          disabled={isCreating}
        >
          <Plus className="mr-2 h-4 w-4" />
          New Chat
        </Button>
      </div>

      {/* Conversations List */}
      <div ref={parentRef as any} className="flex-1 overflow-y-auto px-2">
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
          </motion.div>
        ) : (
          (conversations?.conversations ?? []).map((conv: any, index: number) => (
            <motion.div
              key={conv.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.03 }}
              layout
              className={`group flex items-center justify-between p-3 rounded-lg mb-1 cursor-pointer hover:bg-accent/50 transition-colors ${
                selectedConversation === conv.id ? 'bg-primary/10 border-l-2 border-primary' : ''
              }`}
              onClick={() => onSelectConversation(conv.id)}
            >
              <div className="flex items-center gap-2 overflow-hidden">
                <MessageSquare className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                <span className="truncate text-sm">{conv.title}</span>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteConversation(conv.id);
                }}
                className="opacity-0 group-hover:opacity-100 hover:text-destructive transition-all p-1"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </motion.div>
          ))
        )}
      </div>

      {/* User Menu */}
      <div className="border-t p-4 space-y-3">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-emerald-500 flex items-center justify-center text-white">
            <User className="h-5 w-5" />
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="font-medium truncate text-sm">{user.name || user.email}</p>
            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" className="flex-1 justify-start">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onLogout}
            className="hover:text-destructive"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </>
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
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-primary/20 to-emerald-500/20 flex items-center justify-center mb-4">
              <Bot className="h-8 w-8 text-primary" />
            </div>
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
          <Button 
            size="lg" 
            onClick={handleSend} 
            disabled={!message.trim() || sendMessage.isPending}
            className="h-12 px-6 bg-gradient-to-r from-primary to-indigo-600 hover:opacity-90"
          >
            <Send className="h-4 w-4" />
          </Button>
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
