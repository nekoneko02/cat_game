'use client';

import * as Phaser from 'phaser';
import { CatState, Toy } from '@/types/cat';

export default class CatGame extends Phaser.Scene {
  private cat!: Phaser.Physics.Arcade.Sprite;
  private toy?: Phaser.Physics.Arcade.Sprite;
  private catState: CatState;
  private isPlaying: boolean = false;
  private onBondingChange?: (bonding: number) => void;
  
  constructor() {
    super({ key: 'CatGame' });
    
    this.catState = {
      position: { x: 400, y: 300 },
      emotions: {
        valence: 0,
        arousal: 0,
        safety: 0.5,
        social: 0,
        discomfort: 0,
      },
      internalStates: {
        hunger: 0.3,
        thirst: 0.3,
        fatigue: 0.2,
        sleepiness: 0.1,
        health: 1.0,
        excretion: 0.1,
        bonding: 0.1,
        anxiety: 0.2,
        curiosity: 0.8,
        playfulness: 0.9,
        fear: 0.1,
      },
      personality: {
        social: 0.7,
        active: 0.8,
        bold: 0.6,
        dependent: 0.5,
        friendly: 0.8,
      },
      preferences: {
        toyType: ['ball', 'feather', 'mouse'],
        movementSpeed: 0.7,
        movementDirection: ['horizontal', 'vertical'],
        randomness: 0.6,
      },
    };
  }

  preload() {
    // Nothing to preload - we'll create textures in create()
  }


  create() {
    this.physics.world.setBounds(0, 0, 800, 600);
    
    // Set camera bounds
    this.cameras.main.setBounds(0, 0, 800, 600);
    this.cameras.main.setBackgroundColor('#87CEEB');
    
    // Create simple textures
    this.createSimpleSprites();
    
    // Create cat sprite with simple texture
    this.cat = this.physics.add.sprite(
      this.catState.position.x,
      this.catState.position.y,
      'simple_cat'
    );
    
    this.cat.setScale(1.5);
    this.cat.setCollideWorldBounds(true);
    this.cat.setBounce(0.1);
    
    this.startIdleBehavior();
    
    // Set up mouse interaction
    this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      if (this.toy && this.toy.active) {
        this.toy.setPosition(pointer.x, pointer.y);
        this.attractCatToToy();
      }
    });
  }

  private createSimpleSprites() {
    // Clear any existing textures first
    if (this.textures.exists('simple_cat')) {
      this.textures.remove('simple_cat');
    }
    if (this.textures.exists('simple_ball')) {
      this.textures.remove('simple_ball');
    }
    if (this.textures.exists('cat_idle')) {
      this.textures.remove('cat_idle');
    }
    if (this.textures.exists('toy_ball')) {
      this.textures.remove('toy_ball');
    }

    // Create cat sprite texture - orange cat with ears
    const catGraphics = this.add.graphics();
    // Cat body (main circle)
    catGraphics.fillStyle(0xffa500);
    catGraphics.fillCircle(32, 40, 18);
    // Cat head
    catGraphics.fillCircle(32, 25, 12);
    // Cat ears (triangles)
    catGraphics.fillTriangle(22, 18, 18, 10, 26, 13);
    catGraphics.fillTriangle(42, 18, 38, 13, 46, 10);
    // Eyes
    catGraphics.fillStyle(0x000000);
    catGraphics.fillCircle(28, 22, 2);
    catGraphics.fillCircle(36, 22, 2);
    catGraphics.generateTexture('simple_cat', 64, 64);
    catGraphics.destroy();

    // Create ball sprite texture - red ball
    const ballGraphics = this.add.graphics();
    ballGraphics.fillStyle(0xff6b6b);
    ballGraphics.fillCircle(16, 16, 12);
    // Add highlight
    ballGraphics.fillStyle(0xffffff);
    ballGraphics.fillCircle(12, 12, 3);
    ballGraphics.generateTexture('simple_ball', 32, 32);
    ballGraphics.destroy();
  }

  update() {
    this.updateCatBehavior();
  }

  private startIdleBehavior() {
    const idleTimer = this.time.addEvent({
      delay: 2000 + Math.random() * 3000,
      callback: this.performIdleAction,
      callbackScope: this,
      loop: true,
    });
  }

  private performIdleAction() {
    if (this.isPlaying) return;
    
    const actions = ['move', 'sit', 'clean'];
    const randomAction = Phaser.Utils.Array.GetRandom(actions);
    
    switch (randomAction) {
      case 'move':
        this.moveRandomly();
        break;
      case 'sit':
        this.cat.setVelocity(0);
        break;
      case 'clean':
        break;
    }
  }

  private moveRandomly() {
    const targetX = Phaser.Math.Between(100, 700);
    const targetY = Phaser.Math.Between(100, 500);
    
    this.physics.moveTo(this.cat, targetX, targetY, 100);
    
    this.time.delayedCall(1000, () => {
      this.cat.setVelocity(0);
    });
  }

  private attractCatToToy() {
    if (!this.toy) return;
    
    const distance = Phaser.Math.Distance.Between(
      this.cat.x,
      this.cat.y,
      this.toy.x,
      this.toy.y
    );
    
    if (distance < 200) {
      this.isPlaying = true;
      
      const shouldChase = Math.random() < this.catState.internalStates.playfulness;
      
      if (shouldChase) {
        this.physics.moveTo(this.cat, this.toy.x, this.toy.y, 150);
        
        if (distance < 50) {
          this.cat.setVelocity(0);
          this.updateBonding(0.1);
        }
      }
    } else {
      this.isPlaying = false;
    }
  }

  public addToy(toyType: string) {
    if (this.toy) {
      this.toy.destroy();
    }
    
    // Check if texture exists and create toy sprite
    if (!this.textures.exists('simple_ball')) {
      // Create a fallback texture immediately
      const fallbackGraphics = this.add.graphics();
      fallbackGraphics.fillStyle(0x00ff00);
      fallbackGraphics.fillRect(0, 0, 32, 32);
      fallbackGraphics.generateTexture('fallback_ball', 32, 32);
      fallbackGraphics.destroy();
      
      this.toy = this.physics.add.sprite(400, 300, 'fallback_ball');
    } else {
      this.toy = this.physics.add.sprite(400, 300, 'simple_ball');
    }
    this.toy.setScale(2); // Make it bigger to be more visible
    this.toy.setInteractive();
    this.toy.setDepth(10); // Ensure it's rendered on top
    
    // Add a simple color change for different toy types
    if (toyType === 'feather') {
      this.toy.setTint(0x00ff00); // Green for feather
    } else if (toyType === 'mouse') {
      this.toy.setTint(0x888888); // Gray for mouse
    } else {
      this.toy.setTint(0xffffff); // White for ball (keeps original red color)
    }
  }

  public removeToy() {
    if (this.toy) {
      this.toy.destroy();
      this.toy = undefined;
      this.isPlaying = false;
    }
  }

  private updateCatBehavior() {
    this.catState.internalStates.playfulness = Math.max(
      0,
      this.catState.internalStates.playfulness - 0.0001
    );
  }

  private updateBonding(amount: number) {
    this.catState.internalStates.bonding = Math.min(
      1,
      this.catState.internalStates.bonding + amount
    );
    
    // Notify React component of bonding change
    if (this.onBondingChange) {
      const bondingLevel = Math.floor(this.catState.internalStates.bonding * 10);
      this.onBondingChange(bondingLevel);
    }
  }

  public setBondingCallback(callback: (bonding: number) => void) {
    this.onBondingChange = callback;
  }

  public getCatState(): CatState {
    return this.catState;
  }
}