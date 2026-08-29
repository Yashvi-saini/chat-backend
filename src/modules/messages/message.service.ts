import { messageRepository } from './message.repository.js';
import { conversationRepository } from '../conversations/conversation.repository.js';
import { AppError } from '../../shared/errors/AppError.js';
import type { SendMessageBody } from './message.validation.js';
import type { MessageResponse, PaginatedMessagesResponse } from './message.types.js';

async function sendMessage(
  senderId: string,
  conversationId: string,
  input: SendMessageBody,
): Promise<MessageResponse> {
  // 1. Verify user is a member of the target conversation
  const isMember = await conversationRepository.isUserMember(conversationId, senderId);
  if (!isMember) {
    throw new AppError('You are not a member of this conversation', 403, 'FORBIDDEN');
  }

  // 2. If replying to another message, verify parent message exists in this conversation
  if (input.replyToId) {
    const parentMessage = await messageRepository.findById(input.replyToId);
    if (!parentMessage || parentMessage.conversationId !== conversationId) {
      throw new AppError('Parent message to reply to was not found in this conversation', 404, 'REPLY_TARGET_NOT_FOUND');
    }
  }

  // 3. Create message
  return messageRepository.createMessage({
    conversationId,
    senderId,
    content: input.content,
    messageType: input.messageType,
    replyToId: input.replyToId,
  });
}

async function getMessages(
  userId: string,
  conversationId: string,
  limit: number,
  cursor?: string,
): Promise<PaginatedMessagesResponse> {
  // 1. Verify user is a member of the target conversation
  const isMember = await conversationRepository.isUserMember(conversationId, senderIdGuard(userId));
  if (!isMember) {
    throw new AppError('You are not a member of this conversation', 403, 'FORBIDDEN');
  }

  // 2. Fetch paginated messages
  return messageRepository.findPaginated(conversationId, limit, cursor);
}

function senderIdGuard(userId: string): string {
  return userId;
}

export const messageService = {
  sendMessage,
  getMessages,
};
