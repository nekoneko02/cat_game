'use client';

import { useLayoutEffect, useRef, useState } from 'react';
import { PhaserGame } from '@/types/game';
import { Cat } from '@/domain/cat/Cat';
import { CatRepository } from '@/domain/cat/CatRepository';
import { GlobalRegistry } from '@/domain/global/GlobalRegistry';
import { GameManager } from '@/lib/GameManager';
import { GameIcon } from '@/components/GameIcon';
import { IMAGE_IDS } from '@/constants/images';
import { logDebug, logError, logInfo } from '@/lib/log';

interface GameCanvasProps {
  onGameReady?: (game: PhaserGame, gameManager: GameManager) => void;
  catName?: string;
  onGameEnd?: () => Promise<void>;
  onCatStateError?: (error: string) => void;
}

export default function GameCanvas({ onGameReady, catName, onGameEnd, onCatStateError }: GameCanvasProps) {
  const gameRef = useRef<HTMLDivElement>(null);
  const phaserGameRef = useRef<PhaserGame | null>(null);
  const gameManagerRef = useRef<GameManager | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  useLayoutEffect(() => {
    let mounted = true;

    const initializeGame = async () => {
      try {
        if (!gameRef.current) return;

        gameManagerRef.current = new GameManager();
        logDebug('GameCanvas: Created new GameManager instance');

        // ゲーム開始時にCatRepositoryからCatインスタンスを取得
        let cat: Cat | undefined = undefined;
        try {
          logDebug('GameCanvas: Creating Cat via CatRepository...');

          // GlobalRegistryから共通のGameTimeManagerを取得してリセット
          // Cat作成前に実行することで、BondingUpdaterが正しい時刻を使用する
          const globalRegistry = GlobalRegistry.getInstance();
          const gameTimeManager = globalRegistry.getGameTimeManager();
          gameTimeManager.reset();

          const catRepository = new CatRepository();

          // TODO: userIdを適切に取得する（現在は仮実装）
          const userId = 'current-user';
          cat = await catRepository.getCatByUserId(userId);

          logInfo('GameCanvas: Created cat via Repository', {
            bondingLevel: cat.getBonding().getLevel(),
            bondingGauge: cat.getBonding().getGauge()
          });
        } catch (error) {
          const errorMessage = 'ねこの情報が取得できませんでした';
          logError('GameCanvas: Failed to load cat from repository', { error: error instanceof Error ? error.message : String(error) });
          if (onCatStateError) {
            onCatStateError(errorMessage);
            return; // ゲーム初期化を中断
          }
        }

        const gameConfig = {
          cat: cat,
          catName: catName || cat?.name,
          onGameEnd: onGameEnd
        };

        const success = await gameManagerRef.current.startGame(
          gameRef.current,
          gameConfig,
          {
            onGameReady: (game) => {
              if (mounted) {
                phaserGameRef.current = game;
                setIsLoaded(true);
                setLoadError(null);
                if (onGameReady && gameManagerRef.current) {
                  onGameReady(game, gameManagerRef.current);
                }
              }
            },
            onStateChange: (state) => {
              if (state === 'error') {
                setLoadError('ゲームの初期化に失敗しました。');
              }
            }
          }
        );

        if (!success) {
          setLoadError('ゲームの開始に失敗しました。');
        }
      } catch (error) {
        logError('Failed to initialize game', { error: error instanceof Error ? error.message : String(error) });
        if (mounted) {
          setLoadError('ゲームの初期化に失敗しました。ページを再読み込みしてください。');
        }
      }
    };

    initializeGame();

    return () => {
      mounted = false;
      if (gameManagerRef.current) {
        gameManagerRef.current.destroy();
        gameManagerRef.current = null;
      }
      if (phaserGameRef.current) {
        phaserGameRef.current = null;
      }
    };
  }, [catName, onGameEnd, onGameReady]);

  return (
    <div ref={gameRef} className="w-[800px] h-[600px] border-2 border-gray-300 rounded-lg shadow-lg bg-sky-100 relative">
      {!isLoaded && !loadError && (
        <div className="absolute inset-0 flex items-center justify-center bg-sky-100/80 z-10">
          <div className="text-gray-600">ゲームを読み込んでいます...</div>
        </div>
      )}
      {loadError && (
        <div className="absolute inset-0 flex items-center justify-center bg-red-50 z-10">
          <div className="text-red-600 text-center">
            <div className="mb-4 flex items-center justify-center gap-2">
              <GameIcon imageId={IMAGE_IDS.ERROR_WARNING} size="md" fallbackEmoji="⚠️" />
              エラー
            </div>
            <div>{loadError}</div>
          </div>
        </div>
      )}
    </div>
  );
}