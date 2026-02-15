import { BOOSTER } from "../enums/booster";
import { GAMEEVENT } from "../enums/gameEvent";
import { IGridElement } from "../interfaces/iGridElement";
import { IEventEmitter } from "../interfaces/services/iEventEmitter";
import { IGameSettings } from "../interfaces/services/iGameSettings";
import { IGameState } from "../interfaces/services/iGameState";

export class GameState implements IGameState {
    private _gridBlocks: (IGridElement | null)[][];
    private _moves: number;
    private _collectedPoints: number;
    private _reshuffleTries: number;
    private _boosterReshuffle: number;
    private _boosterBomb: number;
    private _activeBooster: BOOSTER | null = null;
    private settings: IGameSettings;
    private events: IEventEmitter;

    constructor(settings: IGameSettings, events: IEventEmitter) {
        this.settings = settings;
        this.events = events;
    }

    initGridBlocks(rows: number, cols: number): void {
        this._gridBlocks = Array(rows).fill(null).map(() => Array(cols).fill(null))
    }

    setGridBlock(row, col, block) {
        this._gridBlocks[row][col] = block;
        return block;
    }

    getGridBlock(row, col) {
        if (row < 0 || col < 0 || row >= this.settings.getRows() || col >= this.settings.getCols()) {
            return null;
        }
        return this._gridBlocks[row][col];
    }

    getGridBlockById(gId: string): IGridElement | null {
        for (let row = 0; row < this.settings.getRows(); row++) {
            for (let col = 0; col < this.settings.getCols(); col++) {
                if (this._gridBlocks[row][col]?.id === gId) {
                    return this._gridBlocks[row][col];
                }
            }
        }
        return null;
    }

    setMoves(value) {
        this._moves = value < 0 ? 0 : value;
        this.events.emit(GAMEEVENT.MOVES_CHANGED, this.getMoves());
    }

    minusMove(): void {
        this.setMoves(this.getMoves() - 1)
    }

    getMoves() {
        return this._moves;
    }

    setCollectedPoints(value) {
        this._collectedPoints = value;
        this.events.emit(GAMEEVENT.POINTS_CHANGED, {
            points: `${this.getCollectedPoints()}/${this.settings.getTargetPoints()}`,
            progress:  this.getCollectedPoints() / this.settings.getTargetPoints()
        });
    }

    addCollectedPoins(value?) {
        if (value !== undefined && value !== null) {
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

    setBoosterReshuffle(value) {
        this._boosterReshuffle = value < 0 ? 0 : value;
        this.events.emit(GAMEEVENT.BOOSTER_RESHUFFLE_QANTITY_CHANGED, this.getBoosterReshuffle());
    }

    getBoosterReshuffle() {
        return this._boosterReshuffle;
    }

    minusBoosterReshuffle(): void {
        this.setBoosterReshuffle(this.getBoosterReshuffle() - 1);
    }

    setBoosterBomb(value) {
        this._boosterBomb = value < 0 ? 0 : value;
        this.events.emit(GAMEEVENT.BOOSTER_BOMB_QANTITY_CHANGED, this.getBoosterBomb());
    }

    getBoosterBomb() {
        return this._boosterBomb;
    }

    minusBoosterBomb() {
        this.setBoosterBomb(this.getBoosterBomb() - 1)
    }

    toggleActiveBooster(value) {
        let prev = this._activeBooster;
        let status = (prev == value) ? null : value; 
        if (prev == BOOSTER.superbomb || value == BOOSTER.superbomb) {
            if (this.getBoosterBomb() <= 0) {
                return;
            }
            this.events.emit(GAMEEVENT.BOOSTER_BOMB_STATE_CHANGED, (status == BOOSTER.superbomb));
        }
        this._activeBooster = status;
    }

    getActiveBooster() {
        return this._activeBooster;
    }

    getGridBlocksCols(): number {
        return this._gridBlocks.length;
    }

    getGridBlocksRows(): number {
        return this._gridBlocks[0].length;
    }
}