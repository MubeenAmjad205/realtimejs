export interface AuthAdapter {
  getUser(token: string): Promise<unknown | null>;
  validateSession(sessionId: string): Promise<boolean>;
  createSession(userId: string): Promise<string>;
  destroySession(sessionId: string): Promise<void>;
}
