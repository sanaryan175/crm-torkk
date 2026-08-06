'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Send, MessageCircle } from 'lucide-react';
import { useUI } from '@/lib/context';
import { useAuth } from '@/lib/context';
import { useChat, useTeamMembers } from '@/lib/hooks';
import type { User, ChatMessage } from '@/lib/types';

export default function ChatPage() {
  const { addToast } = useUI();
  const { user } = useAuth();
  const { messages, isLoading, sendMessage, refetch } = useChat();
  const { members } = useTeamMembers();
  const [selectedMember, setSelectedMember] = useState<User | null>(null);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Poll for new messages every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => { refetch(); }, 10000);
    return () => clearInterval(interval);
  }, [refetch]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, selectedMember]);

  // Filter messages for the selected conversation
  const conversation = useMemo(() => {
    if (!selectedMember || !user) return [];
    return messages
      .filter(m => {
        const senderId = typeof m.sender === 'object' ? m.sender?.id : null;
        const receiverId = typeof m.receiver === 'object' ? m.receiver?.id : null;
        return (senderId === user.id && receiverId === selectedMember.id) ||
               (senderId === selectedMember.id && receiverId === user.id);
      })
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }, [messages, selectedMember, user]);

  // Members excluding self
  const teammates = useMemo(() => members.filter(m => m.id !== user?.id), [members, user]);

  // Unread count per member
  const unreadMap = useMemo(() => {
    const m: Record<string, number> = {};
    if (!user) return m;
    messages.forEach(msg => {
      const senderId = typeof msg.sender === 'object' ? msg.sender?.id : null;
      const receiverId = typeof msg.receiver === 'object' ? msg.receiver?.id : null;
      if (receiverId === user.id && !msg.readAt && senderId) {
        m[senderId] = (m[senderId] || 0) + 1;
      }
    });
    return m;
  }, [messages, user]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !selectedMember) return;
    setSending(true);
    try {
      await sendMessage({ receiverId: selectedMember.id, content: input.trim() });
      setInput('');
    } catch (err: any) {
      addToast({ type: 'error', message: err.message || 'Failed to send.' });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden">
      {/* Sidebar: team members */}
      <div className="w-64 border-r border-border flex flex-col flex-shrink-0">
        <div className="p-4 border-b border-border">
          <h1 className="text-lg font-bold text-foreground">Chat</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Internal messaging</p>
        </div>
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex justify-center py-8"><div className="w-5 h-5 border-2 border-primary/20 border-t-primary rounded-full animate-spin" /></div>
          ) : teammates.length === 0 ? (
            <p className="text-xs text-muted-foreground p-4">No teammates found</p>
          ) : (
            teammates.map(m => {
              const isActive = selectedMember?.id === m.id;
              const unread = unreadMap[m.id] || 0;
              return (
                <button
                  key={m.id}
                  onClick={() => setSelectedMember(m)}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${isActive ? 'bg-primary/10 border-r-2 border-primary' : 'hover:bg-muted/50'}`}
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                    {m.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{m.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{m.role.displayName}</p>
                  </div>
                  {unread > 0 && (
                    <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center flex-shrink-0">{unread}</span>
                  )}
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Main chat area */}
      <div className="flex-1 flex flex-col min-w-0">
        {!selectedMember ? (
          <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground gap-3">
            <MessageCircle className="w-12 h-12 opacity-20" />
            <p>Select a teammate to start chatting</p>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="px-6 py-4 border-b border-border flex items-center gap-3 flex-shrink-0">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-sm font-bold">
                {selectedMember.name.charAt(0)}
              </div>
              <div>
                <p className="font-semibold text-foreground">{selectedMember.name}</p>
                <p className="text-xs text-muted-foreground">{selectedMember.role.displayName}</p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-3">
              {conversation.length === 0 ? (
                <div className="text-center text-muted-foreground text-sm py-8">No messages yet. Say hello!</div>
              ) : (
                conversation.map((msg, i) => {
                  const senderId = typeof msg.sender === 'object' ? msg.sender?.id : null;
                  const isMine = senderId === user?.id;
                  return (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: Math.min(i * 0.02, 0.3) }}
                      className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[70%] px-4 py-2.5 rounded-2xl text-sm ${isMine ? 'bg-primary text-primary-foreground rounded-br-sm' : 'bg-muted text-foreground rounded-bl-sm'}`}>
                        <p>{msg.content}</p>
                        <p className={`text-xs mt-1 ${isMine ? 'text-primary-foreground/60' : 'text-muted-foreground'}`}>
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </motion.div>
                  );
                })
              )}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSend} className="px-6 py-4 border-t border-border flex items-center gap-3 flex-shrink-0">
              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder={`Message ${selectedMember.name}...`}
                className="flex-1 bg-muted/40 border border-border/40 rounded-xl px-4 py-2.5 text-sm text-foreground outline-none focus:border-primary/60 transition-colors"
                disabled={sending}
              />
              <button type="submit" disabled={sending || !input.trim()}
                className="w-10 h-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 transition-colors disabled:opacity-50 flex-shrink-0">
                <Send className="w-4 h-4" />
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
