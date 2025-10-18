import { SessionOptions } from 'iron-session';
import { logError } from './log';

export interface CatState {
  bonding: {
    level: number;
    gauge: number;
  };
}


const getSessionPassword = (): string => {
  const password = process.env.SESSION_PASSWORD;
  if (!password) {
    logError('[SECURITY INCIDENT] SESSION_PASSWORD environment variable is not set. Using fallback password which is not secure for production.');
    return 'complex_password_at_least_32_characters_long_for_security';
  }
  return password;
};

export const sessionOptions: SessionOptions = {
  password: getSessionPassword(),
  cookieName: 'cat-game-session',
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'lax',
  },
};

export function createDefaultCatState(): CatState {
  return {
    bonding: {
      level: 1,
      gauge: 0
    }
  };
}

export interface SessionData {
  username?: string;
  catName?: string;
  catState?: CatState;
}

declare module 'iron-session' {
  interface IronSessionData {
    username?: string;
    catName?: string;
    catState?: CatState;
  }
}