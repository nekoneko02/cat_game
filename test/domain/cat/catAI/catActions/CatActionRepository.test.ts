import { CatActionRepository } from '@/domain/cat/catAI/catActions/CatActionRepository';
import { Bonding } from '@/domain/cat/catAI/bonding/Bonding';

describe('CatActionRepository', () => {
  let repository: CatActionRepository;

  beforeEach(() => {
    repository = new CatActionRepository();
  });

  describe('getCatActionsByBondingLevel', () => {
    it('なつき度レベル0のアクションセットを取得できる', () => {
      const bonding = new Bonding(0, 0);  // レベル0

      const actions = repository.getCatActionsByBondingLevel(bonding.getLevel());

      expect(actions).toBeDefined();
      expect(actions.getBondingLevel()).toBe(0);
    });

    it('なつき度レベル5のアクションセットを取得できる', () => {
      const bonding = new Bonding(5, 0);  // レベル5

      const actions = repository.getCatActionsByBondingLevel(bonding.getLevel());

      expect(actions).toBeDefined();
      expect(actions.getBondingLevel()).toBe(5);
    });

    it('なつき度レベル10のアクションセットを取得できる', () => {
      const bonding = new Bonding(10, 0);  // レベル10

      const actions = repository.getCatActionsByBondingLevel(bonding.getLevel());

      expect(actions).toBeDefined();
      expect(actions.getBondingLevel()).toBe(10);
    });

    it('異なるなつき度レベルで異なるアクションセットを返す', () => {
      const bonding0 = new Bonding(0, 0);  // レベル0
      const bonding5 = new Bonding(5, 0);  // レベル5

      const actions0 = repository.getCatActionsByBondingLevel(bonding0.getLevel());
      const actions5 = repository.getCatActionsByBondingLevel(bonding5.getLevel());

      expect(actions0.getBondingLevel()).not.toBe(actions5.getBondingLevel());
    });

    it('同じなつき度レベルで同じアクションセットを返す（キャッシュ動作）', () => {
      const bonding = new Bonding(3, 0);  // レベル3

      const actions1 = repository.getCatActionsByBondingLevel(bonding.getLevel());
      const actions2 = repository.getCatActionsByBondingLevel(bonding.getLevel());

      expect(actions1.getBondingLevel()).toBe(actions2.getBondingLevel());
      expect(actions1.getBondingLevel()).toBe(3);
    });
  });

  describe('境界値テスト', () => {
    it('なつき度レベル0（最小値）で正常に動作する', () => {
      const actions = repository.getCatActionsByBondingLevel(0);

      expect(actions).toBeDefined();
      expect(actions.getBondingLevel()).toBe(0);
    });

    it('なつき度レベル10（最大値）で正常に動作する', () => {
      const actions = repository.getCatActionsByBondingLevel(10);

      expect(actions).toBeDefined();
      expect(actions.getBondingLevel()).toBe(10);
    });
  });
});

describe('CatActionRepository Integration Tests', () => {
  let repository: CatActionRepository;

  beforeEach(() => {
    repository = new CatActionRepository();
  });

  it('シナリオ: なつき度が上昇するにつれて異なるアクションセットを取得', () => {
    const levels = [0, 3, 5, 7, 10];
    const actionSets = levels.map(level =>
      repository.getCatActionsByBondingLevel(level)
    );

    actionSets.forEach((actions, index) => {
      expect(actions.getBondingLevel()).toBe(levels[index]);
    });

    expect(actionSets[0].getBondingLevel()).toBeLessThan(actionSets[4].getBondingLevel());
  });

  it('シナリオ: なつき度レベル毎のアクションセット取得の一貫性', () => {
    const bonding = new Bonding(5, 0);  // レベル5

    const actions1 = repository.getCatActionsByBondingLevel(bonding.getLevel());
    const actions2 = repository.getCatActionsByBondingLevel(bonding.getLevel());
    const actions3 = repository.getCatActionsByBondingLevel(bonding.getLevel());

    expect(actions1.getBondingLevel()).toBe(5);
    expect(actions2.getBondingLevel()).toBe(5);
    expect(actions3.getBondingLevel()).toBe(5);
  });

  it('シナリオ: 全てのなつき度レベルでアクションセットを取得できる', () => {
    for (let level = 0; level <= 10; level++) {
      const actions = repository.getCatActionsByBondingLevel(level);

      expect(actions).toBeDefined();
      expect(actions.getBondingLevel()).toBe(level);
    }
  });
});
