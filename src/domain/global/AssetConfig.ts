/**
 * アセット設定
 *
 * ゲームアセットのパス管理を担当。
 *
 * @package Global
 */
export class AssetConfig {
  /**
   * @package コンストラクタは外部非公開（package private）
   * @internal GlobalRegistryからのみ生成されるべき
   */
  constructor() {}

  /**
   * アセット名からパスを取得
   *
   * @param assetName - アセット名
   * @returns アセットのパス
   */
  getAssetPath(assetName: string): string {
    // 現時点ではシンプルな実装
    // 将来的にはconfig/assets.jsonから読み込む想定
    return `/assets/${assetName}`;
  }
}
