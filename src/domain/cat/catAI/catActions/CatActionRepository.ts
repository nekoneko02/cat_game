import { BondingLevelActions } from './bondingLevel/BondingLevelActions';
import { BondingLevelActionsLv1 } from './bondingLevel/Lv1/BondingLevelActionsLv1';
import { BondingLevelActionsLv2 } from './bondingLevel/Lv2/BondingLevelActionsLv2';
import { BondingLevelActionsLv3 } from './bondingLevel/Lv3/BondingLevelActionsLv3';
import { BondingLevelActionsLv4 } from './bondingLevel/Lv4/BondingLevelActionsLv4';
import { ActionSelector as ActionSelectorLv1 } from './bondingLevel/Lv1/ActionSelectorLv1';
import { ActionSelector as ActionSelectorLv2 } from './bondingLevel/Lv2/ActionSelectorLv2';
import { ActionSelector as ActionSelectorLv3 } from './bondingLevel/Lv3/ActionSelectorLv3';
import { ActionSelector as ActionSelectorLv4 } from './bondingLevel/Lv4/ActionSelectorLv4';
import { CatActionExecutor } from './CatActionExecutor';
import { SitAction } from './SitAction';
import { ShowBellyAction } from './ShowBellyAction';
import { PlayWithToyAction } from './PlayWithToyAction';
import { RunAwayAction } from './RunAwayAction';
import { RunAwayShortAction } from './RunAwayShortAction';
import { WatchCautiouslyAction } from './WatchCautiouslyAction';
import { WatchToyAction } from './WatchToyAction';
import { WatchWithTailWagAction } from './WatchWithTailWagAction';
import { ApproachAction } from './ApproachAction';
import { MoveAwayAction } from './MoveAwayAction';

/**
 * ねこアクションRepository
 * クラス図における「ねこアクションRepository」に対応
 * なつき度レベルに応じてアクションセットを取得する
 */
export class CatActionRepository {
  private readonly levelActionsMap: Map<number, BondingLevelActions>;
  private readonly actionInstancesMap: Map<string, CatActionExecutor>;

  constructor() {
    this.levelActionsMap = new Map();
    this.actionInstancesMap = new Map();

    // なつき度レベル毎のアクションセットを初期化（各レベルのActionSelectorを使用）
    // Lv1-4のみ実装済み。Lv0, Lv5-10は未実装
    this.levelActionsMap.set(1, new BondingLevelActionsLv1(new ActionSelectorLv1()));
    this.levelActionsMap.set(2, new BondingLevelActionsLv2(new ActionSelectorLv2()));
    this.levelActionsMap.set(3, new BondingLevelActionsLv3(new ActionSelectorLv3()));
    this.levelActionsMap.set(4, new BondingLevelActionsLv4(new ActionSelectorLv4()));
    // Lv0, Lv5-10: TODO 未実装 - 暫定的にLv1と同じ動作
    this.levelActionsMap.set(0, new BondingLevelActionsLv1(new ActionSelectorLv1()));
    for (let level = 5; level <= 10; level++) {
      this.levelActionsMap.set(level, new BondingLevelActionsLv4(new ActionSelectorLv4()));
    }

    // デバッグ用: 全アクションのインスタンスを登録
    this.registerAction(new SitAction());
    this.registerAction(new ShowBellyAction());
    this.registerAction(new PlayWithToyAction());
    this.registerAction(new RunAwayAction());
    this.registerAction(new RunAwayShortAction());
    this.registerAction(new WatchCautiouslyAction());
    this.registerAction(new WatchToyAction());
    this.registerAction(new WatchWithTailWagAction());
    this.registerAction(new ApproachAction());
    this.registerAction(new MoveAwayAction());
  }

  private registerAction(action: CatActionExecutor): void {
    this.actionInstancesMap.set(action.getName(), action);
  }

  /**
   * なつき度レベルに応じたアクションセットを取得
   * @param level なつき度レベル (0-10)
   * @returns なつき度毎のアクションセット
   */
  getCatActionsByBondingLevel(level: number): BondingLevelActions {
    const actions = this.levelActionsMap.get(level);
    if (!actions) {
      throw new Error(`Invalid bonding level: ${level}. Level must be between 0 and 10.`);
    }
    return actions;
  }

  /**
   * デバッグ用: 全てのアクション名の一覧を取得
   * @internal デバッグ専用
   */
  getAllActionNames(): string[] {
    return Array.from(this.actionInstancesMap.keys());
  }

  /**
   * デバッグ用: アクション名からアクションExecutorを取得
   * @internal デバッグ専用
   */
  getActionByName(name: string): CatActionExecutor | undefined {
    return this.actionInstancesMap.get(name);
  }
}
