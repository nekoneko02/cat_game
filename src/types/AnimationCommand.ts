/**
 * アニメーションコマンドの型定義
 */
export interface AnimationCommand {
  animationKey: string;  // configで定義されたアニメーションキー
  repeat: number;        // 繰り返し回数: -1=無限, 0=1回, n=n+1回
}