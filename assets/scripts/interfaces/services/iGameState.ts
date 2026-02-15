import { BOOSTER } from "../../enums/booster";
import { IGridElement } from "../iGridElement";

export interface IGameState {
    initGridBlocks(rows: number, cols: number): void;
    setGridBlock(row: number, col: number, block: IGridElement | null) : IGridElement;
    getGridBlock(row: number, col: number): IGridElement | null;
    getGridBlockById(gId: string): IGridElement | null;
    setMoves(value: number): void;
    minusMove(): void;
    getMoves(): number;
    setCollectedPoints(value: number):  void;
    addCollectedPoins(value?: number): void;
    getCollectedPoints(): number;
    setReshuffleTries(value: number): void;
    getReshuffleTries(): number;
    setBoosterReshuffle(value: number): void;
    getBoosterReshuffle(): number;
    minusBoosterReshuffle(): void;
    setBoosterBomb(value: number): void;
    getBoosterBomb(): number;
    minusBoosterBomb(): void;
    toggleActiveBooster(value: BOOSTER | null): void;
    getActiveBooster(): BOOSTER | null;
    getGridBlocksRows(): number;
    getGridBlocksCols(): number;
}