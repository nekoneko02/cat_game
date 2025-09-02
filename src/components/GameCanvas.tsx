'use client';

import { useLayoutEffect, useRef, useState } from 'react';
import { PhaserGame } from '@/types/game';
import { CatState } from '@/lib/session';

interface GameCanvasProps {
  onGameReady?: (game: PhaserGame) => void;
  initialCatState?: CatState;
  catName?: string;
  onGameEnd?: () => Promise<void>;
}

export default function GameCanvas({ onGameReady, initialCatState, catName, onGameEnd }: GameCanvasProps) {
  const gameRef = useRef<HTMLDivElement>(null);
  const phaserGameRef = useRef<PhaserGame | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  useLayoutEffect(() => {
    let mounted = true;
    
    // Dynamic import to avoid SSR issues
    const loadPhaser = async () => {
      try {
        const [Phaser, { default: CatGame }] = await Promise.all([
          import('phaser'),
          import('@/game/CatGame')
        ]);
        
        if (!mounted) return;
        
        setIsLoaded(true);
        setLoadError(null);
        

        if (gameRef.current && !phaserGameRef.current) {
          const catGameConfig = initialCatState ? {
            initialCatState: {
              bonding: initialCatState.bonding,
              playfulness: initialCatState.playfulness,
              fear: initialCatState.fear,
              personality: initialCatState.personality,
              preferences: initialCatState.preferences,
              catName: catName
            },
            onGameEnd: onGameEnd
          } : { onGameEnd: onGameEnd };

          const config = {
            type: Phaser.AUTO,
            width: 800,
            height: 600,
            parent: gameRef.current,
            backgroundColor: '#87CEEB',
            render: {
              antialias: true,
              pixelArt: false,
              transparent: false,
              clearBeforeRender: true,
              premultipliedAlpha: true,
              preserveDrawingBuffer: false,
              failIfMajorPerformanceCaveat: false,
              powerPreference: 'default',
            },
            physics: {
              default: 'arcade',
              arcade: {
                gravity: { x: 0, y: 0 },
                debug: false,
              },
            },
          };

          phaserGameRef.current = new Phaser.Game(config) as PhaserGame;
          
          // シーンを手動で追加して初期設定を渡す
          const catGameScene = phaserGameRef.current.scene.add('CatGame', CatGame, false, catGameConfig);
          phaserGameRef.current.scene.start('CatGame');
          
          if (onGameReady && mounted) {
            onGameReady(phaserGameRef.current);
          }
        }
      } catch (error) {
        console.error('Failed to load Phaser game:', error);
        if (mounted) {
          setLoadError('ゲームの読み込みに失敗しました。ページを再読み込みしてください。');
        }
      }
    };

    loadPhaser();

    return () => {
      mounted = false;
      if (phaserGameRef.current) {
        phaserGameRef.current.destroy(true);
        phaserGameRef.current = null;
      }
    };
  }, []);

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
          <div className="mb-4">⚠️ エラー</div>
          <div>{loadError}</div>
        </div>
      </div>
    )}
  </div>

  );
}