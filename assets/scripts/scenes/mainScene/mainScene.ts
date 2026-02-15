import { BLOCK } from "../../enums/block";
import { BOOSTER } from "../../enums/booster";
import { GAMEEVENT } from "../../enums/gameEvent";
import { ZINDEX } from "../../enums/zIndexes";
import { MathHelper } from "../../helpers/mathHelper";
import { IGridElement } from "../../interfaces/iGridElement";
import { IInteractResponse } from "../../interfaces/iInteractResponse";
import { IMove } from "../../interfaces/iMove";
import { INode } from "../../interfaces/iNode";
import { IEventEmitter } from "../../interfaces/services/iEventEmitter";
import { IGameSettings } from "../../interfaces/services/iGameSettings";
import { IGameState } from "../../interfaces/services/iGameState";
import { IGridViewService } from "../../interfaces/services/iGridPointsService";
import { ILogicService } from "../../interfaces/services/iLogicService";
import { IUiUtils } from "../../interfaces/services/iUiUtils";
import { getLogic, DIInitializer, getUI, getSettings, getState, getEvents, getGridPoints } from "../../ioc/init";

let _: MainScene;

const { ccclass, property } = cc._decorator;

@ccclass
export default class MainScene extends cc.Component {

    logic: ILogicService;
    ui: IUiUtils;
    settings: IGameSettings;
    state: IGameState;
    events: IEventEmitter;
    grid: IGridViewService;

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
        _ = this;
        _.logic = getLogic();
        _.ui = getUI();
        _.settings = getSettings();
        _.events = getEvents();
        _.grid = getGridPoints();
        _.state = getState();

