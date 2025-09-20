'use client';

import { useLayoutEffect, useRef, useState } from 'react';
import { PhaserGame } from '@/types/game';
import { CatState } from '@/lib/session';
import { GameManager } from '@/lib/GameManager';
import { apiClient } from '@/lib/ApiClient';
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

        // ゲーム開始時に最新の猫状態を取得
        let initialCatGameConfig: CatState | undefined = undefined;
        try {
          logDebug('GameCanvas: Calling getCatState API...');
          const response = await apiClient.getCatState();
          logDebug('GameCanvas: getCatState response', { response });

          if (response.success && response.data?.catState) {
            // CatStateをCatGameConfigに変換
            initialCatGameConfig = {
              bonding: response.data.catState.bonding,
              playfulness: response.data.catState.playfulness,
              fear: response.data.catState.fear,
              personality: response.data.catState.personality,
              preferences: response.data.catState.preferences
            };
            logInfo('GameCanvas: Using loaded cat state', { initialCatGameConfig });
          } else {
            const errorMessage = 'ねこの情報が取得できませんでした';
            logError('GameCanvas: Cat state retrieval failed', { error: response.error });
            if (onCatStateError) {
              onCatStateError(errorMessage);
              return; // ゲーム初期化を中断
            }
          }
        } catch (error) {
          const errorMessage = 'ねこの情報が取得できませんでした';
          logError('GameCanvas: Failed to load initial cat state', { error: error instanceof Error ? error.message : String(error) });
          if (onCatStateError) {
            onCatStateError(errorMessage);
            return; // ゲーム初期化を中断
          }
        }

        const gameConfig = {
          initialCatState: initialCatGameConfig,
          catName: catName || undefined,
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