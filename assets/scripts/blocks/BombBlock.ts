import { GAMEEVENT } from "../enums/gameEvent";
import { IGridElement } from "../interfaces/iGridElement";
import { IInteractedBlock } from "../interfaces/iInteractedBlock";
import { IEventEmitter } from "../interfaces/services/iEventEmitter";
import { IGameState } from "../interfaces/services/iGameState";

export class BombBlock implements IInteractedBlock {
    interact(gridEl: IGridElement, state: IGameState, events: IEventEmitter): Array<IGridElement> {
        let result = new Array<IGridElement>();
        result.push(state.getGridBlock(gridEl.row, gridEl.col - 1));
        result.push(state.getGridBlock(gridEl.row + 1, gridEl.col - 1));
        result.push(state.getGridBlock(gridEl.row + 1, gridEl.col));
        result.push(state.getGridBlock(gridEl.row + 1, gridEl.col + 1));
        result.push(state.getGridBlock(gridEl.row, gridEl.col + 1));
        result.push(state.getGridBlock(gridEl.row - 1, gridEl.col + 1));
        result.push(state.getGridBlock(gridEl.row - 1, gridEl.col));
        result.push(state.getGridBlock(gridEl.row - 1, gridEl.col - 1));
        events?.emit(GAMEEVENT.BOMB_ANIMATION, gridEl);
        return result.filter(x => x !== null && x !== undefined);
    }
}