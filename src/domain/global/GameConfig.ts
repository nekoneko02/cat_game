/**
 * ゲーム設定クラス
 * ゲーム画面のサイズなどの設定を管理
 *
 * @package Global
 */
export class GameConfig {
  private static instance: GameConfig | null = null;
  private readonly gameWidth: number = 800;
  private readonly gameHeight: number = 600;

  /**
   * @package コンストラクタは外部非公開（package private）
   * @internal Singletonパターン: getInstance()からのみアクセス可能
   */
  private constructor() {}

  /**
   * シングルトンインスタンスを取得
   */
  static getInstance(): GameConfig {
    if (!GameConfig.instance) {
      GameConfig.instance = new GameConfig();
    }
    return GameConfig.instance;
  }

  /**
   * ゲーム画面のサイズを取得
   * @returns {width: number, height: number} 画面の幅と高さ
   */
  getGameScreenSize(): { width: number; height: number } {
    return {
      width: this.gameWidth,
      height: this.gameHeight,
    };
  }
}
