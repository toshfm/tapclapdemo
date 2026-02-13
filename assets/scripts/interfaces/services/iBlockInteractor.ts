import { BLOCK } from "../../enums/block";
import { IInteractedBlock } from "../iInteractedBlock";

export interface IBlockInteractor {
    getInteraction(block: BLOCK): IInteractedBlock
}