export interface CatState {
  position: { x: number; y: number };
  emotions: {
    valence: number;
    arousal: number;
    safety: number;
    social: number;
    discomfort: number;
  };
  internalStates: {
    hunger: number;
    thirst: number;
    fatigue: number;
    sleepiness: number;
    health: number;
    excretion: number;
    bonding: number;
    anxiety: number;
    curiosity: number;
    playfulness: number;
    fear: number;
  };
  personality: {
    social: number;
    active: number;
    bold: number;
    dependent: number;
    friendly: number;
  };
  preferences: {
    toyType: string[];
    movementSpeed: number;
    movementDirection: string[];
    randomness: number;
  };
}

export interface Toy {
  id: string;
  name: string;
  type: string;
  attributes: {
    appearance: string;
    material: string;
    sound: string;
    color: string;
  };
}

export interface GameState {
  cat: CatState;
  selectedToy?: Toy;
  isPlaying: boolean;
  sessionTime: number;
}