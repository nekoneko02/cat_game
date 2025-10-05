import { BondingLevelActions } from '../BondingLevelActions';
import { IActionSelector } from '../IActionSelector';

/**
 * なつき度レベル7のアクションセット
 */
export class BondingLevelActionsLv7 extends BondingLevelActions {
  constructor(actionSelector: IActionSelector) {
    super(7, actionSelector);
  }
}
