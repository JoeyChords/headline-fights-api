import "express-session";

declare global {
  namespace Express {
    interface User {
      id: string;
      username: string;
      email: string;
      email_verified: boolean;
    }
  }
}

declare module "express-session" {
  interface SessionData {
    passport?: {
      user: {
        id: string;
        username: string;
        email: string;
        email_verified: boolean;
      };
    };
  }
}

export {};
