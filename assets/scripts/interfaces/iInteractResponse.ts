import { IMove } from "./IMove";
import { IQueue } from "./IQueue";

export interface IInteractResponse {
    interactedBlockId: string;
    normalBlocks: Set<string>;
    bonusBlocks: Set<string>;
    moveSuccess: boolean;
}

export interface IInteractResponseChained extends IInteractResponse {
    chain: IQueue<string>;
}