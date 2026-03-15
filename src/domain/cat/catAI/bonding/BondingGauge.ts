/**
 * なつきゲージ値オブジェクト
 *
 * なつき度のゲージ（0~1）を表す不変オブジェクト
 * 次のレベルまでの進捗を表す
 *
 * @package ねこ.ねこAI.なつき
 */
export class BondingGauge {
  private readonly value: number;

  constructor(value: number) {
    if (value < 0 || value > 1) {
      throw new Error(`BondingGauge must be between 0 and 1, got ${value}`);
    }
    this.value = value;
  }

  getValue(): number {
    return this.value;
  }

  /**
   * ゲージに変化量を加えた新しいBondingGaugeを返す
   * 0~1の範囲にクランプされる
   */
  add(change: number): BondingGauge {
    const newValue = Math.max(0, Math.min(1, this.value + change));
    return new BondingGauge(newValue);
  }

  /**
   * ゲージが1.0に達しているか判定
   */
  isFull(): boolean {
    return this.value >= 1.0;
  }

  /**
   * ゲージが0.0か判定
   */
  isEmpty(): boolean {
    return this.value === 0;
  }

  equals(other: BondingGauge): boolean {
    return Math.abs(this.value - other.value) < 0.0001; // 浮動小数点誤差を考慮
  }

  /**
   * ゲージをリセット（0に戻す）
   */
  static reset(): BondingGauge {
    return new BondingGauge(0);
  }
}
