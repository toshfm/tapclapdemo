import { IGridElement } from "../interfaces/iGridElement";
import { IPoint } from "../interfaces/iPoint";
import { IGameState } from "../interfaces/services/iGameState";

export class GameState implements IGameState {
    private _gridPoints: (IPoint | null)[][];
    private _gridBlocks: (IGridElement | null)[][];
    private _moves: number;
    private _collectedPoints: number;
    private _reshuffleTries: number;
    private _boosterReshuffle: number;
    private _boosterBomb: number;
    private _boosterBombActivated: boolean;

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
    }

    minusMove(): void {
        this._moves--;
    }

    getMoves() {
        return this._moves;
    }

    setCollectedPoints(value) {
        this._collectedPoints = value;
    }

    addCollectedPoins(value?) {
        this._collectedPoints = value !== undefined && value !== null 
        ? this._collectedPoints + value 
        : this._collectedPoints + 1;
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

    setBoosterBombActivated(value) {
        this._boosterBombActivated = value;
    }

    getBoosterBombActivated() {
        return this._boosterBombActivated;
    }
}