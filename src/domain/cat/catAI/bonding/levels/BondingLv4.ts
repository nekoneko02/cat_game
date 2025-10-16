import { Bonding } from '../Bonding';

/**
 * なつき度レベル4
 *
 * @package ねこ.ねこAI.なつき.なつき度毎
 */
export class BondingLv4 extends Bonding {
  constructor(gauge: number) {
    super(4, gauge);
  }
}
