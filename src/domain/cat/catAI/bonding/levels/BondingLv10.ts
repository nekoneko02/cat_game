import { Bonding } from '../Bonding';

/**
 * なつき度レベル10
 *
 * @package ねこ.ねこAI.なつき.なつき度毎
 */
export class BondingLv10 extends Bonding {
  constructor(gauge: number) {
    super(10, gauge);
  }
}
