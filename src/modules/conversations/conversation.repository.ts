import prisma from '../../config/prisma.js';
import type { ConversationResponse, ConversationType, MemberRole } from './conversation.types.js';

function toResponse(conv: {
  id: string;
  applicationId: string;
  type: string;
  name: string | null;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  members: Array<{
    id: string;
    userId: string;
    role: string;
    joinedAt: Date;
    user: {
      id: string;
      name: string;
      email: string | null;
      avatarUrl: string | null;
    };
  }>;
}): ConversationResponse {
  return {
    id: conv.id,
    applicationId: conv.applicationId,
    type: conv.type as ConversationType,
    name: conv.name,
    status: conv.status as 'ACTIVE' | 'ARCHIVED',
    createdAt: conv.createdAt.toISOString(),
    updatedAt: conv.updatedAt.toISOString(),
    members: conv.members.map((m) => ({
      id: m.id,
      userId: m.userId,
      role: m.role as MemberRole,
      joinedAt: m.joinedAt.toISOString(),
      user: {
        id: m.user.id,
        name: m.user.name,
        email: m.user.email,
        avatarUrl: m.user.avatarUrl,
      },
    })),
  };
}

async function findExistingDirectConversation(
  applicationId: string,
  userAId: string,
  userBId: string,
): Promise<ConversationResponse | null> {
  const conversation = await prisma.conversation.findFirst({
    where: {
      applicationId,
      type: 'DIRECT',
      AND: [
        { members: { some: { userId: userAId } } },
        { members: { some: { userId: userBId } } },
      ],
    },
    include: {
      members: {
        include: {
          user: {
            select: { id: true, name: true, email: true, avatarUrl: true },
          },
        },
      },
    },
  });

  if (!conversation) return null;
  return toResponse(conversation);
}

async function createConversation(data: {
  applicationId: string;
  type: ConversationType;
  name?: string;
  members: Array<{ userId: string; role: MemberRole }>;
}): Promise<ConversationResponse> {
  const conversation = await prisma.conversation.create({
    data: {
      applicationId: data.applicationId,
      type: data.type,
      name: data.name ?? null,
      members: {
        createMany: {
          data: data.members.map((m) => ({
            userId: m.userId,
            role: m.role,
          })),
        },
      },
    },
    include: {
      members: {
        include: {
          user: {
            select: { id: true, name: true, email: true, avatarUrl: true },
          },
        },
      },
    },
  });

  return toResponse(conversation);
}

async function findUserConversations(
  applicationId: string,
  userId: string,
): Promise<ConversationResponse[]> {
  const conversations = await prisma.conversation.findMany({
    where: {
      applicationId,
      status: 'ACTIVE',
      members: {
        some: { userId },
      },
    },
    include: {
      members: {
        include: {
          user: {
            select: { id: true, name: true, email: true, avatarUrl: true },
          },
        },
      },
    },
    orderBy: { updatedAt: 'desc' },
  });

  return conversations.map(toResponse);
}

async function findById(
  id: string,
  applicationId: string,
): Promise<ConversationResponse | null> {
  const conversation = await prisma.conversation.findFirst({
    where: {
      id,
      applicationId,
    },
    include: {
      members: {
        include: {
          user: {
            select: { id: true, name: true, email: true, avatarUrl: true },
          },
        },
      },
    },
  });

  if (!conversation) return null;
  return toResponse(conversation);
}

async function isUserMember(conversationId: string, userId: string): Promise<boolean> {
  const member = await prisma.conversationMember.findUnique({
    where: {
      conversationId_userId: {
        conversationId,
        userId,
      },
    },
  });
  return !!member;
}

export const conversationRepository = {
  findExistingDirectConversation,
  createConversation,
  findUserConversations,
  findById,
  isUserMember,
};
