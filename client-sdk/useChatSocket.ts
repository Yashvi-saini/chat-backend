import { useEffect, useState, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import type { Message } from './chat-client';

export interface UseChatSocketProps {
  serverUrl: string; 
  accessToken: string | null;
  conversationId: string | null;
}

export interface UseChatSocketReturn {
  isConnected: boolean;
  messages: Message[];
  typingUsers: string[];
  sendMessage: (content: string, replyToId?: string) => Promise<void>;
  setTyping: (isTyping: boolean) => void;
}

export function useChatSocket({
  serverUrl,
  accessToken,
  conversationId,
}: UseChatSocketProps): UseChatSocketReturn {
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!accessToken || !conversationId) return;

    // Initialize Socket.io connection with JWT auth
    const socket = io(serverUrl, {
      auth: { token: accessToken },
      transports: ['websocket', 'polling'],
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      setIsConnected(true);

      // Join conversation room
      socket.emit('conversation:join', { conversationId }, (response: { success: boolean }) => {
        if (!response?.success) {
          console.error('[useChatSocket] Failed to join conversation room');
        }
      });
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    // Listen for real-time incoming messages
    socket.on('message:new', (newMessage: Message) => {
      if (newMessage.conversationId === conversationId) {
        setMessages((prev) => [...prev, newMessage]);
      }
    });

    // Listen for live typing indicators
    socket.on('typing:user_started', (data: { conversationId: string; userId: string }) => {
      if (data.conversationId === conversationId) {
        setTypingUsers((prev) => Array.from(new Set([...prev, data.userId])));
      }
    });

    socket.on('typing:user_stopped', (data: { conversationId: string; userId: string }) => {
      if (data.conversationId === conversationId) {
        setTypingUsers((prev) => prev.filter((id) => id !== data.userId));
      }
    });

    return () => {
      if (conversationId) {
        socket.emit('conversation:leave', { conversationId });
      }
      socket.disconnect();
      socketRef.current = null;
    };
  }, [serverUrl, accessToken, conversationId]);

  const sendMessage = useCallback(
    async (content: string, replyToId?: string) => {
      if (!socketRef.current || !conversationId) return;

      return new Promise<void>((resolve, reject) => {
        socketRef.current?.emit(
          'message:send',
          { conversationId, content, replyToId, messageType: 'TEXT' },
          (response: { success: boolean; error?: string }) => {
            if (response?.success) {
              resolve();
            } else {
              reject(new Error(response?.error || 'Failed to send message over socket'));
            }
          },
        );
      });
    },
    [conversationId],
  );

  const setTyping = useCallback(
    (isTyping: boolean) => {
      if (!socketRef.current || !conversationId) return;

      const eventName = isTyping ? 'typing:start' : 'typing:stop';
      socketRef.current.emit(eventName, { conversationId });
    },
    [conversationId],
  );

  return {
    isConnected,
    messages,
    typingUsers,
    sendMessage,
    setTyping,
  };
}
