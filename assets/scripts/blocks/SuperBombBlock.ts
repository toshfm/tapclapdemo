import { IGridElement } from "../interfaces/iGridElement";
import { IInteractedBlock } from "../interfaces/iInteractedBlock";
import { IGameState } from "../interfaces/services/iGameState";

export class SuperBombBlock implements IInteractedBlock {
    interact(gridEl: IGridElement, state: IGameState): Array<IGridElement> {
        let result = new Array<IGridElement>();
        result.push(state.getGridBlock(gridEl.row, gridEl.col));

        result.push(state.getGridBlock(gridEl.row, gridEl.col - 1));
        result.push(state.getGridBlock(gridEl.row + 1, gridEl.col - 1));
        result.push(state.getGridBlock(gridEl.row + 1, gridEl.col));
        result.push(state.getGridBlock(gridEl.row + 1, gridEl.col + 1));
        result.push(state.getGridBlock(gridEl.row, gridEl.col + 1));
        result.push(state.getGridBlock(gridEl.row - 1, gridEl.col + 1));
        result.push(state.getGridBlock(gridEl.row - 1, gridEl.col));
        result.push(state.getGridBlock(gridEl.row - 1, gridEl.col - 1));

        result.push(state.getGridBlock(gridEl.row, gridEl.col - 2));
        result.push(state.getGridBlock(gridEl.row + 2, gridEl.col - 2));
        result.push(state.getGridBlock(gridEl.row + 2, gridEl.col));
        result.push(state.getGridBlock(gridEl.row + 2, gridEl.col + 2));
        result.push(state.getGridBlock(gridEl.row, gridEl.col + 2));
        result.push(state.getGridBlock(gridEl.row - 2, gridEl.col + 2));
        result.push(state.getGridBlock(gridEl.row - 2, gridEl.col));
        result.push(state.getGridBlock(gridEl.row - 2, gridEl.col - 2));
        return result.filter(x => x !== null && x !== undefined);
    }
}