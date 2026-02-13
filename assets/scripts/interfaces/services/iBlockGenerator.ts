import { IBlockData } from "../iBlockData";

export interface IBlockGenerator {
    newBlock() : IBlockData;
    normalBlock() : IBlockData;
    bonusBlock() : IBlockData;
}