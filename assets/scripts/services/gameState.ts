import { BOOSTER } from "../enums/booster";
import { IGridElement } from "../interfaces/iGridElement";
import { IPoint } from "../interfaces/iPoint";
import { IGameState } from "../interfaces/services/iGameState";
import { Observable } from "../misc/observable";

export enum GameEventType {
    POINTS_CHANGED = "POINTS_CHANGED",
    MOVES_CHANGED = "MOVES_CHANGED",
    BOOSTER_STATE_CHANGED = "BOOSTER_STATE_CHANGED",
    BOOSTER_BOMB_QANTITY_CHANGED = "BOOSTER_BOMB_QANTITY_CHANGED",
    BOOSTER_RESHUFFLE_QANTITY_CHANGED = "BOOSTER_RESHUFFLE_QANTITY_CHANGED"
}

export class GameState extends Observable implements IGameState {
    private _gridPoints: (IPoint | null)[][];
    private _gridBlocks: (IGridElement | null)[][];
    private _moves: number;
    private _collectedPoints: number;
    private _reshuffleTries: number;
    private _boosterReshuffle: number;
    private _boosterBomb: number;
    private _activeBooster: BOOSTER | null = null;

    initGridPoints(rows: number, cols: number): void {
        this._gridPoints = Array(rows).fill(null).map(() => Array(cols).fill(null));
    }

    getGridPointsRows(): number {
        return this._gridPoints.length;
    }

    getGridPointsCols(): number {
        return this._gridPoints[0].length;
    }

    setGridPoint(row, col, point) {
        this._gridPoints[row][col] = point;
    }

    getGridPoint(row, col) {
        return this._gridPoints[row][col];
    }

    initGridBlocks(rows: number, cols: number): void {
        this._gridBlocks = Array(rows).fill(null).map(() => Array(cols).fill(null))
    }

    setGridBlock(row, col, block) {
        this._gridBlocks[row][col] = block;
    }

    getGridBlock(row, col) {
        if (row < 0 || col < 0 || row >= this._gridPoints.length || col >= this._gridPoints[0].length) {
            return null;
        }
        return this._gridBlocks[row][col];
    }

    getGridBlockById(gId: string): IGridElement | null {
        for (let row = 0; row <  this._gridPoints.length; row++) {
            for (let col = 0; col < this._gridPoints[0].length; col++) {
                if (this._gridBlocks[row][col]?.id === gId) {
                    return this._gridBlocks[row][col];
                }
            }
        }
        return null;
    }

    setMoves(value) {
        this._moves = value < 0 ? 0 : value;
        this.notify({
            type: GameEventType.MOVES_CHANGED,
            data: this._moves
        })
    }

    minusMove(): void {
        this.setMoves(this._moves-1)
    }

    getMoves() {
        return this._moves;
    }

    setCollectedPoints(value) {
        this._collectedPoints = value;
        this.notify({
            type: GameEventType.POINTS_CHANGED,
            data: this._collectedPoints
        })
    }

    addCollectedPoins(value?) {
        if(value !== undefined && value !== null) {  
            this.setCollectedPoints(this._collectedPoints + value) 
        } else {
            this.setCollectedPoints(this._collectedPoints + 1);
        }
    }

    getCollectedPoints() {
        return this._collectedPoints;
    }

    setReshuffleTries(value) {
        this._reshuffleTries = value < 0 ? 0 : value;
    }

    getReshuffleTries() {
        return this._reshuffleTries;
    }

    setBoosterReshuffle(value){
        this._boosterReshuffle = value < 0 ? 0 : value;
    }

    getBoosterReshuffle() {
        return this._boosterReshuffle;
    }

    setBoosterBomb(value) {
        this._boosterBomb = value < 0 ? 0 : value;
    }

    getBoosterBomb() {
        return this._boosterBomb;
    }

    toggleActiveBooster(value) {
        this._activeBooster = value;
        this.notify({
            type: GameEventType.BOOSTER_STATE_CHANGED,
            data: value
        })
        
    }

    getActiveBooster() {
        return this._activeBooster;
    }
}