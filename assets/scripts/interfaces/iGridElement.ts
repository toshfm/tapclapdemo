import { IBlockData } from "./IBlockData";

export interface IGridElement extends IBlockData {
    row: number;
    col: number;
    above?: number | null;
}