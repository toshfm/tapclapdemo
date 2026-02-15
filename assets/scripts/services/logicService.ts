import { BLOCKTYPE } from "../enums/blockType";
import { BOOSTER } from "../enums/booster";
import { GAMEEVENT } from "../enums/gameEvent";
import { MathHelper } from "../helpers/mathHelper";
import { IGridElement } from "../interfaces/iGridElement";
import { IInteractResponse, IInteractResponseChained } from "../interfaces/iInteractResponse";
import { IMove } from "../interfaces/iMove";
import { IBlockGenerator } from "../interfaces/services/iBlockGenerator";
import { IBlockInteractor } from "../interfaces/services/iBlockInteractor";
import { IEventEmitter } from "../interfaces/services/iEventEmitter";
import { IGameSettings } from "../interfaces/services/iGameSettings";
import { IGameState } from "../interfaces/services/iGameState";
import { IGridViewService } from "../interfaces/services/iGridPointsService";
import { ILogicService } from "../interfaces/services/iLogicService";
import { Queue } from "../misc/queue";

let _: LogicService;

export class LogicService implements ILogicService {
    private settings: IGameSettings;
    private state: IGameState;
    private gridPoints: IGridViewService;
    private blockGenerator: IBlockGenerator;
    private blockInteractor: IBlockInteractor;
    private events: IEventEmitter;

    constructor(settings: IGameSettings, state: IGameState, blockGenerator: IBlockGenerator, blockInteractor: IBlockInteractor, events: IEventEmitter, gridPoints: IGridViewService) {
        _ = this;
        _.settings = settings;
        _.state = state;
        _.blockGenerator = blockGenerator;
        _.blockInteractor = blockInteractor;
        _.events = events;
        _.gridPoints = gridPoints;
    }

    async newLevel() {
        _.clearState();
        const gridIsReady = new Promise<void>((resolve) => {
            const unsub = _.events.on(GAMEEVENT.GRID_PREPARED, () => {
                unsub(); 
                resolve();
            });
        });
        _.events.emit(GAMEEVENT.PREPARE_GRID);
        await gridIsReady;
        _.fillGrid();
    }

    clearState(){
        _.state.toggleActiveBooster(null);
        _.state.setCollectedPoints(0);
        _.state.setMoves(_.settings.getStartedMoves());
        _.state.setBoosterBomb(_.settings.getStartedBoosterBomb());
        _.state.setBoosterReshuffle(_.settings.getStartedBoosterReshuffle());
        _.gridPoints.initGridPoints();
    }

