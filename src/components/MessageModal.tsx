'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Send, MessageCircle, X, User } from 'lucide-react';
import type { Locale } from '@/i18n-routing';

const translations = {
  en: {
    noMessages: 'No messages yet. Start the conversation!',
    typeMessage: 'Type your message...',
    regardingJob: 'Regarding Job',
    send: 'Send',
  },
  fr: {
    noMessages: 'Pas encore de messages. Commencez la conversation !',
    typeMessage: 'Tapez votre message...',
    regardingJob: 'Concernant le travail',
    send: 'Envoyer',
  },
  'ar-TN': {
    noMessages: 'لا توجد رسائل بعد. ابدأ المحادثة!',
    typeMessage: 'اكتب رسالتك...',
    regardingJob: 'بخصوص العمل',
    send: 'إرسال',
  },
};

interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  receiverId: string;
  content: string;
  type: 'text';
  read: boolean;
  createdAt: string;
}

interface Conversation {
  id: string;
  participants: string[];
  lastMessage: Message;
  createdAt: string;
  updatedAt: string;
}

interface MessageModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUserId: string;
  otherUserId: string;
  otherUserName?: string;
  jobId?: string;
  locale?: Locale;
}

const MessageModal: React.FC<MessageModalProps> = ({
  isOpen,
  onClose,
  currentUserId,
  otherUserId,
  otherUserName = 'User',
  jobId,
  locale = 'en'
}) => {
  const t = translations[locale];
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [resolvedConversationId, setResolvedConversationId] = useState<string | undefined>(jobId);

  useEffect(() => {
    setResolvedConversationId(jobId);
  }, [jobId]);

  const conversationId = resolvedConversationId;

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  const fetchMessages = useCallback(async () => {
    try {
      if (!conversationId) return;

      const token = localStorage.getItem('auth_token');
      const response = await fetch(`/api/messages?conversationId=${conversationId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setMessages(data.messages || []);

        // Mark messages as read
        const unreadMessages =
          data.messages?.filter((m: Message) => m.receiverId === currentUserId && !m.read) || [];

        for (const message of unreadMessages) {
          await fetch('/api/messages', {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              messageId: message.id,
              read: true
            })
          });
        }
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  }, [conversationId, currentUserId]);

  const resolveConversationIfNeeded = useCallback(async () => {
    if (jobId) return;
    if (!isOpen) return;
    if (!currentUserId || !otherUserId) return;
    if (resolvedConversationId) return;

    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/messages?listConversations=true', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) return;
      const data = await response.json();
      const conversations = data.conversations || [];
      const match = conversations.find((c: any) => c?.otherUser?.id === otherUserId);
      if (match?.id) {
        setResolvedConversationId(match.id);
      }
    } catch (error) {
      console.error('Error resolving conversation:', error);
    }
  }, [currentUserId, isOpen, jobId, otherUserId, resolvedConversationId]);

  useEffect(() => {
    if (isOpen && currentUserId && otherUserId && conversationId) {
      fetchMessages();
    }
  }, [isOpen, currentUserId, otherUserId, conversationId, fetchMessages]);

  useEffect(() => {
    resolveConversationIfNeeded();
  }, [resolveConversationIfNeeded]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim()) return;
    if (!conversationId) return;

    setIsLoading(true);

    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          conversationId,
          content: newMessage.trim(),
          type: 'text'
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setMessages(prev => [...prev, data.message]);
        setNewMessage('');
      } else {
        console.error('Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit'
    });
  };

  if (!isOpen) return null;


  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[600px] flex flex-col">
        <CardHeader className="pb-3">
          <div className={`flex items-center justify-between`}>
            <div className={`flex items-center gap-3`}>
              <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center">
                <MessageCircle className="w-5 h-5 text-primary-600 dark:text-primary-400" />
              </div>
              <div>
                <h3 className="font-semibold text-neutral-900 dark:text-neutral-100">
                  {otherUserName}
                </h3>
                {jobId && (
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">
                    {t.regardingJob} #{jobId}
                  </p>
                )}
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="flex-1 p-0">
          <div className="h-96 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 ? (
              <div className="text-center text-neutral-500 dark:text-neutral-400 py-8">
                <MessageCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>{t.noMessages}</p>
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${
                    message.senderId === currentUserId ? 'flex-row-reverse' : ''
                  }`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    message.senderId === currentUserId
                      ? 'bg-primary-500 text-white'
                      : 'bg-neutral-200 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300'
                  }`}>
                    <User className="w-4 h-4" />
                  </div>
                  <div className={`max-w-[70%] ${
                    message.senderId === currentUserId ? 'text-end' : 'text-start'
                  }`}>
                    <div
                      className={`inline-block px-4 py-2 rounded-lg ${
                        message.senderId === currentUserId
                          ? 'bg-primary-500 text-white'
                          : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100'
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                    </div>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                      {formatTime(message.createdAt)}
                    </p>
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>
        </CardContent>
        
        <CardHeader className="pt-3">
          <form onSubmit={sendMessage} className="flex gap-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder={t.typeMessage}
              className="flex-1"
              disabled={isLoading}
            />
            <Button type="submit" size="sm" disabled={isLoading || !newMessage.trim() || !conversationId}>
              <Send className="w-4 h-4" />
            </Button>
          </form>
        </CardHeader>
      </Card>
    </div>
  );
};

export default MessageModal;
