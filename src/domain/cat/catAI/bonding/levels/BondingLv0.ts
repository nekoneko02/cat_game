import { Bonding } from '../Bonding';

/**
 * なつき度レベル0
 *
 * @package ねこ.ねこAI.なつき.なつき度毎
 */
export class BondingLv0 extends Bonding {
  constructor(gauge: number) {
    super(0, gauge);
  }
}
