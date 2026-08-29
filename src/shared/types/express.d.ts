declare namespace Express {
  interface Request {
    id: string;
    user?: {
      userId: string;
      applicationId: string;
    };
  }
}
