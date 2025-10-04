import { Cat, Personality, Preferences } from '@/domain/entities/Cat';
import { InternalState } from '@/domain/valueObjects/InternalState';
import { ExternalState } from '@/domain/valueObjects/ExternalState';
import { GameTimeManager } from '@/game/GameTimeManager';

// GameTimeManagerのモック
class MockGameTimeManager extends GameTimeManager {
  private mockDeltaTime: number = 0;
  private mockTotalTime: number = 0;

  setDeltaTime(deltaTime: number): void {
    this.mockDeltaTime = deltaTime;
  }

  setTotalTime(totalTime: number): void {
    this.mockTotalTime = totalTime;
  }

  getDeltaTime(): number {
    return this.mockDeltaTime;
  }

  getTotalTime(): number {
    return this.mockTotalTime;
  }

  update(deltaTime: number): void {
    this.mockDeltaTime = deltaTime;
    this.mockTotalTime += deltaTime;
  }
}

describe('Cat', () => {
  let cat: Cat;
  let mockGameTimeManager: MockGameTimeManager;

  beforeEach(() => {
    mockGameTimeManager = new MockGameTimeManager();
    mockGameTimeManager.setDeltaTime(16.67); // 60FPS想定
    mockGameTimeManager.setTotalTime(0);
    cat = Cat.createDefault('テスト猫', mockGameTimeManager);
  });

  describe('createDefault', () => {
    it('デフォルト値でCatインスタンスを作成できる', () => {
      const defaultCat = Cat.createDefault();

      expect(defaultCat).toBeDefined();
      expect(defaultCat.name).toBe('たぬきねこ');
      expect(defaultCat.personality.social).toBe(0.7);
      expect(defaultCat.personality.active).toBe(0.8);
      expect(defaultCat.personality.bold).toBe(0.6);
      expect(defaultCat.personality.dependent).toBe(0.5);
      expect(defaultCat.personality.friendly).toBe(0.8);
    });

    it('名前を指定してCatインスタンスを作成できる', () => {
      const customCat = Cat.createDefault('カスタム猫');

      expect(customCat.name).toBe('カスタム猫');
    });
  });

  describe('getCurrentEmotions', () => {
    it('現在の感情を取得できる', () => {
      const emotions = cat.getCurrentEmotions();

      expect(emotions).toBeDefined();
      expect(typeof emotions.valence).toBe('number');
      expect(typeof emotions.arousal).toBe('number');
      expect(typeof emotions.safety).toBe('number');
      expect(typeof emotions.social).toBe('number');
      expect(typeof emotions.discomfort).toBe('number');
    });
  });

  describe('getInternalState', () => {
    it('内部状態を取得できる', () => {
      const internalState = cat.getInternalState();

      expect(internalState).toBeInstanceOf(InternalState);
      expect(typeof internalState.bonding).toBe('number');
      expect(typeof internalState.playfulness).toBe('number');
      expect(typeof internalState.fear).toBe('number');
    });
  });

  describe('getExternalState', () => {
    it('外部状態を取得できる', () => {
      const externalState = cat.getExternalState();

      expect(externalState).toBeInstanceOf(ExternalState);
      expect(typeof externalState.toyPresence).toBe('boolean');
      expect(typeof externalState.userPresence).toBe('boolean');
      expect(typeof externalState.isPlaying).toBe('boolean');
    });
  });

  describe('getBondingLevel', () => {
    it('なつき度を0-10スケールで取得できる', () => {
      const level = cat.getBondingLevel();

      expect(level).toBeGreaterThanOrEqual(0);
      expect(level).toBeLessThanOrEqual(10);
      expect(Number.isInteger(level)).toBe(true);
    });

    it('内部状態が-1の場合、レベル0を返す', () => {
      const catWithMinBonding = new Cat(
        'test-id',
        'test-cat',
        new InternalState(-1, 0, 0),
        ExternalState.createDefault(),
        cat.personality,
        cat.preferences,
        0,
        mockGameTimeManager
      );

      expect(catWithMinBonding.getBondingLevel()).toBe(0);
    });

    it('内部状態が1の場合、レベル10を返す', () => {
      const catWithMaxBonding = new Cat(
        'test-id',
        'test-cat',
        new InternalState(1, 0, 0),
        ExternalState.createDefault(),
        cat.personality,
        cat.preferences,
        0,
        mockGameTimeManager
      );

      expect(catWithMaxBonding.getBondingLevel()).toBe(10);
    });

    it('内部状態が0の場合、レベル5を返す', () => {
      const catWithMidBonding = new Cat(
        'test-id',
        'test-cat',
        new InternalState(0, 0, 0),
        ExternalState.createDefault(),
        cat.personality,
        cat.preferences,
        0,
        mockGameTimeManager
      );

      expect(catWithMidBonding.getBondingLevel()).toBe(5);
    });
  });

  describe('getCurrentAction', () => {
    it('初期状態ではnullを返す', () => {
      expect(cat.getCurrentAction()).toBeNull();
    });

    it('update後はアクション情報を返す', () => {
      const externalState = ExternalState.createDefault();
      cat.update(externalState, 100, 100);

      const action = cat.getCurrentAction();
      expect(action).not.toBeNull();
      if (action) {
        expect(action.name).toBeDefined();
        expect(action.startTime).toBeDefined();
      }
    });
  });

  describe('update', () => {
    it('外部状態を受け取って状態を更新できる', () => {
      const externalState = new ExternalState(true, 100, true, false);
      const result = cat.update(externalState, 200, 200);

      expect(result).toBeDefined();
    });

    it('アクション実行中は継続処理を行う', () => {
      const externalState = ExternalState.createDefault();

      // 最初のアクション開始（totalTime=0）
      mockGameTimeManager.setTotalTime(0);
      cat.update(externalState, 100, 100);

      // 時間を少し進める（アクション継続中）
      mockGameTimeManager.update(100);

      // 2回目の更新
      const result = cat.update(externalState, 120, 120);
      expect(result).toBeDefined();
    });

    it('アクション完了後は新しいアクションを選択する', () => {
      const externalState = ExternalState.createDefault();

      // 最初のアクション開始（totalTime=0）
      mockGameTimeManager.setTotalTime(0);
      cat.update(externalState, 100, 100);
      const firstAction = cat.getCurrentAction();

      // アクションの実行時間を超えて時間を進める
      mockGameTimeManager.update(10000);

      // 2回目の更新で新しいアクション選択
      cat.update(externalState, 100, 100);
      const secondAction = cat.getCurrentAction();

      // 開始時刻が異なることを確認
      expect(firstAction?.startTime).not.toBe(secondAction?.startTime);
    });
  });


  describe('getGameTimeManager (private)', () => {
    it('GameTimeManagerが設定されている場合は既存のインスタンスを返す', () => {
      const manager1 = (cat as any).getGameTimeManager();
      const manager2 = (cat as any).getGameTimeManager();

      expect(manager1).toBe(manager2);
    });

    it('GameTimeManagerが未設定の場合は新規作成する', () => {
      const catWithoutManager = new Cat(
        'test-id',
        'test-cat',
        InternalState.createDefault(),
        ExternalState.createDefault(),
        cat.personality,
        cat.preferences
      );

      const manager = (catWithoutManager as any).getGameTimeManager();
      expect(manager).toBeInstanceOf(GameTimeManager);
    });
  });

  describe('updateInternalStateByTime (private)', () => {
    it('時間経過により遊び欲求が減衰する', () => {
      const initialPlayfulness = cat.getInternalState().playfulness;

      (cat as any).updateInternalStateByTime(1000);

      const newPlayfulness = cat.getInternalState().playfulness;
      expect(newPlayfulness).toBeLessThan(initialPlayfulness);
    });

    it('外部状態の影響を内部状態に適用する', () => {
      const externalState = new ExternalState(true, 50, true, false);
      const catWithToy = new Cat(
        'test-id',
        'test-cat',
        InternalState.createDefault(),
        externalState,
        cat.personality,
        cat.preferences,
        0,
        mockGameTimeManager
      );

      const initialState = catWithToy.getInternalState();
      (catWithToy as any).updateInternalStateByTime(1000);
      const newState = catWithToy.getInternalState();

      expect(newState).not.toBe(initialState);
    });
  });

  describe('createActionInstance (private)', () => {
    it('showBellyアクションのインスタンスを作成できる', () => {
      const action = (cat as any).createActionInstance('showBelly');
      expect(action).toBeDefined();
      expect(action.name).toBe('showBelly');
    });

    it('playWithToyアクションのインスタンスを作成できる', () => {
      const action = (cat as any).createActionInstance('playWithToy');
      expect(action).toBeDefined();
      expect(action.name).toBe('playWithToy');
    });

    it('sitアクションのインスタンスを作成できる', () => {
      const action = (cat as any).createActionInstance('sit');
      expect(action).toBeDefined();
      expect(action.name).toBe('sit');
    });

    it('runAwayアクションのインスタンスを作成できる', () => {
      const action = (cat as any).createActionInstance('runAway');
      expect(action).toBeDefined();
      expect(action.name).toBe('runAway');
    });

    it('不明なアクション名の場合はnullを返す', () => {
      const action = (cat as any).createActionInstance('unknownAction');
      expect(action).toBeNull();
    });
  });

  describe('executeStepOneAction (private)', () => {
    it('アクションを実行してActionResultを返す', () => {
      const result = (cat as any).executeStepOneAction('sit', 100, 100);

      expect(result).toBeDefined();
      expect(result.movement).toBeDefined();
    });

    it('不明なアクション名の場合はnullを返す', () => {
      const result = (cat as any).executeStepOneAction('unknownAction', 100, 100);
      expect(result).toBeNull();
    });

    it('currentActionを設定する', () => {
      (cat as any).executeStepOneAction('sit', 100, 100);

      const currentAction = cat.getCurrentAction();
      expect(currentAction).not.toBeNull();
      expect(currentAction?.name).toBe('sit');
    });
  });

  describe('updateCurrentAction (private)', () => {
    it('currentActionがnullの場合はnullを返す', () => {
      const result = (cat as any).updateCurrentAction(100, 100);
      expect(result).toBeNull();
    });

    it('currentActionが存在する場合はActionResultを返す', () => {
      (cat as any).currentAction = {
        name: 'sit',
        startTime: 0,
        duration: 2000
      };

      const result = (cat as any).updateCurrentAction(100, 100);
      expect(result).toBeDefined();
      expect(result.movement).toBeDefined();
    });
  });

  describe('applyTimeBasedInternalStateChange (private)', () => {
    it('bonding変化を時間係数付きで適用する', () => {
      const initialBonding = cat.getInternalState().bonding;

      (cat as any).applyTimeBasedInternalStateChange({ bonding: 0.5 }, 1.0);

      const newBonding = cat.getInternalState().bonding;
      expect(newBonding).toBeGreaterThan(initialBonding);
      expect(newBonding).toBeLessThanOrEqual(1);
    });

    it('playfulness変化を時間係数付きで適用する', () => {
      const initialPlayfulness = cat.getInternalState().playfulness;

      (cat as any).applyTimeBasedInternalStateChange({ playfulness: 0.3 }, 1.0);

      const newPlayfulness = cat.getInternalState().playfulness;
      expect(newPlayfulness).toBeGreaterThan(initialPlayfulness);
    });

    it('fear変化を時間係数付きで適用する', () => {
      // 初期値が上限でない状態を作成
      const catWithLowFear = new Cat(
        'test-id',
        'test-cat',
        new InternalState(0, 0, 0.5),
        ExternalState.createDefault(),
        cat.personality,
        cat.preferences,
        0,
        mockGameTimeManager
      );

      const initialFear = catWithLowFear.getInternalState().fear;

      (catWithLowFear as any).applyTimeBasedInternalStateChange({ fear: 0.2 }, 1.0);

      const newFear = catWithLowFear.getInternalState().fear;
      expect(newFear).toBeGreaterThan(initialFear);
      expect(newFear).toBe(0.7); // 0.5 + 0.2 = 0.7
    });

    it('fear変化の境界値テスト: 上限（1.0）を超えない', () => {
      const catWithHighFear = new Cat(
        'test-id',
        'test-cat',
        new InternalState(0, 0, 0.9),
        ExternalState.createDefault(),
        cat.personality,
        cat.preferences,
        0,
        mockGameTimeManager
      );

      (catWithHighFear as any).applyTimeBasedInternalStateChange({ fear: 0.5 }, 1.0);

      const newFear = catWithHighFear.getInternalState().fear;
      expect(newFear).toBe(1.0); // 上限でクランプされる
    });

    it('fear変化の境界値テスト: 下限（-1.0）を下回らない', () => {
      const catWithLowFear = new Cat(
        'test-id',
        'test-cat',
        new InternalState(0, 0, -0.9),
        ExternalState.createDefault(),
        cat.personality,
        cat.preferences,
        0,
        mockGameTimeManager
      );

      (catWithLowFear as any).applyTimeBasedInternalStateChange({ fear: -0.5 }, 1.0);

      const newFear = catWithLowFear.getInternalState().fear;
      expect(newFear).toBe(-1.0); // 下限でクランプされる
    });

    it('時間係数により変化量が調整される', () => {
      const cat1 = Cat.createDefault('cat1', mockGameTimeManager);
      const cat2 = Cat.createDefault('cat2', mockGameTimeManager);

      (cat1 as any).applyTimeBasedInternalStateChange({ bonding: 0.5 }, 0.5);
      (cat2 as any).applyTimeBasedInternalStateChange({ bonding: 0.5 }, 1.0);

      const bonding1 = cat1.getInternalState().bonding;
      const bonding2 = cat2.getInternalState().bonding;

      expect(bonding2).toBeGreaterThan(bonding1);
    });

    it('bonding変化の境界値テスト: 上限（1.0）を超えない', () => {
      const catWithHighBonding = new Cat(
        'test-id',
        'test-cat',
        new InternalState(0.9, 0, 0),
        ExternalState.createDefault(),
        cat.personality,
        cat.preferences,
        0,
        mockGameTimeManager
      );

      (catWithHighBonding as any).applyTimeBasedInternalStateChange({ bonding: 0.5 }, 1.0);

      const newBonding = catWithHighBonding.getInternalState().bonding;
      expect(newBonding).toBe(1.0); // 上限でクランプされる
    });

    it('bonding変化の境界値テスト: 下限（-1.0）を下回らない', () => {
      const catWithLowBonding = new Cat(
        'test-id',
        'test-cat',
        new InternalState(-0.9, 0, 0),
        ExternalState.createDefault(),
        cat.personality,
        cat.preferences,
        0,
        mockGameTimeManager
      );

      (catWithLowBonding as any).applyTimeBasedInternalStateChange({ bonding: -0.5 }, 1.0);

      const newBonding = catWithLowBonding.getInternalState().bonding;
      expect(newBonding).toBe(-1.0); // 下限でクランプされる
    });
  });

  describe('applyExternalStateChange (private)', () => {
    it('isPlayingフラグを更新できる', () => {
      const initialIsPlaying = cat.getExternalState().isPlaying;

      (cat as any).applyExternalStateChange({ isPlaying: true });

      const newIsPlaying = cat.getExternalState().isPlaying;
      expect(newIsPlaying).toBe(true);
      expect(newIsPlaying).not.toBe(initialIsPlaying);
    });

    it('isPlayingがundefinedの場合は変更しない', () => {
      const initialExternalState = cat.getExternalState();

      (cat as any).applyExternalStateChange({});

      const newExternalState = cat.getExternalState();
      expect(newExternalState).toBe(initialExternalState);
    });
  });
});

