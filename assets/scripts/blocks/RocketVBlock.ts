import { GAMEEVENT } from "../enums/gameEvent";
import { IGridElement } from "../interfaces/iGridElement";
import { IInteractedBlock } from "../interfaces/iInteractedBlock";
import { IEventEmitter } from "../interfaces/services/iEventEmitter";
import { IGameState } from "../interfaces/services/iGameState";

export class RocketVBlock implements IInteractedBlock {
    interact(gridEl: IGridElement, state: IGameState, events: IEventEmitter): Array<IGridElement> {
        let result = new Array<IGridElement>();
        for (let row = 0; row < state.getGridBlocksRows(); row++) {
            result.push(state.getGridBlock(row, gridEl.col));
        }
        events?.emit(GAMEEVENT.ROCKETV_ANIMATION, gridEl);
        return result.filter(x => x !== null && x !== undefined);
    }
}