import { Block } from "../../enums/Block";
import { Booster } from "../../enums/Booster";
import { GameEvent } from "../../enums/GameEvent";
import { ZIndex } from "../../enums/ZIndex";
import { MathHelper } from "../../helpers/MathHelper";
import { IGridElement } from "../../interfaces/IGridElement";
import { IInteractResponse } from "../../interfaces/IInteractResponse";
import { IMove } from "../../interfaces/IMove";
import { INode } from "../../interfaces/INode";
import { IEventEmitter } from "../../interfaces/services/IEventEmitter";
import { IGameSettings } from "../../interfaces/services/IGameSettings";
import { IGridPointsService } from "../../interfaces/services/IGridPointsService";
import { ILogicService } from "../../interfaces/services/ILogicService";
import { IUiUtils } from "../../interfaces/services/IUiUtils";
import { getLogic, DIInitializer, getUI, getSettings, getState, getEvents, getGridPoints } from "../../ioc/Init";

const { ccclass, property } = cc._decorator;

@ccclass
export default class MainScene extends cc.Component {

    logic: ILogicService;
    ui: IUiUtils;
    settings: IGameSettings;
    events: IEventEmitter;
    grid: IGridPointsService;

    blocksOnStage: Map<string, cc.Node> = new Map();
    blocksPool: cc.NodePool;

    @property(cc.Prefab)
    block: cc.Prefab = null;

    @property(cc.Prefab)
    bigBoom: cc.Prefab = null;

    @property(cc.Prefab)
    lighting: cc.Prefab = null;

    @property(cc.SpriteFrame)
    block1: cc.SpriteFrame = null;

    @property(cc.SpriteFrame)
    block2: cc.SpriteFrame = null;

    @property(cc.SpriteFrame)
    block3: cc.SpriteFrame = null;

    @property(cc.SpriteFrame)
    block4: cc.SpriteFrame = null;

    @property(cc.SpriteFrame)
    bomb: cc.SpriteFrame = null;

    @property(cc.SpriteFrame)
    rocketh: cc.SpriteFrame = null;

    @property(cc.SpriteFrame)
    rocketv: cc.SpriteFrame = null;

    gridCoverNode: cc.Node;
    movesLabel: cc.Node;
    movesBackground: cc.Node;
    pointsLabel: cc.Node;
    boosterReshuffleLabel: cc.Node;
    boosterBombLabel: cc.Node;
    boosterReshuffle: cc.Node;
    boosterBomb: cc.Node;
    progress: cc.Node;
    canvas: cc.Node;
    settingsNode: cc.Node;
    shadow: cc.Node;
    replay: cc.Node;
    winLoseLabel: cc.Node;

    onLoad() {
        DIInitializer.initialize();
        this.logic = getLogic();
        this.ui = getUI();
        this.settings = getSettings();
        this.events = getEvents();
        this.grid = getGridPoints();

        this.blocksPool = new cc.NodePool("Block");
        this.gridCoverNode = cc.find('Canvas/gameplay_node/parent');
        this.movesLabel = cc.find('Canvas/moves_node/moves');
        this.movesLabel.parent.zIndex = ZIndex.movesNode;
        this.movesBackground = cc.find('Canvas/moves_node/bg_moves');
        this.pointsLabel = cc.find('Canvas/moves_node/points');
        this.boosterReshuffle = cc.find('Canvas/boosters_node/boosters_panel/reshuffle_booster/icon');
        this.boosterReshuffleLabel = cc.find('Canvas/boosters_node/boosters_panel/reshuffle_booster/label');
        this.boosterBomb = cc.find('Canvas/boosters_node/boosters_panel/bomb_booster/icon');
        this.boosterBombLabel = cc.find('Canvas/boosters_node/boosters_panel/bomb_booster/label');
        this.canvas = cc.find('Canvas');
        this.progress = cc.find('Canvas/moves_node/progress');
        this.settingsNode = cc.find('Canvas/settings');
        this.shadow = cc.find('Canvas/shadow');
        this.replay = cc.find('Canvas/gameplay_node/replay');
        this.winLoseLabel = cc.find('Canvas/gameplay_node/winlose');
    }

