import { Bonding } from '../Bonding';

/**
 * なつき度レベル7
 *
 * @package ねこ.ねこAI.なつき.なつき度毎
 */
export class BondingLv7 extends Bonding {
  constructor(gauge: number) {
    super(7, gauge);
  }
}
