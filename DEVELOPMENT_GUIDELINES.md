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

### 移動速度の実装

移動速度の管理には`MovementSpeed`クラス（ゲームロジックpackage）を使用します。

#### 責務分担

- **ねこクラス（ドメイン層）**: 1秒あたりの移動量を扱う
- **CatGame（ゲームロジック層）**: `MovementSpeed`を使って1フレームあたりの移動量に変換

#### 実装例

```typescript
// ❌ アクション側でフレーム単位の移動量を計算（避ける）
export class PlayWithToyAction extends CatActionExecutor {
  execute(context: ActionContext): ActionMovement {
    const toyMovement = context.getToyMovementDelta()!;
    return {
      deltaX: toyMovement.deltaX, // おもちゃまでの総距離（誤り）
      deltaY: toyMovement.deltaY,
      speed: 200
    };
  }
}

// ✅ 1秒あたりの移動速度を定義し、実行側でフレーム単位に変換（推奨）
export class PlayWithToyAction extends CatActionExecutor {
  execute(context: ActionContext): ActionMovement {
    const direction = context.getToyDirection()!; // 正規化された方向ベクトル
    const speedPerSecond = 200; // 1秒あたりの移動速度（ピクセル/秒）

    return {
      deltaX: direction.x * speedPerSecond, // 1秒あたりの移動量
      deltaY: direction.y * speedPerSecond,
      speed: speedPerSecond
    };
  }
}

// CatGame側でMovementSpeedを使用
const movementSpeed = new MovementSpeed(actionResult.movement.speed);
const deltaXPerFrame = actionResult.movement.deltaX * movementSpeed.getSpeedPerFrame(60) / actionResult.movement.speed;
const deltaYPerFrame = actionResult.movement.deltaY * movementSpeed.getSpeedPerFrame(60) / actionResult.movement.speed;
```

#### 設計原則

1. **アクション定義**: 方向と1秒あたりの速度を返す
2. **ねこクラス**: 1秒あたりの移動量で位置を更新
3. **CatGame**: フレームレートを考慮した移動量をねこに渡す

## Configuration設計

AI猫の行動決定における重み計算は、外部設定で調整可能にします。

### 行動決定フロー

```
外部状態 → 内部状態 → 感情 → アクション選択
```

### 実装原則

- **ドメイン固有実装**: 計算処理は各ドメインに適した場所に実装
- **汎用化の回避**: `CalculationManager`のような汎用クラスでの一元管理は行わない

## ドメイン駆動設計

プロジェクトアーキテクチャは、ドメイン駆動設計（DDD）に基づきます。

### 設計指針

- **クラス図**: `docs/クラス図.pu`に定義された構造に従う
  - public/package privateなメソッドは必ず記載すること
  - アクセス修飾子は最小限を原則とする
- **境界の明確化**: ドメイン間の責務を明確に分離
- **ビジネスロジック**: ドメインオブジェクト内にビジネスルールを配置
- **通知パターン**: Observerパターンを用いた状態変化の伝播
  - `外部状態通知`: 環境の変化を各システムに通知
  - `感情変化通知`: 感情の変化をアクション選択に通知
  - `なつき度通知`: なつき度の変化をUIに通知

### クラス図と実装の同期原則

プロジェクトの設計意図を明確にし、保守性を高めるため、クラス図と実装の同期を保つことが重要です。

#### 記載ルール

1. **クラス図に記載すべき要素**
   - **Public メソッド・プロパティ**: すべて記載する
   - **Package Private メソッド・プロパティ**: すべて記載する
     - クラス間の協調動作を明確にするため
     - ドメインモデルの理解を促進するため
   - **Private メソッド・プロパティ**: 記載不要
     - 実装の詳細であり、クラス図の目的外

2. **実装時の義務**
   - 新規にpublic/package privateなメソッド・プロパティを追加した場合、クラス図も同時に更新する
   - リファクタリングでメソッド・プロパティを削除・変更した場合も、クラス図を更新する

3. **レビュー観点**
   - コードレビュー時に、クラス図との整合性を確認する
   - クラス図と実装のギャップを発見した場合は、速やかに修正する

#### ギャップ分析

