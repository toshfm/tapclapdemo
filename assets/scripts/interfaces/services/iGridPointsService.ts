import { IPoint } from "../iPoint";

export interface IGridViewService {
    initGridPoints(): void;
    setGridPoint(row: number, col: number, point: IPoint | null): void;
    getGridPoint(row: number, col: number): IPoint | null;
}