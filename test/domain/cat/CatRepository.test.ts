import { CatRepository } from '@/domain/cat/CatRepository';
import { Cat } from '@/domain/cat/Cat';
import { GameTimeManager } from '@/game/GameTimeManager';

describe('CatRepository', () => {
  let repository: CatRepository;
  let gameTimeManager: GameTimeManager;

  beforeEach(() => {
    gameTimeManager = new GameTimeManager();
    repository = new CatRepository(gameTimeManager);
  });

  describe('getCatByUserId', () => {
    it('ユーザーIDからCatインスタンスを取得できること', () => {
      const userId = 'user123';
      const catData = {
        id: 'cat1',
        name: 'たまねこ',
        bonding: { level: 2, gauge: 0.5 },
        personality: {
          social: 0.7,
          active: 0.8,
          bold: 0.6,
          dependent: 0.5,
          friendly: 0.8,
        },
        preferences: {
          toyTypes: ['ball', 'feather'],
          movementSpeed: 0.7,
          movementDirections: ['horizontal', 'vertical'],
          randomness: 0.6,
        },
      };

      const cat = repository.getCatByUserId(userId, catData);

      expect(cat).toBeInstanceOf(Cat);
      expect(cat.id).toBe('cat1');
      expect(cat.name).toBe('たまねこ');
      expect(cat.getBonding().getLevel()).toBe(2);
      expect(cat.getBonding().getGauge()).toBe(0.5);
    });

    it('初期位置が画面中央に設定されること', () => {
      const userId = 'user123';
      const catData = {
        id: 'cat1',
        name: 'たまねこ',
        bonding: { level: 0, gauge: 0 },
        personality: {
          social: 0.7,
          active: 0.8,
          bold: 0.6,
          dependent: 0.5,
          friendly: 0.8,
        },
        preferences: {
          toyTypes: ['ball'],
          movementSpeed: 0.7,
          movementDirections: ['horizontal'],
          randomness: 0.6,
        },
      };

      const cat = repository.getCatByUserId(userId, catData);
      const position = cat.getPosition();

      // GameConfigから取得した画面サイズの中央
      expect(position.x).toBe(400); // 800 / 2
      expect(position.y).toBe(300); // 600 / 2
    });
  });

  describe('createCat', () => {
    it('新しいCatインスタンスを作成できること', () => {
      const name = 'みけねこ';
      const personality = {
        social: 0.6,
        active: 0.9,
        bold: 0.7,
        dependent: 0.4,
        friendly: 0.9,
      };
      const preferences = {
        toyTypes: ['mouse', 'string'],
        movementSpeed: 0.8,
        movementDirections: ['diagonal'],
        randomness: 0.5,
      };

      const cat = repository.createCat(name, personality, preferences);

      expect(cat).toBeInstanceOf(Cat);
      expect(cat.name).toBe('みけねこ');
      expect(cat.personality).toEqual(personality);
      expect(cat.preferences).toEqual(preferences);
      expect(cat.getBonding().getLevel()).toBe(0);
      expect(cat.getBonding().getGauge()).toBe(0);
    });
  });
});
