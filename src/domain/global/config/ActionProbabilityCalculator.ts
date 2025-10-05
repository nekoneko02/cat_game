import { Bonding } from '../../cat/catAI/bonding/Bonding';
import { ExternalState } from '../../gameLogic/environment/ExternalState';
import actionConfig from './actionConfig.json';

/**
 * アクション確率計算設定の型定義
 */
interface ActionConfig {
  name: string;
  description: string;
  duration?: number;
}

/**
 * アクション確率計算機（仮実装）
 *
 * なつき度のみを使用したシンプルなアクション選択ロジック。
 * playfulness/fearは廃止されたため、なつき度レベルと外部状態のみで判定する。
 *
 * @package ねこ.ねこAI.ねこアクション
 */
export class ActionProbabilityCalculator {
  private actionConfigs: Record<string, ActionConfig>;

  constructor() {
    this.actionConfigs = actionConfig.stepOneActions as Record<string, ActionConfig>;
  }

  /**
   * 各アクションの確率値を計算（仮実装）
   *
   * なつき度レベルと外部状態に基づいて簡易的に確率を計算する。
   * 本実装では、より洗練された重み付き計算を行う予定。
   */
  calculateActionProbabilities(
    bonding: Bonding,
    externalState: ExternalState
  ): Record<string, number> {
    const bondingLevel = bonding.getLevel();
    const probabilities: Record<string, number> = {};

    // なつき度レベルに応じた基本確率を設定（仮実装）
    if (bondingLevel >= 7) {
      // 高なつき度: お腹見せが最も確率が高い
      probabilities['showBelly'] = 0.5;
      probabilities['playWithToy'] = externalState.toyPresence ? 0.3 : 0.1;
      probabilities['sit'] = 0.2;
      probabilities['runAway'] = 0.0;
    } else if (bondingLevel >= 4) {
      // 中なつき度: バランス型
      probabilities['showBelly'] = 0.2;
      probabilities['playWithToy'] = externalState.toyPresence ? 0.4 : 0.2;
      probabilities['sit'] = 0.4;
      probabilities['runAway'] = 0.0;
    } else {
      // 低なつき度: 警戒的
      probabilities['showBelly'] = 0.0;
      probabilities['playWithToy'] = externalState.toyPresence ? 0.2 : 0.0;
      probabilities['sit'] = 0.3;
      probabilities['runAway'] = 0.5;
    }

    return probabilities;
  }

  /**
   * 確率分布に基づいてアクションを選択
   */
  selectAction(probabilities: Record<string, number>): string {
    const actions = Object.keys(probabilities);
    const weights = Object.values(probabilities);

    // 重みの合計を計算
    const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);

    // ランダム値を生成
    let random = Math.random() * totalWeight;

    // 累積確率でアクションを選択
    for (let i = 0; i < actions.length; i++) {
      random -= weights[i];
      if (random <= 0) {
        return actions[i];
      }
    }

    // フォールバック: 最初のアクション
    return actions[0] || 'sit';
  }

  /**
   * アクション設定を取得（実行時間など）
   */
  getActionConfig(actionName: string): ActionConfig | undefined {
    return this.actionConfigs[actionName];
  }
}
