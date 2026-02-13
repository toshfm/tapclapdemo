import { IGridElement } from "../interfaces/iGridElement";
import { IInteractedBlock } from "../interfaces/iInteractedBlock";
import { IGameState } from "../interfaces/services/iGameState";

export class RocketVBlock implements IInteractedBlock {
    interact(gridEl: IGridElement, state: IGameState): Array<IGridElement> {
        let result = [];
        for (let row = 0; row < state.getGridPointsRows(); row++) {
            result.push(state.getGridBlock(gridEl.row, row)?.id);
        }
        return result.filter(x => x !== null && x !== undefined);
    }
}