export interface AuthUserResponse {
  id: string;
  applicationId: string;
  name: string;
  email: string | null;
  avatarUrl: string | null;
  status: 'ACTIVE' | 'SUSPENDED';
  createdAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthSuccessResponse {
  user: AuthUserResponse;
  tokens: AuthTokens;
}