    fillGrid() {
        let rows = _.settings.getRows();
        let cols = _.settings.getCols();
        _.state.initGridBlocks(rows, cols);
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                let newBlock = _.state.setGridBlock(row, col, {
                    ..._.blockGenerator.newBlock(),
                    row: row,
                    col: col,
                    above: 0
                    //isNew: false,
                    //isMoved: false
                });
                _.events.emit(GAMEEVENT.BLOCK_CREATED, newBlock);
            }
        }
    }

    handleBoosterClick(booster: BOOSTER) {
        switch (booster) {
            case BOOSTER.reshuffle:
                if (_.state.getBoosterReshuffle() > 0) {
                    let moves = _.reshuffle();
                    _.state.minusBoosterReshuffle();
                    _.events.emit(GAMEEVENT.RESHUFFLE, moves);
                }
                break;
            case BOOSTER.superbomb:
                _.state.toggleActiveBooster(BOOSTER.superbomb);
                break;
            default: return;
        }
    }

    reshuffle() : Array<IMove> {
        let result: IMove[] = []
        let arr: IGridElement[] = [];
        let rows = _.settings.getRows();
        let cols = _.settings.getCols();
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < _.settings.getCols(); col++) {
                arr.push(_.state.getGridBlock(row, col));
            }
        }
        MathHelper.shuffleArrayInPlace(arr);
        let i = 0;
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                if(arr[i].col != col || arr[i].row != row) {
                    result.push({
                        id: arr[i].id,
                        row: row,
                        col: col
                    })
                }
                arr[i].col = col;
                arr[i].row = row;
                _.state.setGridBlock(row, col, arr[i]);
                i++;
            }
        }
        return result;
    }

    // isBonus(gId: string): BLOCK | null {
    //     let gridEl = _.state.getGridBlockById(gId)
    //     if (gridEl.blockType == BLOCKTYPE.bonus) {
    //         return gridEl.block
    //     }
    //     return null;
    // }

    /**Interact with block
     * booster, bomb or check similar 
     * TODO: Could be refactor into small pieces
     * @param gId id Of block
     * @param useBomb if we use Bomb booster
    // */
    // interact1(gId: string, useBomb?: boolean): IInteractResponse {
    //     let response: IInteractResponse = {
    //         normalBlocks: new Set<string>(),
    //         bonusBlocks: new Set<string>(), moveSuccess: false
    //     }
    //     let gridEl = _.state.getGridBlockById(gId);
    //     if (gridEl) {
    //         let booster = _.isBonus(gId);
    //         if (booster || useBomb) {
    //             //bonuses interaction
    //             (response as IInteractResponseChained).chain = new Queue<string>();
    //             (response as IInteractResponseChained).chain.enqueue(gId);
    //             let firstTry = true;
    //             while ((response as IInteractResponseChained).chain.count() > 0) {
    //                 let el = (response as IInteractResponseChained).chain.dequeue();
    //                 let gEl = firstTry ? gridEl : _.state.getGridBlockById(el);
    //                 if (gEl) {
    //                     if (_.isBonus(gEl.id)) {
    //                         response.bonusBlocks.add(el);
    //                     } else {
    //                         _.addBlockToResponse(el, response);
    //                     }
    //                     if (gEl.block === BLOCK.bomb || (firstTry && useBomb)) {
    //                         _.bomb(gEl, response);
    //                     } else if (gEl.block === BLOCK.rocketh || (firstTry && useBomb)) {
    //                         _.rocketH(gEl, response);
    //                     } else if (gEl.block === BLOCK.rocketv || (firstTry && useBomb)) {
    //                         _.rocketV(gEl, response);
    //                     } else {
    //                         throw new Error('no booster')
    //                     }
    //                     _.state.setGridBlock(gEl.row, gEl.col, null);
    //                 }
    //                 firstTry = false;
    //             }
    //         } else {
    //             response.normalBlocks.add(gridEl.id);
    //             //search sim algo
    //             let queue = new Queue<string>();
    //             queue.enqueue(gId);
    //             while (queue.count() > 0) {
    //                 let levelSize = queue.count();
    //                 for (let i = 0; i < levelSize; i++) {
    //                     let blockEl = _.state.getGridBlockById(queue.dequeue());
    //                     _.checkAndAddSimilar(_.state.getGridBlock(blockEl.row, blockEl.col - 1), blockEl, response, queue);
    //                     _.checkAndAddSimilar(_.state.getGridBlock(blockEl.row + 1, blockEl.col), blockEl, response, queue);
    //                     _.checkAndAddSimilar(_.state.getGridBlock(blockEl.row, blockEl.col + 1), blockEl, response, queue);
    //                     _.checkAndAddSimilar(_.state.getGridBlock(blockEl.row - 1, blockEl.col), blockEl, response, queue);
    //                 }
    //             }
    //         }
    //         response.moveSuccess = response.normalBlocks.size > 1 || response.bonusBlocks.size >= 1;
    //         _.processResponse(response);
    //         return response
    //     } else {
    //         return null;
    //     }
    // }

    handleBlockClick(gId: string) {
        let response: IInteractResponse = {
            interactedBlockId: gId,
            normalBlocks: new Set<string>(),
            bonusBlocks: new Set<string>(), 
            moveSuccess: false
        }
        let gridEl = _.state.getGridBlockById(gId);

        if (gridEl) {
            (response as IInteractResponseChained).chain = new Queue<string>();

            let firstTry = true;

            let activeBooster = _.state.getActiveBooster();
            if (activeBooster !== null) {
                let strategy = _.blockInteractor.getBoosterInteraction(activeBooster);
                let affected = strategy.interact(gridEl, _.state, _.events);
                _.processAffectedBlocks(affected, response);
                if (activeBooster == BOOSTER.superbomb) {
                    _.state.toggleActiveBooster(null);
                    _.state.minusBoosterBomb();
                }
            } else {
                (response as IInteractResponseChained).chain.enqueue(gId);
            }

            while ((response as IInteractResponseChained).chain.count() > 0) {
                let el = (response as IInteractResponseChained).chain.dequeue();
                let gEl = firstTry ? gridEl : _.state.getGridBlockById(el);
                _.processOne(gEl, response);
                if (gEl) {
                    let strategy = _.blockInteractor.getBlockInteraction(gEl.block);
                    let affected = strategy.interact(gEl, _.state, _.events);
                    _.processAffectedBlocks(affected, response);
                    _.state.setGridBlock(gEl.row, gEl.col, null);
                }
                firstTry = false;
            }
            response.moveSuccess = response.normalBlocks.size > 1 || response.bonusBlocks.size >= 1;
            _.processResponse(response);
            if (response.moveSuccess) {
                _.state.minusMove();
            }
            _.events.emit(GAMEEVENT.BLOCK_CLICK_HAPPENED, response);
        } else {
            return;
        }
    }

    private processOne(block: IGridElement, response: IInteractResponse) {
        if (block?.blockType == BLOCKTYPE.bonus) {
            response.bonusBlocks.add(block.id);
        } else if (block?.blockType == BLOCKTYPE.normal) {
            response.normalBlocks.add(block.id);
        }
    }

    private processAffectedBlocks(blocks: Array<IGridElement>, response: IInteractResponse) {
        blocks.forEach(block => {
            _.processAffectedBlock(block, response);
        }
        );
    }

    private processAffectedBlock(block: IGridElement, response: IInteractResponse) {
        if (block.blockType == BLOCKTYPE.bonus) {
            if (!response.bonusBlocks.has(block.id)) {
                (response as IInteractResponseChained).chain.enqueue(block.id)
            }
        } else {
            response.normalBlocks.add(block.id);
        }
    }


    private processResponse(response: IInteractResponse) {
        if (response.moveSuccess) {
            _.destroyBlocks(response);
            _.fillNewBlocks();
        }

    }

    private fillNewBlocks() {
        let cols = _.settings.getCols();
        let rows = _.settings.getRows();
        for (let col = 0; col < cols; col++) {
            let existed: IGridElement[] = [];
            for (let row = 0; row < rows; row++) {
                if (_.state.getGridBlock(row, col)) {
                    existed.push(_.state.getGridBlock(row, col))
                }
            }
            for (let row = 0; row < rows; row++) {
                _.state.setGridBlock(row, col, existed[row]
                    ? { ...existed[row], isMoved: (existed[row].row != row), row: row, isNew: false }
                    : { ..._.blockGenerator.newBlock(), row: row, col: col, isNew: true, isMoved: false }
                );
            }
        }
    }

    private destroyBlocks(response: IInteractResponse) {
        for (let row = 0; row < _.settings.getRows(); row++) {
            for (let col = 0; col < _.settings.getCols(); col++) {
                if (response.normalBlocks.has(_.state.getGridBlock(row, col)?.id)) {
                    _.state.setGridBlock(row, col, null);
                }
            }
        }
    }

    //add outer blocks
    // private bomb(block: IGridElement, response: IInteractResponse) {
    //     let blocks = [];
    //     blocks.push(_.state.getGridBlock(block.row, block.col - 1)?.id);
    //     blocks.push(_.state.getGridBlock(block.row + 1, block.col - 1)?.id);
    //     blocks.push(_.state.getGridBlock(block.row + 1, block.col)?.id);
    //     blocks.push(_.state.getGridBlock(block.row + 1, block.col + 1)?.id);
    //     blocks.push(_.state.getGridBlock(block.row, block.col + 1)?.id);
    //     blocks.push(_.state.getGridBlock(block.row - 1, block.col + 1)?.id);
    //     blocks.push(_.state.getGridBlock(block.row - 1, block.col)?.id);
    //     blocks.push(_.state.getGridBlock(block.row - 1, block.col - 1)?.id);
    //     (blocks.filter(x => x !== null && x !== undefined)).forEach(item =>
    //         _.addBlockToResponse(item, response)
    //     )
    // }

    // //add horizontal 
    // private rocketH(block: IGridElement, response: IInteractResponse) {
    //     let blocks = [];
    //     for (let col = 0; col < _.settings.getCols(); col++) {
    //         blocks.push(_.state.getGridBlock(block.row, col)?.id);
    //     }
    //     (blocks.filter(x => x !== null && x !== undefined)).forEach(item =>
    //         _.addBlockToResponse(item, response)
    //     )
    // }

    // //add vertical
    // private rocketV(block: IGridElement, response: IInteractResponse) {
    //     let blocks = [];
    //     for (let row = 0; row < _.settings.getRows(); row++) {
    //         blocks.push(_.state.getGridBlock(row, block.col)?.id);
    //     }
    //     (blocks.filter(x => x !== null && x !== undefined)).forEach(item =>
    //         _.addBlockToResponse(item, response)
    //     )
    // }

    // private addBlockToResponse(id: string, response: IInteractResponse) {
    //     if (_.isBonus(id)) {
    //         if (!response.bonusBlocks.has(id)) {
    //             (response as IInteractResponseChained).chain.enqueue(id)
    //         }
    //     } else {
    //         response.normalBlocks.add(id);
    //     }
    // }

    // private checkAndAddSimilar(blockToCheck: IGridElement, blockTwo: IGridElement, response: IInteractResponse, resultQueue: Queue<string>) {
    //     if (blockToCheck?.block === blockTwo?.block) {
    //         if (!response.normalBlocks.has(blockToCheck.id)) {
    //             response.normalBlocks.add(blockToCheck.id);
    //             resultQueue.enqueue(blockToCheck.id);
    //         }
    //     }
    // }

    //For testing purposes
    private translate(num: number) {
        cc.log('----' + num);
        for (let row = 0; row < _.settings.getRows(); row++) {
            if (_.state.getGridBlock(row, 0)) {
                cc.log(_.state.getGridBlock(row, 0).row
                    + ' ' + _.state.getGridBlock(row, 0).col
                    + ' ' + _.state.getGridBlock(row, 0).id
                    // + ' ' + _.state.getGridBlock(row, 0).isMoved
                    // + ' ' + _.state.getGridBlock(row, 0).isNew);
            } else {
                cc.log(row + ' ' + 0 + ' ' + 'null');
            }
        }
        cc.log('----');
    }
}