import { BondingLevel } from '@/domain/cat/catAI/bonding/BondingLevel';

describe('BondingLevel', () => {
  describe('constructor', () => {
    it('正常な値(0~10)でインスタンスを生成できる', () => {
      expect(() => new BondingLevel(0)).not.toThrow();
      expect(() => new BondingLevel(5)).not.toThrow();
      expect(() => new BondingLevel(10)).not.toThrow();
    });

    it('範囲外の値でエラーをスローする', () => {
      expect(() => new BondingLevel(-1)).toThrow();
      expect(() => new BondingLevel(11)).toThrow();
    });

    it('小数値でエラーをスローする', () => {
      expect(() => new BondingLevel(1.5)).toThrow();
    });
  });

  describe('getValue', () => {
    it('設定した値を取得できる', () => {
      const level = new BondingLevel(5);
      expect(level.getValue()).toBe(5);
    });
  });

  describe('levelUp', () => {
    it('レベルを1つ上げた新しいインスタンスを返す', () => {
      const level = new BondingLevel(5);
      const newLevel = level.levelUp();

      expect(newLevel.getValue()).toBe(6);
      expect(level.getValue()).toBe(5); // 元のインスタンスは不変
    });

    it('最大レベル(10)の場合は変化しない', () => {
      const level = new BondingLevel(10);
      const newLevel = level.levelUp();

      expect(newLevel.getValue()).toBe(10);
    });
  });

  describe('levelDown', () => {
    it('レベルを1つ下げた新しいインスタンスを返す', () => {
      const level = new BondingLevel(5);
      const newLevel = level.levelDown();

      expect(newLevel.getValue()).toBe(4);
      expect(level.getValue()).toBe(5); // 元のインスタンスは不変
    });

    it('最小レベル(0)の場合は変化しない', () => {
      const level = new BondingLevel(0);
      const newLevel = level.levelDown();

      expect(newLevel.getValue()).toBe(0);
    });
  });

  describe('equals', () => {
    it('同じ値のBondingLevelは等しい', () => {
      const level1 = new BondingLevel(5);
      const level2 = new BondingLevel(5);

      expect(level1.equals(level2)).toBe(true);
    });

    it('異なる値のBondingLevelは等しくない', () => {
      const level1 = new BondingLevel(5);
      const level2 = new BondingLevel(6);

      expect(level1.equals(level2)).toBe(false);
    });
  });
});
