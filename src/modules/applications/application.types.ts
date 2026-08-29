export interface ApplicationResponse {
  id: string;
  name: string;
  status: 'ACTIVE' | 'SUSPENDED';
  createdAt: string;
  updatedAt: string;
}

export interface CreateApplicationInput {
  name: string;
}