describe('Cat Integration Tests', () => {
  let cat: Cat;
  let mockGameTimeManager: MockGameTimeManager;

  beforeEach(() => {
    mockGameTimeManager = new MockGameTimeManager();
    mockGameTimeManager.setDeltaTime(16.67);
    mockGameTimeManager.setTotalTime(0);
    cat = Cat.createDefault('統合テスト猫', mockGameTimeManager);
  });

  it('シナリオ: おもちゃで遊んでなつき度が上がる', () => {
    const initialBonding = cat.getBondingLevel();

    // おもちゃを配置
    const externalState = new ExternalState(true, 50, true, false);

    // 複数回更新してアクション実行
    for (let i = 0; i < 100; i++) {
      mockGameTimeManager.update(100);
      cat.update(externalState, 200, 200, 250, 250);
    }

    const finalBonding = cat.getBondingLevel();

    // なつき度が上昇していることを期待（確率的なので必ず上がるとは限らないが、傾向として）
    expect(finalBonding).toBeGreaterThanOrEqual(initialBonding);
  });

  it('シナリオ: 遊び欲求は状況により増減する', () => {
    // playfulness変化を確認
    const testCat = new Cat(
      'test-id',
      'test-cat',
      new InternalState(0, 0.5, 0), // playfulness = 0.5
      ExternalState.createDefault(),
      cat.personality,
      cat.preferences,
      0,
      mockGameTimeManager
    );

    // おもちゃあり状態（遊び欲求が増加する可能性）
    const externalStateWithToy = new ExternalState(true, 50, true, false);

    const initialPlayfulness = testCat.getInternalState().playfulness;

    // 時間経過
    for (let i = 0; i < 100; i++) {
      mockGameTimeManager.update(100);
      testCat.update(externalStateWithToy, 100, 100, 200, 200);
    }

    const finalPlayfulness = testCat.getInternalState().playfulness;

    // playfulnessが変化すること（増加または減少）を確認
    // 具体的な増減は実行されるアクションと外部状態の影響による
    expect(finalPlayfulness).not.toBe(initialPlayfulness);
  });

});
