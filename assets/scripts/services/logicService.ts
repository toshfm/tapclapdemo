import { BlockType } from "../enums/BlockType";
import { Booster } from "../enums/Booster";
import { GameEvent } from "../enums/GameEvent";
import { MathHelper } from "../helpers/MathHelper";
import { IGridElement } from "../interfaces/IGridElement";
import { IInteractResponse, IInteractResponseChained } from "../interfaces/IInteractResponse";
import { IMove } from "../interfaces/IMove";
import { IBlockGenerator } from "../interfaces/services/IBlockGenerator";
import { IBlockInteractor } from "../interfaces/services/IBlockInteractor";
import { IEventEmitter } from "../interfaces/services/IEventEmitter";
import { IGameSettings } from "../interfaces/services/IGameSettings";
import { IGameState } from "../interfaces/services/IGameState";
import { IGridPointsService } from "../interfaces/services/IGridPointsService";
import { ILogicService } from "../interfaces/services/ILogicService";
import { Matrix } from "../misc/Matrix";
import { Queue } from "../misc/Queue";

export class LogicService implements ILogicService {
    private settings: IGameSettings;
    private state: IGameState;
    private gridPoints: IGridPointsService;
    private blockGenerator: IBlockGenerator;
    private blockInteractor: IBlockInteractor;
    private events: IEventEmitter;

    constructor(settings: IGameSettings, state: IGameState, blockGenerator: IBlockGenerator, blockInteractor: IBlockInteractor, events: IEventEmitter, gridPoints: IGridPointsService) {
        this.settings = settings;
        this.state = state;
        this.blockGenerator = blockGenerator;
        this.blockInteractor = blockInteractor;
        this.events = events;
        this.gridPoints = gridPoints;
    }

    async newLevel() {
        this.clearState();
        const gridIsReady = new Promise<void>((resolve) => {
            const unsub = this.events.on(GameEvent.GRID_PREPARED, () => {
                unsub();
                resolve();
            });
        });
        this.events.emit(GameEvent.PREPARE_GRID);
        await gridIsReady;
        this.fillGrid();
    }

    clearState() {
        this.state.toggleActiveBooster(null);
        this.state.collectedPoints = 0;
        this.state.moves = this.settings.startedMoves;
        this.state.boosterBomb = this.settings.startedBoosterBomb;
        this.state.boosterReshuffle = this.settings.startedBoosterReshuffle;
        debugger;
        this.gridPoints.initGridPoints();
    }

