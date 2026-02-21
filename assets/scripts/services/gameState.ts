import { Booster } from "../enums/Booster";
import { GameEvent } from "../enums/GameEvent";
import { IGridElement } from "../interfaces/IGridElement";
import { IMatrix } from "../interfaces/IMatrix";
import { IEventEmitter } from "../interfaces/services/IEventEmitter";
import { IGameSettings } from "../interfaces/services/IGameSettings";
import { IGameState } from "../interfaces/services/IGameState";

export class GameState implements IGameState {
    private _gridBlocks: IMatrix<IGridElement>;
    private _moves: number;
    private _collectedPoints: number;
    private _reshuffleTries: number;
    private _boosterReshuffle: number;
    private _boosterBomb: number;
    private _activeBooster: Booster = null;
    private settings: IGameSettings;
    private events: IEventEmitter;

    constructor(settings: IGameSettings, events: IEventEmitter) {
        this.settings = settings;
        this.events = events;
    }
    set moves(value) {
        this._moves = value < 0 ? 0 : value;
        this.events.emit(GameEvent.MOVES_CHANGED, this.moves);
    }

    get moves() {
        return this._moves;
    }

    set collectedPoints(value) {
        this._collectedPoints = value;
        this.events.emit(GameEvent.POINTS_CHANGED, {
            points: `${this.collectedPoints}/${this.settings.targetPoints}`,
            progress: this.collectedPoints / this.settings.targetPoints
        });
    }

    get collectedPoints() {
        return this._collectedPoints;
    }

    set reshuffleTries(value) {
        this._reshuffleTries = value < 0 ? 0 : value;
    }

    get reshuffleTries() {
        return this._reshuffleTries;
    }

    set boosterReshuffle(value) {
        this._boosterReshuffle = value < 0 ? 0 : value;
        this.events.emit(GameEvent.BOOSTER_RESHUFFLE_QANTITY_CHANGED, this.boosterReshuffle);
    }

    get boosterReshuffle() {
        return this._boosterReshuffle;
    }

    set boosterBomb(value) {
        this._boosterBomb = value < 0 ? 0 : value;
        this.events.emit(GameEvent.BOOSTER_BOMB_QANTITY_CHANGED, this.boosterBomb);
    }

    get boosterBomb() {
        return this._boosterBomb;
    }

    toggleActiveBooster(value) {
        let prev = this._activeBooster;
        let status = (prev == value) ? null : value;
        if (prev == Booster.superbomb || value == Booster.superbomb) {
            if (this.boosterBomb <= 0) {
                return;
            }
            this.events.emit(GameEvent.BOOSTER_BOMB_STATE_CHANGED, (status == Booster.superbomb));
        }
        this._activeBooster = status;
    }

    get activeBooster() {
        return this._activeBooster;
    }

    get gridBlocks() {
        return this._gridBlocks;
    }

    set gridBlocks(value) {
        this._gridBlocks = value;
    }
}