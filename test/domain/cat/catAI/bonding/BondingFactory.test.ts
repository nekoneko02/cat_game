import { BondingFactory } from '@/domain/cat/catAI/bonding/BondingFactory';
import { Bonding } from '@/domain/cat/catAI/bonding/Bonding';

describe('BondingFactory', () => {
  describe('getBonding', () => {
    it('レベル0のBondingを生成できること', () => {
      const context = { level: 0, gauge: 0.5 };
      const bonding = BondingFactory.getBonding(context);

      expect(bonding.getLevel()).toBe(0);
      expect(bonding.getGauge()).toBe(0.5);
    });

    it('レベル1のBondingを生成できること', () => {
      const context = { level: 1, gauge: 0.3 };
      const bonding = BondingFactory.getBonding(context);

      expect(bonding.getLevel()).toBe(1);
      expect(bonding.getGauge()).toBe(0.3);
    });

    it('レベル10のBondingを生成できること', () => {
      const context = { level: 10, gauge: 0.9 };
      const bonding = BondingFactory.getBonding(context);

      expect(bonding.getLevel()).toBe(10);
      expect(bonding.getGauge()).toBe(0.9);
    });

    it('レベル0~10の全てのBondingを生成できること', () => {
      for (let level = 0; level <= 10; level++) {
        const context = { level, gauge: 0.5 };
        const bonding = BondingFactory.getBonding(context);

        expect(bonding.getLevel()).toBe(level);
        expect(bonding.getGauge()).toBe(0.5);
      }
    });

    it('不正なレベル（負の数）でエラーをスローすること', () => {
      const context = { level: -1, gauge: 0.5 };

      expect(() => BondingFactory.getBonding(context)).toThrow();
    });

    it('不正なレベル（11以上）でエラーをスローすること', () => {
      const context = { level: 11, gauge: 0.5 };

      expect(() => BondingFactory.getBonding(context)).toThrow();
    });

    it('不正なゲージ値（負の数）でエラーをスローすること', () => {
      const context = { level: 0, gauge: -0.1 };

      expect(() => BondingFactory.getBonding(context)).toThrow();
    });

    it('不正なゲージ値（1より大きい）でエラーをスローすること', () => {
      const context = { level: 0, gauge: 1.1 };

      expect(() => BondingFactory.getBonding(context)).toThrow();
    });

    it('ゲージが0のBondingを生成できること', () => {
      const context = { level: 5, gauge: 0 };
      const bonding = BondingFactory.getBonding(context);

      expect(bonding.getLevel()).toBe(5);
      expect(bonding.getGauge()).toBe(0);
    });

    it('ゲージが1のBondingを生成できること', () => {
      const context = { level: 5, gauge: 1 };
      const bonding = BondingFactory.getBonding(context);

      expect(bonding.getLevel()).toBe(5);
      expect(bonding.getGauge()).toBe(1);
    });
  });

  describe('生成されたBondingの振る舞い', () => {
    it('updateBonding()でレベルアップする際、新しいレベルのBondingを返すこと', () => {
      const bonding = BondingFactory.getBonding({ level: 0, gauge: 0.9 });
      const updated = bonding.updateBonding(0.2); // ゲージが1.1になり、レベル1に

      expect(updated.getLevel()).toBe(1);
      expect(updated.getGauge()).toBeCloseTo(0.1, 5);
    });

    it('updateBonding()でゲージのみ変化する場合、同じレベルのBondingを返すこと', () => {
      const bonding = BondingFactory.getBonding({ level: 3, gauge: 0.5 });
      const updated = bonding.updateBonding(0.2);

      expect(updated.getLevel()).toBe(3);
      expect(updated.getGauge()).toBeCloseTo(0.7, 5);
    });
  });
});
