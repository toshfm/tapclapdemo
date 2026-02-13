
import { BLOCK } from "../enums/block";
import { BLOCKTYPE } from "../enums/blockType";
import { MathHelper } from "../helpers/mathHelper";
import { IBlockData } from "../interfaces/iBlockData";
import { IBlockGenerator } from "../interfaces/services/iBlockGenerator";
import { IGameSettings } from "../interfaces/services/iGameSettings";

let _: BlockFactory;

export class BlockFactory implements IBlockGenerator {
    private settings: IGameSettings;
    _blocksAll: string[] = Object.values(BLOCK).filter((v) => isNaN(Number(v))) as string[]
    _blocksNoBonuses: string[] = (Object.keys(BLOCK) as (keyof typeof BLOCK)[]).filter(key => isNaN(Number(key)) && key.startsWith('block'))
    _blocksBonuses: string[] = (Object.keys(BLOCK) as (keyof typeof BLOCK)[]).filter(key => isNaN(Number(key)) && !key.startsWith('block'))

    constructor(settings: IGameSettings) {
        _ = this;
        _.settings = settings;
    }

    newBlock(): IBlockData {
        if (MathHelper.getRandomInt(0, _.settings.getBonusChance()) === 1) {
            return _.bonusBlock();
        } else {
            return _.normalBlock();
        }
    }

    bonusBlock(): IBlockData {
        return {
            id: MathHelper.newUUID(),
            block: this.getRandomBonusBlock(),
            blockType: BLOCKTYPE.bonus
        }

    }

    normalBlock(): IBlockData {
        return {
            id: MathHelper.newUUID(),
            block: this.getRandomNormalBlock(),
            blockType: BLOCKTYPE.normal
        }

    }

    private getRandomBonusBlock() {
        return BLOCK[_._blocksBonuses[MathHelper.getRandomInt(0, this._blocksBonuses.length - 1)]];
    }

    private getRandomNormalBlock() {
        return BLOCK[_._blocksNoBonuses[MathHelper.getRandomInt(0, this._blocksNoBonuses.length - 1)]]
    }
}