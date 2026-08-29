import { conversationRepository } from './conversation.repository.js';
import prisma from '../../config/prisma.js';
import { AppError } from '../../shared/errors/AppError.js';
import type { CreateConversationBody } from './conversation.validation.js';
import type { ConversationResponse } from './conversation.types.js';

async function createConversation(
  userId: string,
  applicationId: string,
  input: CreateConversationBody,
): Promise<ConversationResponse> {
  if (input.type === 'DIRECT') {
    if (input.recipientId === userId) {
      throw new AppError('Cannot create a direct conversation with yourself', 400, 'INVALID_RECIPIENT');
    }

    // Verify recipient exists in the same application
    const recipient = await prisma.user.findFirst({
      where: {
        id: input.recipientId,
        applicationId,
        status: 'ACTIVE',
      },
    });

    if (!recipient) {
      throw new AppError('Recipient user not found in this application', 404, 'RECIPIENT_NOT_FOUND');
    }

    // Idempotency: Return existing 1-on-1 direct conversation if one already exists
    const existing = await conversationRepository.findExistingDirectConversation(
      applicationId,
      userId,
      input.recipientId,
    );
    if (existing) {
      return existing;
    }

    return conversationRepository.createConversation({
      applicationId,
      type: 'DIRECT',
      members: [
        { userId, role: 'ADMIN' },
        { userId: input.recipientId, role: 'MEMBER' },
      ],
    });
  }

  // GROUP Conversation
  // Deduplicate and filter out creator
  const uniqueMemberIds = Array.from(new Set(input.memberIds.filter((id) => id !== userId)));

  // Validate all requested members exist in the same application
  const validUsersCount = await prisma.user.count({
    where: {
      id: { in: uniqueMemberIds },
      applicationId,
      status: 'ACTIVE',
    },
  });

  if (validUsersCount !== uniqueMemberIds.length) {
    throw new AppError('One or more group members do not exist in this application', 400, 'INVALID_MEMBERS');
  }

  const memberList: Array<{ userId: string; role: 'ADMIN' | 'MEMBER' }> = [
    { userId, role: 'ADMIN' },
    ...uniqueMemberIds.map((mId) => ({ userId: mId, role: 'MEMBER' as const })),
  ];

  return conversationRepository.createConversation({
    applicationId,
    type: 'GROUP',
    name: input.name,
    members: memberList,
  });
}

async function getUserConversations(
  userId: string,
  applicationId: string,
): Promise<ConversationResponse[]> {
  return conversationRepository.findUserConversations(applicationId, userId);
}

async function getConversationById(
  conversationId: string,
  userId: string,
  applicationId: string,
): Promise<ConversationResponse> {
  const conversation = await conversationRepository.findById(conversationId, applicationId);

  if (!conversation) {
    throw new AppError('Conversation not found', 404, 'CONVERSATION_NOT_FOUND');
  }

  const isMember = conversation.members.some((m) => m.userId === userId);
  if (!isMember) {
    throw new AppError('You are not a member of this conversation', 403, 'FORBIDDEN');
  }

  return conversation;
}

export const conversationService = {
  createConversation,
  getUserConversations,
  getConversationById,
};
