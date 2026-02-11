import { Blocks } from "../enums/blocks";
import { MathHelper } from "../helpers/mathHelper";
import { IGridElement } from "../interfaces/iGridElement";
import { IInteractResponse, IInteractResponseChained } from "../interfaces/iInteractResponse";
import { ILogicService } from "../interfaces/services/iLogicService";
import { Queue } from "../misc/queue";
import { GameSettings } from "../scenes/mainScene/gameSettings";
import { GameState } from "../scenes/mainScene/gameState";

let _: LogicService;

export class LogicService implements ILogicService {
    _bonusesOnGrid: number = 0;
    _blocksAll: string[] = Object.values(Blocks).filter((v) => isNaN(Number(v))) as string[]
    _blocksNoBonuses: string[] = (Object.keys(Blocks) as (keyof typeof Blocks)[]).filter(key => isNaN(Number(key)) && key.startsWith('block'))

    constructor() {
        _ = this;
    }

    prepareGrid() {
        _.setGrid();
        _.fillGrid();
    }

    /**Set grid matrix. 
     * Separated logic and view*/
    setGrid() {
        let rows = GameSettings.rows;
        let cols = GameSettings.cols;
        GameState.gridPoints = Array(rows).fill(null).map(() => Array(cols).fill(null));
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                GameState.gridPoints[row][col] = {
                    x: GameSettings.colWidth / 2 - cols * (GameSettings.colWidth / 2) + col * GameSettings.colWidth,
                    y: GameSettings.rowHeight / 2 - rows * (GameSettings.rowHeight / 2) + row * GameSettings.rowHeight
                };
            }
        }
    }

    /**Fill grid with elements */
    fillGrid() {
        _._bonusesOnGrid = 0;
        GameState.gridBlocks = Array(GameSettings.rows).fill(null).map(() => Array(GameSettings.cols).fill(null))
        for (let row = 0; row < GameSettings.rows; row++) {
            for (let col = 0; col < GameSettings.cols; col++) {
                GameState.gridBlocks[row][col] = { id: MathHelper.newUUID(), block: this.getBlockName(), row: row, col: col, isNew: false, isMoved: false };
            }
        }
    }

    /**Reshuffle blocks*/
    reshuffle() {
        let arr: IGridElement[] = [];
        for (let row = 0; row < GameSettings.rows; row++) {
            for (let col = 0; col < GameSettings.cols; col++) {
                arr.push(GameState.gridBlocks[row][col]);
            }
        }
        MathHelper.shuffleArrayInPlace(arr);
        let i = 0;
        for (let row = 0; row < GameSettings.rows; row++) {
            for (let col = 0; col < GameSettings.cols; col++) {
                arr[i].col = col;
                arr[i].row = row;
                GameState.gridBlocks[row][col] = arr[i];
                i++;
            }
        }
    }

    /**Get block*/
    getBlockName(): string {
        let block = null;
        if (_._bonusesOnGrid < GameSettings.possibleStartBonuses && MathHelper.getRandomInt(0, GameSettings.bonusChance) === 1) {
            block = _._blocksAll[MathHelper.getRandomInt(0, this._blocksAll.length - 1)];
            if (!block.startsWith("block")) {
                _._bonusesOnGrid++;
            }
        } else {
            block = _._blocksNoBonuses[MathHelper.getRandomInt(0, this._blocksNoBonuses.length - 1)]
        }
        return block;
    }

    isBooster(gId: string): string | null {
        let gridEl = _.getGridElementById(gId)
        if (!gridEl.block.startsWith('block')) {
            return gridEl.block
        }
        return null;
    }

    /**Interact with block
     * booster, bomb or check similar 
     * TODO: Could be refactor into small pieces
     * @param gId id Of block
     * @param useBomb if we use Bomb booster
    */
    interact(gId: string, useBomb?: boolean): IInteractResponse {
        let response: IInteractResponse = {
            blocks: new Set<string>(),
            boosters: new Set<string>(), moveSuccess: false
        }
        let gridEl = _.getGridElementById(gId);
        if (gridEl) {
            let booster = _.isBooster(gId);
            if (booster || useBomb) {
                //bonuses interaction
                (response as IInteractResponseChained).chain = new Queue<string>();
                (response as IInteractResponseChained).chain.enqueue(gId);
                let firstTry = true;
                while ((response as IInteractResponseChained).chain.count() > 0) {
                    let el = (response as IInteractResponseChained).chain.dequeue();
                    let gEl = firstTry ? gridEl : _.getGridElementById(el);
                    if (gEl) {
                        if (_.isBooster(gEl.id)) {
                            response.boosters.add(el);
                        } else {
                            _.addBlockToResponse(el, response);
                        }
                        if (gEl.block === 'bomb' || (firstTry && useBomb)) {
                            _.bomb(gEl, response);
                        } else if (gEl.block === 'rocketh' || (firstTry && useBomb)) {
                            _.rocketH(gEl, response);
                        } else if (gEl.block === 'rocketv' || (firstTry && useBomb)) {
                            _.rocketV(gEl, response);
                        } else {
                            throw new Error('no booster')
                        }
                        GameState.gridBlocks[gEl.row][gEl.col] = null;
                    }
                    _._bonusesOnGrid--;
                    firstTry = false;
                }
            } else {
                response.blocks.add(gridEl.id);
                //search sim algo
                let queue = new Queue<string>();
                queue.enqueue(gId);
                while (queue.count() > 0) {
                    let levelSize = queue.count();
                    for (let i = 0; i < levelSize; i++) {
                        let blockEl = _.getGridElementById(queue.dequeue());
                        _.checkAndAddSimilar(_.getGridElementByRowCol(blockEl.row, blockEl.col - 1), blockEl, response, queue);
                        _.checkAndAddSimilar(_.getGridElementByRowCol(blockEl.row + 1, blockEl.col), blockEl, response, queue);
                        _.checkAndAddSimilar(_.getGridElementByRowCol(blockEl.row, blockEl.col + 1), blockEl, response, queue);
                        _.checkAndAddSimilar(_.getGridElementByRowCol(blockEl.row - 1, blockEl.col), blockEl, response, queue);
                    }
                }
            }
            response.moveSuccess = response.blocks.size > 1 || response.boosters.size >= 1;
            _.processResponse(response);
            return response
        } else {
            return null;
        }
    }

    private processResponse(response: IInteractResponse) {
        if (response.moveSuccess) {
            _.destroyBlocks(response);
            _.fillNewBlocks();
        }

    }

    private fillNewBlocks() {
        for (let col = 0; col < GameSettings.cols; col++) {
            let existed: IGridElement[] = [];
            for (let row = 0; row < GameSettings.rows; row++) {
                if (GameState.gridBlocks[row][col]) {
                    existed.push(GameState.gridBlocks[row][col])
                }
            }
            for (let row = 0; row < GameSettings.rows; row++) {
                GameState.gridBlocks[row][col] = existed[row]
                    ? { ...existed[row], isMoved: (existed[row].row != row), row: row, isNew: false }
                    : { id: MathHelper.newUUID(), block: this.getBlockName(), row: row, col: col, isNew: true, isMoved: false };
            }
        }
    }

    private destroyBlocks(response: IInteractResponse) {
        for (let row = 0; row < GameSettings.rows; row++) {
            for (let col = 0; col < GameSettings.cols; col++) {
                if (response.blocks.has(GameState.gridBlocks[row][col]?.id)) {
                    GameState.gridBlocks[row][col] = null;
                }
            }
        }
    }

    //add outer blocks
    private bomb(block: IGridElement, response: IInteractResponse) {
        let blocks = [];
        blocks.push(_.getGridElementByRowCol(block.row, block.col - 1)?.id);
        blocks.push(_.getGridElementByRowCol(block.row + 1, block.col - 1)?.id);
        blocks.push(_.getGridElementByRowCol(block.row + 1, block.col)?.id);
        blocks.push(_.getGridElementByRowCol(block.row + 1, block.col + 1)?.id);
        blocks.push(_.getGridElementByRowCol(block.row, block.col + 1)?.id);
        blocks.push(_.getGridElementByRowCol(block.row - 1, block.col + 1)?.id);
        blocks.push(_.getGridElementByRowCol(block.row - 1, block.col)?.id);
        blocks.push(_.getGridElementByRowCol(block.row - 1, block.col - 1)?.id);
        (blocks.filter(x => x !== null && x !== undefined)).forEach(item =>
            _.addBlockToResponse(item, response)
        )
    }

    //add horizontal 
    private rocketH(block: IGridElement, response: IInteractResponse) {
        let blocks = [];
        for (let col = 0; col < GameSettings.cols; col++) {
            blocks.push(_.getGridElementByRowCol(block.row, col)?.id);
        }
        (blocks.filter(x => x !== null && x !== undefined)).forEach(item =>
            _.addBlockToResponse(item, response)
        )
    }

    //add vertical
    private rocketV(block: IGridElement, response: IInteractResponse) {
        let blocks = [];
        for (let row = 0; row < GameSettings.rows; row++) {
            blocks.push(_.getGridElementByRowCol(row, block.col)?.id);
        }
        (blocks.filter(x => x !== null && x !== undefined)).forEach(item =>
            _.addBlockToResponse(item, response)
        )
    }

    private addBlockToResponse(id: string, response: IInteractResponse) {
        if (_.isBooster(id)) {
            if (!response.boosters.has(id)) {
                (response as IInteractResponseChained).chain.enqueue(id)
            }
        } else {
            response.blocks.add(id);
        }
    }

    private checkAndAddSimilar(blockToCheck: IGridElement, blockTwo: IGridElement, response: IInteractResponse, resultQueue: Queue<string>) {
        if (blockToCheck?.block === blockTwo?.block) {
            if (!response.blocks.has(blockToCheck.id)) {
                response.blocks.add(blockToCheck.id);
                resultQueue.enqueue(blockToCheck.id);
            }
        }
    }

    private getGridElementByRowCol(row: number, col: number): IGridElement | null {
        if (row < 0 || col < 0 || row >= GameSettings.rows || col >= GameSettings.cols) {
            return null;
        }
        return GameState.gridBlocks[row][col];
    }

    private getGridElementById(gId: string): IGridElement | null {
        for (let row = 0; row < GameSettings.rows; row++) {
            for (let col = 0; col < GameSettings.cols; col++) {
                if (GameState.gridBlocks[row][col]?.id === gId) {
                    return GameState.gridBlocks[row][col];
                }
            }
        }
        return null;
    }

    //For testing purposes
    private translate(num: number) {
        cc.log('----' + num);
        for (let row = 0; row < GameSettings.rows; row++) {
            if (GameState.gridBlocks[row][0]) {
                cc.log(GameState.gridBlocks[row][0].row
                    + ' ' + GameState.gridBlocks[row][0].col
                    + ' ' + GameState.gridBlocks[row][0].id
                    + ' ' + GameState.gridBlocks[row][0].isMoved
                    + ' ' + GameState.gridBlocks[row][0].isNew);
            } else {
                cc.log(row + ' ' + 0 + ' ' + 'null');
            }
        }
        cc.log('----');
    }
}