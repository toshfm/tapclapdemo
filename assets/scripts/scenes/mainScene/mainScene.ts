import { ZINDEXES } from "../../enums/zIndexes";
import { MathHelper } from "../../helpers/mathHelper";
import { IInteractResponse } from "../../interfaces/iInteractResponse";
import { INode } from "../../interfaces/iNode";
import { ILogicService } from "../../interfaces/services/iLogicService";
import { getLogic, ServicesInitializer } from "../../ioc/init";
import { Rum } from "../../Rum";
import { GameSettings } from "./gameSettings";
import { GameState } from "./gameState";

let _: MainScene;

const { ccclass, property } = cc._decorator;

@ccclass
export default class MainScene extends cc.Component {

    logic: ILogicService

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
    settings: cc.Node;
    shadow: cc.Node;
    replay: cc.Node;
    winLoseLabel: cc.Node;

    onLoad() {
        ServicesInitializer.initialize();
        _ = this;
        _.logic = getLogic();
        _.blocksPool = new cc.NodePool("Block");
        _.gridCoverNode = cc.find('Canvas/gameplay_node/parent');
        _.movesLabel = cc.find('Canvas/moves_node/moves');
        _.movesLabel.parent.zIndex = ZINDEXES.movesNode;
        _.movesBackground = cc.find('Canvas/moves_node/bg_moves');
        _.pointsLabel = cc.find('Canvas/moves_node/points');
        _.boosterReshuffle = cc.find('Canvas/boosters_node/boosters_panel/reshuffle_booster/icon');
        _.boosterReshuffleLabel = cc.find('Canvas/boosters_node/boosters_panel/reshuffle_booster/label');
        _.boosterBomb = cc.find('Canvas/boosters_node/boosters_panel/bomb_booster/icon');
        _.boosterBombLabel = cc.find('Canvas/boosters_node/boosters_panel/bomb_booster/label');
        _.canvas = cc.find('Canvas');
        _.progress = cc.find('Canvas/moves_node/progress');
        _.settings = cc.find('Canvas/settings');
        _.shadow = cc.find('Canvas/shadow');
        _.replay = cc.find('Canvas/gameplay_node/replay');
        _.winLoseLabel = cc.find('Canvas/gameplay_node/winlose');
    }

    async start() {
        _.boosterReshuffle.on(cc.Node.EventType.TOUCH_START, () => {
            if (!Rum.isBlocked()) {
                _.reshuffle();
            }
        });
        _.boosterBomb.on(cc.Node.EventType.TOUCH_START, () => {
            if (!Rum.isBlocked()) {
                _.boosterBombToggle();
            }
        });
        _.settings.on(cc.Node.EventType.TOUCH_START, () => {
            if (!Rum.isBlocked()) {
                _.scheduleOnce(function () {
                    Rum.nextScene("Settings");
                }, 0.1);
            }
        });
        _.replay.on(cc.Node.EventType.TOUCH_START, () => {
            if (!Rum.isBlocked()) {
                _.startNewLevel();
            }
        });
        Rum.hoverButton(_.settings);
        Rum.hoverButton(_.boosterReshuffle);
        Rum.hoverButton(_.boosterBomb);
        Rum.hoverButton(_.replay);
        await _.startNewLevel();
    }

    async startNewLevel() {
        Rum.shadow(_.shadow, false);
        _.logic.prepareGrid();
        await _.prepareLevel();
        _.replay.position = cc.v3(0, -1300);
        _.winLoseLabel.position = cc.v3(0, 1300);
    }

    async prepareLevel() {
        Rum.addLock();
        await _.adaptGridCover();
        _.fillGridWithBlocks();
        _.fillLabels();
        Rum.removeLock();
    }

    async adaptGridCover(rows?: number, cols?: number): Promise<void> {
        rows ??= GameSettings.rows;
        cols ??= GameSettings.cols;
        let width = cols * GameSettings.colWidth + GameSettings.colWidth * 0.75;
        let height = rows * GameSettings.rowHeight + GameSettings.rowHeight * 0.75;
        return new Promise<void>((resolve) => {
            cc.tween(_.gridCoverNode.parent)
                .to(0.2, { width: width, height: height }, { easing: 'backIn' })
                .start();
            cc.tween(_.gridCoverNode)
                .to(0.2, { width: width, height: height }, { easing: 'backIn' })
                .call(() => {
                    resolve();
                })
                .start();
        })
    }

