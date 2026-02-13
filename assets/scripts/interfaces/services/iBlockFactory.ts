import { IBlockData } from "../iBlockData";

export interface IBlockFactory {
    newBlock() : IBlockData;
    normalBlock() : IBlockData;
    bonusBlock() : IBlockData;
}