import { BondingLevelActions } from '../BondingLevelActions';
import { IActionSelector } from '../IActionSelector';

/**
 * なつき度レベル2のアクションセット
 */
export class BondingLevelActionsLv2 extends BondingLevelActions {
  constructor(actionSelector: IActionSelector) {
    super(2, actionSelector);
  }
}
