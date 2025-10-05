import { BondingLevelActions } from './bondingLevel/BondingLevelActions';
import { BondingLevelActionsLv0 } from './bondingLevel/Lv0/BondingLevelActionsLv0';
import { BondingLevelActionsLv1 } from './bondingLevel/Lv1/BondingLevelActionsLv1';
import { BondingLevelActionsLv2 } from './bondingLevel/Lv2/BondingLevelActionsLv2';
import { BondingLevelActionsLv3 } from './bondingLevel/Lv3/BondingLevelActionsLv3';
import { BondingLevelActionsLv4 } from './bondingLevel/Lv4/BondingLevelActionsLv4';
import { BondingLevelActionsLv5 } from './bondingLevel/Lv5/BondingLevelActionsLv5';
import { BondingLevelActionsLv6 } from './bondingLevel/Lv6/BondingLevelActionsLv6';
import { BondingLevelActionsLv7 } from './bondingLevel/Lv7/BondingLevelActionsLv7';
import { BondingLevelActionsLv8 } from './bondingLevel/Lv8/BondingLevelActionsLv8';
import { BondingLevelActionsLv9 } from './bondingLevel/Lv9/BondingLevelActionsLv9';
import { BondingLevelActionsLv10 } from './bondingLevel/Lv10/BondingLevelActionsLv10';
import { ActionSelector as ActionSelectorLv0 } from './bondingLevel/Lv0/ActionSelectorLv0';
import { ActionSelector as ActionSelectorLv1 } from './bondingLevel/Lv1/ActionSelectorLv1';
import { ActionSelector as ActionSelectorLv2 } from './bondingLevel/Lv2/ActionSelectorLv2';
import { ActionSelector as ActionSelectorLv3 } from './bondingLevel/Lv3/ActionSelectorLv3';
import { ActionSelector as ActionSelectorLv4 } from './bondingLevel/Lv4/ActionSelectorLv4';
import { ActionSelector as ActionSelectorLv5 } from './bondingLevel/Lv5/ActionSelectorLv5';
import { ActionSelector as ActionSelectorLv6 } from './bondingLevel/Lv6/ActionSelectorLv6';
import { ActionSelector as ActionSelectorLv7 } from './bondingLevel/Lv7/ActionSelectorLv7';
import { ActionSelector as ActionSelectorLv8 } from './bondingLevel/Lv8/ActionSelectorLv8';
import { ActionSelector as ActionSelectorLv9 } from './bondingLevel/Lv9/ActionSelectorLv9';
import { ActionSelector as ActionSelectorLv10 } from './bondingLevel/Lv10/ActionSelectorLv10';

/**
 * ねこアクションRepository
 * クラス図における「ねこアクションRepository」に対応
 * なつき度レベルに応じてアクションセットを取得する
 */
export class CatActionRepository {
  private readonly levelActionsMap: Map<number, BondingLevelActions>;

  constructor() {
    this.levelActionsMap = new Map();

    // なつき度レベル毎のアクションセットを初期化（各レベルのActionSelectorを使用）
    this.levelActionsMap.set(0, new BondingLevelActionsLv0(new ActionSelectorLv0()));
    this.levelActionsMap.set(1, new BondingLevelActionsLv1(new ActionSelectorLv1()));
    this.levelActionsMap.set(2, new BondingLevelActionsLv2(new ActionSelectorLv2()));
    this.levelActionsMap.set(3, new BondingLevelActionsLv3(new ActionSelectorLv3()));
    this.levelActionsMap.set(4, new BondingLevelActionsLv4(new ActionSelectorLv4()));
    this.levelActionsMap.set(5, new BondingLevelActionsLv5(new ActionSelectorLv5()));
    this.levelActionsMap.set(6, new BondingLevelActionsLv6(new ActionSelectorLv6()));
    this.levelActionsMap.set(7, new BondingLevelActionsLv7(new ActionSelectorLv7()));
    this.levelActionsMap.set(8, new BondingLevelActionsLv8(new ActionSelectorLv8()));
    this.levelActionsMap.set(9, new BondingLevelActionsLv9(new ActionSelectorLv9()));
    this.levelActionsMap.set(10, new BondingLevelActionsLv10(new ActionSelectorLv10()));
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
}
