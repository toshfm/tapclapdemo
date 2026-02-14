import { IGridElement } from "../interfaces/iGridElement";
import { IInteractedBlock } from "../interfaces/iInteractedBlock";
import { IGameState } from "../interfaces/services/iGameState";
import { Queue } from "../misc/queue";

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
                let blockEl = state.getGridBlockById(queue.dequeue());
                this.checkAndAddSimilar(state.getGridBlock(blockEl.row, blockEl.col - 1), blockEl, result, queue);
                this.checkAndAddSimilar(state.getGridBlock(blockEl.row + 1, blockEl.col), blockEl, result, queue);
                this.checkAndAddSimilar(state.getGridBlock(blockEl.row, blockEl.col + 1), blockEl, result, queue);
                this.checkAndAddSimilar(state.getGridBlock(blockEl.row - 1, blockEl.col), blockEl, result, queue);
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