import { Block } from "../../enums/Block";
import { Booster } from "../../enums/Booster";
import { IInteractedBlock } from "../IInteractedBlock";

export interface IBlockInteractor {
    getBlockInteraction(block: Block): IInteractedBlock
    getBoosterInteraction(booster: Booster) : IInteractedBlock
}