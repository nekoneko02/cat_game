import { InternalState } from '../valueObjects/InternalState';
import { ExternalState } from '../valueObjects/ExternalState';
import actionConfig from './actionConfig.json';

/**
 * アクション確率計算設定の型定義
 */
interface ActionConfig {
  name: string;
  description: string;
  inputs: string[];
  weights: number[];
  duration?: number;
}

interface EmotionCalcConfig {
  inputs: string[];
  weights: number[];
}

interface ProbabilityConfig {
  method: 'softmax';
  temperature: number;
  minimumProbability: number;
}

/**
 * アクション確率計算機
 * ステップ1の要件に基づいた簡略化されたロジック
 */
export class ActionProbabilityCalculator {
  private actionConfigs: Record<string, ActionConfig>;
  private emotionConfigs: Record<string, EmotionCalcConfig>;
  private probabilityConfig: ProbabilityConfig;

  constructor() {
    this.actionConfigs = actionConfig.stepOneActions as Record<string, ActionConfig>;
    this.emotionConfigs = actionConfig.emotionCalculation as Record<string, EmotionCalcConfig>;
    this.probabilityConfig = actionConfig.probabilityCalculation as ProbabilityConfig;
  }

  /**
   * ステップ1の簡略化された感情計算
   */
  calculateEmotions(internalState: InternalState): Record<string, number> {
    const emotions: Record<string, number> = {};
    
    // ステップ1で使用する3つの内部状態のみ抽出
    const stepOneState = {
      bonding: internalState.bonding,
      playfulness: internalState.playfulness,
      fear: internalState.fear
    };

    for (const [emotionName, config] of Object.entries(this.emotionConfigs)) {
      emotions[emotionName] = this.calculateSingleEmotion(config, stepOneState);
    }

    return emotions;
  }

  /**
   * 単一の感情値を計算（重み付き線形結合）
   */
  private calculateSingleEmotion(
    config: EmotionCalcConfig, 
    state: Record<string, number>
  ): number {
    let result = 0;
    
    // 各入力値に重みを掛けて加算
    for (let i = 0; i < config.inputs.length; i++) {
      const inputValue = state[config.inputs[i]] || 0;
      const weight = config.weights[i] || 0;
      result += inputValue * weight;
    }
    
    // バイアス項を加算（weights配列の最後の要素）
    const biasIndex = config.inputs.length;
    const bias = config.weights[biasIndex] || 0;
    result += bias;
    
    return result;
  }

  /**
   * 各アクションの確率値を計算
   */
  calculateActionProbabilities(
    internalState: InternalState,
    externalState: ExternalState
  ): Record<string, number> {
    const emotions = this.calculateEmotions(internalState);
    const actionValues: Record<string, number> = {};

    // 各アクションの基本値を計算
    for (const [actionName, actionConfig] of Object.entries(this.actionConfigs)) {
      actionValues[actionName] = this.calculateActionValue(actionConfig, emotions);
    }

    // おもちゃがない場合は「おもちゃにじゃれる」の確率を大幅に下げる
    if (!externalState.toyPresence) {
      actionValues['playWithToy'] = Math.min(actionValues['playWithToy'], 0.1);
    }

    // ソフトマックス関数で正規化
    return this.applySoftmax(actionValues);
  }

  /**
   * 単一のアクション値を計算（重み付き線形結合）
   */
  private calculateActionValue(actionConfig: ActionConfig, emotions: Record<string, number>): number {
    let result = 0;
    
    // 各入力値に重みを掛けて加算
    for (let i = 0; i < actionConfig.inputs.length; i++) {
      const inputValue = emotions[actionConfig.inputs[i]] || 0;
      const weight = actionConfig.weights[i] || 0;
      result += inputValue * weight;
    }
    
    // バイアス項を加算（weights配列の最後の要素）
    const biasIndex = actionConfig.inputs.length;
    const bias = actionConfig.weights[biasIndex] || 0;
    result += bias;
    
    return result;
  }

  /**
   * ソフトマックス関数を適用して確率を正規化
   */
  private applySoftmax(values: Record<string, number>): Record<string, number> {
    const temp = this.probabilityConfig.temperature;
    const minProb = this.probabilityConfig.minimumProbability;
    
    // 温度パラメータで調整
    const adjustedValues = Object.fromEntries(
      Object.entries(values).map(([key, value]) => [key, value / temp])
    );
    
    // ソフトマックス計算
    const maxValue = Math.max(...Object.values(adjustedValues));
    const expValues = Object.fromEntries(
      Object.entries(adjustedValues).map(([key, value]) => [key, Math.exp(value - maxValue)])
    );
    
    const sumExp = Object.values(expValues).reduce((sum, exp) => sum + exp, 0);
    
    // 正規化し、最小確率を保証
    const probabilities = Object.fromEntries(
      Object.entries(expValues).map(([key, exp]) => {
        const prob = exp / sumExp;
        return [key, Math.max(prob, minProb)];
      })
    );
    
    // 確率の合計を1にする（最小確率保証により少し超過する可能性があるため）
    const totalProb = Object.values(probabilities).reduce((sum, prob) => sum + prob, 0);
    return Object.fromEntries(
      Object.entries(probabilities).map(([key, prob]) => [key, prob / totalProb])
    );
  }

  /**
   * 確率に基づいてアクションを選択
   */
  selectAction(probabilities: Record<string, number>): string {
    const random = Math.random();
    let cumulative = 0;
    
    for (const [actionName, probability] of Object.entries(probabilities)) {
      cumulative += probability;
      if (random < cumulative) {
        return actionName;
      }
    }
    
    // フォールバック（通常は到達しない）
    return Object.keys(probabilities)[0];
  }

  /**
   * アクション設定を取得
   */
  getActionConfig(actionName: string): ActionConfig | null {
    return this.actionConfigs[actionName] || null;
  }

  /**
   * 設定を動的に更新（デバッグ用）
   */
  updateConfig(newConfig: typeof actionConfig): void {
    this.actionConfigs = newConfig.stepOneActions as Record<string, ActionConfig>;
    this.emotionConfigs = newConfig.emotionCalculation as Record<string, EmotionCalcConfig>;
    this.probabilityConfig = newConfig.probabilityCalculation as ProbabilityConfig;
  }
}