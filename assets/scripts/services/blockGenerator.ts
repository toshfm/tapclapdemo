
import { Block } from "../enums/Block";
import { BlockType } from "../enums/BlockType";
import { MathHelper } from "../helpers/MathHelper";
import { IBlockData } from "../interfaces/IBlockData";
import { IBlockGenerator } from "../interfaces/services/IBlockGenerator";
import { IGameSettings } from "../interfaces/services/IGameSettings";

export class BlockFactory implements IBlockGenerator {
    private settings: IGameSettings;
    _blocksAll: string[] = Object.values(Block).filter((v) => isNaN(Number(v))) as string[]
    _blocksNoBonuses: string[] = (Object.keys(Block) as (keyof typeof Block)[]).filter(key => isNaN(Number(key)) && key.startsWith('block'))
    _blocksBonuses: string[] = (Object.keys(Block) as (keyof typeof Block)[]).filter(key => isNaN(Number(key)) && !key.startsWith('block'))

    constructor(settings: IGameSettings) {
        this.settings = settings;
    }

    newBlock(): IBlockData {
        if (MathHelper.getRandomInt(0, this.settings.bonusChance) == 1) {
            return this.bonusBlock();
        } else {
            return this.normalBlock();
        }
    }

    bonusBlock(): IBlockData {
        return {
            id: MathHelper.newUUID(),
            block: this.getRandomBonusBlock(),
            blockType: BlockType.bonus
        }

    }

    normalBlock(): IBlockData {
        return {
            id: MathHelper.newUUID(),
            block: this.getRandomNormalBlock(),
            blockType: BlockType.normal
        }

    }

    private getRandomBonusBlock() {
        return Block[this._blocksBonuses[MathHelper.getRandomInt(0, this._blocksBonuses.length - 1)]];
    }

    private getRandomNormalBlock() {
        return Block[this._blocksNoBonuses[MathHelper.getRandomInt(0, this._blocksNoBonuses.length - 1)]]
    }
}