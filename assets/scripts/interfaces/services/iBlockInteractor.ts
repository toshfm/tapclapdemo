import { BLOCK } from "../../enums/block";
import { BOOSTER } from "../../enums/booster";
import { IInteractedBlock } from "../iInteractedBlock";

export interface IBlockInteractor {
    getBlockInteraction(block: BLOCK): IInteractedBlock
    getBoosterInteraction(booster: BOOSTER) : IInteractedBlock
}