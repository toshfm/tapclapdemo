import { BLOCK } from "../../enums/block";
import { ZINDEX } from "../../enums/zIndexes";
import { MathHelper } from "../../helpers/mathHelper";
import { IInteractResponse } from "../../interfaces/iInteractResponse";
import { INode } from "../../interfaces/iNode";
import { IGameSettings } from "../../interfaces/services/iGameSettings";
import { IGameState } from "../../interfaces/services/iGameState";
import { ILogicService } from "../../interfaces/services/iLogicService";
import { IUiUtils } from "../../interfaces/services/iUiUtils";
import { getLogic, DIInitializer, getUI, getSettings, getState } from "../../ioc/init";

let _: MainScene;

const { ccclass, property } = cc._decorator;

@ccclass
export default class MainScene extends cc.Component {

    logic: ILogicService;
    ui: IUiUtils;
    settings: IGameSettings;
    state: IGameState;

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
                _.reshuffle();
            }
        });
        _.boosterBomb.on(cc.Node.EventType.TOUCH_START, () => {
            if (!_.ui.uiIsLocked()) {
                _.boosterBombToggle();
            }
        });
        _.settingsNode.on(cc.Node.EventType.TOUCH_START, () => {
            if (!_.ui.uiIsLocked()) {
                _.scheduleOnce(function () {
                    _.ui.nextScene("Settings");
                }, 0.1);
            }
        });
        _.replay.on(cc.Node.EventType.TOUCH_START, () => {
            if (!_.ui.uiIsLocked()) {
                _.startNewLevel();
            }
        });
        _.ui.hoverButton(_.settingsNode);
        _.ui.hoverButton(_.boosterReshuffle);
        _.ui.hoverButton(_.boosterBomb);
        _.ui.hoverButton(_.replay);
        await _.startNewLevel();
    }

    async startNewLevel() {
        _.ui.shadow(_.shadow, false);
        _.logic.prepareGrid();
        await _.prepareLevel();
        _.replay.position = cc.v3(0, -1300);
        _.winLoseLabel.position = cc.v3(0, 1300);
    }

    async prepareLevel() {
        _.ui.addLock();
        await _.adaptGridCover();
        _.fillGridWithBlocks();
        _.fillLabels();
        _.ui.removeLock();
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

    fillLabels() {
        _.state.setCollectedPoints(0);
        _.state.setMoves(_.settings.getStartedMoves());
        _.state.setBoosterBomb(_.settings.getStartedBoosterBomb());
        _.state.setBoosterReshuffle(_.settings.getStartedBoosterReshuffle());
        _.updateMoves();
        _.updatePoints();
        _.ui.setText(_.boosterReshuffleLabel, _.settings.getStartedBoosterReshuffle());
        _.ui.setText(_.boosterBombLabel, _.settings.getStartedBoosterBomb());
        _.setBoosterActivated(false);
    }

    fillGridWithBlocks() {
        for (let row = 0; row < _.settings.getRows(); row++) {
            for (let col = 0; col < _.settings.getCols(); col++) {
                _.createBlock(row, col);
            }
        }
    }

    boosterBombToggle() {
        if (_.state.getBoosterBomb() <= 0 && !_.state.getBoosterBombActivated()) {
            return;
        }
        _.setBoosterActivated(!_.state.getBoosterBombActivated());

    }

    setBoosterActivated(status: boolean) {
        _.state.setBoosterBombActivated(status);
        _.boosterBomb.color = status ? cc.Color.YELLOW : cc.Color.WHITE
    }

    reshuffle() {
        if (_.state.getBoosterReshuffle() <= 0) {
            return;
        }
        _.ui.addLock();
        _.ui.blink(_.boosterReshuffle);
        _.logic.reshuffle();
        let promises: Promise<void>[] = [];
        for (let col = 0; col < _.settings.getCols(); col++) {
            for (let row = 0; row < _.settings.getRows(); row++) {
                let block = _.blocksOnStage.get(_.state.getGridBlock(row,col).id)
                if (block) {
                    promises.push(_.ui.toPositionXY(block, _.state.getGridPoint(row,col).x, _.state.getGridPoint(row,col).y, 0.5));
                }
            }
        }
        Promise.all(promises);
        _.state.setBoosterReshuffle(_.state.getBoosterReshuffle()-1);
        _.ui.setText(_.boosterReshuffleLabel, _.state.getBoosterReshuffle());
        _.ui.removeLock();
    }

    /**
     * Touch the block on Stage
     * TODO: Could be refactor into small pieces
     * @param block 
     * @returns true if move, false if not move
     */
    async blockTouch(block: cc.Node): Promise<boolean> {
        try {
            _.ui.addLock();
            let response: IInteractResponse;
            //Check status of bomb bonus activity
            if (_.state.getBoosterBombActivated()) {
                _.state.setBoosterBomb(_.state.getBoosterBomb()-1);
                _.ui.setText(_.boosterBombLabel, _.state.getBoosterBomb());
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
                _.state.minusMove();
                _.ui.blink(_.movesBackground);
                _.ui.pulse(_.movesLabel);
                _.updateMoves();
                await _.processBlocks(response.blocks);
                return (true);
            } else {
                _.ui.pulse(block);
                return (false);
            }
        } finally {
            _.ui.removeLock();
        }
    }

    boomClip(block) {
        let clipNode = _.ui.playClip(_.bigBoom, { x: block.x, y: block.y + 50 }, _.gridCoverNode, ZINDEX.boom);
        clipNode.setParent(_.canvas);
    }

    lightingClip(block, vertical?: boolean) {
        let x = vertical ? block.x : 0;
        let y = vertical ? 0 : block.y;
        let clipNode = _.ui.playClip(_.lighting, { x: x, y: y }, _.gridCoverNode, ZINDEX.boom);
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
        for (let col = 0; col < _.settings.getCols(); col++) {
            // row above the Grid if new 
            let newLine = 0;
            for (let row = 0; row < _.settings.getRows(); row++) {
                if (_.state.getGridBlock(row,col).isMoved) {
                    let block = _.blocksOnStage.get(_.state.getGridBlock(row,col).id)
                    if (block) {
                        promises.push(_.ui.toPositionXY(block, _.state.getGridPoint(row,col).x, _.state.getGridPoint(row,col).y, 0.5));
                    }
                } else if (_.state.getGridBlock(row,col).isNew) {
                    promises.push(_.ui.toPositionXY(_.createBlock(row, col, newLine), _.state.getGridPoint(row,col).x, _.state.getGridPoint(row,col).y, 0.5));
                    newLine++;
                }
            }
        }
        await Promise.all(promises);
    }

    createBlock(row: number, col: number, newLine?: number): cc.Node {
        let block = _.blocksPool.get() ?? _.ui.createNode(_.block);
        block.scale = 1;
        block.angle = 0;
        block.getComponent(cc.Sprite).spriteFrame = _[BLOCK[_.state.getGridBlock(row,col).block]];
        (block as INode).gId = _.state.getGridBlock(row,col).id;
        (block as INode).gTag = BLOCK[_.state.getGridBlock(row,col).block];
        block.setParent(_.gridCoverNode);
        block.zIndex = ZINDEX.blocks;
        block.on(cc.Node.EventType.TOUCH_START, async () => {
            if (!_.ui.uiIsLocked()) {
                //true - we made a move; false - nothing to move
                if (await _.blockTouch(block)) {
                    await _.winLose();
                }
            }
        });
        _.blocksOnStage.set((block as INode).gId, block);
        if (newLine === undefined) {
            block.setPosition(_.state.getGridPoint(row,col).x, _.state.getGridPoint(row,col).y);
        } else {
            block.setPosition(_.state.getGridPoint(row,col).x, _.state.getGridPoint(_.settings.getRows() - 1,col).y + _.settings.getRowHeight() * 2 + _.settings.getRowHeight() * newLine)
        }
        return block
    }

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
                        _.updatePoints();
                        _.ui.pulse(_.movesLabel.parent);
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
        _.ui.addLock();
        try {
            if (_.state.getMoves() <= 0 || _.state.getCollectedPoints() >= _.settings.getTargetPoints()) {
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
                _.winLoseLabel.getComponent(cc.Label).string = _.state.getCollectedPoints() >= _.settings.getTargetPoints()
                    ? 'ПОБЕДА!' : 'ПРОИГРАЛ!'
                tweens.push(_.ui.toPositionXY(_.winLoseLabel, 0, 230, 0.3));
                await Promise.all(tweens);
            }
        } finally {
            _.ui.removeLock();
        }
    }

    updatePoints() {
        _.progress.getComponent(cc.ProgressBar).progress = _.state.getCollectedPoints() / _.settings.getTargetPoints();
        _.ui.setText(_.pointsLabel, `${_.state.getCollectedPoints()}/${_.settings.getTargetPoints()}`);
    }

    updateMoves() {
        _.ui.setText(_.movesLabel, _.state.getMoves());
    }
}
