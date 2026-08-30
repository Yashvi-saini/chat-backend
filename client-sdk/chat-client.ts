export interface ChatClientConfig {
  baseUrl: string; 
  applicationId: string;
}

export interface User {
  id: string;
  applicationId: string;
  name: string;
  email: string | null;
  avatarUrl: string | null;
  status: 'ACTIVE' | 'SUSPENDED';
  createdAt: string;
}

export interface Tokens {
  accessToken: string;
  refreshToken: string;
}

export interface Conversation {
  id: string;
  applicationId: string;
  type: 'DIRECT' | 'GROUP';
  name: string | null;
  status: 'ACTIVE' | 'ARCHIVED';
  createdAt: string;
  updatedAt: string;
  members: Array<{
    id: string;
    userId: string;
    role: 'MEMBER' | 'ADMIN';
    joinedAt: string;
    user: {
      id: string;
      name: string;
      email: string | null;
      avatarUrl: string | null;
    };
  }>;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string | null;
  messageType: 'TEXT' | 'IMAGE' | 'FILE' | 'SYSTEM';
  replyToId: string | null;
  createdAt: string;
  updatedAt: string;
  sender: {
    id: string;
    name: string;
    avatarUrl: string | null;
  };
}

export interface PaginatedMessages {
  items: Message[];
  nextCursor: string | null;
  hasMore: boolean;
}

export class ChatBackendClient {
  private baseUrl: string;
  private applicationId: string;
  private accessToken: string | null = null;
  private refreshToken: string | null = null;

  constructor(config: ChatClientConfig) {
    this.baseUrl = config.baseUrl.replace(/\/$/, '');
    this.applicationId = config.applicationId;
  }

  public setTokens(tokens: Tokens): void {
    this.accessToken = tokens.accessToken;
    this.refreshToken = tokens.refreshToken;
  }

  public getAccessToken(): string | null {
    return this.accessToken;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (this.accessToken) {
      headers['Authorization'] = `Bearer ${this.accessToken}`;
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.error?.message || `HTTP Error ${response.status}`);
    }

    return data.data as T;
  }

  // --- Auth API ---
  public auth = {
    register: async (input: { name: string; email: string; password: string; avatarUrl?: string }) => {
      const res = await this.request<{ user: User; tokens: Tokens }>('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ applicationId: this.applicationId, ...input }),
      });
      this.setTokens(res.tokens);
      return res;
    },

    login: async (input: { email: string; password: string }) => {
      const res = await this.request<{ user: User; tokens: Tokens }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ applicationId: this.applicationId, ...input }),
      });
      this.setTokens(res.tokens);
      return res;
    },

    refreshToken: async () => {
      if (!this.refreshToken) throw new Error('No refresh token available');
      const res = await this.request<{ accessToken: string }>('/auth/refresh', {
        method: 'POST',
        body: JSON.stringify({ refreshToken: this.refreshToken }),
      });
      this.accessToken = res.accessToken;
      return res.accessToken;
    },

    getMe: async () => {
      return this.request<{ user: { userId: string; applicationId: string } }>('/auth/me');
    },
  };

  // --- Conversations API ---
  public conversations = {
    createDirect: async (recipientId: string) => {
      return this.request<Conversation>('/conversations', {
        method: 'POST',
        body: JSON.stringify({ type: 'DIRECT', recipientId }),
      });
    },

    createGroup: async (name: string, memberIds: string[]) => {
      return this.request<Conversation>('/conversations', {
        method: 'POST',
        body: JSON.stringify({ type: 'GROUP', name, memberIds }),
      });
    },

    list: async () => {
      return this.request<Conversation[]>('/conversations');
    },

    getDetails: async (conversationId: string) => {
      return this.request<Conversation>(`/conversations/${conversationId}`);
    },
  };

  // --- Messages API ---
  public messages = {
    send: async (conversationId: string, content: string, replyToId?: string) => {
      return this.request<Message>(`/conversations/${conversationId}/messages`, {
        method: 'POST',
        body: JSON.stringify({ content, messageType: 'TEXT', replyToId }),
      });
    },

    list: async (conversationId: string, params: { limit?: number; cursor?: string } = {}) => {
      const query = new URLSearchParams();
      if (params.limit) query.append('limit', String(params.limit));
      if (params.cursor) query.append('cursor', params.cursor);

      const queryString = query.toString() ? `?${query.toString()}` : '';
      return this.request<PaginatedMessages>(`/conversations/${conversationId}/messages${queryString}`);
    },
  };
}
