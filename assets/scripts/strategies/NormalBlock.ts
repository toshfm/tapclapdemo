import { IGridElement } from "../interfaces/IGridElement";
import { IInteractedBlock } from "../interfaces/IInteractedBlock";
import { IGameState } from "../interfaces/services/IGameState";
import { Queue } from "../misc/Queue";

export class NormalBlock implements IInteractedBlock {
    interact(gridEl: IGridElement, state: IGameState): Array<IGridElement> {
        let result = new Array<IGridElement>;
        result.push(gridEl);
        //search sim algo
        let queue = new Queue<string>();
        queue.enqueue(gridEl.id);
        while (queue.count() > 0) {
            let levelSize = queue.count();
            for (let i = 0; i < levelSize; i++) {
                let blockId = queue.dequeue();
                let blockEl = state.gridBlocks.data.find(x => x?.id === blockId);
                this.checkAndAddSimilar(state.gridBlocks.get(blockEl.row, blockEl.col - 1), blockEl, result, queue);
                this.checkAndAddSimilar(state.gridBlocks.get(blockEl.row + 1, blockEl.col), blockEl, result, queue);
                this.checkAndAddSimilar(state.gridBlocks.get(blockEl.row, blockEl.col + 1), blockEl, result, queue);
                this.checkAndAddSimilar(state.gridBlocks.get(blockEl.row - 1, blockEl.col), blockEl, result, queue);
            }
        }
        return result;
    }

    private checkAndAddSimilar(blockToCheck: IGridElement, blockTwo: IGridElement, result: Array<IGridElement>, resultQueue: Queue<string>) {
        if (blockToCheck?.block === blockTwo?.block) {
            if (!result.find(x => x.id == blockToCheck.id)) {
                result.push(blockToCheck);
                resultQueue.enqueue(blockToCheck.id);
            }
        }
    }
}