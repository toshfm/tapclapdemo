import { Booster } from "../../enums/Booster";
import { IGridElement } from "../IGridElement";
import { IMatrix } from "../IMatrix";

export interface IGameState {
    gridBlocks: IMatrix<IGridElement>
    moves: number;
    collectedPoints: number;
    reshuffleTries: number;
    boosterReshuffle: number;
    boosterBomb: number;
    activeBooster: Booster
    toggleActiveBooster(value: Booster | null): void;
}