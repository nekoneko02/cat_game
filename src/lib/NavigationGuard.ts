import { useRouter } from 'next/navigation';
import { useEffect, useCallback } from 'react';
import { logError } from './log';

export interface NavigationGuardConfig {
  message: string;
  enabled: boolean;
  showCustomDialog: boolean;
  customDialogTitle?: string;
  customDialogMessage?: string;
  confirmButtonText?: string;
  cancelButtonText?: string;
}

export interface NavigationGuardCallbacks {
  onBeforeUnload?: () => Promise<void>;
  onRouteChange?: () => Promise<boolean>; // return true to allow navigation
}

export class NavigationGuard {
  private static instance: NavigationGuard | null = null;
  private config: NavigationGuardConfig;
  private callbacks: NavigationGuardCallbacks;
  private isEnabled: boolean = false;

  private constructor() {
    this.config = {
      message: 'ゲームを終了しますか？進行状況が失われる可能性があります。',
      enabled: false,
      showCustomDialog: true,
      customDialogTitle: 'ゲーム終了確認',
      customDialogMessage: 'ゲームを終了しますか？\n現在の進行状況が保存されます。',
      confirmButtonText: 'はい、終了する',
      cancelButtonText: 'いいえ、続ける'
    };
    this.callbacks = {};
  }

  static getInstance(): NavigationGuard {
    if (!NavigationGuard.instance) {
      NavigationGuard.instance = new NavigationGuard();
    }
    return NavigationGuard.instance;
  }

  enable(callbacks: NavigationGuardCallbacks = {}): void {
    this.callbacks = callbacks;
    this.isEnabled = true;
    this.setupBeforeUnloadHandler();
  }

  disable(): void {
    this.isEnabled = false;
    this.removeBeforeUnloadHandler();
  }

  updateConfig(newConfig: Partial<NavigationGuardConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  private setupBeforeUnloadHandler(): void {
    if (typeof window === 'undefined') return;

    const handleBeforeUnload = async (event: BeforeUnloadEvent) => {
      if (!this.isEnabled) return;

      if (this.callbacks.onBeforeUnload) {
        try {
          await this.callbacks.onBeforeUnload();
        } catch (error) {
          logError('Error in onBeforeUnload callback', { error: error instanceof Error ? error.message : String(error) });
        }
      }

      event.preventDefault();
      event.returnValue = this.config.message;
      return this.config.message;
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    // クリーンアップ用の関数を保存
    (this as unknown as { _removeBeforeUnload?: () => void })._removeBeforeUnload = () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }

  private removeBeforeUnloadHandler(): void {
    if (typeof window === 'undefined') return;

    const cleanupFn = (this as unknown as { _removeBeforeUnload?: () => void })._removeBeforeUnload;
    if (cleanupFn) {
      cleanupFn();
    }
  }

  async showCustomDialog(): Promise<boolean> {
    if (!this.config.showCustomDialog) {
      return window.confirm(this.config.message);
    }

    return new Promise((resolve) => {
      const dialog = this.createCustomDialog(resolve);
      document.body.appendChild(dialog);
    });
  }

  private createCustomDialog(onResult: (result: boolean) => void): HTMLElement {
    const overlay = document.createElement('div');
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 10000;
    `;

    const dialog = document.createElement('div');
    dialog.style.cssText = `
      background: white;
      padding: 24px;
      border-radius: 8px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
      max-width: 400px;
      width: 90%;
      text-align: center;
    `;

    const title = document.createElement('h3');
    title.textContent = this.config.customDialogTitle || 'ゲーム終了確認';
    title.style.cssText = `
      margin: 0 0 16px 0;
      color: #333;
      font-size: 18px;
    `;

    const message = document.createElement('p');
    message.textContent = this.config.customDialogMessage || this.config.message;
    message.style.cssText = `
      margin: 0 0 24px 0;
      color: #666;
      line-height: 1.5;
      white-space: pre-line;
    `;

    const buttonContainer = document.createElement('div');
    buttonContainer.style.cssText = `
      display: flex;
      gap: 12px;
      justify-content: center;
    `;

    const confirmButton = document.createElement('button');
    confirmButton.textContent = this.config.confirmButtonText || 'はい';
    confirmButton.style.cssText = `
      padding: 8px 16px;
      background: #ef4444;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
    `;

    const cancelButton = document.createElement('button');
    cancelButton.textContent = this.config.cancelButtonText || 'いいえ';
    cancelButton.style.cssText = `
      padding: 8px 16px;
      background: #6b7280;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
    `;

    const cleanup = () => {
      document.body.removeChild(overlay);
    };

    confirmButton.onclick = () => {
      cleanup();
      onResult(true);
    };

    cancelButton.onclick = () => {
      cleanup();
      onResult(false);
    };

    buttonContainer.appendChild(cancelButton);
    buttonContainer.appendChild(confirmButton);

    dialog.appendChild(title);
    dialog.appendChild(message);
    dialog.appendChild(buttonContainer);
    overlay.appendChild(dialog);

    return overlay;
  }
}

// React Hook for using NavigationGuard
export function useNavigationGuard(
  enabled: boolean = false,
  callbacks: NavigationGuardCallbacks = {}
) {
  const router = useRouter();
  const navigationGuard = NavigationGuard.getInstance();

  const handleRouteChange = useCallback(async () => {
    if (!enabled) return true;

    if (callbacks.onRouteChange) {
      return await callbacks.onRouteChange();
    }

    return await navigationGuard.showCustomDialog();
  }, [enabled, callbacks.onRouteChange, navigationGuard]);

  useEffect(() => {
    if (enabled) {
      navigationGuard.enable(callbacks);
    } else {
      navigationGuard.disable();
    }

    return () => {
      navigationGuard.disable();
    };
  }, [enabled, callbacks, navigationGuard]);

  return {
    showExitDialog: () => navigationGuard.showCustomDialog(),
    updateConfig: (config: Partial<NavigationGuardConfig>) => navigationGuard.updateConfig(config)
  };
}