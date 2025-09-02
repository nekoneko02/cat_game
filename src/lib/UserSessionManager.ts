import { User, PlaySession, SessionAction } from '@/domain/entities/User';

/**
 * ユーザーセッション管理
 * ブラウザセッション内でのユーザー情報管理
 */
export class UserSessionManager {
  private static instance: UserSessionManager | null = null;
  private currentUser: User;
  private currentSession: PlaySession | null = null;

  private constructor() {
    this.currentUser = this.loadUserFromSession() || User.createDefault();
  }

  /**
   * シングルトンインスタンス取得
   */
  static getInstance(): UserSessionManager {
    if (!UserSessionManager.instance) {
      UserSessionManager.instance = new UserSessionManager();
    }
    return UserSessionManager.instance;
  }

  /**
   * 現在のユーザーを取得
   */
  getCurrentUser(): User {
    return this.currentUser;
  }

  /**
   * ユーザー名を設定
   */
  setUserName(name: string): void {
    this.currentUser = User.createWithName(name);
    this.saveUserToSession();
  }

  /**
   * プレイセッションを開始
   */
  startPlaySession(): void {
    if (this.currentSession && this.currentSession.isActive()) {
      // 既存のアクティブセッションを終了
      this.endPlaySession(0);
    }

    this.currentSession = new PlaySession(new Date());
  }

  /**
   * プレイセッションを終了
   */
  endPlaySession(finalBondingLevel: number): void {
    if (this.currentSession && this.currentSession.isActive()) {
      const endedSession = this.currentSession.end(finalBondingLevel);
      this.currentUser = this.currentUser.addPlaySession(endedSession);
      this.currentSession = null;
      this.saveUserToSession();
    }
  }

  /**
   * セッションにアクションを記録
   */
  recordAction(action: SessionAction): void {
    if (this.currentSession && this.currentSession.isActive()) {
      this.currentSession = this.currentSession.addAction(action);
    }
  }

  /**
   * 現在のセッションを取得
   */
  getCurrentSession(): PlaySession | null {
    return this.currentSession;
  }

  /**
   * セッションストレージからユーザー情報を読み込み
   */
  private loadUserFromSession(): User | null {
    if (typeof window === 'undefined') {
      return null;
    }

    try {
      const userData = sessionStorage.getItem('tanuki-neko-user');
      if (!userData) {
        return null;
      }

      const parsed = JSON.parse(userData);
      const playHistory = parsed.playHistory.map((session: { startTime: string; endTime?: string; actions: unknown[]; finalBondingLevel: number }) => {
        const actions = session.actions.map((action: unknown) => {
          const typedAction = action as { type: string; timestamp: string; data: Record<string, unknown> };
          return new SessionAction(typedAction.type as 'toySelect' | 'toyRemove' | 'mouseMove' | 'petCat', new Date(typedAction.timestamp), typedAction.data);
        });
        
        return new PlaySession(
          new Date(session.startTime),
          session.endTime ? new Date(session.endTime) : null,
          actions,
          session.finalBondingLevel
        );
      });

      return new User(parsed.id, parsed.name, playHistory);
    } catch (error) {
      console.warn('Failed to load user from session:', error);
      return null;
    }
  }

  /**
   * セッションストレージにユーザー情報を保存
   */
  private saveUserToSession(): void {
    if (typeof window === 'undefined') {
      return;
    }

    try {
      const userData = {
        id: this.currentUser.id,
        name: this.currentUser.name,
        playHistory: this.currentUser.getPlayHistory().map(session => ({
          startTime: session.startTime.toISOString(),
          endTime: session.endTime?.toISOString() || null,
          actions: session.actions.map(action => ({
            type: action.type,
            timestamp: action.timestamp.toISOString(),
            data: action.data
          })),
          finalBondingLevel: session.finalBondingLevel
        }))
      };

      sessionStorage.setItem('tanuki-neko-user', JSON.stringify(userData));
    } catch (error) {
      console.warn('Failed to save user to session:', error);
    }
  }

  /**
   * ユーザーデータをクリア
   */
  clearUserData(): void {
    this.currentUser = User.createDefault();
    this.currentSession = null;
    
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('tanuki-neko-user');
    }
  }
}