import { Bonding } from '../Bonding';

/**
 * なつき度レベル2
 *
 * @package ねこ.ねこAI.なつき.なつき度毎
 */
export class BondingLv2 extends Bonding {
  constructor(gauge: number) {
    super(2, gauge);
  }
}
