import prisma from '../../config/prisma.js';
import type { MessageResponse, MessageType, PaginatedMessagesResponse } from './message.types.js';

function toResponse(msg: {
  id: string;
  conversationId: string;
  senderId: string;
  content: string | null;
  messageType: string;
  replyToId: string | null;
  createdAt: Date;
  updatedAt: Date;
  sender: {
    id: string;
    name: string;
    avatarUrl: string | null;
  };
}): MessageResponse {
  return {
    id: msg.id,
    conversationId: msg.conversationId,
    senderId: msg.senderId,
    content: msg.content,
    messageType: msg.messageType as MessageType,
    replyToId: msg.replyToId,
    createdAt: msg.createdAt.toISOString(),
    updatedAt: msg.updatedAt.toISOString(),
    sender: {
      id: msg.sender.id,
      name: msg.sender.name,
      avatarUrl: msg.sender.avatarUrl,
    },
  };
}

async function createMessage(data: {
  conversationId: string;
  senderId: string;
  content: string;
  messageType: MessageType;
  replyToId?: string;
}): Promise<MessageResponse> {
  // Use Prisma transaction to atomically insert message and update conversation timestamp
  const [message] = await prisma.$transaction([
    prisma.message.create({
      data: {
        conversationId: data.conversationId,
        senderId: data.senderId,
        content: data.content,
        messageType: data.messageType,
        replyToId: data.replyToId ?? null,
      },
      include: {
        sender: {
          select: { id: true, name: true, avatarUrl: true },
        },
      },
    }),
    prisma.conversation.update({
      where: { id: data.conversationId },
      data: { updatedAt: new Date() },
    }),
  ]);

  return toResponse(message);
}

async function findPaginated(
  conversationId: string,
  limit: number,
  cursor?: string,
): Promise<PaginatedMessagesResponse> {
  // Fetch limit + 1 items to determine if there are more items available
  const messages = await prisma.message.findMany({
    where: {
      conversationId,
      deletedAt: null,
    },
    take: limit + 1,
    ...(cursor
      ? {
          cursor: { id: cursor },
          skip: 1, // Skip the cursor itself
        }
      : {}),
    orderBy: { createdAt: 'desc' }, // Latest messages first
    include: {
      sender: {
        select: { id: true, name: true, avatarUrl: true },
      },
    },
  });

  const hasMore = messages.length > limit;
  const items = hasMore ? messages.slice(0, limit) : messages;
  const nextCursor = hasMore ? items[items.length - 1]?.id ?? null : null;

  return {
    items: items.map(toResponse),
    nextCursor,
    hasMore,
  };
}

async function findById(id: string): Promise<MessageResponse | null> {
  const message = await prisma.message.findUnique({
    where: { id },
    include: {
      sender: {
        select: { id: true, name: true, avatarUrl: true },
      },
    },
  });

  if (!message) return null;
  return toResponse(message);
}

export const messageRepository = {
  createMessage,
  findPaginated,
  findById,
};
