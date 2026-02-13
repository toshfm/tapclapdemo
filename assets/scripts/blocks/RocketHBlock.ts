import { IGridElement } from "../interfaces/iGridElement";
import { IInteractedBlock } from "../interfaces/iInteractedBlock";
import { IGameState } from "../interfaces/services/iGameState";

export class RocketHBlock implements IInteractedBlock {
    interact(gridEl: IGridElement, state: IGameState): Array<IGridElement> {
        let result = [];
        for (let col = 0; col < state.getGridPointsCols(); col++) {
            result.push(state.getGridBlock(gridEl.row, col)?.id);
        }
        return result.filter(x => x !== null && x !== undefined);
    }
}