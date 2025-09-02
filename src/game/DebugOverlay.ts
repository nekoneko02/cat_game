import * as Phaser from 'phaser';
import { Cat } from '@/domain/entities/Cat';
import { ExternalState } from '@/domain/valueObjects/ExternalState';

/**
 * デバッグ用オーバーレイ
 * 管理者向け機能として、ねこの内部状態・外部状態・感情・なつき度を可視化
 */
export class DebugOverlay {
  private scene: Phaser.Scene;
  private debugGroup: Phaser.GameObjects.Group;
  private backgroundRect!: Phaser.GameObjects.Graphics;
  private textObjects: Phaser.GameObjects.Text[] = [];
  private isVisible: boolean = false;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.debugGroup = scene.add.group();
    this.createBackground();
  }

  /**
   * 背景を作成
   */
  private createBackground(): void {
    this.backgroundRect = this.scene.add.graphics();
    this.backgroundRect.fillStyle(0x000000, 0.8);
    this.backgroundRect.fillRoundedRect(10, 10, 380, 500, 8);
    this.backgroundRect.setDepth(1000);
    this.backgroundRect.setVisible(false);
    this.debugGroup.add(this.backgroundRect);
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

    const internalState = cat.getInternalState();
    const emotions = cat.getCurrentEmotions();
    const bondingLevel = cat.getBondingLevel();
    const currentAction = cat.getCurrentAction();

    let yOffset = 25;
    const lineHeight = 18;
    const leftMargin = 20;

    // タイトル
    this.addText('=== CAT DEBUG INFO ===', leftMargin, yOffset, '#ffffff', '14px');
    yOffset += lineHeight * 1.5;

    // なつき度（目立つように表示）
    this.addText(`🐾 Bonding Level: ${bondingLevel}/10`, leftMargin, yOffset, '#ffff00', '16px');
    yOffset += lineHeight * 1.5;

    // 現在のアクション
    this.addText('--- Current Action ---', leftMargin, yOffset, '#00ffff');
    yOffset += lineHeight;
    if (currentAction) {
      this.addText(`Action: ${currentAction.name}`, leftMargin, yOffset, '#ffffff');
      yOffset += lineHeight;
      if (currentAction.duration) {
        const elapsed = Date.now() - currentAction.startTime;
        const remaining = Math.max(0, currentAction.duration - elapsed);
        this.addText(`Remaining: ${(remaining / 1000).toFixed(1)}s`, leftMargin, yOffset, '#ffffff');
        yOffset += lineHeight;
      }
    } else {
      this.addText('Action: none', leftMargin, yOffset, '#888888');
      yOffset += lineHeight;
    }
    yOffset += lineHeight * 0.5;

    // 感情状態
    this.addText('--- Emotions ---', leftMargin, yOffset, '#00ffff');
    yOffset += lineHeight;
    
    Object.entries(emotions).forEach(([key, value]) => {
      const colorValue = this.getValueColor(value, -1, 1);
      this.addText(`${key}: ${value.toFixed(3)}`, leftMargin, yOffset, colorValue);
      yOffset += lineHeight;
    });
    yOffset += lineHeight * 0.5;

    // 内部状態
    this.addText('--- Internal State ---', leftMargin, yOffset, '#00ffff');
    yOffset += lineHeight;

    const internalStateEntries = [
      ['bonding', internalState.bonding],
      ['playfulness', internalState.playfulness],
      ['fear', internalState.fear]
    ];

    internalStateEntries.forEach(([key, value]) => {
      const colorValue = this.getValueColor(value as number, -1, 1);
      this.addText(`${key}: ${(value as number).toFixed(3)}`, leftMargin, yOffset, colorValue);
      yOffset += lineHeight;
    });
    yOffset += lineHeight * 0.5;

    // 外部状態
    this.addText('--- External State ---', leftMargin, yOffset, '#00ffff');
    yOffset += lineHeight;

    this.addText(`toyPresence: ${externalState.toyPresence}`, leftMargin, yOffset, '#ffffff');
    yOffset += lineHeight;
    this.addText(`toyDistance: ${externalState.toyDistance.toFixed(1)}`, leftMargin, yOffset, '#ffffff');
    yOffset += lineHeight;
    this.addText(`toyType: ${externalState.toyType || 'none'}`, leftMargin, yOffset, '#ffffff');
    yOffset += lineHeight;
    this.addText(`userPresence: ${externalState.userPresence}`, leftMargin, yOffset, '#ffffff');
    yOffset += lineHeight;
    this.addText(`isPlaying: ${externalState.isPlaying}`, leftMargin, yOffset, '#ffffff');
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
    this.clearTexts();
    this.debugGroup.destroy(true);
  }
}