    async start() {
        this.boosterReshuffle.on(cc.Node.EventType.TOUCH_START, () => {
            if (!this.ui.uiIsLocked()) {
                this.logic.handleBoosterClick(Booster.reshuffle)
            }
        });
        this.boosterBomb.on(cc.Node.EventType.TOUCH_START, () => {
            if (!this.ui.uiIsLocked()) {
                this.logic.handleBoosterClick(Booster.superbomb)
            }
        });
        this.replay.on(cc.Node.EventType.TOUCH_START, () => {
            if (!this.ui.uiIsLocked()) {
                this.logic.newLevel()
            }
        });
        this.settingsNode.on(cc.Node.EventType.TOUCH_START, () => {
            if (!this.ui.uiIsLocked()) {
                this.scheduleOnce(() => {
                    this.ui.nextScene("Settings");
                }, 0.1);
            }
        });
        this.ui.hoverButton(this.settingsNode);
        this.ui.hoverButton(this.boosterReshuffle);
        this.ui.hoverButton(this.boosterBomb);
        this.ui.hoverButton(this.replay);

        this.events.on(GameEvent.MOVES_CHANGED, (value) => this.updateMoves(value));
        this.events.on(GameEvent.POINTS_CHANGED, (value) => this.updatePoints(value));
        this.events.on(GameEvent.PREPARE_GRID, async () => await this.startNewLevel());
        this.events.on(GameEvent.BOOSTER_BOMB_QANTITY_CHANGED, (value) => this.updateBombCount(value));
        this.events.on(GameEvent.BOOSTER_RESHUFFLE_QANTITY_CHANGED, (value) => this.updateReshuffleCount(value));
        this.events.on(GameEvent.BOOSTER_BOMB_STATE_CHANGED, (value) => this.updateBombState(value));
        this.events.on(GameEvent.RESHUFFLE, async (value) => await this.reshuffle(value));
        this.events.on(GameEvent.WIN, async () => await this.winLose());
        this.events.on(GameEvent.LOSE, async () => await this.winLose(false));
        this.events.on(GameEvent.BLOCK_CREATED, async (value) => await this.createBlock(value));
        this.events.on(GameEvent.BLOCK_CLICK_HAPPENED, async (value) => await this.interaction(value));
        this.events.on(GameEvent.BOMB_ANIMATION, (value) => this.boomClip(value));
        this.events.on(GameEvent.ROCKETH_ANIMATION, (value) => this.lightingClip(value));
        this.events.on(GameEvent.ROCKETV_ANIMATION, (value) => this.lightingClip(value, true))

        this.logic.newLevel();
    }

    async startNewLevel() {
        try {
            this.ui.addLock();
            this.ui.shadow(this.shadow, false);
            await this.adaptGridCover();
            this.replay.position = cc.v3(0, -1300);
            this.winLoseLabel.position = cc.v3(0, 1300);
        } finally {
            this.ui.removeLock();
            this.events.emit(GameEvent.GRID_PREPARED);
        }
    }

    async adaptGridCover(rows?: number, cols?: number): Promise<void> {
        rows ??= this.settings.rows;
        cols ??= this.settings.cols;
        let width = cols * this.settings.colWidth + this.settings.colWidth * 0.75;
        let height = rows * this.settings.rowHeight + this.settings.rowHeight * 0.75;
        return new Promise<void>((resolve) => {
            cc.tween(this.gridCoverNode.parent)
                .to(0.2, { width: width, height: height }, { easing: 'backIn' })
                .start();
            cc.tween(this.gridCoverNode)
                .to(0.2, { width: width, height: height }, { easing: 'backIn' })
                .call(() => {
                    resolve();
                })
                .start();
        });
    }

    async reshuffle(moves: Array<IMove>): Promise<void> {
        try {
            this.ui.addLock();
            let promises: Promise<void>[] = [];

            moves.forEach(move => {
                let block = this.blocksOnStage.get(move.id);
                if (block) {
                    let point = this.grid.gridPoints.get(move.row, move.col);
                    promises.push(this.ui.toPositionXY(block, point.x, point.y, 0.5));
                }
            });

            Promise.all(promises);
        } finally {
            this.ui.removeLock();
        }
    }

    async interaction(value: IInteractResponse) {
        try {
            this.ui.addLock()
            if (value.moveSuccess) {
                value.bonusBlocks?.forEach(bonus => {
                    let el = this.blocksOnStage.get(bonus)
                    this.destroyBlock(el);
                });

                let promises: Promise<void>[] = [];
                value.normalBlocks.forEach(id => {
                    let gridEl = this.blocksOnStage.get(id);
                    promises.push(this.destroyBlockToPoints(gridEl));
                });
                await Promise.all(promises);
                this.logic.checkWinLose();
            } else {
                this.ui.pulse(this.blocksOnStage.get(value.interactedBlockId));
            }
        } finally {
            this.ui.removeLock();
        }
    }

