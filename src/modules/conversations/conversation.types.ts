export type ConversationType = 'DIRECT' | 'GROUP';
export type MemberRole = 'MEMBER' | 'ADMIN';

export interface ConversationMemberResponse {
  id: string;
  userId: string;
  role: MemberRole;
  joinedAt: string;
  user: {
    id: string;
    name: string;
    email: string | null;
    avatarUrl: string | null;
  };
}

export interface ConversationResponse {
  id: string;
  applicationId: string;
  type: ConversationType;
  name: string | null;
  status: 'ACTIVE' | 'ARCHIVED';
  createdAt: string;
  updatedAt: string;
  members: ConversationMemberResponse[];
}
