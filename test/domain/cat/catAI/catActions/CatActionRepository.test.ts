import { CatActionRepository } from '@/domain/cat/catAI/catActions/CatActionRepository';
import { Bonding } from '@/domain/cat/catAI/bonding/Bonding';

describe('CatActionRepository', () => {
  let repository: CatActionRepository;

  beforeEach(() => {
    repository = new CatActionRepository();
  });

  describe('getCatActionsByBondingLevel', () => {
    it('なつき度レベル0のアクションセットを取得できる（Lv1にフォールバック）', () => {
      const bonding = new Bonding(0, 0);

      const actions = repository.getCatActionsByBondingLevel(bonding.getLevel());

      expect(actions).toBeDefined();
      expect(actions.getBondingLevel()).toBe(1);
    });

    it('なつき度レベル4のアクションセットを取得できる', () => {
      const bonding = new Bonding(4, 0);

      const actions = repository.getCatActionsByBondingLevel(bonding.getLevel());

      expect(actions).toBeDefined();
      expect(actions.getBondingLevel()).toBe(4);
    });

    it('なつき度レベル5以上はLv4のアクションセットにフォールバックする', () => {
      const bonding5 = new Bonding(5, 0);
      const bonding10 = new Bonding(10, 0);

      const actions5 = repository.getCatActionsByBondingLevel(bonding5.getLevel());
      const actions10 = repository.getCatActionsByBondingLevel(bonding10.getLevel());

      expect(actions5).toBeDefined();
      expect(actions5.getBondingLevel()).toBe(4);
      expect(actions10).toBeDefined();
      expect(actions10.getBondingLevel()).toBe(4);
    });

    it('異なるなつき度レベルで異なるアクションセットを返す', () => {
      const bonding1 = new Bonding(1, 0);
      const bonding2 = new Bonding(2, 0);

      const actions1 = repository.getCatActionsByBondingLevel(bonding1.getLevel());
      const actions2 = repository.getCatActionsByBondingLevel(bonding2.getLevel());

      expect(actions1.getBondingLevel()).not.toBe(actions2.getBondingLevel());
    });

    it('同じなつき度レベルで同じアクションセットを返す（キャッシュ動作）', () => {
      const bonding = new Bonding(3, 0);

      const actions1 = repository.getCatActionsByBondingLevel(bonding.getLevel());
      const actions2 = repository.getCatActionsByBondingLevel(bonding.getLevel());

      expect(actions1.getBondingLevel()).toBe(actions2.getBondingLevel());
      expect(actions1.getBondingLevel()).toBe(3);
    });
  });

  describe('境界値テスト', () => {
    it('なつき度レベル0（最小値）で正常に動作する（Lv1にフォールバック）', () => {
      const actions = repository.getCatActionsByBondingLevel(0);

      expect(actions).toBeDefined();
      expect(actions.getBondingLevel()).toBe(1);
    });

    it('なつき度レベル10（最大値）で正常に動作する（Lv4にフォールバック）', () => {
      const actions = repository.getCatActionsByBondingLevel(10);

      expect(actions).toBeDefined();
      expect(actions.getBondingLevel()).toBe(4);
    });
  });
});

describe('CatActionRepository Integration Tests', () => {
  let repository: CatActionRepository;

  beforeEach(() => {
    repository = new CatActionRepository();
  });

  it('シナリオ: なつき度が上昇するにつれて異なるアクションセットを取得', () => {
    const levels = [1, 2, 3, 4];
    const actionSets = levels.map(level =>
      repository.getCatActionsByBondingLevel(level)
    );

    actionSets.forEach((actions, index) => {
      expect(actions.getBondingLevel()).toBe(levels[index]);
    });

    expect(actionSets[0].getBondingLevel()).toBeLessThan(actionSets[3].getBondingLevel());
  });

  it('シナリオ: なつき度レベル毎のアクションセット取得の一貫性', () => {
    const bonding = new Bonding(3, 0);

    const actions1 = repository.getCatActionsByBondingLevel(bonding.getLevel());
    const actions2 = repository.getCatActionsByBondingLevel(bonding.getLevel());
    const actions3 = repository.getCatActionsByBondingLevel(bonding.getLevel());

    expect(actions1.getBondingLevel()).toBe(3);
    expect(actions2.getBondingLevel()).toBe(3);
    expect(actions3.getBondingLevel()).toBe(3);
  });

  it('シナリオ: 全てのなつき度レベルでアクションセットを取得できる', () => {
    for (let level = 0; level <= 10; level++) {
      const actions = repository.getCatActionsByBondingLevel(level);
      const expectedLevel = level === 0 ? 1 : (level <= 4 ? level : 4);

      expect(actions).toBeDefined();
      expect(actions.getBondingLevel()).toBe(expectedLevel);
    }
  });
});
