import { GameConfig } from '@/domain/global/GameConfig';

describe('GameConfig', () => {
  let gameConfig: GameConfig;

  beforeEach(() => {
    gameConfig = GameConfig.getInstance();
  });

  describe('getInstance', () => {
    it('シングルトンパターンで同じインスタンスを返すこと', () => {
      const instance1 = GameConfig.getInstance();
      const instance2 = GameConfig.getInstance();

      expect(instance1).toBe(instance2);
    });
  });

  describe('getGameScreenSize', () => {
    it('ゲーム画面のサイズを返すこと', () => {
      const { width, height } = gameConfig.getGameScreenSize();

      expect(width).toBe(800);
      expect(height).toBe(600);
    });

    it('返り値は正の数であること', () => {
      const { width, height } = gameConfig.getGameScreenSize();

      expect(width).toBeGreaterThan(0);
      expect(height).toBeGreaterThan(0);
    });
  });
});
