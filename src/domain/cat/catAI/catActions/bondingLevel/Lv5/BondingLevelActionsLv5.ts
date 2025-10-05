import { BondingLevelActions } from '../BondingLevelActions';
import { IActionSelector } from '../IActionSelector';

/**
 * なつき度レベル5のアクションセット
 */
export class BondingLevelActionsLv5 extends BondingLevelActions {
  constructor(actionSelector: IActionSelector) {
    super(5, actionSelector);
  }
}
