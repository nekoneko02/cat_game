import { BondingLevelActions } from '../BondingLevelActions';
import { IActionSelector } from '../IActionSelector';

/**
 * なつき度レベル9のアクションセット
 */
export class BondingLevelActionsLv9 extends BondingLevelActions {
  constructor(actionSelector: IActionSelector) {
    super(9, actionSelector);
  }
}
