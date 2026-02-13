import { IGridElement } from "../interfaces/iGridElement";
import { IInteractedBlock } from "../interfaces/iInteractedBlock";
import { IGameState } from "../interfaces/services/iGameState";

export class BombBlock implements IInteractedBlock {
    interact(gridEl: IGridElement, state: IGameState): Array<IGridElement> {
        let result = [];
        result.push(state.getGridBlock(gridEl.row, gridEl.col - 1)?.id);
        result.push(state.getGridBlock(gridEl.row + 1, gridEl.col - 1)?.id);
        result.push(state.getGridBlock(gridEl.row + 1, gridEl.col)?.id);
        result.push(state.getGridBlock(gridEl.row + 1, gridEl.col + 1)?.id);
        result.push(state.getGridBlock(gridEl.row, gridEl.col + 1)?.id);
        result.push(state.getGridBlock(gridEl.row - 1, gridEl.col + 1)?.id);
        result.push(state.getGridBlock(gridEl.row - 1, gridEl.col)?.id);
        result.push(state.getGridBlock(gridEl.row - 1, gridEl.col - 1)?.id);
        return result.filter(x => x !== null && x !== undefined);
    }
}