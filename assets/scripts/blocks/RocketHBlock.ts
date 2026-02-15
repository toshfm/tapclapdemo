import { GAMEEVENT } from "../enums/gameEvent";
import { IGridElement } from "../interfaces/iGridElement";
import { IInteractedBlock } from "../interfaces/iInteractedBlock";
import { IEventEmitter } from "../interfaces/services/iEventEmitter";
import { IGameState } from "../interfaces/services/iGameState";

export class RocketHBlock implements IInteractedBlock {
    interact(gridEl: IGridElement, state: IGameState, events: IEventEmitter): Array<IGridElement> {
        let result = new Array<IGridElement>();
        for (let col = 0; col < state.getGridBlocksCols(); col++) {
            result.push(state.getGridBlock(gridEl.row, col));
        }
        events?.emit(GAMEEVENT.ROCKETH_ANIMATION, gridEl);
        return result.filter(x => x !== null && x !== undefined);
    }
}
