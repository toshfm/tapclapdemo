import { IBlockData } from "./iBlockData";

export interface IGridElement extends IBlockData {
    row: number;
    col: number;
    isMoved: boolean;
    isNew: boolean;
}