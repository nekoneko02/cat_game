import * as Phaser from 'phaser';
import { Cat } from '@/domain/cat/Cat';
import { ExternalState } from '@/domain/gameLogic/environment/ExternalState';

const numberKeys = [
  Phaser.Input.Keyboard.KeyCodes.ZERO,
  Phaser.Input.Keyboard.KeyCodes.ONE,
  Phaser.Input.Keyboard.KeyCodes.TWO,
  Phaser.Input.Keyboard.KeyCodes.THREE,
  Phaser.Input.Keyboard.KeyCodes.FOUR,
  Phaser.Input.Keyboard.KeyCodes.FIVE,
  Phaser.Input.Keyboard.KeyCodes.SIX,
  Phaser.Input.Keyboard.KeyCodes.SEVEN,
  Phaser.Input.Keyboard.KeyCodes.EIGHT,
  Phaser.Input.Keyboard.KeyCodes.NINE,
];
/**
 * デバッグ用オーバーレイ
 * 管理者向け機能として、ねこの内部状態・外部状態・感情・なつき度を可視化
 */
export class DebugOverlay {
  private scene: Phaser.Scene;
  private debugGroup: Phaser.GameObjects.Group;
  private backgroundRect!: Phaser.GameObjects.Graphics;
  private actionSelectorBackground?: Phaser.GameObjects.Graphics;
  private textObjects: Phaser.GameObjects.Text[] = [];
  private isVisible: boolean = false;
  private cat: Cat | null = null;

