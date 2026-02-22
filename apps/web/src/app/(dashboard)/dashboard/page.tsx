'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { trpc } from '@/lib/trpc/client';
import { Button } from '@/components/ui/button';
import { Plus, MessageSquare, Trash2, LogOut, Settings, User } from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  
  const { data: user } = trpc.auth.me.useQuery();
  const { data: conversations, refetch } = trpc.conversation.list.useQuery();
  
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

  if (!user) {
    router.push('/login');
    return null;
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside className="w-64 border-r bg-card flex flex-col">
        {/* New Chat Button */}
        <div className="p-4">
          <Button 
            onClick={handleNewChat} 
            className="w-full" 
            disabled={createConversation.isPending}
          >
            <Plus className="mr-2 h-4 w-4" />
            New Chat
          </Button>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto px-2">
          {conversations?.conversations.map((conv) => (
            <motion.div
              key={conv.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={`flex items-center justify-between p-3 rounded-lg mb-1 cursor-pointer hover:bg-accent ${
                selectedConversation === conv.id ? 'bg-accent' : ''
              }`}
              onClick={() => setSelectedConversation(conv.id)}
            >
              <div className="flex items-center gap-2 overflow-hidden">
                <MessageSquare className="h-4 w-4 flex-shrink-0" />
                <span className="truncate text-sm">{conv.title}</span>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  deleteConversation.mutate({ id: conv.id });
                }}
                className="opacity-0 group-hover:opacity-100 hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </motion.div>
          ))}
          
          {conversations?.conversations.length === 0 && (
            <p className="text-sm text-muted-foreground text-center p-4">
              No conversations yet
            </p>
          )}
        </div>

        {/* User Menu */}
        <div className="border-t p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
              <User className="h-4 w-4" />
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-medium truncate">{user.name || user.email}</p>
              <p className="text-xs text-muted-foreground truncate">{user.email}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" className="flex-1">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => logout.mutate()}
              className="text-destructive hover:text-destructive"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        {selectedConversation ? (
          <ChatView conversationId={selectedConversation} />
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessageSquare className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h2 className="text-xl font-semibold mb-2">Select a conversation</h2>
              <p className="text-muted-foreground mb-4">or start a new one</p>
              <Button onClick={handleNewChat}>
                <Plus className="mr-2 h-4 w-4" />
                New Chat
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function ChatView({ conversationId }: { conversationId: string }) {
  const [message, setMessage] = useState('');
  const utils = trpc.useUtils();
  
  const { data: conversation } = trpc.conversation.byId.useQuery({ id: conversationId });
  
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

  return (
    <>
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {conversation?.messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[70%] rounded-lg px-4 py-2 ${
                msg.role === 'user'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted'
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="p-4 border-t">
        <div className="flex gap-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Type a message..."
            className="flex-1 h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
          />
          <Button onClick={handleSend} disabled={sendMessage.isPending}>
            Send
          </Button>
        </div>
      </div>
    </>
  );
}