定期的に`docs/クラス図と実装のギャップ分析.md`を更新し、クラス図と実装の差異を可視化します。

- **分析の目的**: クラス図の更新漏れを早期発見する
- **分析の頻度**: 主要な機能追加・リファクタリング後に実施
- **対応方針**: ギャップを発見したら、優先順位をつけてクラス図を更新する

### パッケージアクセス制御

クラス図のpackage構造に基づき、パッケージ間のアクセスを制御します。

#### アクセス修飾子の定義

1. **Public メソッド・プロパティ**
   - すべてのパッケージからアクセス可能
   - 外部に公開するAPI

2. **Package Private メソッド・プロパティ**
   - **同じパッケージ内のクラスからのみアクセス可能**
   - サブパッケージを含む別パッケージからはアクセス禁止
   - パッケージ内部の協調動作に使用

3. **Private メソッド・プロパティ**
   - 同じクラス内からのみアクセス可能
   - 実装の詳細

#### パッケージ間アクセス制御ルール

1. **同じ階層のパッケージ間アクセス**
   - **Public メソッド・プロパティ**: ✅ アクセス可能
   - **Package Private**: ❌ アクセス禁止
   - **例**: `ゲームロジック` → `ねこ`
   ```typescript
   // ✅ OK: CatGame (ゲームロジック) から Cat (ねこ) の public メソッド
   const internalState = this.cat.getInternalState(); // public

   // ❌ NG: CatGame から Cat の package private メソッド
   // this.cat.getGameTimeManager(); // package private - アクセス禁止
   ```

2. **親パッケージから子パッケージへのアクセス**
   - **Public メソッド・プロパティ**: ❌ アクセス禁止（2つ以上の階層を跨ぐため）
   - **Package Private**: ❌ アクセス禁止
   - **例**: `ねこ` → `ねこAI`
   ```typescript
   // ❌ NG: Cat (ねこ) から CatAI (ねこAI) の public メソッド
   // ただし、Cat が ねこAI を内包する設計の場合は例外
   // Cat が CatAI のインスタンスを持ち、同一パッケージ内として扱う

   // 実装上は Cat と CatAI が同じ「ねこ」パッケージに属する
   // この場合、package private メソッドもアクセス可能
   return this.catAI.getBondingLevel(); // 同一パッケージ内なら OK
   ```

3. **2つ以上下のパッケージへのアクセス（禁止）**
   - **すべてのアクセス修飾子**: ❌ アクセス禁止
   - **例**: `ねこ` → `ねこアクション`
   - **理由**: カプセル化を破壊し、依存関係が複雑になる
   ```typescript
   // ❌ NG: Cat (ねこ) から ActionSelector (ねこアクション選択) への直接アクセス
   // const action = new ActionSelector(); // 禁止

   // ✅ OK: CatAI (ねこAI) 経由でアクセス
   // CatAI が ActionSelector を内包し、同一パッケージとして扱う
   return this.catAI.action(externalState);
   ```

4. **別パッケージのサブパッケージへのアクセス（禁止）**
   - **すべてのアクセス修飾子**: ❌ アクセス禁止
   - **例**: `ゲームロジック` → `ねこAI`
   - **理由**: パッケージの境界を越えた内部実装への依存を防ぐ
   ```typescript
   // ❌ NG: CatGame (ゲームロジック) から CatAI (ねこAI) への直接アクセス
   // const catAI = this.cat.catAI; // 禁止
   // catAI.updateInternalStateByTime(); // 禁止

   // ✅ OK: Cat (ねこ) の public メソッド経由でアクセス
   this.cat.update(externalState, x, y);
   ```

#### 違反例と修正例

**違反例1: 2つ下のパッケージへの直接アクセス**
```typescript
// ❌ NG: Cat から ActionSelector へ直接アクセス
class Cat {
  private actionSelector = new ActionSelector();

  selectAction() {
    return this.actionSelector.select(emotions);
  }
}
```

**修正例1: 中間パッケージ経由でアクセス**
```typescript
// ✅ OK: CatAI 経由でアクセス
class Cat {
  private catAI = new CatAI();

  action(externalState) {
    return this.catAI.action(externalState);
  }
}
```