  private actionSelectorMode: boolean = false;
  private availableActions: string[] = [];
  private selectedActionIndex: number = 0;
  private currentPage: number = 0;
  private itemsPerPage: number = 8;
  private actionSelectorText?: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene, cat?: Cat) {
    this.scene = scene;
    this.debugGroup = scene.add.group();
    this.cat = cat || null;
    this.createBackground();
    this.setupKeyboardControls();
  }

  /**
   * 背景を作成
   */
  private createBackground(): void {
    // 左側：デバッグ情報
    this.backgroundRect = this.scene.add.graphics();
    this.backgroundRect.fillStyle(0x000000, 0.8);
    this.backgroundRect.fillRoundedRect(10, 10, 380, 350, 8);
    this.backgroundRect.setDepth(1000);
    this.backgroundRect.setVisible(false);
    this.debugGroup.add(this.backgroundRect);
  }

  /**
   * アクション選択UIの背景を作成
   */
  private createActionSelectorBackground(): void {
    if (this.actionSelectorBackground) {
      this.actionSelectorBackground.destroy();
    }

    // 右側：アクション選択UI
    this.actionSelectorBackground = this.scene.add.graphics();
    this.actionSelectorBackground.fillStyle(0x000000, 0.9);
    this.actionSelectorBackground.fillRoundedRect(410, 10, 380, 350, 8);
    this.actionSelectorBackground.setDepth(1001);
    this.debugGroup.add(this.actionSelectorBackground);
  }

  /**
   * キーボード制御を設定
   */
  private setupKeyboardControls(): void {
    if (!this.scene.input.keyboard) return;

    const keyboard = this.scene.input.keyboard;

    // Dキー: デバッグパネル表示/非表示（全てここに集約）
    keyboard.on('keydown-D', () => {
      this.toggle();
    });

    // 以下、デバッグモードかつCatが存在する場合のみ有効

    // Aキー: アクション選択モード切替
    keyboard.on('keydown-A', () => {
      if (!this.isVisible || !this.cat) return;
      this.toggleActionSelectorMode();
    });

    // 矢印キー: アクション選択（選択モード時のみpreventDefault）
    keyboard.on('keydown-UP', (event: KeyboardEvent) => {
      if (this.actionSelectorMode) {
        event.preventDefault(); // スクロール防止（選択モード時のみ）
        this.selectedActionIndex = Math.max(0, this.selectedActionIndex - 1);
        this.updateActionSelector();
      }
    });

    keyboard.on('keydown-DOWN', (event: KeyboardEvent) => {
      if (this.actionSelectorMode) {
        event.preventDefault(); // スクロール防止（選択モード時のみ）
        this.selectedActionIndex = Math.min(
          this.availableActions.length - 1,
          this.selectedActionIndex + 1
        );
        this.updateActionSelector();
      }
    });

    // PageUp/PageDown: ページ切り替え
    keyboard.on('keydown-PAGE_UP', (event: KeyboardEvent) => {
      if (this.actionSelectorMode) {
        event.preventDefault();
        this.changePage(-1);
      }
    });

    keyboard.on('keydown-PAGE_DOWN', (event: KeyboardEvent) => {
      if (this.actionSelectorMode) {
        event.preventDefault();
        this.changePage(1);
      }
    });

    // Enterキー: 選択したアクションを実行（999秒 = 約16分）
    keyboard.on('keydown-ENTER', (event: KeyboardEvent) => {
      if (this.actionSelectorMode && this.cat) {
        event.preventDefault();
        const actionName = this.availableActions[this.selectedActionIndex];
        if (actionName) {
          this.cat.debugForceAction(actionName, 999000); // 999秒
          // アクション選択モードは維持（次のアクションを選べる）
        }
      }
    });

    // Escapeキー: アクション選択モード終了
    keyboard.on('keydown-ESC', () => {
      if (this.actionSelectorMode) {
        this.hideActionSelector();
      }
    });

    // +キー: なつき度レベルを1上げる（最大10）
    keyboard.on('keydown-PLUS', (event: KeyboardEvent) => {
      if (!this.isVisible || !this.cat) return;
      event.preventDefault();
      const currentLevel = this.cat.getBonding().getLevel();
      if (currentLevel < 10) {
        this.cat.debugSetBondingLevel(currentLevel + 1);
      }
    });

    // -キー: なつき度レベルを1下げる（最小0）
    keyboard.on('keydown-MINUS', (event: KeyboardEvent) => {
      if (!this.isVisible || !this.cat) return;
      event.preventDefault();
      const currentLevel = this.cat.getBonding().getLevel();
      if (currentLevel > 0) {
        this.cat.debugSetBondingLevel(currentLevel - 1);
      }
    });

    numberKeys.forEach((code, i) => {
      const key = keyboard.addKey(code);
      key.on('down', (event: KeyboardEvent) => {
        if (!this.isVisible || !this.cat) return;
        this.cat.debugSetBondingLevel(i);
      });
    });

  }

  /**
   * アクション選択モードの切り替え
   */
  private toggleActionSelectorMode(): void {
    if (this.actionSelectorMode) {
      this.hideActionSelector();
    } else {
      this.showActionSelector();
    }
  }

  /**
   * ページ切り替え
   */
  private changePage(delta: number): void {
    const totalPages = Math.ceil(this.availableActions.length / this.itemsPerPage);
    this.currentPage = Math.max(0, Math.min(totalPages - 1, this.currentPage + delta));

    // 現在のページの範囲内に選択インデックスを調整
    const pageStart = this.currentPage * this.itemsPerPage;
    const pageEnd = Math.min(pageStart + this.itemsPerPage, this.availableActions.length);
    if (this.selectedActionIndex < pageStart || this.selectedActionIndex >= pageEnd) {
      this.selectedActionIndex = pageStart;
    }

    this.updateActionSelector();
  }

  /**
   * アクション選択UIを表示
   */
  private showActionSelector(): void {
    if (!this.cat) return;

    this.actionSelectorMode = true;
    this.availableActions = this.cat.debugGetAvailableActions();
    this.selectedActionIndex = 0;
    this.currentPage = 0;
    this.createActionSelectorBackground();
    this.updateActionSelector();
  }

  /**
   * アクション選択UIを非表示
   */
  private hideActionSelector(): void {
    this.actionSelectorMode = false;
    if (this.actionSelectorText) {
      this.actionSelectorText.destroy();
      this.actionSelectorText = undefined;
    }
    if (this.actionSelectorBackground) {
      this.actionSelectorBackground.destroy();
      this.actionSelectorBackground = undefined;
    }
  }

  /**
   * アクション選択UIを更新
   */
  private updateActionSelector(): void {
    if (this.actionSelectorText) {
      this.actionSelectorText.destroy();
    }

    if (!this.actionSelectorMode) return;

    const totalPages = Math.ceil(this.availableActions.length / this.itemsPerPage);
    const pageStart = this.currentPage * this.itemsPerPage;
    const pageEnd = Math.min(pageStart + this.itemsPerPage, this.availableActions.length);
    const pageActions = this.availableActions.slice(pageStart, pageEnd);

    const lines = [
      '=== ACTION SELECTOR ===',
      `Page ${this.currentPage + 1}/${totalPages}`,
      ''
    ];

    pageActions.forEach((action, localIndex) => {
      const globalIndex = pageStart + localIndex;
      const prefix = globalIndex === this.selectedActionIndex ? '> ' : '  ';
      lines.push(`${prefix}${action}`);
    });

    lines.push('');
    lines.push('--- Controls ---');
    lines.push('↑↓: Select');
    lines.push('PgUp/Dn: Page');
    lines.push('Enter: Execute (999s)');
    lines.push('Esc: Cancel');

    const text = lines.join('\n');
    this.actionSelectorText = this.scene.add.text(420, 20, text, {
      fontSize: '14px',
      color: '#00ff00',
      fontFamily: 'monospace',
      padding: { x: 5, y: 5 }
    });
    this.actionSelectorText.setDepth(1002);
    this.debugGroup.add(this.actionSelectorText);
  }

  /**
   * デバッグ表示のON/OFF切り替え
   */
  public toggle(): void {
    this.isVisible = !this.isVisible;
    this.setVisible(this.isVisible);
  }

  /**
   * デバッグ表示の表示/非表示設定
   */
  public setVisible(visible: boolean): void {
    this.isVisible = visible;
    this.backgroundRect.setVisible(visible);
    this.textObjects.forEach(text => text.setVisible(visible));
  }

  /**
   * 表示状態を取得
   */
  public getVisible(): boolean {
    return this.isVisible;
  }

  /**
   * 状態情報を更新して表示
   */
  public update(cat: Cat, externalState: ExternalState): void {
    if (!this.isVisible) return;

    // 既存のテキストオブジェクトをクリア
    this.clearTexts();

    const bonding = cat.getBonding();
    const currentAction = cat.getCurrentAction();
    const position = cat.getPosition();

    let yOffset = 25;
    const lineHeight = 18;
    const leftMargin = 20;

    // タイトル
    this.addText('=== CAT DEBUG INFO ===', leftMargin, yOffset, '#ffffff', '14px');
    yOffset += lineHeight * 1.5;

    // なつき度（目立つように表示）
    this.addText(`Bonding Level: ${bonding.getLevel()}/10`, leftMargin, yOffset, '#ffff00', '16px');
    yOffset += lineHeight * 1.5;
    this.addText(`Bonding Gauge: ${bonding.getGauge().toFixed(3)}`, leftMargin, yOffset, '#ffff00', '14px');
    yOffset += lineHeight * 1.5;

    // ねこの位置
    this.addText('--- Cat Position ---', leftMargin, yOffset, '#00ffff');
    yOffset += lineHeight;
    this.addText(`X: ${position.x.toFixed(1)}`, leftMargin, yOffset, '#ffffff');
    yOffset += lineHeight;
    this.addText(`Y: ${position.y.toFixed(1)}`, leftMargin, yOffset, '#ffffff');
    yOffset += lineHeight * 1.5;

    // 現在のアクション
    this.addText('--- Current Action ---', leftMargin, yOffset, '#00ffff');
    yOffset += lineHeight;
    if (currentAction) {
      this.addText(`Action: ${currentAction.getActionName()}`, leftMargin, yOffset, '#ffffff');
      yOffset += lineHeight;
      const duration = currentAction.getDuration();
      if (duration) {
        const elapsed = Date.now() - currentAction.getStartTime();
        const remaining = Math.max(0, duration - elapsed);
        this.addText(`Remaining: ${(remaining / 1000).toFixed(1)}s`, leftMargin, yOffset, '#ffffff');
        yOffset += lineHeight;
      }
    } else {
      this.addText('Action: none', leftMargin, yOffset, '#888888');
      yOffset += lineHeight;
    }
    yOffset += lineHeight * 0.5;

    // 外部状態
    this.addText('--- External State ---', leftMargin, yOffset, '#00ffff');
    yOffset += lineHeight;

    this.addText(`toyPresence: ${externalState.toyPresence}`, leftMargin, yOffset, '#ffffff');
    yOffset += lineHeight;
    this.addText(`toyDistance: ${externalState.toyDistance.toFixed(1)}`, leftMargin, yOffset, '#ffffff');
    yOffset += lineHeight;
    this.addText(`userPresence: ${externalState.userPresence}`, leftMargin, yOffset, '#ffffff');
    yOffset += lineHeight;
    this.addText(`isPlaying: ${externalState.isPlaying}`, leftMargin, yOffset, '#ffffff');
    yOffset += lineHeight * 1.5;

    // デバッグコントロール
    this.addText('--- Debug Controls ---', leftMargin, yOffset, '#00ffff');
    yOffset += lineHeight;
    this.addText('D: Toggle Debug', leftMargin, yOffset, '#888888', '11px');
    yOffset += lineHeight * 0.9;
    this.addText('A: Action Selector', leftMargin, yOffset, '#888888', '11px');
    yOffset += lineHeight * 0.9;
    this.addText('+/-: Level Up/Down', leftMargin, yOffset, '#888888', '11px');
    yOffset += lineHeight * 0.9;
    this.addText('0-9: Set Level', leftMargin, yOffset, '#888888', '11px');
  }

  /**
   * テキストを追加
   */
  private addText(text: string, x: number, y: number, color: string = '#ffffff', fontSize: string = '12px'): void {
    const textObj = this.scene.add.text(x, y, text, {
      fontSize: fontSize,
      color: color,
      fontFamily: 'monospace'
    });
    textObj.setDepth(1001);
    textObj.setVisible(this.isVisible);
    this.textObjects.push(textObj);
    this.debugGroup.add(textObj);
  }

  /**
   * 値に応じた色を取得（0-1の範囲または-1から1の範囲）
   */
  private getValueColor(value: number, min: number, max: number): string {
    const normalizedValue = (value - min) / (max - min);
    
    if (normalizedValue < 0.3) {
      return '#ff4444'; // 赤（低い値）
    } else if (normalizedValue < 0.7) {
      return '#ffff44'; // 黄色（中間値）
    } else {
      return '#44ff44'; // 緑（高い値）
    }
  }

  /**
   * 既存のテキストオブジェクトをクリア
   */
  private clearTexts(): void {
    this.textObjects.forEach(text => {
      text.destroy();
    });
    this.textObjects = [];
  }

  /**
   * デバッグオーバーレイを破棄
   */
  public destroy(): void {
    this.hideActionSelector();
    this.clearTexts();
    this.debugGroup.destroy(true);
  }
}