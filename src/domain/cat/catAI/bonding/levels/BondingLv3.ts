import { Bonding } from '../Bonding';

/**
 * なつき度レベル3
 *
 * @package ねこ.ねこAI.なつき.なつき度毎
 */
export class BondingLv3 extends Bonding {
  constructor(gauge: number) {
    super(3, gauge);
  }
}
