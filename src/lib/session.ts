import { SessionOptions } from 'iron-session';
import { Personality, Preferences } from '@/domain/entities/Cat';

export interface CatState {
  bonding: number;
  playfulness: number;
  fear: number;
  personality: Personality;
  preferences: Preferences;
}


export const sessionOptions: SessionOptions = {
  password: process.env.SESSION_PASSWORD || 'complex_password_at_least_32_characters_long_for_security',
  cookieName: 'cat-game-session',
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 7, // 1週間
    sameSite: 'lax',
  },
};

export function createDefaultCatState(): CatState {
  return {
    bonding: -1,  // InternalState.createDefault()と同じ初期値
    playfulness: 0,
    fear: 1,
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

declare module 'iron-session' {
  interface IronSessionData {
    username?: string;
    catName?: string;
    catState?: CatState;
  }
}