import { BondingLevelActions } from '../BondingLevelActions';
import { IActionSelector } from '../IActionSelector';

/**
 * なつき度レベル1のアクションセット
 */
export class BondingLevelActionsLv1 extends BondingLevelActions {
  constructor(actionSelector: IActionSelector) {
    super(1, actionSelector);
  }
}
