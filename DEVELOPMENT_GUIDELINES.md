# Development Guidelines

このドキュメントは、本プロジェクトの開発における技術的な規約とベストプラクティスを定義します。

## ステップ数の考え方

ゲーム内の状態更新は、フレーム単位ではなく時間ベースで管理します。

### 基本原則

- **時間ベースの更新**: 状態更新処理は1秒あたりの変化量で定義する
- **FPS非依存**: 更新を指示する側はFPS（フレームレート）を意識せずにコーディング
- **実装の分離**: 更新指示と実行を分離し、実行側でFPS計算を処理

### 実装例

```typescript
// ❌ FPSを意識した実装（避ける）
cat.energy += 0.017; // 60FPS前提の値

// ✅ 時間ベースの実装（推奨）
const energyRecoveryPerSecond = 1.0;
cat.energy += energyRecoveryPerSecond / fps;
```

### 実装ガイドライン

1. 状態変更は「1秒あたりの変化量」として定義
2. 実行時にFPSで割って実際の更新量を計算
3. 処理遅延を考慮し、実時間ではなくゲーム内時間を使用

## Configuration設計

AI猫の行動決定における重み計算は、外部設定で調整可能にします。

### 行動決定フロー

```
外部状態 → 内部状態 → 感情 → アクション選択
```

### 設定構造

重み計算は行列計算モデルで、以下の要素で構成：

```typescript
interface WeightConfig {
  weights: number[][];  // 重み行列
  bias: number[];      // バイアス項
  inputs: string[];    // 入力変数名
  outputs: string[];   // 出力変数名
}
```

### 実装原則

- **設定による調整**: 重み・バイアス値は外部configで管理
- **ドメイン固有実装**: 計算処理は各ドメインに適した場所に実装
- **汎用化の回避**: `CalculationManager`のような汎用クラスでの一元管理は行わない

### 設定例

```json
{
  "emotionCalculation": {
    "weights": [[0.8, 0.2], [0.3, 0.7]],
    "bias": [0.1, -0.1],
    "inputs": ["hunger", "energy"],
    "outputs": ["happiness", "sleepiness"]
  }
}
```

## ドメイン駆動設計

プロジェクトアーキテクチャは、ドメイン駆動設計（DDD）に基づきます。

### 設計指針

- **ドメインモデル**: `ドメインモデル.drawio`（`ドメインモデル.png`）に定義された構造に従う
- **境界の明確化**: ドメイン間の責務を明確に分離
- **ビジネスロジック**: ドメインオブジェクト内にビジネスルールを配置

### ディレクトリ構成

```
src/
├── domain/          # ドメインモデル
├── application/     # アプリケーションサービス
├── infrastructure/  # インフラストラクチャ層
└── presentation/    # プレゼンテーション層
```

## 商用リリース品質

本プロジェクトは商用リリースを前提とした品質を維持します。

### コード品質基準

#### コメント

- **不要なコメント**: 実装の「what」を説明するコメントは削除
- **意味のあるコメント**: 「why」を説明するコメントは許容
- **自己文書化**: 変数名・メソッド名で意図を明確に表現

```typescript
// ❌ 不要なコメント
let catEnergy = 100; // 猫のエネルギーを100に設定

// ✅ 意味のあるコメント
let catEnergy = 100; // 満腹時のエネルギー上限値
```

#### ログ出力

- **本番用ログ**: エラーログ・警告ログは適切に出力
- **調査用ログ**: 開発・デバッグ用の一時的なログは許容
- **無駄なログ**: 意味のない情報ログは削除

```typescript
// ✅ 適切なログ
console.error('Failed to load cat data:', error);
console.warn('Cat energy below threshold:', energy);

// ❌ 不要なログ
console.log('Function started'); // 削除する
```

## ステート管理方針

### 基本原則

ステート管理は以下の原則に基づいて実装します：

- **セッションによる状態永続化**: ユーザーのねこの状態はセッション（iron-session）で管理
- **ゲームのステートレス化**: CatGame.ts（Phaser）はステートレスに保つ
- **状態の受け渡し**: ゲーム開始時に状態を受け取り、終了時に状態を保存

### アーキテクチャ

```
Next.js (Session管理) ⇄ Phaser (ゲームロジック)
       ↑                     ↓
   セッション状態        ステートレス実行
```

### 実装ルール

#### セッション管理

- **データ範囲**: ユーザー名とねこの内部状態のみを保存
- **個人情報**: 個人情報は取得せず、一時的なセッション管理のみ
- **セキュリティ**: iron-sessionで暗号化されたCookieを使用

#### ゲームの状態管理

- **初期化**: ゲーム開始時にセッションから状態を読み込み
- **終了処理**: ゲーム終了時に現在の状態をセッションに保存
- **切り替え**: おもちゃの再選択等は必ず終了→開始の順で実行

#### API設計

```typescript
// 状態取得
GET /api/cat-state
Response: { catState: CatState | null }

// 状態保存
POST /api/cat-state
Body: { catState: CatState }
```

#### 状態構造

```typescript
interface CatState {
  bonding: number;      // なつき度 (-1 to 1)
  playfulness: number;  // 遊び欲 (-1 to 1)
  fear: number;        // 恐怖度 (-1 to 1)
  personality: Personality;  // 性格特性
  preferences: Preferences;  // 好み設定
}
```

### 実装例

```typescript
// ゲーム開始時
const catGame = new CatGame({
  initialCatState: sessionCatState,
  onGameEnd: async () => {
    await saveCatStateToSession();
  }
});

// 状態保存
const currentState = catGame.getCurrentCatState();
await fetch('/api/cat-state', {
  method: 'POST',
  body: JSON.stringify({ catState: currentState })
});
```

## 開発プロセス

### コードレビュー観点

1. **ステップ数管理**: 時間ベースの実装になっているか
2. **Config設計**: 重み計算が適切に外部化されているか
3. **DDD準拠**: ドメインモデルに従った実装か
4. **ステート管理**: セッション管理が適切に実装されているか
5. **商用品質**: 不要なコメント・ログが含まれていないか

### 品質チェック

- 実装前にドメインモデルとの整合性を確認
- コード完成後、不要な要素の削除を実施
- 設定ファイルでの調整可能性を検証
- セッション管理の動作確認を実施

---

このガイドラインに従って、保守性が高く商用品質のコードを作成してください。