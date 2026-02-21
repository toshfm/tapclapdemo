import { Block } from "../enums/Block";
import { BlockType } from "../enums/BlockType";

export interface IBlockData {
    id: string;
    block: Block;
    blockType: BlockType;
}