    async createBlock(el: IGridElement): Promise<cc.Node> {
        try {
            this.ui.addLock();
            let block = this.blocksPool.get() ?? this.ui.createNode(this.block);
            block.scale = 1;
            block.angle = 0;
            block.getComponent(cc.Sprite).spriteFrame = this[Block[el.block]];
            (block as INode).gId = el.id;
            (block as INode).gTag = Block[el.block];
            block.setParent(this.gridCoverNode);
            block.zIndex = ZIndex.blocks;
            block.on(cc.Node.EventType.TOUCH_START, async () => {
                if (!this.ui.uiIsLocked()) {
                    this.logic.handleBlockClick((block as INode).gId);

                }
            });
            this.blocksOnStage.set((block as INode).gId, block);
            let point = this.grid.gridPoints.get(el.row, el.col);
            if (el.above) {
                block.setPosition(point.x, point.y + this.settings.rowHeight * 2 + this.settings.rowHeight * el.above)
                await this.ui.toPositionXY(block, point.x, point.y, 0.5);
            } else {
                block.setPosition(point.x, point.y);
            }

            return block
        } finally {
            this.ui.removeLock();
        }
    }

    async destroyBlockToPoints(gridEl: cc.Node): Promise<void> {
        if (gridEl) {
            gridEl.zIndex = ZIndex.flyingBlocks;
            //remove from Mask
            gridEl.setParent(this.canvas);
            return new Promise<void>((resolve) => {
                cc.tween(gridEl)
                    .to(MathHelper.getRandomFloat(0.2, 0.4), {
                        position: cc.v3(gridEl.getPosition().add(cc.v2(MathHelper.getRandomInt(-this.settings.colWidth * 2, this.settings.colWidth * 2), MathHelper.getRandomInt(-this.settings.colWidth * 2, this.settings.colWidth * 2)))),
                        scale: 1.1,
                        angle: MathHelper.getRandomInt(-1000, 1000)
                    }, { easing: 'circInOut' })
                    .to(MathHelper.getRandomFloat(0.2, 0.8), { position: cc.v3(this.ui.getWorldCoord(this.pointsLabel, this.canvas)), scale: 0.7 }, { easing: 'circIn' })
                    .call(() => {
                        this.logic.addCollectedPoints((gridEl as INode).gTag);
                        gridEl.off(cc.Node.EventType.TOUCH_START);
                        this.destroyBlock(gridEl);
                        resolve();
                    })
                    .start();
            })
        }
    }

    destroyBlock(block: cc.Node) {
        this.blocksPool.put(block);
        this.blocksOnStage.delete((block as INode)?.gId);
    }

    async winLose(isWin = true) {
        try {
            this.ui.addLock();
            let tweens = [];
            this.blocksOnStage.forEach(async block => {
                tweens.push(new Promise<void>((resolve) => {
                    cc.tween(block)
                        .to(0.6, { position: cc.v3(block.x, block.y - 1000) })
                        .call(() => {
                            this.destroyBlock(block);
                            resolve();
                        })
                        .start()
                }));
            });
            this.ui.shadow(this.shadow, true);
            await Promise.all(tweens);
            await this.adaptGridCover(7, 7);
            tweens = [];
            tweens.push(this.ui.toPositionXY(this.replay, 0, -150, 0.3));
            this.winLoseLabel.getComponent(cc.Label).string = isWin ? 'ПОБЕДА!' : 'ПРОИГРАЛ!'
            tweens.push(this.ui.toPositionXY(this.winLoseLabel, 0, 230, 0.3));
            await Promise.all(tweens);
        } finally {
            this.ui.removeLock();
        }
    }

    boomClip(value: { row: number, col: number }) {
        let point = this.grid.gridPoints.get(value.row, value.col);
        let clipNode = this.ui.playClip(this.bigBoom, { x: point.x, y: point.y + 50 }, this.gridCoverNode, ZIndex.boom);
        clipNode.setParent(this.canvas);
    }

    lightingClip(value: { row: number, col: number }, vertical?: boolean) {
        let point = this.grid.gridPoints.get(value.row, value.col);
        let x = vertical ? point.x : 0;
        let y = vertical ? 0 : point.y;
        let clipNode = this.ui.playClip(this.lighting, { x: x, y: y }, this.gridCoverNode, ZIndex.boom);
        if (vertical) {
            clipNode.angle = 90;
        }
    }

    updateBombState(value: boolean) {
        this.boosterBomb.color = value ? cc.Color.YELLOW : cc.Color.WHITE
    }

    updateReshuffleCount(value: number) {
        this.ui.blink(this.boosterReshuffle);
        this.ui.setText(this.boosterReshuffleLabel, value);
    }

    updateBombCount(value: number) {
        this.ui.setText(this.boosterBombLabel, value);
    }

    updatePoints(value: { progress: number, points: string }) {
        this.progress.getComponent(cc.ProgressBar).progress = value.progress;
        this.ui.setText(this.pointsLabel, value.points);
        this.ui.pulse(this.movesLabel.parent);
    }

    updateMoves(value: number) {
        this.ui.blink(this.movesBackground);
        this.ui.pulse(this.movesLabel);
        this.ui.setText(this.movesLabel, value);
    }

    onDestroy(): void {
        this.events.removeAll();
    }
}
