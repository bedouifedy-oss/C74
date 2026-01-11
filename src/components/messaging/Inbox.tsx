'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  MessageCircle,
  Search,
  Send,
  ArrowLeft,
  User,
  Briefcase,
  Wrench,
  Zap,
  Wind,
  Sparkles,
  Loader2,
} from 'lucide-react';
import type { Locale } from '@/i18n-routing';
import { MobileBottomNav } from '@/components/MobileBottomNav';

const translations = {
  en: {
    inbox: 'Messages',
    searchConversations: 'Search conversations...',
    noConversations: 'No conversations yet',
    noConversationsDesc: 'Start a conversation by messaging a worker or customer',
    typeMessage: 'Type a message...',
    send: 'Send',
    today: 'Today',
    yesterday: 'Yesterday',
    regarding: 'Re:',
    online: 'Online',
    offline: 'Offline',
    unread: 'unread',
    backToList: 'Back',
    loading: 'Loading...',
  },
  fr: {
    inbox: 'Messages',
    searchConversations: 'Rechercher des conversations...',
    noConversations: 'Aucune conversation',
    noConversationsDesc: 'Commencez une conversation en envoyant un message',
    typeMessage: 'Tapez un message...',
    send: 'Envoyer',
    today: "Aujourd'hui",
    yesterday: 'Hier',
    regarding: 'Re:',
    online: 'En ligne',
    offline: 'Hors ligne',
    unread: 'non lu(s)',
    backToList: 'Retour',
    loading: 'Chargement...',
  },
  'ar-TN': {
    inbox: 'الرسائل',
    searchConversations: 'ابحث في المحادثات...',
    noConversations: 'ما فماش محادثات',
    noConversationsDesc: 'ابدأ محادثة مع عامل أو حريف',
    typeMessage: 'اكتب رسالة...',
    send: 'أرسل',
    today: 'اليوم',
    yesterday: 'البارح',
    regarding: 'بخصوص:',
    online: 'متصل',
    offline: 'غير متصل',
    unread: 'غير مقروءة',
    backToList: 'رجوع',
    loading: 'جاري التحميل...',
  },
};

interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  receiverId: string;
  content: string;
  type: string;
  read: boolean;
  createdAt: string;
}

interface Conversation {
  id: string;
  participants: string[];
  otherUser: {
    id: string;
    name: string;
    role: string;
  };
  jobId?: string;
  jobCategory?: string;
  jobTitle?: string;
  lastMessage: {
    content: string;
    senderId: string;
    createdAt: string;
  };
  unreadCount: number;
  updatedAt: string;
}

interface InboxProps {
  locale: Locale;
  userId: string;
  userRole: 'customer' | 'worker';
}

const categoryIcons: Record<string, React.ReactNode> = {
  plumbing: <Wrench className="w-3 h-3" />,
  electrical: <Zap className="w-3 h-3" />,
  ac: <Wind className="w-3 h-3" />,
  cleaning: <Sparkles className="w-3 h-3" />,
};

