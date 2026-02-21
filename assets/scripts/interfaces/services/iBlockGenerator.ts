import { IBlockData } from "../IBlockData";

export interface IBlockGenerator {
    newBlock() : IBlockData;
    normalBlock() : IBlockData;
    bonusBlock() : IBlockData;
}