**違反例2: 別パッケージのサブパッケージへのアクセス**
```typescript
// ❌ NG: CatGame から InternalState へ直接アクセス
class CatGame {
  update() {
    this.cat.catAI.internalState.updateBonding(0.1);
  }
}
```

**修正例2: 公開APIを通じてアクセス**
```typescript
// ✅ OK: Cat の公開メソッド経由でアクセス
class CatGame {
  update() {
    this.cat.update(externalState, x, y);
  }
}
```

#### パッケージ構造の実装指針

TypeScript/JavaScript には package private の概念がないため、以下の規約で実装します：

1. **ディレクトリ構造でパッケージを表現**
   ```
   src/domain/entities/
   ├── Cat.ts              // ねこパッケージ
   ├── CatAI.ts            // ねこパッケージ（Cat の内部クラス扱い）
   ├── Toy.ts              // アイテムパッケージ
   └── User.ts             // ユーザーパッケージ

   src/domain/actions/
   ├── ActionSelector.ts   // ねこアクション選択パッケージ（ねこAI の内部クラス扱い）
   ├── CurrentAction.ts    // ねこアクション選択パッケージ
   └── ...
   ```

2. **Package Private の実装方法**
   - TypeScript の `private` や `protected` ではなく、コメントで明示
   - `// Package Private` コメントを付与
   - コードレビューで package private アクセスをチェック

3. **クラス図とディレクトリの対応**
   - `package ねこ` → `src/domain/entities/Cat.ts` + `CatAI.ts`
   - `package ねこAI` → CatAI クラス内部
   - `package ねこアクション` → `src/domain/actions/`
   - サブパッケージは親クラスが内包する形で実装

#### 実装時のチェックポイント

- **import 文を確認**: パッケージ階層を2つ以上飛び越えた import がないか
- **メソッド呼び出しを確認**: 中間パッケージを経由せず、直接内部パッケージのメソッドを呼んでいないか
- **プロパティアクセスを確認**: 別パッケージの内部プロパティに直接アクセスしていないか
- **Package Private チェック**: `// Package Private` コメントのあるメソッド・プロパティに別パッケージからアクセスしていないか

### ディレクトリ構成

**基本原則**: クラス図のpackage構造に従ったディレクトリ構成とする

```
src/
├── domain/          # ドメインモデル
│   ├── entities/    # エンティティ（ねこ、ねこAI等）
│   ├── valueObjects/# 値オブジェクト（感情、なつき度、位置等）
│   ├── actions/     # ねこアクション
│   └── config/      # ドメイン設定
├── application/     # アプリケーションサービス
├── infrastructure/  # インフラストラクチャ層
└── presentation/    # プレゼンテーション層
```

**クラス図とディレクトリの対応**:
- `package ねこ` → `src/domain/entities/`
- `package ねこAI` → `src/domain/entities/CatAI.ts`
- `package 感情システム` → `src/domain/valueObjects/InternalState.ts`
- `package ねこアクション` → `src/domain/actions/`
- `package 環境` → `src/domain/valueObjects/ExternalState.ts`

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

- **構造化ログ**: `src/lib/log.ts`の構造化ログシステムを使用
- **本番用ログ**: エラーログ・警告ログは適切に出力
- **調査用ログ**: 開発・デバッグ用の一時的なログは許容
- **無駄なログ**: 意味のない情報ログは削除
- **ログレベル**: 環境変数`LOG_LEVEL`で制御（debug/info/warn/error）

```typescript
import { logError, logWarn, logInfo, logDebug } from '@/lib/log';

// ✅ 適切なログ（構造化ログ使用）
logError('Failed to load cat data', { error: error.message });
logWarn('Cat energy below threshold', { energy });
logDebug('Action selected', { actionName, emotionState });

// ❌ 不要なログ
console.log('Function started'); // 削除する

// ❌ 直接console使用（避ける）
console.error('Error occurred'); // logError()を使用すること
```

#### ログの特徴