    fillLabels() {
        GameState.collectedPoints = 0;
        GameState.moves = GameSettings.startedMoves;
        GameState.boosterBomb = GameSettings.startedBoosterBomb
        GameState.boosterReshuffle = GameSettings.startedBoosterReshuffle;
        _.updateMoves();
        _.updatePoints();
        Rum.setText(_.boosterReshuffleLabel, GameSettings.startedBoosterReshuffle);
        Rum.setText(_.boosterBombLabel, GameSettings.startedBoosterBomb);
        _.setBoosterActivated(false);
    }

    fillGridWithBlocks() {
        for (let row = 0; row < GameSettings.rows; row++) {
            for (let col = 0; col < GameSettings.cols; col++) {
                _.createBlock(row, col);
            }
        }
    }

    boosterBombToggle() {
        if (GameState.boosterBomb <= 0 && !GameState.boosterBombActivated) {
            return;
        }
        _.setBoosterActivated(!GameState.boosterBombActivated);

    }

    setBoosterActivated(status: boolean) {
        GameState.boosterBombActivated = status;
        _.boosterBomb.color = status ? cc.Color.YELLOW : cc.Color.WHITE
    }

    reshuffle() {
        if (GameState.boosterReshuffle <= 0) {
            return;
        }
        Rum.addLock();
        Rum.blink(_.boosterReshuffle);
        _.logic.reshuffle();
        let promises: Promise<void>[] = [];
        for (let col = 0; col < GameSettings.cols; col++) {
            for (let row = 0; row < GameSettings.rows; row++) {
                let block = _.blocksOnStage.get(GameState.gridBlocks[row][col].id)
                if (block) {
                    promises.push(Rum.toPositionXY(block, GameState.gridPoints[row][col].x, GameState.gridPoints[row][col].y, 0.5));
                }
            }
        }
        Promise.all(promises);
        GameState.boosterReshuffle--;
        Rum.setText(_.boosterReshuffleLabel, GameState.boosterReshuffle);
        Rum.removeLock();
    }

    /**
     * Touch the block on Stage
     * Could be refactor into small pieces
     * @param block 
     * @returns true if move, false if not move
     */
    async blockTouch(block: cc.Node): Promise<boolean> {
        try {
            Rum.addLock();
            let response: IInteractResponse;
            //Check status of bomb bonus activity
            if (GameState.boosterBombActivated) {
                GameState.boosterBomb--;
                Rum.setText(_.boosterBombLabel, GameState.boosterBomb);
                _.boosterBombToggle();
                response = _.logic.interact((block as INode).gId, true);
                _.boomClip(block);
            } else {
                response = _.logic.interact((block as INode).gId);
            }
            //Process Response from logic
            response.boosters?.forEach(booster => {
                let el = _.blocksOnStage.get(booster)
                if ((el as INode).gTag === 'bomb') {
                    _.boomClip(el);
                } else if ((el as INode).gTag === 'rocketh') {
                    _.lightingClip(el);
                } else if ((el as INode).gTag === 'rocketv') {
                    _.lightingClip(el, true);
                }
                _.destroyBlock(el);
            });
            if (response.moveSuccess) {
                GameState.moves--;
                Rum.blink(_.movesBackground);
                Rum.pulse(_.movesLabel);
                _.updateMoves();
                await _.processBlocks(response.blocks);
                return (true);
            } else {
                Rum.pulse(block);
                return (false);
            }
        } finally {
            Rum.removeLock();
        }
    }

    boomClip(block) {
        let clipNode = Rum.playClip(_.bigBoom, { x: block.x, y: block.y + 50 }, _.gridCoverNode, ZINDEXES.boom);
        clipNode.setParent(_.canvas);
    }

    lightingClip(block, vertical?: boolean) {
        let x = vertical ? block.x : 0;
        let y = vertical ? 0 : block.y;
        let clipNode = Rum.playClip(_.lighting, { x: x, y: y }, _.gridCoverNode, ZINDEXES.boom);
        if(vertical) {
            clipNode.angle = 90;
        }
    }

    async processBlocks(blocksToDestroy: Set<string>): Promise<void> {
        let promises: Promise<void>[] = [];
        //Destroy blocks
        blocksToDestroy.forEach(element => {
            let gridEl = _.blocksOnStage.get(element);
            promises.push(_.destroyBlockToPoints(gridEl));
        });
        //Fill With new blocks
        for (let col = 0; col < GameSettings.cols; col++) {
            // row above the Grid if new 
            let newLine = 0;
            for (let row = 0; row < GameSettings.rows; row++) {
                if (GameState.gridBlocks[row][col].isMoved) {
                    let block = _.blocksOnStage.get(GameState.gridBlocks[row][col].id)
                    if (block) {
                        promises.push(Rum.toPositionXY(block, GameState.gridPoints[row][col].x, GameState.gridPoints[row][col].y, 0.5));
                    }
                } else if (GameState.gridBlocks[row][col].isNew) {
                    promises.push(Rum.toPositionXY(_.createBlock(row, col, newLine), GameState.gridPoints[row][col].x, GameState.gridPoints[row][col].y, 0.5));
                    newLine++;
                }
            }
        }
        await Promise.all(promises);
    }

