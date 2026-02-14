import { IQueue } from "./iQueue";

export interface IInteractResponse {
    normalBlocks: Set<string>;
    bonusBlocks: Set<string>;
    moveSuccess: boolean;
}

export interface IInteractResponseChained extends IInteractResponse {
    chain: IQueue<string>;
}