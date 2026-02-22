import { IGridElement } from "../interfaces/IGridElement"
import { IInteractResponse } from "../interfaces/IInteractResponse"
import { IMove } from "../interfaces/IMove"

export enum GameEvent {
    POINTS_CHANGED,
    MOVES_CHANGED,
    PREPARE_GRID,
    GRID_PREPARED,
    BOOSTER_BOMB_STATE_CHANGED,
    BOOSTER_BOMB_QANTITY_CHANGED,
    BOOSTER_RESHUFFLE_QANTITY_CHANGED,
    RESHUFFLE,
    BLOCK_CREATED,
    WIN,
    LOSE,
    BLOCK_CLICK_HAPPENED,
    BOMB_ANIMATION,
    ROCKETV_ANIMATION,
    ROCKETH_ANIMATION
}

export interface IEventMap {
    [GameEvent.POINTS_CHANGED]: { points: string, progress: number }
    [GameEvent.MOVES_CHANGED]: number
    [GameEvent.PREPARE_GRID]: void
    [GameEvent.GRID_PREPARED]: void
    [GameEvent.BOOSTER_BOMB_STATE_CHANGED]: boolean
    [GameEvent.BOOSTER_BOMB_QANTITY_CHANGED]: number
    [GameEvent.BOOSTER_RESHUFFLE_QANTITY_CHANGED]: number
    [GameEvent.RESHUFFLE]: Array<IMove>
    [GameEvent.BLOCK_CREATED]: IGridElement
    [GameEvent.WIN]: void
    [GameEvent.LOSE]: void
    [GameEvent.BLOCK_CLICK_HAPPENED]: IInteractResponse
    [GameEvent.BOMB_ANIMATION]:  { row: number, col: number }
    [GameEvent.ROCKETV_ANIMATION]:  { row: number, col: number }
    [GameEvent.ROCKETH_ANIMATION]:  { row: number, col: number }
}