import type { Server } from 'socket.io';
import type { AuthenticatedSocket } from './socket.auth.js';
import { conversationRepository } from '../modules/conversations/conversation.repository.js';
import { messageService } from '../modules/messages/message.service.js';
import logger from '../config/logger.js';

export function registerSocketEvents(io: Server, socket: AuthenticatedSocket): void {
  const { userId, applicationId } = socket.data.user;

  // Auto-join user-specific private room for personal notifications
  socket.join(`user:${userId}`);
  logger.info({ userId, socketId: socket.id }, '[socket] User connected and joined personal room');

  // Event: Join a conversation room
  socket.on('conversation:join', async (data: { conversationId: string }, callback?: Function) => {
    try {
      const { conversationId } = data;
      const isMember = await conversationRepository.isUserMember(conversationId, userId);

      if (!isMember) {
        if (callback) callback({ success: false, error: 'Not a member of this conversation' });
        return;
      }

      socket.join(`conversation:${conversationId}`);
      logger.info({ userId, conversationId }, '[socket] Joined conversation room');
      if (callback) callback({ success: true });
    } catch (err) {
      logger.error({ err }, '[socket] Error joining conversation room');
      if (callback) callback({ success: false, error: 'Internal server error' });
    }
  });

  // Event: Leave a conversation room
  socket.on('conversation:leave', (data: { conversationId: string }) => {
    socket.leave(`conversation:${data.conversationId}`);
    logger.info({ userId, conversationId: data.conversationId }, '[socket] Left conversation room');
  });

  // Event: Send a real-time message
  socket.on(
    'message:send',
    async (
      data: {
        conversationId: string;
        content: string;
        messageType?: 'TEXT' | 'IMAGE' | 'FILE' | 'SYSTEM';
        replyToId?: string;
      },
      callback?: Function,
    ) => {
      try {
        const { conversationId, content, messageType = 'TEXT', replyToId } = data;

        // Persist message via service
        const message = await messageService.sendMessage(userId, conversationId, {
          content,
          messageType,
          replyToId,
        });

        // Broadcast to all sockets in conversation room (including sender)
        io.to(`conversation:${conversationId}`).emit('message:new', message);

        if (callback) callback({ success: true, data: message });
      } catch (err: any) {
        logger.error({ err, userId }, '[socket] Error handling message:send');
        if (callback) callback({ success: false, error: err.message || 'Failed to send message' });
      }
    },
  );

  // Event: Typing Start
  socket.on('typing:start', (data: { conversationId: string }) => {
    socket.to(`conversation:${data.conversationId}`).emit('typing:user_started', {
      conversationId: data.conversationId,
      userId,
    });
  });

  // Event: Typing Stop
  socket.on('typing:stop', (data: { conversationId: string }) => {
    socket.to(`conversation:${data.conversationId}`).emit('typing:user_stopped', {
      conversationId: data.conversationId,
      userId,
    });
  });

  // Disconnect handler
  socket.on('disconnect', (reason) => {
    logger.info({ userId, socketId: socket.id, reason }, '[socket] User disconnected');
  });
}
