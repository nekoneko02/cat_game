/**
 * なつきLv値オブジェクト
 *
 * なつき度のレベル（0~10）を表す不変オブジェクト
 *
 * @package ねこ.ねこAI.なつき
 */
export class BondingLevel {
  private readonly value: number;

  constructor(value: number) {
    if (value < 0 || value > 10 || !Number.isInteger(value)) {
      throw new Error(`BondingLevel must be an integer between 0 and 10, got ${value}`);
    }
    this.value = value;
  }

  getValue(): number {
    return this.value;
  }

  /**
   * レベルアップした新しいBondingLevelを返す
   */
  levelUp(): BondingLevel {
    if (this.value >= 10) {
      return this; // 最大レベルの場合は変化なし
    }
    return new BondingLevel(this.value + 1);
  }

  /**
   * レベルダウンした新しいBondingLevelを返す
   */
  levelDown(): BondingLevel {
    if (this.value <= 0) {
      return this; // 最小レベルの場合は変化なし
    }
    return new BondingLevel(this.value - 1);
  }

  equals(other: BondingLevel): boolean {
    return this.value === other.value;
  }
}
