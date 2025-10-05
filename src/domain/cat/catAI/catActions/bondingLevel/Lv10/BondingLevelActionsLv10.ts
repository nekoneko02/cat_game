import { BondingLevelActions } from '../BondingLevelActions';
import { IActionSelector } from '../IActionSelector';

/**
 * なつき度レベル10のアクションセット
 */
export class BondingLevelActionsLv10 extends BondingLevelActions {
  constructor(actionSelector: IActionSelector) {
    super(10, actionSelector);
  }
}
