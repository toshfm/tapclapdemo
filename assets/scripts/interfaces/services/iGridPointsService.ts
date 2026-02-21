import { IMatrix } from "../IMatrix";
import { IPoint } from "../IPoint";

export interface IGridPointsService {
    gridPoints: IMatrix<IPoint>
    initGridPoints(): void;
}