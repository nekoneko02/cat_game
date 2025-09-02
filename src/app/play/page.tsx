'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '@/components/Layout';
import GameCanvas from '@/components/GameCanvas';
import type { ToyType } from '@/domain/entities/Toy';
import { PhaserGame } from '@/types/game';
import { CatState } from '@/lib/session';

interface ToyDisplay {
  id: ToyType;
  name: string;
  type: ToyType;
  attributes: {
    appearance: string;
    material: string;
    sound: string;
    color: string;
  };
}

const availableToys: ToyDisplay[] = [
  {
    id: 'ball',
    name: 'ボール',
    type: 'ball',
    attributes: {
      appearance: 'round',
      material: 'rubber',
      sound: 'bounce',
      color: 'red',
    },
  },
  {
    id: 'feather',
    name: 'フェザー',
    type: 'feather',
    attributes: {
      appearance: 'fluffy',
      material: 'feather',
      sound: 'rustle',
      color: 'colorful',
    },
  },
  {
    id: 'mouse',
    name: 'ねずみ',
    type: 'mouse',
    attributes: {
      appearance: 'small',
      material: 'fabric',
      sound: 'squeak',
      color: 'gray',
    },
  },
];

export default function PlayPage() {
  const [selectedToy, setSelectedToy] = useState<ToyDisplay | null>(null);
  const [catState, setCatState] = useState<CatState | null>(null);
  const [catName, setCatName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const gameRef = useRef<PhaserGame | null>(null);
  const router = useRouter();

  useEffect(() => {
    checkSessionAndLoadCatState();
  }, []);

  // おもちゃ選択変更時の処理（ゲーム初期化後のおもちゃ変更のみ）
  useEffect(() => {
    if (gameRef.current && selectedToy) {
      const waitForScene = () => {
        const scene = gameRef.current?.scene.getScene('CatGame');
        if (scene && 'addToy' in scene) {
          (scene as any).addToy(selectedToy.type);
        } else if (!scene) {
          setTimeout(waitForScene, 100);
        }
      };
      waitForScene();
    }
  }, [selectedToy]);

  const checkSessionAndLoadCatState = async () => {
    try {
      const response = await fetch('/api/cat-state',
        {
          method: 'GET',
          credentials: 'include',
        }
      );
      if (response.status === 401) {
        router.push('/signup');
        return;
      }
      
      const data = await response.json();
      if (data.catState) {
        setCatState(data.catState);
      }
      if (data.catName) {
        setCatName(data.catName);
      }
    } catch (error) {
      console.error('Failed to load cat state:', error);
      router.push('/signup');
    } finally {
      setLoading(false);
    }
  };

  const saveCatState = useCallback(async () => {
    if (!gameRef.current) return;
    
    try {
      const scene = gameRef.current.scene.getScene('CatGame');
      if (scene && 'getCurrentCatState' in scene) {
        const currentState = (scene as any).getCurrentCatState();
        const catStateToSave: CatState = {
          bonding: currentState.bonding,
          playfulness: currentState.playfulness,
          fear: currentState.fear,
          personality: currentState.personality,
          preferences: currentState.preferences
        };
        
        await fetch('/api/cat-state', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({ catState: catStateToSave }),
        });
      }
    } catch (error) {
      console.error('Failed to save cat state:', error);
    }
  }, []);

  const handleToySelect = async (toy: ToyDisplay) => {
    if (selectedToy) {
      await saveCatState();
    }
    setSelectedToy(toy);
  };

  const handleStopPlaying = async () => {
    await saveCatState();
    setSelectedToy(null);
    
    if (gameRef.current) {
      const scene = gameRef.current.scene.getScene('CatGame');
      if (scene && 'removeToy' in scene) {
        scene.removeToy();
      }
    }
  };

  const handleGameReady = useCallback((game: PhaserGame) => {
    gameRef.current = game;
    
    // シーンが利用可能になるまで少し待機
    const waitForScene = () => {
      const scene = game.scene.getScene('CatGame');
      
      if (!scene) {
        // シーンがまだ利用できない場合、少し待って再試行
        setTimeout(waitForScene, 100);
        return;
      }
      
      if ('endGame' in scene) {
        window.addEventListener('beforeunload', async () => {
          await saveCatState();
          (scene as any).endGame();
        });
      }

      // 選択されたおもちゃがある場合は自動的に追加
      if (selectedToy && 'addToy' in scene) {
        (scene as any).addToy(selectedToy.type);
      }
    };
    
    waitForScene();
  }, [selectedToy, saveCatState]);

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

  return (
    <Layout>
      <div className="space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            🐱 ねこと遊ぶ
          </h1>
          <p className="text-gray-600">
            おもちゃを選んでねこちゃんと遊びましょう！
          </p>
        </div>

        {/* Game Canvas */}
        {selectedToy ? (
          <GameCanvas 
            onGameReady={handleGameReady} 
            initialCatState={catState || undefined}
            catName={catName || undefined}
            onGameEnd={saveCatState}
          />
        ) : (
          <div className="w-full flex justify-center">
            <div className="w-[800px] h-[600px] border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50">
              <div className="text-center text-gray-500">
                <div className="text-4xl mb-4">🎾</div>
                <p className="text-lg font-medium">おもちゃを選んでゲームを開始してください</p>
                <p className="text-sm mt-2">下からおもちゃを選ぶとねこちゃんが現れます</p>
              </div>
            </div>
          </div>
        )}

        {/* Toy Selection */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            おもちゃを選んでください
          </h3>
          
          {selectedToy && (
            <div className="mb-4 p-3 bg-pink-50 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-pink-800">
                  🎾 {selectedToy.name}で遊んでいます
                </span>
                <button
                  onClick={handleStopPlaying}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded text-sm"
                >
                  終了
                </button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-3 gap-4">
            {availableToys.map((toy) => (
              <button
                key={toy.id}
                onClick={() => handleToySelect(toy)}
                disabled={selectedToy?.id === toy.id}
                className={`p-4 rounded-lg border-2 transition-colors ${
                  selectedToy?.id === toy.id
                    ? 'border-pink-500 bg-pink-50 text-pink-700'
                    : 'border-gray-200 hover:border-pink-300 hover:bg-pink-50'
                }`}
              >
                <div className="text-3xl mb-2">
                  {toy.type === 'ball' ? '🎾' : 
                   toy.type === 'feather' ? '🪶' : '🐭'}
                </div>
                <div className="font-medium">{toy.name}</div>
                <div className="text-sm text-gray-600 mt-1">
                  {toy.attributes.color}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Game Instructions */}
        <div className="bg-blue-50 rounded-lg p-4">
          <h4 className="font-semibold text-blue-800 mb-2">遊び方</h4>
          <ul className="text-blue-700 text-sm space-y-1">
            <li>• おもちゃを選んでゲーム画面に表示させます</li>
            <li>• マウスを動かしておもちゃを動かしましょう</li>
            <li>• ねこちゃんがおもちゃに興味を示すか観察してください</li>
            <li>• 遊んでくれるとなつき度が上がります（ゲーム画面左上に表示）</li>
          </ul>
        </div>
      </div>
    </Layout>
  );
}