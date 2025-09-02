import { ExternalState } from './ExternalState';
import actionConfig from '../config/actionConfig.json';

/**
 * ねこの内部状態（生理的・心理的状態）
 * ステップ1で使用する3つの状態のみ
 * 値オブジェクト：不変
 */
export class InternalState {
  constructor(
    public readonly bonding: number,     // なつき度 (0-1)
    public readonly playfulness: number, // 遊びたい気分 (0-1)
    public readonly fear: number         // 恐怖 (0-1)
  ) {
    this.validateRange();
  }

  private validateRange(): void {
    const values = [this.bonding, this.playfulness, this.fear];

    values.forEach((value, index) => {
      if (value < -1 || value > 1) {
        throw new Error(`Internal state value must be between -1 and 1. Index ${index}: ${value}`);
      }
    });
  }

  /**
   * なつき度を更新した新しいインスタンスを返す
   */
  updateBonding(amount: number): InternalState {
    const newBonding = Math.max(-1, Math.min(1, this.bonding + amount));
    return new InternalState(
      newBonding,
      this.playfulness,
      this.fear
    );
  }

  /**
   * 恐怖度を更新した新しいインスタンスを返す
   */
  updateFear(amount: number): InternalState {
    const newFear = Math.max(-1, Math.min(1, this.fear + amount));
    return new InternalState(
      this.bonding,
      this.playfulness,
      newFear
    );
  }

  /**
   * 遊び欲求を更新した新しいインスタンスを返す
   */
  updatePlayfulness(amount: number): InternalState {
    const newPlayfulness = Math.max(-1, Math.min(1, this.playfulness + amount));
    return new InternalState(
      this.bonding,
      newPlayfulness,
      this.fear
    );
  }

  /**
   * 遊び欲求を減衰させた新しいインスタンスを返す
   */
  decreasePlayfulness(amount: number = 0.0001): InternalState {
    const newPlayfulness = Math.max(-1, this.playfulness - amount);
    return new InternalState(
      this.bonding,
      newPlayfulness,
      this.fear
    );
  }

  /**
   * 外部状態による影響を適用した新しいインスタンスを返す
   */
  applyExternalInfluence(externalState: ExternalState, timeFactorPerSecond: number): InternalState {
    const stateChanges = new Map<string, number>();
    const influenceConfig = actionConfig.externalStateInfluence;

    // 外部状態を数値化したマップを作成
    const externalStateValues = this.convertExternalStateToNumbers(externalState);

    // 各内部状態について、weights/inputs方式で計算
    Object.entries(influenceConfig).forEach(([internalStateName, config]) => {
      const typedConfig = config as { inputs: string[], weights: number[] };
      const change = this.calculateWeightedInfluence(typedConfig, externalStateValues, timeFactorPerSecond);
      if (change !== 0) {
        stateChanges.set(internalStateName, change);
      }
    });

    // 変化を適用して新しいインスタンスを作成
    return this.applyStateChanges(stateChanges);
  }

  /**
   * 外部状態を数値マップに変換
   */
  private convertExternalStateToNumbers(externalState: ExternalState): Map<string, number> {
    const values = new Map<string, number>();
    
    // boolean値を0/1の数値に変換
    values.set('userPresence', externalState.userPresence ? 1 : 0);
    values.set('toyPresence', externalState.toyPresence ? 1 : 0);
    values.set('isPlaying', externalState.isPlaying ? 1 : 0);
    
    // 距離による派生値
    values.set('toyNear', (externalState.toyPresence && externalState.toyDistance < 100) ? 1 : 0);
    
    return values;
  }

  /**
   * weights/inputs方式で影響度を計算
   */
  private calculateWeightedInfluence(
    config: { inputs: string[], weights: number[] },
    externalStateValues: Map<string, number>,
    timeFactorPerSecond: number
  ): number {
    let totalInfluence = 0;

    config.inputs.forEach((inputName, index) => {
      const inputValue = externalStateValues.get(inputName) || 0;
      const weight = config.weights[index] || 0;
      totalInfluence += inputValue * weight;
    });

    return totalInfluence * timeFactorPerSecond;
  }

  /**
   * 状態変化マップを適用して新しいインスタンスを作成
   */
  private applyStateChanges(stateChanges: Map<string, number>): InternalState {
    let newBonding = this.bonding;
    let newPlayfulness = this.playfulness;
    let newFear = this.fear;

    // マップから各状態の変化を適用
    const bondingChange = stateChanges.get('bonding') || 0;
    const playfulnessChange = stateChanges.get('playfulness') || 0;
    const fearChange = stateChanges.get('fear') || 0;

    if (bondingChange !== 0) {
      newBonding = Math.max(-1, Math.min(1, this.bonding + bondingChange));
    }

    if (playfulnessChange !== 0) {
      newPlayfulness = Math.max(-1, Math.min(1, this.playfulness + playfulnessChange));
    }

    if (fearChange !== 0) {
      newFear = Math.max(-1, Math.min(1, this.fear + fearChange));
    }

    return new InternalState(newBonding, newPlayfulness, newFear);
  }

  /**
   * デフォルト状態を作成
   */
  static createDefault(): InternalState {
    return new InternalState(
      -1, // bonding - なつき度
      0,  // playfulness - 遊びたい気分
      1  // fear - 恐怖
    );
  }
}