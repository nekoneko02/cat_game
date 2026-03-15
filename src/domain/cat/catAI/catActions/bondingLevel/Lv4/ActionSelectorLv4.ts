
import { IActionSelector } from '../IActionSelector';
import { ActionContext } from '../../ActionContext';
import { CatActionExecutor } from '../../CatActionExecutor';
import { WatchCautiouslyAction } from '../../WatchCautiouslyAction';
import { WatchWithTailWagAction } from '../../WatchWithTailWagAction';
import { WatchToyAction } from '../../WatchToyAction';
import { PlayWithToyAction } from '../../PlayWithToyAction';
import { ApproachAction } from '../../ApproachAction';
import { MoveAwayAction } from '../../MoveAwayAction';
import actionConfig from '../../../../../global/config/actionConfig.json';

/**
 * なつき度Lv.4用のアクション選択クラス
 * Lv.4: おもちゃで少し遊ぶ。短時間なら近づく。触らせるが警戒あり。
 * - 警戒しながら様子を見る: 65% × 5秒
 * - しっぽを揺らしながら、様子を見る: 25% × 3秒
 * - こちらに近づいてくる: 10% × 1秒
 * - 遠ざかる: +30% × 1秒（一定距離以内の場合）
 * - おもちゃに興味を持つ（見るだけ）: +30% × 2秒（おもちゃがあるときのみ）
 * - おもちゃで遊ぶ: +10% × 2秒（おもちゃがあるときのみ）
 * - 落ち着かない様子で撫でられる: +10% × 2秒（撫でられるときのみ） ※未実装
 *
 * @package ねこ.ねこAI.ねこアクション
 */
export class ActionSelector implements IActionSelector {
  private readonly watchCautiouslyAction: CatActionExecutor;
  private readonly watchWithTailWagAction: CatActionExecutor;
  private readonly watchToyAction: CatActionExecutor;
  private readonly playWithToyAction: CatActionExecutor;
  private readonly approachAction: CatActionExecutor;
  private readonly moveAwayAction: CatActionExecutor;
  private actionConfigs: Record<string, { duration: number }>;

  constructor() {
    this.watchCautiouslyAction = new WatchCautiouslyAction();
    this.watchWithTailWagAction = new WatchWithTailWagAction();
    this.watchToyAction = new WatchToyAction();
    this.playWithToyAction = new PlayWithToyAction();
    this.approachAction = new ApproachAction();
    this.moveAwayAction = new MoveAwayAction();
    this.actionConfigs = actionConfig.stepOneActions as Record<string, { duration: number }>;
  }

  /**
   * なつき度と外部状態に基づいてアクションを選択
   */
  select(context: ActionContext): CatActionExecutor {
    const hasToy = context.toyPresence;
    const toyDistance = context.getToyDistance();
    const closeDistance = 150;
    let random = Math.random();

    // 距離が近い場合は遠ざかる確率を追加
    if (hasToy && toyDistance < closeDistance) {
      if (random < 0.3) {
        return this.moveAwayAction;
      }
      random = (random - 0.3) / 0.7;
    }

    if (hasToy) {
      // おもちゃがある場合: +30%でwatchToy、+10%でplayWithToy
      if (random < 0.3) {
        return this.watchToyAction;
      } else if (random < 0.4) {
        return this.playWithToyAction;
      }
      // 残りの確率を再正規化（60%を100%にスケール）
      random = (random - 0.4) / 0.6;
    }

    // 基本アクション: 65%でwatchCautiously、25%でwatchWithTailWag、10%でapproach
    if (random < 0.65) {
      return this.watchCautiouslyAction;
    } else if (random < 0.9) {
      return this.watchWithTailWagAction;
    } else {
      return this.approachAction;
    }
  }

  /**
   * アクション設定を取得（実行時間など）
   */
  getActionConfig(actionName: string) {
    return this.actionConfigs[actionName];
  }
}
