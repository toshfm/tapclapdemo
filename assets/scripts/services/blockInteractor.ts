import { BombBlock } from "../blocks/BombBlock";
import { NormalBlock } from "../blocks/NormalBlock";
import { RocketHBlock } from "../blocks/RockethBlock";
import { RocketVBlock } from "../blocks/RocketvBlock";
import { BLOCK } from "../enums/block";
import { IInteractedBlock } from "../interfaces/iInteractedBlock";
import { IBlockInteractor } from "../interfaces/services/iBlockInteractor";

export class BlockInteractor implements IBlockInteractor {
    private _interactions: Map<BLOCK, IInteractedBlock> = new Map();

    constructor() {
        const normalBlock = new NormalBlock();

        this._interactions.set(BLOCK.block1, normalBlock);
        this._interactions.set(BLOCK.block2, normalBlock);
        this._interactions.set(BLOCK.block3, normalBlock);
        this._interactions.set(BLOCK.block4, normalBlock);

        this._interactions.set(BLOCK.bomb, new BombBlock());
        this._interactions.set(BLOCK.rocketh, new RocketHBlock());
        this._interactions.set(BLOCK.rocketv, new RocketVBlock());
    }
    
    getInteraction(block: BLOCK): IInteractedBlock {
        return this._interactions.get(block);
    }
}