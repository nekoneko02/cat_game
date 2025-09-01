'use client';

import { useEffect, useRef, useState } from 'react';

interface GameCanvasProps {
  onGameReady?: (game: any) => void;
}

export default function GameCanvas({ onGameReady }: GameCanvasProps) {
  const gameRef = useRef<HTMLDivElement>(null);
  const phaserGameRef = useRef<any>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Dynamic import to avoid SSR issues
    const loadPhaser = async () => {
      const [Phaser, { default: CatGame }] = await Promise.all([
        import('phaser'),
        import('@/game/CatGame')
      ]);
      setIsLoaded(true);
      
      if (gameRef.current && !phaserGameRef.current) {
        const config = {
          type: Phaser.AUTO,
          width: 800,
          height: 600,
          parent: gameRef.current,
          backgroundColor: '#87CEEB',
          physics: {
            default: 'arcade',
            arcade: {
              gravity: { x: 0, y: 0 },
              debug: false,
            },
          },
          scene: [CatGame],
        };

        phaserGameRef.current = new Phaser.Game(config);
        
        if (onGameReady) {
          onGameReady(phaserGameRef.current);
        }
      }
    };

    loadPhaser();

    return () => {
      if (phaserGameRef.current) {
        phaserGameRef.current.destroy(true);
        phaserGameRef.current = null;
      }
    };
  }, [onGameReady]);

  return (
    <div className="w-full flex justify-center">
      {!isLoaded ? (
        <div className="w-[800px] h-[600px] border-2 border-gray-300 rounded-lg shadow-lg bg-sky-100 flex items-center justify-center">
          <div className="text-gray-600">ゲームを読み込んでいます...</div>
        </div>
      ) : (
        <div
          ref={gameRef}
          className="border-2 border-gray-300 rounded-lg shadow-lg bg-sky-100"
        />
      )}
    </div>
  );
}