        _.blocksPool = new cc.NodePool("Block");
        _.gridCoverNode = cc.find('Canvas/gameplay_node/parent');
        _.movesLabel = cc.find('Canvas/moves_node/moves');
        _.movesLabel.parent.zIndex = ZINDEX.movesNode;
        _.movesBackground = cc.find('Canvas/moves_node/bg_moves');
        _.pointsLabel = cc.find('Canvas/moves_node/points');
        _.boosterReshuffle = cc.find('Canvas/boosters_node/boosters_panel/reshuffle_booster/icon');
        _.boosterReshuffleLabel = cc.find('Canvas/boosters_node/boosters_panel/reshuffle_booster/label');
        _.boosterBomb = cc.find('Canvas/boosters_node/boosters_panel/bomb_booster/icon');
        _.boosterBombLabel = cc.find('Canvas/boosters_node/boosters_panel/bomb_booster/label');
        _.canvas = cc.find('Canvas');
        _.progress = cc.find('Canvas/moves_node/progress');
        _.settingsNode = cc.find('Canvas/settings');
        _.shadow = cc.find('Canvas/shadow');
        _.replay = cc.find('Canvas/gameplay_node/replay');
        _.winLoseLabel = cc.find('Canvas/gameplay_node/winlose');
    }

    async start() {
        _.boosterReshuffle.on(cc.Node.EventType.TOUCH_START, () => {
            if (!_.ui.uiIsLocked()) {
                _.logic.handleBoosterClick(BOOSTER.reshuffle)
            }
        });
        _.boosterBomb.on(cc.Node.EventType.TOUCH_START, () => {
            if (!_.ui.uiIsLocked()) {
                _.logic.handleBoosterClick(BOOSTER.superbomb)
            }
        });
        _.replay.on(cc.Node.EventType.TOUCH_START, () => {
            if (!_.ui.uiIsLocked()) {
                _.logic.newLevel()
            }
        });
        _.settingsNode.on(cc.Node.EventType.TOUCH_START, () => {
            if (!_.ui.uiIsLocked()) {
                _.scheduleOnce(function () {
                    _.ui.nextScene("Settings");
                }, 0.1);
            }
        });
        _.ui.hoverButton(_.settingsNode);
        _.ui.hoverButton(_.boosterReshuffle);
        _.ui.hoverButton(_.boosterBomb);
        _.ui.hoverButton(_.replay);

        _.events.on(GAMEEVENT.MOVES_CHANGED, (value) => _.updateMoves(value));
        _.events.on(GAMEEVENT.POINTS_CHANGED, (value) => _.updatePoints(value));
        _.events.on(GAMEEVENT.PREPARE_GRID, async () => await _.startNewLevel());
        _.events.on(GAMEEVENT.BOOSTER_RESHUFFLE_QANTITY_CHANGED, (value) => _.updateReshuffleCount(value));
        _.events.on(GAMEEVENT.BOOSTER_BOMB_QANTITY_CHANGED, (value) => _.updateBombCount(value));
        _.events.on(GAMEEVENT.BOOSTER_BOMB_STATE_CHANGED, (value) => _.updateBombState(value));
        _.events.on(GAMEEVENT.RESHUFFLE, (value) => _.reshuffle(value));
        _.events.on(GAMEEVENT.WIN, async () => await _.win());
        _.events.on(GAMEEVENT.LOSE, async () => await _.win(false));
        _.events.on(GAMEEVENT.BLOCK_CREATED, (value) => _.createBlock(value));
        _.events.on(GAMEEVENT.BLOCK_CLICK_HAPPENED, async(value) => await _.interaction(value));
        _.events.on(GAMEEVENT.BOMB_ANIMATION, (value) => _.boomClip(value));
        _.events.on(GAMEEVENT.ROCKETH_ANIMATION, (value) => _.lightingClip(value));
        _.events.on(GAMEEVENT.ROCKETV_ANIMATION, (value) => _.lightingClip(value, true))

        _.logic.newLevel();
    }

    async startNewLevel() {
        try {
            _.ui.addLock();
            _.ui.shadow(_.shadow, false);
            await _.adaptGridCover();
            _.replay.position = cc.v3(0, -1300);
            _.winLoseLabel.position = cc.v3(0, 1300);
        } finally {
            _.ui.removeLock();
            _.events.emit(GAMEEVENT.GRID_PREPARED);
        }
    }

    async adaptGridCover(rows?: number, cols?: number): Promise<void> {
        rows ??= _.settings.getRows();
        cols ??= _.settings.getCols();
        let width = cols * _.settings.getColWidth() + _.settings.getColWidth() * 0.75;
        let height = rows * _.settings.getRowHeight() + _.settings.getRowHeight() * 0.75;
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

    reshuffle(moves: Array<IMove>) {
        try {
            _.ui.addLock();
            let promises: Promise<void>[] = [];

            moves.forEach(move => {
                let block = _.blocksOnStage.get(move.id);
                if (block) {
                    let point = _.grid.getGridPoint(move.row, move.col);
                    promises.push(_.ui.toPositionXY(block, point.x, point.y, 0.5));
                }
            });

            Promise.all(promises);
        } finally {
            _.ui.removeLock();
        }
    }

    async interaction(value: IInteractResponse) {
        try {
            _.ui.addLock()
            value.bonusBlocks?.forEach(booster => {
                let el = _.blocksOnStage.get(booster)
                _.destroyBlock(el);
            });
            if (value.moveSuccess) {
                await _.processBlocks(value.normalBlocks);
                return (true);
            } else {
                _.ui.pulse(_.blocksOnStage.get(value.interactedBlockId));
                return (false);
            }
        } finally {
            _.ui.removeLock();
        }
    }


    /**
     * Touch the block on Stage
     * TODO: Could be refactor into small pieces
     * @param block 
     * @returns true if move, false if not move
     */
    // async blockTouch(block: cc.Node): Promise<boolean> {
    //     try {
    //         _.ui.addLock();
    //         let response: IInteractResponse;
    //         //Check status of bomb bonus activity
    //         if (_.state.getActiveBooster()) {
    //             response = _.logic.handleBlockClick((block as INode).gId);
    //             _.boomClip(block);
    //         } else {
    //             response = _.logic.handleBlockClick((block as INode).gId);
    //         }
    //         //Process Response from logic
    //         response.bonusBlocks?.forEach(booster => {
    //             let el = _.blocksOnStage.get(booster)
    //             if ((el as INode).gTag === 'bomb') {
    //                 _.boomClip(el);
    //             } else if ((el as INode).gTag === 'rocketh') {
    //                 _.lightingClip(el);
    //             } else if ((el as INode).gTag === 'rocketv') {
    //                 _.lightingClip(el, true);
    //             }
    //             _.destroyBlock(el);
    //         });
    //         if (response.moveSuccess) {
    //             await _.processBlocks(response.normalBlocks);
    //             return (true);
    //         } else {
    //             _.ui.pulse(block);
    //             return (false);
    //         }
    //     } finally {
    //         _.ui.removeLock();
    //     }
    // }

    boomClip(value) {
        let point = _.grid.getGridPoint(value.row, value.col);
        let clipNode = _.ui.playClip(_.bigBoom, { x: point.x, y: point.y + 50 }, _.gridCoverNode, ZINDEX.boom);
        clipNode.setParent(_.canvas);
    }

    lightingClip(value, vertical?: boolean) {
        let point = _.grid.getGridPoint(value.row, value.col);
        let x = vertical ? point.x : 0;
        let y = vertical ? 0 : point.y;
        let clipNode = _.ui.playClip(_.lighting, { x: x, y: y }, _.gridCoverNode, ZINDEX.boom);
        if (vertical) {
            clipNode.angle = 90;
        }
    }

    async processBlocks(blocksToDestroy: Set<string>): Promise<void> {
        let promises: Promise<void>[] = [];

        blocksToDestroy.forEach(id => {
            let gridEl = _.blocksOnStage.get(id);
            promises.push(_.destroyBlockToPoints(gridEl));
        });
        
        //Fill With new blocks
        for (let col = 0; col < _.settings.getCols(); col++) {
            // row above the Grid if new 
            let newLine = 0;
            for (let row = 0; row < _.settings.getRows(); row++) {
                if (_.state.getGridBlock(row, col).isMoved) {
                    let block = _.blocksOnStage.get(_.state.getGridBlock(row, col).id)
                    if (block) {
                        //promises.push(_.ui.toPositionXY(block, _.state.getGridPoint(row, col).x, _.state.getGridPoint(row, col).y, 0.5));
                    }
                } else if (_.state.getGridBlock(row, col).isNew) {
                    //promises.push(_.ui.toPositionXY(_.createBlock(row, col, newLine), _.state.getGridPoint(row, col).x, _.state.getGridPoint(row, col).y, 0.5));
                    newLine++;
                }
            }
        }
        await Promise.all(promises);
    }

    createBlock(el: IGridElement): cc.Node {
        let block = _.blocksPool.get() ?? _.ui.createNode(_.block);
        block.scale = 1;
        block.angle = 0;
        block.getComponent(cc.Sprite).spriteFrame = _[BLOCK[el.block]];
        (block as INode).gId = el.id;
        (block as INode).gTag = BLOCK[el.block];
        block.setParent(_.gridCoverNode);
        block.zIndex = ZINDEX.blocks;
        block.on(cc.Node.EventType.TOUCH_START, async () => {
            if (!_.ui.uiIsLocked()) {
                _.logic.handleBlockClick((block as INode).gId);
                //true - we made a move; false - nothing to move
                // if (await _.blockTouch(block)) {
                //     await _.win();
                // }
            }
        });
        _.blocksOnStage.set((block as INode).gId, block);
        let point = _.grid.getGridPoint(el.row, el.col)
        // if (newLine === undefined) {
        block.setPosition(point.x, point.y);
        // } else {

        //block.setPosition(point.x, point.y + _.settings.getRowHeight() * 2 + _.settings.getRowHeight() * newLine)
        // }
        return block
    }

    // _createBlock(row: number, col: number, newLine?: number): cc.Node {
    //     let block = _.blocksPool.get() ?? _.ui.createNode(_.block);
    //     block.scale = 1;
    //     block.angle = 0;
    //     block.getComponent(cc.Sprite).spriteFrame = _[BLOCK[_.state.getGridBlock(row, col).block]];
    //     (block as INode).gId = _.state.getGridBlock(row, col).id;
    //     (block as INode).gTag = BLOCK[_.state.getGridBlock(row, col).block];
    //     block.setParent(_.gridCoverNode);
    //     block.zIndex = ZINDEX.blocks;
    //     block.on(cc.Node.EventType.TOUCH_START, async () => {
    //         if (!_.ui.uiIsLocked()) {
    //             //true - we made a move; false - nothing to move
    //             if (await _.blockTouch(block)) {
    //                 await _.win();
    //             }
    //         }
    //     });
    //     _.blocksOnStage.set((block as INode).gId, block);
    //     if (newLine === undefined) {
    //         block.setPosition(_.state.getGridPoint(row, col).x, _.state.getGridPoint(row, col).y);
    //     } else {
    //         block.setPosition(_.state.getGridPoint(row, col).x, _.state.getGridPoint(_.settings.getRows() - 1, col).y + _.settings.getRowHeight() * 2 + _.settings.getRowHeight() * newLine)
    //     }
    //     return block
    // }

    async destroyBlockToPoints(gridEl: cc.Node): Promise<void> {
        if (gridEl) {
            gridEl.zIndex = ZINDEX.flyingBlocks;
            //remove from Mask
            gridEl.setParent(_.canvas);
            return new Promise<void>((resolve) => {
                cc.tween(gridEl)
                    .to(MathHelper.getRandomFloat(0.2, 0.4), {
                        position: cc.v3(gridEl.getPosition().add(cc.v2(MathHelper.getRandomInt(-_.settings.getColWidth() * 2, _.settings.getColWidth() * 2), MathHelper.getRandomInt(-_.settings.getColWidth() * 2, _.settings.getColWidth() * 2)))),
                        scale: 1.1,
                        angle: MathHelper.getRandomInt(-1000, 1000)
                    }, { easing: 'circInOut' })
                    .to(MathHelper.getRandomFloat(0.2, 0.8), { position: cc.v3(_.ui.getWorldCoord(_.pointsLabel, _.canvas)), scale: 0.7 }, { easing: 'circIn' })
                    .call(() => {
                        _.state.addCollectedPoins();
                        // _.updatePoints();
                        // _.ui.pulse(_.movesLabel.parent);
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
        _.blocksOnStage.delete((block as INode)?.gId);
    }

    async win(isWin = true) {
        try {
            _.ui.addLock();
            //if (_.state.getMoves() <= 0 || _.state.getCollectedPoints() >= _.settings.getTargetPoints()) {
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
            _.ui.shadow(_.shadow, true);
            await Promise.all(tweens);
            await _.adaptGridCover(7, 7);
            tweens = [];
            tweens.push(_.ui.toPositionXY(_.replay, 0, -150, 0.3));
            _.winLoseLabel.getComponent(cc.Label).string = isWin ? 'ПОБЕДА!' : 'ПРОИГРАЛ!'
            tweens.push(_.ui.toPositionXY(_.winLoseLabel, 0, 230, 0.3));
            await Promise.all(tweens);
            //}
        } finally {
            _.ui.removeLock();
        }
    }

    updateBombState(value) {
        _.boosterBomb.color = value ? cc.Color.YELLOW : cc.Color.WHITE
    }

    updateReshuffleCount(value) {
        _.ui.blink(_.boosterReshuffle);
        _.ui.setText(_.boosterReshuffleLabel, value);
    }

    updateBombCount(value) {
        _.ui.setText(_.boosterBombLabel, value);
    }

    updatePoints(value) {
        _.progress.getComponent(cc.ProgressBar).progress = value.progress;
        _.ui.setText(_.pointsLabel, value.points);
        _.ui.pulse(_.movesLabel.parent);
    }

    updateMoves(value) {
        _.ui.blink(_.movesBackground);
        _.ui.pulse(_.movesLabel);
        _.ui.setText(_.movesLabel, value);
    }

    onDestroy(): void {
        _.events.removeAll();
    }
}
