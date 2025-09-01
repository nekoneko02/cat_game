'use client';

import { useState, useRef } from 'react';
import Layout from '@/components/Layout';
import GameCanvas from '@/components/GameCanvas';
import { Toy } from '@/types/cat';

const availableToys: Toy[] = [
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
  const [selectedToy, setSelectedToy] = useState<Toy | null>(null);
  const [bondingLevel, setBondingLevel] = useState(10);
  const gameRef = useRef<Phaser.Game | null>(null);

  const handleToySelect = (toy: Toy) => {
    setSelectedToy(toy);
    
    // Function to add toy
    const addToyToGame = () => {
      if (gameRef.current) {
        const scene = gameRef.current.scene.getScene('CatGame');
        if (scene && 'addToy' in scene) {
          (scene as any).addToy(toy.type);
        }
      } else {
        // Wait a bit and try again
        setTimeout(addToyToGame, 100);
      }
    };
    
    addToyToGame();
  };

  const handleStopPlaying = () => {
    setSelectedToy(null);
    
    if (gameRef.current) {
      const scene = gameRef.current.scene.getScene('CatGame');
      if (scene && 'removeToy' in scene) {
        (scene as any).removeToy();
      }
    }
  };

  const handleGameReady = (game: any) => {
    gameRef.current = game;
    
    // Set up bonding level callback
    const scene = game.scene.getScene('CatGame');
    if (scene && 'setBondingCallback' in scene) {
      (scene as any).setBondingCallback((newBondingLevel: number) => {
        setBondingLevel(newBondingLevel);
      });
    }
  };

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

        {/* Bonding Level Display */}
        <div className="bg-white rounded-lg shadow-md p-4 text-center">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">なつき度</h3>
          <div className="flex items-center justify-center space-x-2">
            <div className="flex">
              {[...Array(10)].map((_, i) => (
                <span
                  key={i}
                  className={`text-2xl ${
                    i < bondingLevel ? 'text-pink-500' : 'text-gray-300'
                  }`}
                >
                  ❤️
                </span>
              ))}
            </div>
            <span className="text-gray-600 font-medium">
              {bondingLevel}/10
            </span>
          </div>
        </div>

        {/* Game Canvas */}
        <GameCanvas onGameReady={handleGameReady} />

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
            <li>• 遊んでくれるとなつき度が上がります</li>
          </ul>
        </div>
      </div>
    </Layout>
  );
}