import { SessionOptions } from 'iron-session';
import { Personality, Preferences } from '@/domain/cat/Cat';
import { logError } from './log';

export interface CatState {
  bonding: {
    level: number;
    gauge: number;
  };
  personality: Personality;
  preferences: Preferences;
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
      level: 0,
      gauge: 0
    },
    personality: {
      social: 0.7,
      active: 0.8,
      bold: 0.6,
      dependent: 0.5,
      friendly: 0.8
    },
    preferences: {
      toyTypes: ['ball', 'feather', 'mouse'],
      movementSpeed: 0.7,
      movementDirections: ['horizontal', 'vertical'],
      randomness: 0.6
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