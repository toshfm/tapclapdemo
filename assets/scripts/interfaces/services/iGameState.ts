import { IGridElement } from "../iGridElement";
import { IPoint } from "../iPoint";

export interface IGameState {
    initGridPoints(rows: number, cols: number): void;
    setGridPoint(row: number, col: number, point: IPoint | null): void;
    getGridPoint(row: number, col: number): IPoint | null;
    initGridBlocks(rows: number, cols: number): void;
    setGridBlock(row: number, col: number, block: IGridElement | null);
    getGridBlock(row: number, col: number): IGridElement | null;
    getGridBlockById(gId: string): IGridElement | null;
    setMoves(value: number): void;
    minusMove(): void;
    getMoves(): number;
    setCollectedPoints(value: number): void;
    addCollectedPoins(value?: number): void;
    getCollectedPoints(): number;
    setReshuffleTries(value: number): void;
    getReshuffleTries(): number;
    setBoosterReshuffle(value: number): void;
    getBoosterReshuffle(): number;
    setBoosterBomb(value: number): void;
    getBoosterBomb(): number;
    setBoosterBombActivated(value: boolean);
    getBoosterBombActivated(): boolean;
}