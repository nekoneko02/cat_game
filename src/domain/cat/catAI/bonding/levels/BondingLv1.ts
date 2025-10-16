import { Bonding } from '../Bonding';

/**
 * なつき度レベル1
 *
 * @package ねこ.ねこAI.なつき.なつき度毎
 */
export class BondingLv1 extends Bonding {
  constructor(gauge: number) {
    super(1, gauge);
  }
}
