export interface CatMaster {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  personality: {
    social: number;
    active: number;
    bold: number;
    dependent: number;
    friendly: number;
  };
  preferences: {
    toyTypes: string[];
    movementSpeed: number;
    movementDirections: string[];
    randomness: number;
  };
}