- **JSON形式**: すべてのログはJSON形式で出力
- **UUID付き**: 匿名UUIDでユーザーセッションを追跡可能
- **タイムスタンプ**: ISO 8601形式のタイムスタンプ付き
- **メタデータ**: 任意の構造化データを付加可能

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
// 感情状態
interface EmotionState {
  comfort: number;           // 快適度 (0~1)
  arousal: number;           // 覚醒度 (0~1)
  safety: number;            // 安全安心度 (0~1)
  affinity: number;          // 親和性 (0~1)
  physicalDiscomfort: number; // 身体的不快感 (0~1)
}

// なつき度状態
interface FriendshipState {
  level: number;    // なつきLv (1~10)
  gauge: number;    // なつきゲージ
}

// 猫の内部状態
interface CatInternalState {
  emotion: EmotionState;
  friendship: FriendshipState;
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
3. **DDD準拠**: ドメインモデル（クラス図）に従った実装か
4. **ステート管理**: セッション管理が適切に実装されているか
5. **商用品質**: 不要なコメント・ログが含まれていないか
6. **ログ出力**: 構造化ログ（log.ts）を使用しているか
7. **通知パターン**: Observerパターンが適切に実装されているか
8. **型安全性**: TypeScriptの型定義が適切か

### 品質チェック

- 実装前にドメインモデル（`docs/クラス図.pu`）との整合性を確認
- コード完成後、不要な要素の削除を実施
- 設定ファイルでの調整可能性を検証
- セッション管理の動作確認を実施
- ログ出力が構造化ログ（`log.ts`）を使用しているか確認
- 通知パターンの実装が適切か確認

## アーキテクチャ設計

### システム構成

本システムでは、以下の3層構成でアーキテクチャを設計します：

1. **Next.js**: アプリ全体のフレームワーク（画面遷移・API呼び出し・内部状態管理）
2. **Phaser**: ゲームエンジン（1ゲーム1Sceneのステートレス実装）
3. **共通モジュール**: 疎結合連携のためのラッパー群

### 設計パターン

#### Observerパターン（通知パターン）

状態変化の伝播にObserverパターンを使用します：

```typescript
// 通知インターフェース
interface StateChangeNotifier {
  update(delta: StateChange): void;
}

// 実装例
class ExternalState implements ExternalStateNotifier {
  update(userPos: UserPositionChange): void {
    // ユーザー位置変化を受信して内部状態を更新
  }

  update(toyPos: ToyPositionChange): void {
    // おもちゃ位置変化を受信して内部状態を更新
  }
}
```

#### abstract classとinterfaceの使い分け

- **interface**: 契約の定義（通知、実行インターフェース）
- **abstract class**: 変化データの構造定義（位置変化、感情変化）

```typescript
// 通知契約
interface 感情変化通知 {
  update(delta: 感情変化): void;
}

// 変化データ構造
abstract class 感情変化 {
  快適度変化: number;
  覚醒度変化: number;
  安全安心度変化: number;
  親和性変化: number;
  身体的不快感変化: number;
}
```

### 責務分担

```
Next.js (アプリケーション層)
├── 画面遷移・ルーティング
├── API呼び出し・セッション管理
└── 内部状態の永続化

Phaser (ゲーム実行層)
├── 描画・入力処理
├── ゲームロジック実行
└── ステートレス設計

共通モジュール (インフラ層)
├── ApiClient (APIラッパー)
├── PhaserWrapper (Phaserラッパー)
└── 描画/入力ユーティリティ
```

### 実装責務表

| No | 処理タイトル | 実装場所 | 方針 |
|---|---|---|---|
| 1 | API呼び出し | 呼び出し側：Next.js<br>APIラッパー：共通モジュール（ApiClient） | ・セッション管理や永続化などはAPI（Next.jsのAPIルート）利用を基本とする<br>・API呼び出しはNext.js側を基本とする<br>・API毎に必ずApiClientのラッパー関数を作成し、UI側（page）は直接fetchしない |
| 2 | 内部状態の初期化 | 内部状態の取得：Next.js<br>ゲーム内への受け渡し：Phaserのinit(data) | ・ねこの内部状態はNext.jsで管理し、Phaserはステートレス設計<br>・API呼び出しはApiClientを利用 |
| 3 | 外部状態の初期化 | ロジック：ExternalState（ドメイン層）<br>ゲーム固有処理：Phaser.Scene具象クラス<br>呼び出し：Phaserのinit(data) | ・外部状態の共通/個別の区分は別途【ねこAI】状態変数シートに従う |
| 4 | アセットのロード | 共通処理：共通モジュール（AssetLoader）<br>呼び出し：Phaserのpreload() | |
| 5 | ねこ/おもちゃ/ユーザーの描画 | 共通処理：共通モジュール（Renderer）<br>呼び出し：Phaserのcreate() | |
| 6 | ユーザー操作の登録 | 共通UIコンポーネント：共通モジュール（InputControls）<br>呼び出し：Phaserのcreate() | ・ドラッグ&ドロップやアナログスティックなど、1種類のUIに対して1クラスを実装 |
| 7 | ねこアクションの選択と実行 | ロジック：Catクラス（ドメイン層）<br>呼び出し：Phaserのupdate() | ・Catクラスは別途ドメイン設計に従う |
| 8 | 画面離脱時の警告処理 | 共通処理：共通モジュール（NavigationGuard）<br>呼び出し：Next.js各ゲーム画面 | ・リロードなどは標準警告画面を利用<br>・SPAの画面遷移はNavigationGuardのカスタムポップアップを利用（UC:終了するに従う） |
| 9 | 内部状態の保存 | 保存処理：共通モジュール（StateSaver）<br>呼び出し：Next.js各ゲーム画面 | ・API呼び出しが発生する場合はApiClientを利用 |
| 10 | ゲーム開始/終了 | ゲーム内部：Phaser.Scene具象クラス<br>開始/終了管理：共通モジュール（GameManager）<br>呼び出し：Next.js各ゲーム画面 | ・開始/終了処理をGameManagerに集約<br>・Sceneの破棄や生成はGameManager経由で呼ぶ<br>・内部状態の保存はStateSaverを利用 |
| 11 | 画面遷移 | Next.js | ・Next.jsのルーティングを利用<br>・1ゲーム画面 = 1Next.jsページ + 1Phaser.Scene具象クラス<br>・モード選択や開始ボタンはNext.jsで実装 |
| 12 | Phaser実装 | Phaser.Scene具象クラス | ・1ゲーム画面 = 1Scene<br>・1回のゲーム = 1インスタンス<br>・切替時はインスタンス破棄後に再生成<br>・開始/終了トリガはNext.js側、進行中の処理はPhaser内部で完結 |

### 共通モジュール設計

以下の共通モジュールを実装し、Next.jsとPhaserの疎結合を実現します：

#### ApiClient
- API呼び出しの統一インターフェース
- エラーハンドリングの共通化
- レスポンスの型安全性確保

#### GameManager
- Phaserのライフサイクル管理
- Scene の生成・破棄・切り替え
- 状態の受け渡し処理

#### StateSaver
- 内部状態の保存・復元
- セッション管理との連携
- ApiClient を通じたAPI呼び出し

#### AssetLoader
- ゲームアセットの統一ロード処理
- キャッシュ管理
- ロード進捗の表示

#### Renderer
- 描画処理の共通化
- アニメーション管理
- レイアウト計算

#### InputControls
- 入力デバイスの抽象化
- UI コンポーネントの再利用性
- イベントハンドリングの統一

#### NavigationGuard
- 画面離脱時の警告
- 状態保存の確認
- カスタムポップアップ表示

## ビルドチェック要件

### 必須チェック項目

コード変更後は、必ず以下のビルドチェックを実行してください：

#### 1. 基本ビルドチェック
```bash
npm run build --no-lint
```

#### 2. 型チェック付きビルド
```bash
npm run build
```

#### 3. テスト実行
```bash
npm test              # 全テスト実行
npm run test:watch    # watchモードでテスト実行
npm run test:coverage # カバレッジ付きテスト実行
```

### チェック基準

- **エラー**: ビルドエラーが発生した場合は必ず修正
- **警告**: ESLintの警告は可能な限り修正（未使用変数など）
- **プリレンダリング**: SSG/SSRエラーが発生しないことを確認
- **型安全性**: TypeScriptの型エラーがないことを確認

### よくある問題と対処法

1. **useSearchParams() エラー**: Suspenseバウンダリーでラップ
2. **window undefined エラー**: 動的インポート（`ssr: false`）を使用
3. **型定義エラー**: 適切な型定義の追加・修正
4. **アセット参照エラー**: パスの確認とアセット定義の整合性チェック

# テスト方針

## スコープ1（プロトタイプ）テスト方針
- **目的**：ユーザーに見せるプロトタイプとして、ユースケース単位で動作を確認  
- **重点**：単機能テスト（ユースケーステスト）

### 方針
1. **単体テスト**：省略  
2. **単機能テスト（最重点）**  
   - ユースケース単位で動作確認  
   - 内部結合は意識せず、ユーザー視点で動作確認できればOK  
3. **内部結合テスト**：省略  
4. **外部結合テスト**：対象外  
5. **システムテスト**：必要最小限（負荷・性能テストは省略可）  

---

## 本実装テスト方針
- **目的**：製品品質を担保し、リリースに耐えられる堅牢なシステムにする

### 方針
1. **単体テスト**  
   - クラス・メソッド単位で自動テストを徹底  
   - カバレッジを意識  
2. **単機能テスト**  
   - ユースケース単位で正しい動作を自動化・手動両方で確認  
3. **内部結合テスト**  
   - モジュール間の連携確認  
   - DBアクセスやサービス間通信などをモックやステージング環境で確認  
4. **外部結合テスト**  
   - 外部システム（API、DB、外部サービス）との連携を確認  
   - ステージング環境で実施  
5. **システムテスト**  
   - パフォーマンス、負荷、安定性、セキュリティ観点で確認  
   - 本番に近い環境で実施  

---

## テスト種類とスコープ別対応

| テスト種類 | スコープ1（プロトタイプ） | 本実装 |
|------------|------------------------|--------|
| 単体テスト | 省略 | 全モジュールで自動化徹底 |
| 単機能テスト | 最重点、ユースケース確認 | 自動化＋手動で全ユースケース網羅 |
| 内部結合テスト | 省略 | モジュール連携確認 |
| 外部結合テスト | 対象外 | 外部システムとの連携確認 |
| システムテスト | 最小限 | 性能・安定性・セキュリティ観点で網羅 |

---

## テスト駆動開発（TDD）

### 基本原則

- **テスト可能なクラスには必ず単体テストを作成**: UIクラス以外の全てのクラスに単体テストを実装
- **テストファースト**: 実装の前にテストを作成（もしくは修正）する
- **レッド・グリーン・リファクタリング**:
  1. 失敗するテストを書く（Red）
  2. テストを通す最小限の実装をする（Green）
  3. コードをリファクタリングする（Refactor）

### テスト作成の対象外
- **UIコンポーネント**: React コンポーネント、Phaser Scene（手動テストで確認）
- **純粋なインフラ層**: Next.js API ルート、データベース接続（E2Eテストで確認）

### テスト作成の対象
- **ドメインモデル**: エンティティ、値オブジェクト
- **ビジネスロジック**: アクション、計算ロジック
- **ユーティリティ**: ヘルパー関数、ユーティリティクラス

## 単体テスト実装指針

### テスト対象
- **全メソッド**: publicメソッドだけでなく、privateメソッドも含めて単体テストを作成
- **カバレッジ基準**: 最低C1カバレッジ（分岐網羅）を確保
- **結合テスト**: 公開メソッドについては、主要シナリオの結合テストも作成

### テストファイル構成
```
src/
├── domain/
│   ├── entities/
│   │   └── Cat.ts
│   ├── actions/
│   │   ├── CatAction.ts
│   │   └── PlayWithToyAction.ts
test/
├── domain/
│   ├── entities/
│   │   └── Cat.test.ts
│   ├── actions/
│   │   ├── CatAction.test.ts
│   │   └── PlayWithToyAction.test.ts
```

**重要**: テストファイル（*.test.ts）は`test/`ディレクトリに配置し、`src/`ディレクトリと同じ構造を維持します。

### Jest設定

`jest.config.js`でテストディレクトリとモジュール解決を設定しています：

```javascript
const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',  // @/エイリアスの解決
  },
  roots: ['<rootDir>/test'],          // テストルートディレクトリ
  testMatch: [
    '<rootDir>/test/**/*.[jt]s?(x)',
    '<rootDir>/test/**/?(*.)+(spec|test).[jt]s?(x)',
  ],
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.{js,jsx,ts,tsx}',
    '!src/**/__tests__/**',
    '!src/**/*.test.{js,jsx,ts,tsx}',  // testファイルは除外
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
}
```

### テストケース作成指針

#### 1. privateメソッドのテスト
- TypeScriptの制約を回避するため、`(instance as any).privateMethod()`でアクセス
- 分岐条件を網羅するテストケースを作成

#### 2. 分岐網羅（C1カバレッジ）
- if文の真偽両方をテスト
- switch文の全caseをテスト
- 三項演算子の両方の結果をテスト
- エラーケースも含める

#### 2-1. 境界値テスト
- 数値の上限・下限をテスト
- 範囲チェック処理（clamp等）の境界値を確認
- 例: 値が-1～1の範囲の場合、-1.1, -1, 0, 1, 1.1 をテスト

#### 3. 結合テスト
- 複数のメソッドを組み合わせた主要シナリオをテスト
- エンドツーエンドの動作を確認
- 実際のユースケースに基づいたテストケース

### 依存関係のモック化

#### モック作成の指針
- **外部依存のモック化**: GameTimeManager等の外部クラスはモックを作成
- **純粋な単体テスト**: 依存クラスの実装詳細に影響されないテストを作成
- **制御可能性**: テスト用に状態を制御できるモックを実装

#### モック実装例

```typescript
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
}

// テストで使用
describe('Cat', () => {
  let mockGameTimeManager: MockGameTimeManager;

  beforeEach(() => {
    mockGameTimeManager = new MockGameTimeManager();
    mockGameTimeManager.setDeltaTime(16.67); // 60FPS想定
    mockGameTimeManager.setTotalTime(0);
  });

  it('時間を制御してテストできる', () => {
    mockGameTimeManager.setTotalTime(1000);
    // テスト実装
  });
});
```

### テスト実装例

テストファイルは`test/`ディレクトリに配置し、`@/`エイリアスを使ってソースコードをインポートします。

```typescript
// test/domain/entities/Cat.test.ts
import { Cat } from '@/domain/entities/Cat';
import { InternalState } from '@/domain/valueObjects/InternalState';
import { ExternalState } from '@/domain/valueObjects/ExternalState';
import { GameTimeManager } from '@/game/GameTimeManager';

// 単体テスト例
describe('Cat', () => {
  describe('update', () => {
    it('正常系: 状態を更新できる', () => {
      // Arrange
      const cat = Cat.createDefault();

      // Act
      const result = cat.update(externalState, x, y, toyX, toyY);

      // Assert
      expect(result).toBeDefined();
    });

    it('異常系: null値の場合エラーを返す', () => {
      // テストケース実装
    });
  });

  describe('privateMethod (private)', () => {
    it('分岐A: 条件がtrueの場合', () => {
      const cat = Cat.createDefault();
      const result = (cat as any).privateMethod(true);
      expect(result).toBe(expectedValue);
    });

    it('分岐B: 条件がfalseの場合', () => {
      const cat = Cat.createDefault();
      const result = (cat as any).privateMethod(false);
      expect(result).toBe(expectedValue);
    });
  });

  describe('境界値テスト例', () => {
    it('値が範囲の上限を超えない', () => {
      const cat = new Cat(...);
      (cat as any).applyChange({ value: 0.5 }, 1.0);

      const result = cat.getValue();
      expect(result).toBe(1.0); // 上限でクランプ
    });

    it('値が範囲の下限を下回らない', () => {
      const cat = new Cat(...);
      (cat as any).applyChange({ value: -0.5 }, 1.0);

      const result = cat.getValue();
      expect(result).toBe(-1.0); // 下限でクランプ
    });
  });
});

// 結合テスト例
describe('Cat Integration', () => {
  it('シナリオ: おもちゃで遊んでなつき度が上がる', () => {
    // 複数メソッドを組み合わせたテスト
  });
});
```

---

このガイドラインに従って、保守性が高く商用品質のコードを作成してください。