    fillGrid() {
        debugger;
        let rows = this.settings.rows;
        let cols = this.settings.cols;
        this.state.gridBlocks = new Matrix(rows, cols);
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                let newBlock = this.state.gridBlocks.set(row, col, {
                    ...this.blockGenerator.newBlock(),
                    row: row,
                    col: col
                });
                this.events.emit(GameEvent.BLOCK_CREATED, newBlock);
            }
        }
        let t = 1;
    }

    handleBoosterClick(booster: Booster) {
        switch (booster) {
            case Booster.reshuffle:
                if (this.state.boosterReshuffle > 0) {
                    let moves = this.reshuffle();
                    this.state.boosterReshuffle--;
                    this.events.emit(GameEvent.RESHUFFLE, moves);
                }
                break;
            case Booster.superbomb:
                this.state.toggleActiveBooster(Booster.superbomb);
                break;
            default: return;
        }
    }

    addCollectedPoints(blockType?: string) {
        //could be logic to add differents points depends on blockType
        this.state.collectedPoints++;
    }

    checkWinLose() {
        if (this.state.collectedPoints > this.settings.targetPoints) {
            this.events.emit(GameEvent.WIN);
        } else if (this.state.moves == 0) {
            this.events.emit(GameEvent.LOSE);
        }
    }

    reshuffle(): Array<IMove> {
        let result: IMove[] = []
        let arr: IGridElement[] = [];
        let rows = this.settings.rows;
        let cols = this.settings.cols;
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                arr.push(this.state.gridBlocks.get(row, col));
            }
        }
        MathHelper.shuffleArrayInPlace(arr);
        let i = 0;
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                if (arr[i].col != col || arr[i].row != row) {
                    result.push({
                        id: arr[i].id,
                        row: row,
                        col: col
                    })
                }
                arr[i].col = col;
                arr[i].row = row;
                this.state.gridBlocks.set(row, col, arr[i]);
                i++;
            }
        }
        return result;
    }


    handleBlockClick(gId: string) {
        let response: IInteractResponse = {
            interactedBlockId: gId,
            normalBlocks: new Set<string>(),
            bonusBlocks: new Set<string>(),
            moveSuccess: false
        }
        let gridEl = this.state.gridBlocks.data.find(x => x?.id == gId);

        if (gridEl) {
            (response as IInteractResponseChained).chain = new Queue<string>();

            let firstTry = true;

            let activeBooster = this.state.activeBooster;
            if (activeBooster !== null) {
                let strategy = this.blockInteractor.getBoosterInteraction(activeBooster);
                let affected = strategy.interact(gridEl, this.state, this.events);
                this.processAffectedBlocks(affected, response);
                if (activeBooster == Booster.superbomb) {
                    this.state.toggleActiveBooster(null);
                    this.state.boosterBomb--;
                }
            } else {
                (response as IInteractResponseChained).chain.enqueue(gId);
            }

            while ((response as IInteractResponseChained).chain.count() > 0) {
                let el = (response as IInteractResponseChained).chain.dequeue();
                let gEl = firstTry ? gridEl : this.state.gridBlocks.data.find(x => x?.id == el);
                this.processOne(gEl, response);
                if (gEl) {
                    let strategy = this.blockInteractor.getBlockInteraction(gEl.block);
                    let affected = strategy.interact(gEl, this.state, this.events);
                    this.processAffectedBlocks(affected, response);
                    if (gEl.blockType == BlockType.bonus) {
                        this.state.gridBlocks.set(gEl.row, gEl.col, null);
                    }
                }
                firstTry = false;
            }
            response.moveSuccess = response.normalBlocks.size > 1 || response.bonusBlocks.size >= 1;
            
            if (response.moveSuccess) {
                this.processResponse(response);
                this.state.moves--;
            }
            this.events.emit(GameEvent.BLOCK_CLICK_HAPPENED, response);
        } else {
            return;
        }
    }

    private processOne(block: IGridElement, response: IInteractResponse) {
        if (block?.blockType == BlockType.bonus) {
            response.bonusBlocks.add(block.id);
        } else if (block?.blockType == BlockType.normal) {
            response.normalBlocks.add(block.id);
        }
    }

    private processAffectedBlocks(blocks: Array<IGridElement>, response: IInteractResponse) {
        blocks.forEach(block => {
            this.processAffectedBlock(block, response);
        });
    }

    private processAffectedBlock(block: IGridElement, response: IInteractResponse) {
        if (block.blockType == BlockType.bonus) {
            if (!response.bonusBlocks.has(block.id)) {
                (response as IInteractResponseChained).chain.enqueue(block.id)
            }
        } else {
            response.normalBlocks.add(block.id);
        }
    }

    private processResponse(response: IInteractResponse) {
        if (response.moveSuccess) {
            this.destroyBlocks(response);
            this.moveAndNewBlocks();
        }

    }

    private moveAndNewBlocks() {
        let cols = this.settings.cols;
        let rows = this.settings.rows;
        let moved = [];
        for (let col = 0; col < cols; col++) {
            let existed: IGridElement[] = [];
            for (let row = 0; row < rows; row++) {
                let block = this.state.gridBlocks.get(row, col)
                if (block) {
                    existed.push(block)
                }
            }
            for (let row = 0; row < rows; row++) {
                let above = 1;
                if (existed[row]) {
                    let block = { ...existed[row], row: row };
                    this.state.gridBlocks.set(row, col, block)
                    moved.push({ id: block.id, row: row, col:col });
                } else {
                    let block = { ...this.blockGenerator.newBlock(), row: row, col: col, above: above }
                    this.state.gridBlocks.set(row, col, block);
                    this.events.emit(GameEvent.BLOCK_CREATED, block);
                    above++;
                }
            }
        }
        if (moved.length > 0) {
            this.events.emit(GameEvent.RESHUFFLE, moved);
        }
    }

    private destroyBlocks(response: IInteractResponse) {
        for (let row = 0; row < this.settings.rows; row++) {
            for (let col = 0; col < this.settings.cols; col++) {
                if (response.normalBlocks.has(this.state.gridBlocks.get(row, col)?.id)) {
                    this.state.gridBlocks.set(row, col, null);
                }
            }
        }
    }

    //For testing purposes
    private translate(num: number) {
        cc.log('----' + num);
        for (let row = 0; row < this.settings.rows; row++) {
            if (this.state.gridBlocks.get(row, 0)) {
                cc.log(this.state.gridBlocks.get(row, 0).row
                    + ' ' + this.state.gridBlocks.get(row, 0).col
                    + ' ' + this.state.gridBlocks.get(row, 0).id
                    + ' ' + this.state.gridBlocks.get(row, 0).above
                    );
            } else {
                cc.log(row + ' ' + 0 + ' ' + 'null');
            }
        }
        cc.log('----');
    }
}