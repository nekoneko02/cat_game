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
   * デフォルト状態を作成
   * ※ Cat/CatGame（異なるパッケージ）から使用されるため public として公開
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