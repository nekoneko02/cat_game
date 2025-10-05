import { BondingLevelActions } from '../BondingLevelActions';
import { IActionSelector } from '../IActionSelector';

/**
 * なつき度レベル3のアクションセット
 */
export class BondingLevelActionsLv3 extends BondingLevelActions {
  constructor(actionSelector: IActionSelector) {
    super(3, actionSelector);
  }
}
