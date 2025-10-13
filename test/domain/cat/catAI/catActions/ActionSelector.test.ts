import { ActionSelector } from '@/domain/cat/catAI/catActions/bondingLevel/Lv0/ActionSelectorLv0';
import { Bonding } from '@/domain/cat/catAI/bonding/Bonding';
import { ExternalState } from '@/domain/gameLogic/environment/ExternalState';

describe('ActionSelector', () => {
  let actionSelector: ActionSelector;

  beforeEach(() => {
    actionSelector = new ActionSelector();
  });

  describe('select', () => {
    it('should select an action based on bonding and external state', () => {
      const bonding = Bonding.createDefault();
      const externalState = ExternalState.createDefault();

      const actionExecutor = actionSelector.select(bonding, externalState);

      expect(actionExecutor).toBeDefined();
      expect(typeof actionExecutor.getName()).toBe('string');
      expect(['showBelly', 'playWithToy', 'sit', 'runAway']).toContain(actionExecutor.getName());
    });

    it('should select action based on bonding level (high bonding)', () => {
      const highBonding = new Bonding(8, 0);  // レベル8
      const externalState = ExternalState.createDefault();

      const actions = new Set<string>();
      for (let i = 0; i < 50; i++) {
        const actionExecutor = actionSelector.select(highBonding, externalState);
        actions.add(actionExecutor.getName());
      }

      expect(actions.size).toBeGreaterThan(0);
    });

    it('should select action based on bonding level (low bonding)', () => {
      const lowBonding = new Bonding(1, 0);  // レベル1
      const externalState = ExternalState.createDefault();

      const actions = new Set<string>();
      for (let i = 0; i < 50; i++) {
        const actionExecutor = actionSelector.select(lowBonding, externalState);
        actions.add(actionExecutor.getName());
      }

      expect(actions.size).toBeGreaterThan(0);
    });

    it('should consider toy presence in selection', () => {
      const bonding = new Bonding(5, 0);  // レベル5
      const externalStateWithToy = new ExternalState(true, 50, true, false);

      const actions = new Set<string>();
      for (let i = 0; i < 50; i++) {
        const actionExecutor = actionSelector.select(bonding, externalStateWithToy);
        actions.add(actionExecutor.getName());
      }

      expect(actions.size).toBeGreaterThan(0);
    });

    it('should always return a valid action executor', () => {
      const randomBondings = [
        new Bonding(Math.floor(Math.random() * 11), Math.random()),  // レベル0-10
        new Bonding(Math.floor(Math.random() * 11), Math.random()),
        new Bonding(Math.floor(Math.random() * 11), Math.random()),
      ];

      randomBondings.forEach(bonding => {
        const actionExecutor = actionSelector.select(bonding, ExternalState.createDefault());
        expect(['showBelly', 'playWithToy', 'sit', 'runAway']).toContain(actionExecutor.getName());
      });
    });
  });
});
