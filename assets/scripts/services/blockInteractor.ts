import { BombBlock } from "../blocks/BombBlock";
import { NormalBlock } from "../blocks/NormalBlock";
import { RocketHBlock } from "../blocks/RocketHBlock";
import { RocketVBlock } from "../blocks/RocketVBlock";
import { SuperBombBlock } from "../blocks/SuperBombBlock";
import { BLOCK } from "../enums/block";
import { BOOSTER } from "../enums/booster";
import { IInteractedBlock } from "../interfaces/iInteractedBlock";
import { IBlockInteractor } from "../interfaces/services/iBlockInteractor";

export class BlockInteractor implements IBlockInteractor {
    private _interactions: Map<BLOCK, IInteractedBlock> = new Map();
    private _boosterInteractions: Map<BOOSTER, IInteractedBlock> = new Map();

    //**Set strategies to interact */
    constructor() {
        const normalBlock = new NormalBlock();

        this._interactions.set(BLOCK.block1, normalBlock);
        this._interactions.set(BLOCK.block2, normalBlock);
        this._interactions.set(BLOCK.block3, normalBlock);
        this._interactions.set(BLOCK.block4, normalBlock);

        this._interactions.set(BLOCK.bomb, new BombBlock());
        this._interactions.set(BLOCK.rocketh, new RocketHBlock());
        this._interactions.set(BLOCK.rocketv, new RocketVBlock());

        this._boosterInteractions.set(BOOSTER.superbomb, new SuperBombBlock())
    }
    
    getBlockInteraction(block: BLOCK): IInteractedBlock {
        return this._interactions.get(block);
    }

    getBoosterInteraction(booster: BOOSTER) : IInteractedBlock {
        return this._boosterInteractions.get(booster)
    }
}