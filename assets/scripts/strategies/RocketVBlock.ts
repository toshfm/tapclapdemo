import { GameEvent } from "../enums/GameEvent";
import { IGridElement } from "../interfaces/IGridElement";
import { IInteractedBlock } from "../interfaces/IInteractedBlock";
import { IEventEmitter } from "../interfaces/services/IEventEmitter";
import { IGameState } from "../interfaces/services/IGameState";

export class RocketVBlock implements IInteractedBlock {
    interact(gridEl: IGridElement, state: IGameState, events: IEventEmitter): Array<IGridElement> {
        let result = new Array<IGridElement>();
        for (let row = 0; row < state.gridBlocks.rows; row++) {
            result.push(state.gridBlocks.get(row, gridEl.col));
        }
        events?.emit(GameEvent.ROCKETV_ANIMATION, gridEl);
        return result.filter(x => x !== null && x !== undefined);
    }
}