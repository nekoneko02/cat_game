import { BondingLevelActions } from '../BondingLevelActions';
import { IActionSelector } from '../IActionSelector';

/**
 * なつき度レベル0のアクションセット
 */
export class BondingLevelActionsLv0 extends BondingLevelActions {
  constructor(actionSelector: IActionSelector) {
    super(0, actionSelector);
  }
}
