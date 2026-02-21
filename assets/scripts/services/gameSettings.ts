import { MathHelper } from "../helpers/MathHelper";
import { IGameSettings } from "../interfaces/services/IGameSettings";

export class GameSettings implements IGameSettings {
    private _rows: number = 9;
    private _cols: number = 9;
    private _colWidth: number = 100;
    private _rowHeight: number = 105;
    //1 of bonusChance less = better
    private _bonusChance: number = 10;
    private _startedMoves: number = 10;
    private _targetPoints: number = 100;
    private _startedBoosterReshuffle: number = 2;
    private _startedBoosterBomb: number = 2;

    get rows() {
        return this._rows;
    }

    set rows(value: number) {
        this._rows = MathHelper.clamp(value, 1, 9);
    }

    get cols() {
        return this._cols
    }

    set cols(value) {
        this._cols = MathHelper.clamp(value, 1, 9);
    }

    get colWidth() {
        return this._colWidth;
    }

    get rowHeight() {
        return this._rowHeight;
    }

    get bonusChance() {
        return this._bonusChance;
    }

    get startedMoves() {
        return this._startedMoves;
    }

    set startedMoves(value) {
        this._startedMoves = value;
    }

    get targetPoints() {
        return this._targetPoints;
    }

    set targetPoints(value) {
        this._targetPoints = value;
    }

    get startedBoosterReshuffle() {
        return this._startedBoosterReshuffle;
    }

    set startedBoosterReshuffle(value) {
        this._startedBoosterReshuffle = value;
    } 

    get startedBoosterBomb() {
        return this._startedBoosterBomb;
    }

    set startedBoosterBomb(value) {
        this._startedBoosterBomb = value;
    }
}