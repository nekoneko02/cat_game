'use client';

import { useState, useRef, useEffect, useCallback, Suspense } from 'react';
import dynamicImport from 'next/dynamic';

export const dynamic = 'force-dynamic';
import { useRouter, useSearchParams } from 'next/navigation';
import Layout from '@/components/Layout';

const GameCanvas = dynamicImport(() => import('@/components/GameCanvas'), {
  ssr: false,
  loading: () => <div>Loading game...</div>
});
// ToyType removed - using asset keys directly
import { PhaserGame } from '@/types/game';
import { CatState } from '@/lib/session';
import { apiClient } from '@/lib/ApiClient';
import { StateSaver } from '@/lib/StateSaver';
import { GameManager } from '@/lib/GameManager';
import { useNavigationGuard } from '@/lib/NavigationGuard';
import { Personality, Preferences } from '@/domain/cat/Cat';
import { GameIcon } from '@/components/GameIcon';
import { ToyImage } from '@/components/ToyImage';
import { IMAGE_IDS } from '@/constants/images';
import { getToyAsset } from '@/constants/toys';
import { logDebug, logError, logInfo } from '@/lib/log';

function PlayPageContent() {
  const [toyKey, setToyKey] = useState<string | null>(null);
  const [catState, setCatState] = useState<CatState | null>(null);
  const [catName, setCatName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showPauseMenu, setShowPauseMenu] = useState(false);
  const gameRef = useRef<PhaserGame | null>(null);
  const gameManagerRef = useRef<GameManager | null>(null);
  const stateSaverRef = useRef<StateSaver | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  const saveCatState = useCallback(async () => {
    // ゲームが初期化されていない場合は何もしない
    if (!gameManagerRef.current || !stateSaverRef.current) {
      logDebug('PlayPage: Game not initialized, skipping cat state save');
      return;
    }

    try {
      logDebug('PlayPage: Getting current cat state from game...');
      const currentState = gameManagerRef.current.getCurrentCatState() as {
        bonding: {
          level: number;
          gauge: number;
        };
        personality: Personality;
        preferences: Preferences;
      } | null;

      logDebug('PlayPage: Current game state', { currentState });

      if (currentState) {
        const catStateToSave: CatState = {
          bonding: currentState.bonding,
          personality: currentState.personality,
          preferences: currentState.preferences
        };

        logDebug('PlayPage: Saving cat state', { catStateToSave });
        const result = await stateSaverRef.current.saveCatState(catStateToSave);
        logDebug('PlayPage: Save result', { result });

        if (!result.success) {
          logError('PlayPage: Failed to save cat state', { error: result.error });
        } else {
          logInfo('PlayPage: Cat state saved successfully');
        }
      } else {
        logDebug('PlayPage: No current cat state to save');
      }
    } catch (error) {
      logError('PlayPage: Failed to save cat state', { error: error instanceof Error ? error.message : String(error) });
    }
  }, []);

  // NavigationGuardを設定
  useNavigationGuard(!!toyKey, {
    onBeforeUnload: saveCatState,
    onRouteChange: async () => {
      await saveCatState();
      return true;
    }
  });

  const checkSessionAndLoadCatState = useCallback(async () => {
    try {
      const response = await apiClient.getCatState();

      if (!response.success) {
        logError('Failed to load cat state', { error: response.error });
        if (response.error?.includes('認証')) {
          router.push('/signup');
          return;
        }
      }

      if (response.data?.catName) {
        setCatName(response.data.catName);
      }
    } catch (error) {
      logError('Failed to load cat state', { error: error instanceof Error ? error.message : String(error) });
      router.push('/signup');
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    const toyParam = searchParams.get('toy');
    if (!toyParam) {
      router.push('/toy-selection');
      return;
    }

    setToyKey(toyParam);
    checkSessionAndLoadCatState();
    // GameManagerはGameCanvasから受け取るので作成しない
    stateSaverRef.current = new StateSaver();
    logDebug('PlayPage: Created new StateSaver instance');
  }, [checkSessionAndLoadCatState, searchParams, router]);

  // おもちゃ追加処理は handleGameReady で実行

  const handleExitGame = async () => {
    await saveCatState();
    if (gameManagerRef.current) {
      gameManagerRef.current.removeToyFromGame();
    }
    router.push('/toy-selection');
  };

  const handlePauseGame = () => {
    setShowPauseMenu(true);
    // ゲームポーズ処理（GameManagerに追加が必要）
    if (gameManagerRef.current) {
      gameManagerRef.current.pauseGame();
    }
  };

  const handleResumeGame = () => {
    setShowPauseMenu(false);
    if (gameManagerRef.current) {
      gameManagerRef.current.resumeGame();
    }
  };

  const handleCatStateError = useCallback((error: string) => {
    logError('Cat state error', { error });
    alert(error);
    router.push('/toy-selection');
  }, [router]);

  const handleGameReady = useCallback((game: PhaserGame, gameManager: GameManager) => {
    gameRef.current = game;
    gameManagerRef.current = gameManager; // GameCanvasからの正しいGameManagerインスタンスを使用

    logDebug('handleGameReady called', { toyKey, hasGameManager: !!gameManager });

    if (toyKey && gameManager) {
      logDebug('Attempting to add toy after 100ms delay');
      setTimeout(() => {
        logDebug('Timeout triggered, calling addToyToGame');
        const result = gameManager.addToyToGame(toyKey);
        logDebug('addToyToGame result', { result });
      }, 100);
    }
  }, [toyKey]);

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">ゲームを準備しています...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!toyKey) {
    return null;
  }

  const toyAsset = getToyAsset(toyKey);
  const toyName = toyAsset ? toyAsset.name : 'おもちゃ';

  return (
    <Layout>
      <div className="space-y-4">
        {/* Game Header */}
        <div className="flex items-center justify-between bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center space-x-3">
            <ToyImage toyId={toyKey} size="xl" />
            <div>
              <h1 className="text-xl font-bold text-gray-800">
                {toyName}で遊ぶ
              </h1>
              <p className="text-sm text-gray-600">
                {catName || 'ねこちゃん'}と楽しく遊びましょう！
              </p>
            </div>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={handlePauseGame}
              className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-md text-sm transition-colors"
            >
              ポーズ
            </button>
            <button
              onClick={handleExitGame}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md text-sm transition-colors"
            >
              <GameIcon imageId={IMAGE_IDS.PLAY_EXIT_DOOR} size="sm" fallbackEmoji="🚪" className="inline mr-1" />
              終了
            </button>
          </div>
        </div>

        {/* Game Canvas */}
        <GameCanvas
          onGameReady={handleGameReady}
          catName={catName || undefined}
          onGameEnd={saveCatState}
          onCatStateError={handleCatStateError}
        />

        {/* Game Instructions */}
        <div className="bg-blue-50 rounded-lg p-4">
          <h4 className="font-semibold text-blue-800 mb-2">遊び方</h4>
          <ul className="text-blue-700 text-sm space-y-1">
            <li>• マウスを動かしておもちゃを動かしましょう</li>
            <li>• ねこちゃんがおもちゃに興味を示すか観察してください</li>
            <li>• 遊んでくれるとなつき度が上がります（ゲーム画面左上に表示）</li>
            <li>• ポーズボタンでゲームを一時停止できます</li>
          </ul>
        </div>
      </div>

      {/* Pause Menu Modal */}
      {showPauseMenu && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">
              ゲームを一時停止中
            </h3>
            <p className="text-gray-600 text-center mb-6">
              どうしますか？
            </p>
            <div className="flex space-x-3">
              <button
                onClick={handleResumeGame}
                className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-md transition-colors"
              >
                ゲームを再開
              </button>
              <button
                onClick={handleExitGame}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-md transition-colors"
              >
                ゲームを終了
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}

export default function PlayPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PlayPageContent />
    </Suspense>
  );
}