import { Bonding } from '../Bonding';

/**
 * なつき度レベル9
 *
 * @package ねこ.ねこAI.なつき.なつき度毎
 */
export class BondingLv9 extends Bonding {
  constructor(gauge: number) {
    super(9, gauge);
  }
}
