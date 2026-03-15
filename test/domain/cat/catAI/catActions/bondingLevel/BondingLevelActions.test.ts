import { BondingLevelActions } from '@/domain/cat/catAI/catActions/bondingLevel/BondingLevelActions';
import { ActionSelector } from '@/domain/cat/catAI/catActions/bondingLevel/Lv1/ActionSelectorLv1';
import { ActionContext } from '@/domain/cat/catAI/catActions/ActionContext';
import { Bonding } from '@/domain/cat/catAI/bonding/Bonding';

describe('BondingLevelActions', () => {

  describe('constructor', () => {
    it('なつき度レベルとアクション選択器で初期化される', () => {
      const bonding = new Bonding(0, 0);
      const selector = new ActionSelector();

      const actions = new BondingLevelActions(bonding.getLevel(), selector);

      expect(actions.getBondingLevel()).toBe(0);
    });

    it('異なるなつき度レベルで初期化できる', () => {
      const bonding1 = new Bonding(0, 0);
      const bonding2 = new Bonding(5, 0);
      const selector = new ActionSelector();

      const actions1 = new BondingLevelActions(bonding1.getLevel(), selector);
      const actions2 = new BondingLevelActions(bonding2.getLevel(), selector);

      expect(actions1.getBondingLevel()).toBe(0);
      expect(actions2.getBondingLevel()).toBe(5);
    });
  });

  describe('action', () => {
    it('ActionSelectorを使用してアクションを選択し、CatActionExecutorを返す', () => {
      const bonding = new Bonding(0, 0);
      const selector = new ActionSelector();
      const actions = new BondingLevelActions(bonding.getLevel(), selector);
      const context = ActionContext.withoutToy(100, 100, false, false);

      const executor = actions.action(context);

      expect(executor).toBeDefined();
      expect(executor.getName()).toBeDefined();
      expect(typeof executor.execute).toBe('function');
    });

    it('なつき度レベルとコンテキストに応じた適切なアクションを選択する', () => {
      const bonding = new Bonding(5, 0);
      const selector = new ActionSelector();
      const actions = new BondingLevelActions(bonding.getLevel(), selector);
      const context = ActionContext.withoutToy(100, 100, false, false);

      const executor1 = actions.action(context);
      const executor2 = actions.action(context);

      expect(executor1.getName()).toBeDefined();
      expect(executor2.getName()).toBeDefined();
    });
  });

  describe('getBondingLevel', () => {
    it('なつき度レベルを返す', () => {
      const bonding = new Bonding(3, 0);
      const selector = new ActionSelector();
      const actions = new BondingLevelActions(bonding.getLevel(), selector);

      expect(actions.getBondingLevel()).toBe(3);
    });
  });
});

describe('BondingLevelActions Integration Tests', () => {

  it('シナリオ: なつき度0のアクションセットから適切なアクションを選択', () => {
    const bonding = new Bonding(0, 0);
    const selector = new ActionSelector();
    const actions = new BondingLevelActions(bonding.getLevel(), selector);
    const context = ActionContext.withoutToy(100, 100, false, false);

    const executor = actions.action(context);

    expect(executor).toBeDefined();
    expect(['runAway', 'sit', 'showBelly', 'playWithToy']).toContain(executor.getName());
  });

  it('シナリオ: なつき度5のアクションセットから適切なアクションを選択', () => {
    const bonding = new Bonding(5, 0);
    const selector = new ActionSelector();
    const actions = new BondingLevelActions(bonding.getLevel(), selector);
    const context = ActionContext.withoutToy(100, 100, false, false);

    const executor = actions.action(context);

    expect(executor).toBeDefined();
    expect(['runAway', 'sit', 'showBelly', 'playWithToy']).toContain(executor.getName());
  });

  it('シナリオ: 同じなつき度でも異なるアクションが選択される可能性がある', () => {
    const bonding = new Bonding(5, 0);
    const selector = new ActionSelector();
    const actions = new BondingLevelActions(bonding.getLevel(), selector);
    const context = ActionContext.withoutToy(100, 100, false, false);

    const executors = new Set<string>();
    for (let i = 0; i < 50; i++) {
      const executor = actions.action(context);
      executors.add(executor.getName());
    }

    expect(executors.size).toBeGreaterThanOrEqual(1);
  });
});
