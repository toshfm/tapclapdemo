import { IQueue } from "./iQueue";

export interface IInteractResponse {
    blocks: Set<string>;
    boosters: Set<string>;
    moveSuccess: boolean;
}

export interface IInteractResponseChained extends IInteractResponse {
    chain: IQueue<string>;
}