import { BondingLevelActions } from '../BondingLevelActions';
import { IActionSelector } from '../IActionSelector';

/**
 * なつき度レベル6のアクションセット
 */
export class BondingLevelActionsLv6 extends BondingLevelActions {
  constructor(actionSelector: IActionSelector) {
    super(6, actionSelector);
  }
}