    createBlock(row: number, col: number, newLine?: number): cc.Node {
        let block = _.blocksPool.get() ?? Rum.createNode(_.block);
        block.scale = 1;
        block.angle = 0;
        block.getComponent(cc.Sprite).spriteFrame = _[GameState.gridBlocks[row][col].block];
        (block as INode).gId = GameState.gridBlocks[row][col].id;
        (block as INode).gTag = GameState.gridBlocks[row][col].block;
        block.setParent(_.gridCoverNode);
        block.zIndex = ZINDEXES.blocks;
        block.on(cc.Node.EventType.TOUCH_START, async () => {
            if (!Rum.isBlocked()) {
                //true - we made a move; false - nothing to move
                if (await _.blockTouch(block)) {
                    await _.winLose();
                }
            }
        });
        _.blocksOnStage.set((block as INode).gId, block);
        if (newLine === undefined) {
            block.setPosition(GameState.gridPoints[row][col].x, GameState.gridPoints[row][col].y);
        } else {
            block.setPosition(GameState.gridPoints[row][col].x, GameState.gridPoints[GameSettings.rows - 1][col].y + GameSettings.rowHeight * 2 + GameSettings.rowHeight * newLine)
        }
        return block
    }

    async destroyBlockToPoints(gridEl: cc.Node): Promise<void> {
        if (gridEl) {
            gridEl.zIndex = ZINDEXES.flyingBlocks;
            //remove from Mask
            gridEl.setParent(_.canvas);
            return new Promise<void>((resolve) => {
                cc.tween(gridEl)
                    .to(MathHelper.getRandomFloat(0.2, 0.4), {
                        position: cc.v3(gridEl.getPosition().add(cc.v2(MathHelper.getRandomInt(-GameSettings.colWidth * 2, GameSettings.colWidth * 2), MathHelper.getRandomInt(-GameSettings.colWidth * 2, GameSettings.colWidth * 2)))),
                        scale: 1.1,
                        angle: MathHelper.getRandomInt(-1000, 1000)
                    }, { easing: 'circInOut' })
                    .to(MathHelper.getRandomFloat(0.2, 0.8), { position: cc.v3(Rum.getWorldCoord(_.pointsLabel, _.canvas)), scale: 0.7 }, { easing: 'circIn' })
                    .call(() => {
                        GameState.collectedPoints++;
                        _.updatePoints();
                        Rum.pulse(_.movesLabel.parent);
                        gridEl.off(cc.Node.EventType.TOUCH_START);
                        _.destroyBlock(gridEl)
                        resolve();
                    })
                    .start();
            })
        }
    }

    destroyBlock(block: cc.Node) {
        _.blocksPool.put(block);
        _.blocksOnStage.delete((block as INode).gId);
    }

    async winLose() {
        Rum.addLock();
        try {
            if (GameState.moves <= 0 || GameState.collectedPoints >= GameSettings.targetPoints) {
                let tweens = [];
                _.blocksOnStage.forEach(async block => {
                    tweens.push(new Promise<void>((resolve) => {
                        cc.tween(block)
                            .to(0.6, { position: cc.v3(block.x, block.y - 1000) })
                            .call(() => {
                                _.destroyBlock(block);
                                resolve();
                            })
                            .start()
                    }));
                })
                Rum.shadow(_.shadow, true);
                await Promise.all(tweens);
                await _.adaptGridCover(7, 7);
                tweens = [];
                tweens.push(Rum.toPositionXY(_.replay, 0, -150, 0.3));
                _.winLoseLabel.getComponent(cc.Label).string = GameState.collectedPoints >= GameSettings.targetPoints
                    ? 'ПОБЕДА!' : 'ПРОИГРАЛ!'
                tweens.push(Rum.toPositionXY(_.winLoseLabel, 0, 230, 0.3));
                await Promise.all(tweens);
            }
        } finally {
            Rum.removeLock();
        }
    }

    updatePoints() {
        _.progress.getComponent(cc.ProgressBar).progress = GameState.collectedPoints / GameSettings.targetPoints;
        Rum.setText(_.pointsLabel, `${GameState.collectedPoints}/${GameSettings.targetPoints}`);
    }

    updateMoves() {
        Rum.setText(_.movesLabel, GameState.moves);
    }
}
