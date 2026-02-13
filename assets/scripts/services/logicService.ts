import { BLOCK } from "../enums/block";
import { BLOCKTYPE } from "../enums/blockType";
import { MathHelper } from "../helpers/mathHelper";
import { IGridElement } from "../interfaces/iGridElement";
import { IInteractResponse, IInteractResponseChained } from "../interfaces/iInteractResponse";
import { IBlockFactory } from "../interfaces/services/iBlockFactory";
import { IGameSettings } from "../interfaces/services/iGameSettings";
import { IGameState } from "../interfaces/services/iGameState";
import { ILogicService } from "../interfaces/services/iLogicService";
import { Queue } from "../misc/queue";

let _: LogicService;

export class LogicService implements ILogicService {
    settings: IGameSettings;
    state: IGameState;
    blockFactory: IBlockFactory

    constructor(settings: IGameSettings, state: IGameState, blockFactory: IBlockFactory) {
        _ = this;
        _.settings = settings;
        _.state = state;
        _.blockFactory = blockFactory;
    }

    prepareGrid() {
        _.setGrid();
        _.fillGrid();
    }

    /**Set grid matrix. 
     * Separated logic and view*/
    setGrid() {
        let rows = _.settings.getRows();
        let cols = _.settings.getCols();
        _.state.initGridPoints(rows, cols);
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                _.state.setGridPoint(row, col, {
                    x: _.settings.getColWidth() / 2 - cols * (_.settings.getColWidth() / 2) + col * _.settings.getColWidth(),
                    y: _.settings.getRowHeight() / 2 - rows * (_.settings.getRowHeight() / 2) + row * _.settings.getRowHeight() 
                })
            }
        }
    }

    /**Fill grid with elements */
    fillGrid() {
        let rows = _.settings.getRows();
        let cols = _.settings.getCols();
        _.state.initGridBlocks(rows, cols);
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                _.state.setGridBlock( row, col, { 
                    ..._.blockFactory.newBlock(),
                    row: row, 
                    col: col, 
                    isNew: false, 
                    isMoved: false 
                })
            }
        }
    }

    /**Reshuffle blocks*/
    reshuffle() {
        let arr: IGridElement[] = [];
        let rows = _.settings.getRows();
        let cols = _.settings.getCols();
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < _.settings.getCols(); col++) {
                arr.push(_.state.getGridBlock(row,col));
            }
        }
        MathHelper.shuffleArrayInPlace(arr);
        let i = 0;
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                arr[i].col = col;
                arr[i].row = row;
                _.state.setGridBlock(row,col, arr[i])
                i++;
            }
        }
    }

    isBonus(gId: string): BLOCK | null {
        let gridEl = _.state.getGridBlockById(gId)
        if (gridEl.blockType == BLOCKTYPE.bonus) {
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
        let gridEl = _.state.getGridBlockById(gId);
        if (gridEl) {
            let booster = _.isBonus(gId);
            if (booster || useBomb) {
                //bonuses interaction
                (response as IInteractResponseChained).chain = new Queue<string>();
                (response as IInteractResponseChained).chain.enqueue(gId);
                let firstTry = true;
                while ((response as IInteractResponseChained).chain.count() > 0) {
                    let el = (response as IInteractResponseChained).chain.dequeue();
                    let gEl = firstTry ? gridEl : _.state.getGridBlockById(el);
                    if (gEl) {
                        if (_.isBonus(gEl.id)) {
                            response.boosters.add(el);
                        } else {
                            _.addBlockToResponse(el, response);
                        }
                        if (gEl.block === BLOCK.bomb || (firstTry && useBomb)) {
                            _.bomb(gEl, response);
                        } else if (gEl.block === BLOCK.rocketh || (firstTry && useBomb)) {
                            _.rocketH(gEl, response);
                        } else if (gEl.block === BLOCK.rocketv || (firstTry && useBomb)) {
                            _.rocketV(gEl, response);
                        } else {
                            throw new Error('no booster')
                        }
                        _.state.setGridBlock(gEl.row, gEl.col, null);
                    }
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
                        let blockEl = _.state.getGridBlockById(queue.dequeue());
                        _.checkAndAddSimilar(_.state.getGridBlock(blockEl.row, blockEl.col - 1), blockEl, response, queue);
                        _.checkAndAddSimilar(_.state.getGridBlock(blockEl.row + 1, blockEl.col), blockEl, response, queue);
                        _.checkAndAddSimilar(_.state.getGridBlock(blockEl.row, blockEl.col + 1), blockEl, response, queue);
                        _.checkAndAddSimilar(_.state.getGridBlock(blockEl.row - 1, blockEl.col), blockEl, response, queue);
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
        let cols = _.settings.getCols();
        let rows = _.settings.getRows();
        for (let col = 0; col < cols; col++) {
            let existed: IGridElement[] = [];
            for (let row = 0; row < rows; row++) {
                if (_.state.getGridBlock(row,col)) {
                    existed.push(_.state.getGridBlock(row,col))
                }
            }
            for (let row = 0; row < rows; row++) {
                _.state.setGridBlock(row, col, existed[row]
                    ? { ...existed[row], isMoved: (existed[row].row != row), row: row, isNew: false }
                    : { ..._.blockFactory.newBlock(), row: row, col: col, isNew: true, isMoved: false }
                );
            }
        }
    }

    private destroyBlocks(response: IInteractResponse) {
        for (let row = 0; row < _.settings.getRows(); row++) {
            for (let col = 0; col < _.settings.getCols(); col++) {
                if (response.blocks.has(_.state.getGridBlock(row,col)?.id)) {
                    _.state.setGridBlock(row, col, null);
                }
            }
        }
    }

    //add outer blocks
    private bomb(block: IGridElement, response: IInteractResponse) {
        let blocks = [];
        blocks.push(_.state.getGridBlock(block.row, block.col - 1)?.id);
        blocks.push(_.state.getGridBlock(block.row + 1, block.col - 1)?.id);
        blocks.push(_.state.getGridBlock(block.row + 1, block.col)?.id);
        blocks.push(_.state.getGridBlock(block.row + 1, block.col + 1)?.id);
        blocks.push(_.state.getGridBlock(block.row, block.col + 1)?.id);
        blocks.push(_.state.getGridBlock(block.row - 1, block.col + 1)?.id);
        blocks.push(_.state.getGridBlock(block.row - 1, block.col)?.id);
        blocks.push(_.state.getGridBlock(block.row - 1, block.col - 1)?.id);
        (blocks.filter(x => x !== null && x !== undefined)).forEach(item =>
            _.addBlockToResponse(item, response)
        )
    }

    //add horizontal 
    private rocketH(block: IGridElement, response: IInteractResponse) {
        let blocks = [];
        for (let col = 0; col < _.settings.getCols(); col++) {
            blocks.push(_.state.getGridBlock(block.row, col)?.id);
        }
        (blocks.filter(x => x !== null && x !== undefined)).forEach(item =>
            _.addBlockToResponse(item, response)
        )
    }

    //add vertical
    private rocketV(block: IGridElement, response: IInteractResponse) {
        let blocks = [];
        for (let row = 0; row < _.settings.getRows(); row++) {
            blocks.push(_.state.getGridBlock(row, block.col)?.id);
        }
        (blocks.filter(x => x !== null && x !== undefined)).forEach(item =>
            _.addBlockToResponse(item, response)
        )
    }

    private addBlockToResponse(id: string, response: IInteractResponse) {
        if (_.isBonus(id)) {
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

    //For testing purposes
    private translate(num: number) {
        cc.log('----' + num);
        for (let row = 0; row < _.settings.getRows(); row++) {
            if (_.state.getGridBlock(row,0)) {
                cc.log(_.state.getGridBlock(row,0).row
                    + ' ' + _.state.getGridBlock(row,0).col
                    + ' ' + _.state.getGridBlock(row,0).id
                    + ' ' + _.state.getGridBlock(row,0).isMoved
                    + ' ' + _.state.getGridBlock(row,0).isNew);
            } else {
                cc.log(row + ' ' + 0 + ' ' + 'null');
            }
        }
        cc.log('----');
    }
}