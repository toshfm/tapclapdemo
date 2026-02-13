import { BLOCK } from "../enums/block";
import { BLOCKTYPE } from "../enums/blockType";

export interface IBlockData {
    id: string;
    block: BLOCK;
    blockType: BLOCKTYPE;
}