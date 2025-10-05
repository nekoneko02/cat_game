import { BondingLevelActions } from '../BondingLevelActions';
import { IActionSelector } from '../IActionSelector';

/**
 * なつき度レベル8のアクションセット
 */
export class BondingLevelActionsLv8 extends BondingLevelActions {
  constructor(actionSelector: IActionSelector) {
    super(8, actionSelector);
  }
}
