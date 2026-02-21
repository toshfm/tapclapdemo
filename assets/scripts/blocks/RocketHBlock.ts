import { GameEvent } from "../enums/GameEvent";
import { IGridElement } from "../interfaces/IGridElement";
import { IInteractedBlock } from "../interfaces/IInteractedBlock";
import { IEventEmitter } from "../interfaces/services/IEventEmitter";
import { IGameState } from "../interfaces/services/IGameState";

export class RocketHBlock implements IInteractedBlock {
    interact(gridEl: IGridElement, state: IGameState, events: IEventEmitter): Array<IGridElement> {
        let result = new Array<IGridElement>();
        for (let col = 0; col < state.gridBlocks.cols; col++) {
            result.push(state.gridBlocks.get(gridEl.row, col));
        }
        events?.emit(GameEvent.ROCKETH_ANIMATION, gridEl);
        return result.filter(x => x !== null && x !== undefined);
    }
}
