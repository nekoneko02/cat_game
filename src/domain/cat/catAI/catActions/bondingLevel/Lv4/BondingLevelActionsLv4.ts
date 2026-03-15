import { BondingLevelActions } from '../BondingLevelActions';
import { IActionSelector } from '../IActionSelector';

/**
 * なつき度レベル4のアクションセット
 */
export class BondingLevelActionsLv4 extends BondingLevelActions {
  constructor(actionSelector: IActionSelector) {
    super(4, actionSelector);
  }
}
