import { Bonding } from '../Bonding';

/**
 * なつき度レベル8
 *
 * @package ねこ.ねこAI.なつき.なつき度毎
 */
export class BondingLv8 extends Bonding {
  constructor(gauge: number) {
    super(8, gauge);
  }
}
