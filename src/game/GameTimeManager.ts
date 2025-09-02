/**
 * ゲーム内時間管理システム
 * 実時間からの影響を受けずにゲーム内時間を管理
 */
export class GameTimeManager {
  private static instance: GameTimeManager | null = null;
  private gameStartTime: number = 0;
  private accumulatedTime: number = 0;
  private lastUpdateTime: number = 0;
  private isPaused: boolean = false;
  private timeScale: number = 1.0;

  private constructor() {
    this.reset();
  }

  static getInstance(): GameTimeManager {
    if (!GameTimeManager.instance) {
      GameTimeManager.instance = new GameTimeManager();
    }
    return GameTimeManager.instance;
  }

  /**
   * ゲーム時間をリセット
   */
  reset(): void {
    this.gameStartTime = performance.now();
    this.accumulatedTime = 0;
    this.lastUpdateTime = performance.now();
    this.isPaused = false;
  }

  /**
   * ゲーム時間を更新
   */
  update(): void {
    if (this.isPaused) return;

    const currentRealTime = performance.now();
    const realDeltaTime = currentRealTime - this.lastUpdateTime;
    const gameDeltaTime = realDeltaTime * this.timeScale;
    
    this.accumulatedTime += gameDeltaTime;
    this.lastUpdateTime = currentRealTime;
  }

  /**
   * 前回の更新からの経過時間（ミリ秒）
   */
  getDeltaTime(): number {
    if (this.isPaused) return 0;
    
    const currentRealTime = performance.now();
    const realDeltaTime = currentRealTime - this.lastUpdateTime;
    return realDeltaTime * this.timeScale;
  }

  /**
   * ゲーム開始からの総経過時間（ミリ秒）
   */
  getTotalTime(): number {
    return this.accumulatedTime;
  }

  /**
   * ゲーム時間の一時停止
   */
  pause(): void {
    this.isPaused = true;
  }

  /**
   * ゲーム時間の再開
   */
  resume(): void {
    if (this.isPaused) {
      this.lastUpdateTime = performance.now();
      this.isPaused = false;
    }
  }

  /**
   * タイムスケール設定（デバッグ用）
   */
  setTimeScale(scale: number): void {
    this.timeScale = Math.max(0, scale);
  }

  /**
   * ゲーム時間が一時停止中かどうか
   */
  isPausedState(): boolean {
    return this.isPaused;
  }
}