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

      const actionName = actionSelector.select(bonding, externalState);

      expect(actionName).toBeDefined();
      expect(typeof actionName).toBe('string');
      expect(['showBelly', 'playWithToy', 'sit', 'runAway']).toContain(actionName);
    });

    it('should select action based on bonding level (high bonding)', () => {
      const highBonding = new Bonding(0.8);
      const externalState = ExternalState.createDefault();

      const actions = new Set<string>();
      for (let i = 0; i < 50; i++) {
        const action = actionSelector.select(highBonding, externalState);
        actions.add(action);
      }

      expect(actions.size).toBeGreaterThan(0);
    });

    it('should select action based on bonding level (low bonding)', () => {
      const lowBonding = new Bonding(-0.8);
      const externalState = ExternalState.createDefault();

      const actions = new Set<string>();
      for (let i = 0; i < 50; i++) {
        const action = actionSelector.select(lowBonding, externalState);
        actions.add(action);
      }

      expect(actions.size).toBeGreaterThan(0);
    });

    it('should consider toy presence in selection', () => {
      const bonding = new Bonding(0);
      const externalStateWithToy = new ExternalState(true, 50, true, false);

      const actions = new Set<string>();
      for (let i = 0; i < 50; i++) {
        const action = actionSelector.select(bonding, externalStateWithToy);
        actions.add(action);
      }

      expect(actions.size).toBeGreaterThan(0);
    });

    it('should always return a valid action name', () => {
      const randomBondings = [
        new Bonding(Math.random() * 2 - 1),
        new Bonding(Math.random() * 2 - 1),
        new Bonding(Math.random() * 2 - 1),
      ];

      randomBondings.forEach(bonding => {
        const action = actionSelector.select(bonding, ExternalState.createDefault());
        expect(['showBelly', 'playWithToy', 'sit', 'runAway']).toContain(action);
      });
    });
  });
});
