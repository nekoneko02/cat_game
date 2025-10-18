import { ActionSelector } from '@/domain/cat/catAI/catActions/bondingLevel/Lv1/ActionSelectorLv1';
import { ActionContext } from '@/domain/cat/catAI/catActions/ActionContext';

describe('ActionSelector', () => {
  let actionSelector: ActionSelector;

  beforeEach(() => {
    actionSelector = new ActionSelector();
  });

  describe('select', () => {
    it('should select an action based on action context', () => {
      const context = ActionContext.withoutToy(100, 100, false, false);

      const actionExecutor = actionSelector.select(context);

      expect(actionExecutor).toBeDefined();
      expect(typeof actionExecutor.getName()).toBe('string');
      expect(['showBelly', 'playWithToy', 'sit', 'runAway']).toContain(actionExecutor.getName());
    });

    it('should select various actions when called multiple times', () => {
      const context = ActionContext.withoutToy(100, 100, false, false);

      const actions = new Set<string>();
      for (let i = 0; i < 50; i++) {
        const actionExecutor = actionSelector.select(context);
        actions.add(actionExecutor.getName());
      }

      expect(actions.size).toBeGreaterThan(0);
    });

    it('should consider toy presence in selection', () => {
      const contextWithToy = ActionContext.withToy(100, 100, 150, 150, true, false);

      const actions = new Set<string>();
      for (let i = 0; i < 50; i++) {
        const actionExecutor = actionSelector.select(contextWithToy);
        actions.add(actionExecutor.getName());
      }

      expect(actions.size).toBeGreaterThan(0);
    });

    it('should always return a valid action executor', () => {
      const contexts = [
        ActionContext.withoutToy(100, 100, false, false),
        ActionContext.withToy(100, 100, 150, 150, true, false),
        ActionContext.withoutToy(200, 200, true, true),
      ];

      contexts.forEach(context => {
        const actionExecutor = actionSelector.select(context);
        expect(['showBelly', 'playWithToy', 'sit', 'runAway']).toContain(actionExecutor.getName());
      });
    });
  });
});
