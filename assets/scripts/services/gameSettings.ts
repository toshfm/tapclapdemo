import { MathHelper } from "../helpers/mathHelper";
import { IGameSettings } from "../interfaces/services/iGameSettings";

export class GameSettings implements IGameSettings {
    private _rows: number = 9;
    private _cols: number = 9;
    private _colWidth: number = 100;
    private _rowHeight: number = 105;
    private _possibleStartBonuses: number = 100;
    //1 of bonusChance less = better
    private _bonusChance: number = 10;
    private _startedMoves: number = 10;
    private _targetPoints: number = 100;
    private _startedBoosterReshuffle: number = 2;
    private _startedBoosterBomb: number = 2;

    getRows() {
        return this._rows;
    }

    setRows(value) {
        this._rows = MathHelper.clamp(value, 1, 9);
    }

    getCols() {
        return this._cols;
    }

    setCols(value) {
        this._cols = MathHelper.clamp(value, 1, 9);
    }

    getColWidth() {
        return this._colWidth;
    }

    getRowHeight() {
        return this._rowHeight;
    }

    getPossibleStartBonuses() {
        return this._possibleStartBonuses;
    }

    getBonusChance() {
        return this._bonusChance;
    }

    setStartedMoves(value) {
        this._startedMoves = value;
    }

    getStartedMoves() {
        return this._startedMoves;
    }

    setTargetPoints(value) {
        this._targetPoints = value;
    }

    getTargetPoints() {
        return this._targetPoints;
    }

    setStartedBoosterReshuffle(value) {
        this._startedBoosterReshuffle = value;
    }

    getStartedBoosterReshuffle() {
        return this._startedBoosterReshuffle;
    }

    setStartedBoosterBomb(value) {
        this._startedBoosterBomb = value;
    }

    getStartedBoosterBomb() {
        return this._startedBoosterBomb;
    }
}