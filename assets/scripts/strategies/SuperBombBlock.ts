import { GameEvent } from "../enums/GameEvent";
import { IGridElement } from "../interfaces/IGridElement";
import { IInteractedBlock } from "../interfaces/IInteractedBlock";
import { IEventEmitter } from "../interfaces/services/IEventEmitter";
import { IGameState } from "../interfaces/services/IGameState";

export class SuperBombBlock implements IInteractedBlock {
    interact(gridEl: IGridElement, state: IGameState, events: IEventEmitter): Array<IGridElement> {
        let result = new Array<IGridElement>();
        result.push(state.gridBlocks.get(gridEl.row, gridEl.col));

        result.push(state.gridBlocks.get(gridEl.row, gridEl.col - 1));
        result.push(state.gridBlocks.get(gridEl.row + 1, gridEl.col - 1));
        result.push(state.gridBlocks.get(gridEl.row + 1, gridEl.col));
        result.push(state.gridBlocks.get(gridEl.row + 1, gridEl.col + 1));
        result.push(state.gridBlocks.get(gridEl.row, gridEl.col + 1));
        result.push(state.gridBlocks.get(gridEl.row - 1, gridEl.col + 1));
        result.push(state.gridBlocks.get(gridEl.row - 1, gridEl.col));
        result.push(state.gridBlocks.get(gridEl.row - 1, gridEl.col - 1));

        result.push(state.gridBlocks.get(gridEl.row, gridEl.col - 2));
        result.push(state.gridBlocks.get(gridEl.row + 2, gridEl.col));
        result.push(state.gridBlocks.get(gridEl.row, gridEl.col + 2));
        result.push(state.gridBlocks.get(gridEl.row - 2, gridEl.col));
        events?.emit(GameEvent.BOMB_ANIMATION, gridEl);
        return result.filter(x => x !== null && x !== undefined);
    }
}