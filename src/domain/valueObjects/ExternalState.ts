/**
 * ねこの外部状態（環境・状況）
 * ステップ1で使用する状態のみ
 * 値オブジェクト：不変
 */
export class ExternalState {
  constructor(
    public readonly toyPresence: boolean,      // おもちゃの存在
    public readonly toyDistance: number,       // おもちゃとの距離
    public readonly userPresence: boolean,     // ユーザーの存在
    public readonly isPlaying: boolean         // 現在遊び中かどうか
  ) {}

  /**
   * おもちゃ状態を更新した新しいインスタンスを返す
   */
  updateToy(presence: boolean, distance: number = 0): ExternalState {
    return new ExternalState(
      presence,
      distance,
      this.userPresence,
      this.isPlaying
    );
  }

  /**
   * 遊び状態を更新した新しいインスタンスを返す
   */
  updatePlayingState(isPlaying: boolean): ExternalState {
    return new ExternalState(
      this.toyPresence,
      this.toyDistance,
      this.userPresence,
      isPlaying
    );
  }

  /**
   * ユーザー状態を更新した新しいインスタンスを返す
   */
  updateUser(presence: boolean): ExternalState {
    return new ExternalState(
      this.toyPresence,
      this.toyDistance,
      presence,
      this.isPlaying
    );
  }

  /**
   * デフォルト状態を作成
   */
  static createDefault(): ExternalState {
    return new ExternalState(
      false, // toyPresence - おもちゃの存在
      0,     // toyDistance - おもちゃとの距離
      true,  // userPresence - ユーザーの存在
      false  // isPlaying - 現在遊び中かどうか
    );
  }
}