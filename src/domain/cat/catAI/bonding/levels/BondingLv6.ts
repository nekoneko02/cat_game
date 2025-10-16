import { Bonding } from '../Bonding';

/**
 * なつき度レベル6
 *
 * @package ねこ.ねこAI.なつき.なつき度毎
 */
export class BondingLv6 extends Bonding {
  constructor(gauge: number) {
    super(6, gauge);
  }
}
