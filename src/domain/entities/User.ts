/**
 * ユーザーエンティティ
 * セッション管理でのみ使用、永続化なし
 */
export class User {
  constructor(
    public readonly id: string,
    public readonly name: string,
    private playHistory: PlaySession[]
  ) {}

  /**
   * 新しいプレイセッションを追加
   */
  addPlaySession(session: PlaySession): User {
    const newHistory = [...this.playHistory, session];
    
    // 履歴の上限管理（最新50セッションまで）
    if (newHistory.length > 50) {
      newHistory.shift();
    }

    return new User(this.id, this.name, newHistory);
  }

  /**
   * プレイ履歴を取得
   */
  getPlayHistory(): PlaySession[] {
    return [...this.playHistory];
  }

  /**
   * 総プレイ時間を取得（分）
   */
  getTotalPlayTime(): number {
    return this.playHistory.reduce((total, session) => {
      return total + session.getDurationMinutes();
    }, 0);
  }

  /**
   * 総プレイセッション数を取得
   */
  getTotalSessions(): number {
    return this.playHistory.length;
  }

  /**
   * 最後のプレイ日時を取得
   */
  getLastPlayDate(): Date | null {
    if (this.playHistory.length === 0) {
      return null;
    }
    
    return this.playHistory[this.playHistory.length - 1].endTime || 
           this.playHistory[this.playHistory.length - 1].startTime;
  }

  /**
   * 平均プレイ時間を取得（分）
   */
  getAveragePlayTime(): number {
    if (this.playHistory.length === 0) {
      return 0;
    }
    
    return this.getTotalPlayTime() / this.playHistory.length;
  }

  /**
   * デフォルトユーザーを作成
   */
  static createDefault(): User {
    return new User(
      'guest-' + Date.now(),
      'ゲスト',
      []
    );
  }

  /**
   * 名前付きユーザーを作成
   */
  static createWithName(name: string): User {
    return new User(
      'user-' + Date.now(),
      name,
      []
    );
  }
}

/**
 * プレイセッション（ゲームプレイの記録）
 */
export class PlaySession {
  constructor(
    public readonly startTime: Date,
    public readonly endTime: Date | null = null,
    public readonly actions: SessionAction[] = [],
    public readonly finalBondingLevel: number = 0
  ) {}

  /**
   * セッションを終了
   */
  end(bondingLevel: number): PlaySession {
    return new PlaySession(
      this.startTime,
      new Date(),
      this.actions,
      bondingLevel
    );
  }

  /**
   * アクションを追加
   */
  addAction(action: SessionAction): PlaySession {
    return new PlaySession(
      this.startTime,
      this.endTime,
      [...this.actions, action],
      this.finalBondingLevel
    );
  }

  /**
   * セッション時間を分で取得
   */
  getDurationMinutes(): number {
    const endTime = this.endTime || new Date();
    return (endTime.getTime() - this.startTime.getTime()) / (1000 * 60);
  }

  /**
   * セッションが進行中かどうか
   */
  isActive(): boolean {
    return this.endTime === null;
  }
}

/**
 * セッション内でのユーザーアクション記録
 */
export class SessionAction {
  constructor(
    public readonly type: 'toySelect' | 'toyRemove' | 'mouseMove' | 'petCat',
    public readonly timestamp: Date,
    public readonly data: Record<string, unknown> = {}
  ) {}

  static toySelect(toyType: string): SessionAction {
    return new SessionAction('toySelect', new Date(), { toyType });
  }

  static toyRemove(): SessionAction {
    return new SessionAction('toyRemove', new Date());
  }

  static mouseMove(x: number, y: number): SessionAction {
    return new SessionAction('mouseMove', new Date(), { x, y });
  }

  static petCat(x: number, y: number): SessionAction {
    return new SessionAction('petCat', new Date(), { x, y });
  }
}