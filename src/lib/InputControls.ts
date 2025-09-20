import * as Phaser from 'phaser';
import { UserSessionManager } from './UserSessionManager';
import { SessionAction } from '@/domain/entities/User';
import { Cat } from '@/domain/entities/Cat';
import { Toy } from '@/domain/entities/Toy';

export interface InputConfig {
  enablePetting: boolean;
  enableToyMovement: boolean;
  pettingDistance: number;
}

export interface InputHandlers {
  onPetCat?: (x: number, y: number) => void;
  onToyMove?: (x: number, y: number) => void;
}

export class InputControls {
  private sessionManager: UserSessionManager;
  private config: InputConfig;

  constructor() {
    this.sessionManager = UserSessionManager.getInstance();
    this.config = {
      enablePetting: true,
      enableToyMovement: true,
      pettingDistance: 60
    };
  }

  setupMouseControls(
    scene: Phaser.Scene,
    catSprite: Phaser.Physics.Arcade.Sprite,
    toySprite: Phaser.Physics.Arcade.Sprite | undefined,
    cat: Cat,
    toy: Toy | undefined,
    handlers: InputHandlers = {}
  ): void {
    this.setupToyMovement(scene, toySprite, toy, handlers.onToyMove);
    this.setupPettingInteraction(scene, catSprite, cat, handlers.onPetCat);
  }

  setupToyMovement(
    scene: Phaser.Scene,
    toySprite: Phaser.Physics.Arcade.Sprite | undefined,
    toy: Toy | undefined,
    onToyMove?: (x: number, y: number) => void
  ): void {
    if (!this.config.enableToyMovement) return;

    scene.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      if (toySprite && toySprite.active && toy) {
        toySprite.setPosition(pointer.x, pointer.y);
        this.sessionManager.recordAction(SessionAction.mouseMove(pointer.x, pointer.y));

        if (onToyMove) {
          onToyMove(pointer.x, pointer.y);
        }
      }
    });
  }

  setupPettingInteraction(
    scene: Phaser.Scene,
    catSprite: Phaser.Physics.Arcade.Sprite,
    cat: Cat,
    onPetCat?: (x: number, y: number) => void
  ): void {
    if (!this.config.enablePetting) return;

    scene.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      const distance = Phaser.Math.Distance.Between(
        catSprite.x,
        catSprite.y,
        pointer.x,
        pointer.y
      );

      if (distance < this.config.pettingDistance) {
        cat.petByUser();
        this.sessionManager.recordAction(SessionAction.petCat(pointer.x, pointer.y));

        if (onPetCat) {
          onPetCat(pointer.x, pointer.y);
        }
      }
    });
  }

  setupKeyboardControls(scene: Phaser.Scene, handlers: { [key: string]: () => void }): void {
    Object.entries(handlers).forEach(([key, handler]) => {
      scene.input.keyboard?.on(`keydown-${key.toUpperCase()}`, handler);
    });
  }

  setupDragAndDrop(
    scene: Phaser.Scene,
    sprite: Phaser.GameObjects.Sprite,
    onDragStart?: () => void,
    onDrag?: (x: number, y: number) => void,
    onDragEnd?: (x: number, y: number) => void
  ): void {
    sprite.setInteractive();
    scene.input.setDraggable(sprite);

    sprite.on('dragstart', () => {
      if (onDragStart) onDragStart();
    });

    sprite.on('drag', (pointer: Phaser.Input.Pointer, dragX: number, dragY: number) => {
      sprite.x = dragX;
      sprite.y = dragY;
      if (onDrag) onDrag(dragX, dragY);
    });

    sprite.on('dragend', () => {
      if (onDragEnd) onDragEnd(sprite.x, sprite.y);
    });
  }

  setupAnalogStick(
    scene: Phaser.Scene,
    centerX: number,
    centerY: number,
    radius: number,
    onMove?: (angle: number, distance: number) => void
  ): Phaser.GameObjects.Group {
    const stickGroup = scene.add.group();

    const background = scene.add.circle(centerX, centerY, radius, 0x333333, 0.5);
    const knob = scene.add.circle(centerX, centerY, radius * 0.3, 0x666666, 0.8);

    stickGroup.add(background);
    stickGroup.add(knob);

    knob.setInteractive();
    scene.input.setDraggable(knob);

    knob.on('drag', (pointer: Phaser.Input.Pointer) => {
      const distance = Phaser.Math.Distance.Between(centerX, centerY, pointer.x, pointer.y);
      const maxDistance = radius * 0.7;

      if (distance <= maxDistance) {
        knob.x = pointer.x;
        knob.y = pointer.y;
      } else {
        const angle = Phaser.Math.Angle.Between(centerX, centerY, pointer.x, pointer.y);
        knob.x = centerX + Math.cos(angle) * maxDistance;
        knob.y = centerY + Math.sin(angle) * maxDistance;
      }

      if (onMove) {
        const finalAngle = Phaser.Math.Angle.Between(centerX, centerY, knob.x, knob.y);
        const finalDistance = Phaser.Math.Distance.Between(centerX, centerY, knob.x, knob.y) / maxDistance;
        onMove(finalAngle, Math.min(finalDistance, 1));
      }
    });

    knob.on('dragend', () => {
      knob.x = centerX;
      knob.y = centerY;
      if (onMove) onMove(0, 0);
    });

    return stickGroup;
  }

  updateConfig(newConfig: Partial<InputConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  getConfig(): InputConfig {
    return { ...this.config };
  }

  removeAllListeners(scene: Phaser.Scene): void {
    scene.input.removeAllListeners();
  }
}