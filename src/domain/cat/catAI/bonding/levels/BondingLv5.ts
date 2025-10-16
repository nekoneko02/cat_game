import { Bonding } from '../Bonding';

/**
 * なつき度レベル5
 *
 * @package ねこ.ねこAI.なつき.なつき度毎
 */
export class BondingLv5 extends Bonding {
  constructor(gauge: number) {
    super(5, gauge);
  }
}
