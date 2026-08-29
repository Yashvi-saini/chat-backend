export type MessageType = 'TEXT' | 'IMAGE' | 'FILE' | 'SYSTEM';

export interface MessageSender {
  id: string;
  name: string;
  avatarUrl: string | null;
}

export interface MessageResponse {
  id: string;
  conversationId: string;
  senderId: string;
  content: string | null;
  messageType: MessageType;
  replyToId: string | null;
  createdAt: string;
  updatedAt: string;
  sender: MessageSender;
}

export interface PaginatedMessagesResponse {
  items: MessageResponse[];
  nextCursor: string | null;
  hasMore: boolean;
}
