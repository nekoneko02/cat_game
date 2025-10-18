
import { BondingGauge } from '@/domain/cat/catAI/bonding/BondingGauge';

describe('BondingGauge', () => {
  describe('constructor', () => {
    it('正常な値(0~1)でインスタンスを生成できる', () => {
      expect(() => new BondingGauge(0)).not.toThrow();
      expect(() => new BondingGauge(0.5)).not.toThrow();
      expect(() => new BondingGauge(1)).not.toThrow();
    });

    it('範囲外の値でエラーをスローする', () => {
      expect(() => new BondingGauge(-0.1)).toThrow();
      expect(() => new BondingGauge(1.1)).toThrow();
    });
  });

  describe('getValue', () => {
    it('設定した値を取得できる', () => {
      const gauge = new BondingGauge(0.5);
      expect(gauge.getValue()).toBe(0.5);
    });
  });

  describe('add', () => {
    it('変化量を加えた新しいインスタンスを返す', () => {
      const gauge = new BondingGauge(0.3);
      const newGauge = gauge.add(0.2);

      expect(newGauge.getValue()).toBe(0.5);
      expect(gauge.getValue()).toBe(0.3); // 元のインスタンスは不変
    });

    it('1.0を超える場合は1.0にクランプされる', () => {
      const gauge = new BondingGauge(0.8);
      const newGauge = gauge.add(0.5);

      expect(newGauge.getValue()).toBe(1.0);
    });

    it('0未満になる場合は0にクランプされる', () => {
      const gauge = new BondingGauge(0.2);
      const newGauge = gauge.add(-0.5);

      expect(newGauge.getValue()).toBe(0);
    });
  });

  describe('isFull', () => {
    it('ゲージが1.0の場合はtrueを返す', () => {
      const gauge = new BondingGauge(1.0);
      expect(gauge.isFull()).toBe(true);
    });

    it('ゲージが1.0未満の場合はfalseを返す', () => {
      const gauge = new BondingGauge(0.99);
      expect(gauge.isFull()).toBe(false);
    });
  });

  describe('isEmpty', () => {
    it('ゲージが0の場合はtrueを返す', () => {
      const gauge = new BondingGauge(0);
      expect(gauge.isEmpty()).toBe(true);
    });

    it('ゲージが0より大きい場合はfalseを返す', () => {
      const gauge = new BondingGauge(0.01);
      expect(gauge.isEmpty()).toBe(false);
    });
  });

  describe('equals', () => {
    it('同じ値のBondingGaugeは等しい', () => {
      const gauge1 = new BondingGauge(0.5);
      const gauge2 = new BondingGauge(0.5);

      expect(gauge1.equals(gauge2)).toBe(true);
    });

    it('浮動小数点誤差を考慮して等しいと判定する', () => {
      const gauge1 = new BondingGauge(0.5);
      const gauge2 = new BondingGauge(0.50001);

      expect(gauge1.equals(gauge2)).toBe(true);
    });

    it('異なる値のBondingGaugeは等しくない', () => {
      const gauge1 = new BondingGauge(0.5);
      const gauge2 = new BondingGauge(0.6);

      expect(gauge1.equals(gauge2)).toBe(false);
    });
  });

  describe('reset', () => {
    it('ゲージ0の新しいインスタンスを返す', () => {
      const gauge = BondingGauge.reset();
      expect(gauge.getValue()).toBe(0);
    });
  });
});
