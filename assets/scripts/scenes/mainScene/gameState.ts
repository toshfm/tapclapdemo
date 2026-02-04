import { IGridElement } from "../../interfaces/iGridElement";
import { IPoint } from "../../interfaces/iPoint";

export class GameState {
    static gridPoints: (IPoint | null)[][];
    static gridBlocks: (IGridElement | null)[][];
    static moves: number;
    static collectedPoints: number;
    static reshuffleTries: number;
    static boosterReshuffle: number;
    static boosterBomb: number;
    static boosterBombActivated: boolean;
}