export default function Inbox({ locale, userId, userRole }: InboxProps) {
  const t = translations[locale];

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoadingConversations, setIsLoadingConversations] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isSending, setIsSending] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Fetch conversations
  useEffect(() => {
    const fetchConversations = async () => {
      setIsLoadingConversations(true);
      try {
        const token = localStorage.getItem('auth_token');
        const response = await fetch('/api/messages?listConversations=true', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (response.ok) {
          const data = await response.json();
          setConversations(data.conversations || []);
        }
      } catch (error) {
        console.error('Error fetching conversations:', error);
      } finally {
        setIsLoadingConversations(false);
      }
    };

    fetchConversations();
  }, [userId]);

  // Fetch messages for selected conversation
  const fetchMessages = useCallback(async (conversationId: string) => {
    setIsLoadingMessages(true);
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`/api/messages?conversationId=${conversationId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setMessages(data.messages || []);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setIsLoadingMessages(false);
    }
  }, []);

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation.id);
    }
  }, [selectedConversation, fetchMessages]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when conversation is selected
  useEffect(() => {
    if (selectedConversation) {
      inputRef.current?.focus();
    }
  }, [selectedConversation]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation) return;

    setIsSending(true);
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          conversationId: selectedConversation.id,
          content: newMessage.trim(),
          type: 'text',
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setMessages(prev => [...prev, data.message]);
        setNewMessage('');
        
        // Update conversation's last message
        setConversations(prev => prev.map(c => 
          c.id === selectedConversation.id 
            ? { ...c, lastMessage: data.message, updatedAt: data.message.createdAt }
            : c
        ));
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsSending(false);
    }
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return date.toLocaleTimeString(locale === 'ar-TN' ? 'ar-TN' : locale === 'fr' ? 'fr-FR' : 'en-US', {
        hour: '2-digit',
        minute: '2-digit',
      });
    } else if (diffDays === 1) {
      return t.yesterday;
    } else {
      return date.toLocaleDateString(locale === 'ar-TN' ? 'ar-TN' : locale === 'fr' ? 'fr-FR' : 'en-US', {
        month: 'short',
        day: 'numeric',
      });
    }
  };

  const formatMessageTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString(locale === 'ar-TN' ? 'ar-TN' : locale === 'fr' ? 'fr-FR' : 'en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const filteredConversations = conversations.filter(c =>
    c.otherUser?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.jobTitle?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Mobile: Show either list or chat
  // Desktop: Show both side by side
  return (
    <div className="h-[calc(100vh-200px)] min-h-[500px] flex bg-white dark:bg-neutral-800 rounded-lg border overflow-hidden">
      {/* Conversations List */}
      <div className={`w-full md:w-80 lg:w-96 border-e flex-shrink-0 flex flex-col ${
        selectedConversation ? 'hidden md:flex' : 'flex'
      }`}>
        {/* Search Header */}
        <div className="p-4 border-b">
          <div className="relative">
            <Search className="absolute top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 start-3" />
            <Input
              placeholder={t.searchConversations}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="ps-10"
            />
          </div>
        </div>

        {/* Conversations */}
        <div className="flex-1 overflow-y-auto">
          {isLoadingConversations ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-neutral-400" />
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="text-center py-12 px-4">
              <MessageCircle className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
              <p className="font-medium text-neutral-700 dark:text-neutral-300">{t.noConversations}</p>
              <p className="text-sm text-neutral-500 mt-1">{t.noConversationsDesc}</p>
            </div>
          ) : (
            filteredConversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => setSelectedConversation(conv)}
                className={`w-full p-4 border-b hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors text-start ${
                  selectedConversation?.id === conv.id ? 'bg-primary-50 dark:bg-primary-900/20' : ''
                }`}
              >
                <div className="flex gap-3">
                  <Avatar className="w-12 h-12 flex-shrink-0">
                    <AvatarFallback className={conv.otherUser.role === 'worker' ? 'bg-primary-600 text-white' : 'bg-green-600 text-white'}>
                      {conv.otherUser.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <div className={`flex items-center justify-between mb-1`}>
                      <span className="font-medium text-neutral-900 dark:text-neutral-100 truncate">
                        {conv.otherUser.name}
                      </span>
                      <span className="text-xs text-neutral-500 flex-shrink-0">
                        {formatTime(conv.lastMessage.createdAt)}
                      </span>
                    </div>
                    
                    {conv.jobTitle && (
                      <div className={`flex items-center gap-1 text-xs text-primary-600 dark:text-primary-400 mb-1`}>
                        {conv.jobCategory && categoryIcons[conv.jobCategory]}
                        <span className="truncate">{t.regarding} {conv.jobTitle}</span>
                      </div>
                    )}
                    
                    <div className={`flex items-center justify-between`}>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400 truncate">
                        {conv.lastMessage.senderId === userId ? '→ ' : ''}
                        {conv.lastMessage.content}
                      </p>
                      {conv.unreadCount > 0 && (
                        <Badge className="bg-primary-600 text-white text-xs ms-2 flex-shrink-0">
                          {conv.unreadCount}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className={`flex-1 flex flex-col ${
        selectedConversation ? 'flex' : 'hidden md:flex'
      }`}>
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                className="md:hidden"
                onClick={() => setSelectedConversation(null)}
              >
                <ArrowLeft className="w-4 h-4 rtl:rotate-180" />
              </Button>
              
              <Avatar className="w-10 h-10">
                <AvatarFallback className={selectedConversation.otherUser.role === 'worker' ? 'bg-primary-600 text-white' : 'bg-green-600 text-white'}>
                  {selectedConversation.otherUser.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1">
                <p className="font-medium text-neutral-900 dark:text-neutral-100">
                  {selectedConversation.otherUser.name}
                </p>
                {selectedConversation.jobTitle && (
                  <p className="text-xs text-neutral-500">
                    {t.regarding} {selectedConversation.jobTitle}
                  </p>
                )}
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {isLoadingMessages ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="w-6 h-6 animate-spin text-neutral-400" />
                </div>
              ) : messages.length === 0 ? (
                <div className="flex items-center justify-center h-full text-neutral-500">
                  <p>{t.typeMessage}</p>
                </div>
              ) : (
                messages.map((message) => {
                  const isOwn = message.senderId === userId;
                  return (
                    <div
                      key={message.id}
                      className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[75%] ${isOwn ? '' : ''}`}>
                        <div
                          className={`px-4 py-2 rounded-2xl ${
                            isOwn
                              ? 'bg-primary-600 text-white'
                              : 'bg-neutral-100 dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100'
                          }`}
                        >
                          <p className="text-sm">{message.content}</p>
                        </div>
                        <p className={`text-xs text-neutral-400 mt-1 ${isOwn ? 'text-end' : 'text-start'}`}>
                          {formatMessageTime(message.createdAt)}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t">
              <form onSubmit={sendMessage} className={`flex gap-2`}>
                <Input
                  ref={inputRef}
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder={t.typeMessage}
                  disabled={isSending}
                  className="flex-1"
                />
                <Button type="submit" disabled={isSending || !newMessage.trim()}>
                  {isSending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </Button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-neutral-500">
            <div className="text-center">
              <MessageCircle className="w-16 h-16 mx-auto mb-4 opacity-30" />
              <p>{t.noConversationsDesc}</p>
            </div>
          </div>
        )}
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav locale={locale} userRole={userRole} />
    </div>
  );
}
