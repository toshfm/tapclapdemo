import { BombBlock } from "../blocks/BombBlock";
import { NormalBlock } from "../blocks/NormalBlock";
import { RocketHBlock } from "../blocks/RocketHBlock";
import { RocketVBlock } from "../blocks/RocketVBlock";
import { SuperBombBlock } from "../blocks/SuperBombBlock";
import { Block } from "../enums/Block";
import { Booster } from "../enums/Booster";
import { IInteractedBlock } from "../interfaces/IInteractedBlock";
import { IBlockInteractor } from "../interfaces/services/IBlockInteractor";

export class BlockInteractor implements IBlockInteractor {
    private _interactions: Map<Block, IInteractedBlock> = new Map();
    private _boosterInteractions: Map<Booster, IInteractedBlock> = new Map();

    //**Set strategies to interact */
    constructor() {
        const normalBlock = new NormalBlock();

        this._interactions.set(Block.block1, normalBlock);
        this._interactions.set(Block.block2, normalBlock);
        this._interactions.set(Block.block3, normalBlock);
        this._interactions.set(Block.block4, normalBlock);

        this._interactions.set(Block.bomb, new BombBlock());
        this._interactions.set(Block.rocketh, new RocketHBlock());
        this._interactions.set(Block.rocketv, new RocketVBlock());

        this._boosterInteractions.set(Booster.superbomb, new SuperBombBlock())
    }
    
    getBlockInteraction(block: Block): IInteractedBlock {
        return this._interactions.get(block);
    }

    getBoosterInteraction(booster: Booster) : IInteractedBlock {
        return this._boosterInteractions.get(booster)
    }
}